import { beforeEach, describe, expect, test, vi } from "vitest";

import type { AddCartItemInput } from "../src/features/cart/types";

function createMemoryStorage() {
  const values = new Map<string, string>();

  return {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      values.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      values.delete(key);
    }),
    clear: vi.fn(() => {
      values.clear();
    }),
  };
}

const baseItem: AddCartItemInput = {
  productId: "product-om285",
  productSlug: "membrane-filter",
  productName: "Membrane Filter",
  variantId: "variant-020",
  variantSku: "OM285-020",
  variantName: "Membrane Filter 0.20",
  variantLabel: "0.20 micron",
  image: "https://omsonslabs.com/filter.jpg",
  packPricePaise: 520000,
  packSize: 100,
  initialQuantity: 1,
};

const secondVariant: AddCartItemInput = {
  ...baseItem,
  variantId: "variant-045",
  variantSku: "OM285-045",
  variantName: "Membrane Filter 0.45",
  variantLabel: "0.45 micron",
};

async function loadFreshStore() {
  vi.resetModules();

  const storage = createMemoryStorage();
  vi.stubGlobal("localStorage", storage);

  const cartStoreModule = await import("../src/features/cart/store/cart-store");
  cartStoreModule.useCartStore.setState({
    items: [],
    hasHydrated: true,
  });

  return {
    storage,
    ...cartStoreModule,
  };
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe("variant-aware cart store", () => {
  test("adding one variant creates one item", async () => {
    const { useCartStore } = await loadFreshStore();

    useCartStore.getState().addItem(baseItem);

    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0]?.variantSku).toBe("OM285-020");
  });

  test("adding the same variant twice increases only its quantity", async () => {
    const { useCartStore } = await loadFreshStore();

    useCartStore.getState().addItem(baseItem);
    useCartStore.getState().addItem(baseItem);

    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0]?.quantity).toBe(2);
  });

  test("two variants of the same product remain separate", async () => {
    const { useCartStore } = await loadFreshStore();

    useCartStore.getState().addItem(baseItem);
    useCartStore.getState().addItem(secondVariant);

    expect(useCartStore.getState().items).toHaveLength(2);
    expect(useCartStore.getState().items.map((item) => item.variantSku))
      .toEqual(["OM285-020", "OM285-045"]);
  });

  test("cart keys include both product ID and variant ID", async () => {
    const { createCartKey } = await loadFreshStore();

    expect(createCartKey("product-om285", "variant-020"))
      .toBe("product-om285:variant-020");
  });

  test("increment and decrement change only the matching variant", async () => {
    const { createCartKey, useCartStore } = await loadFreshStore();
    const firstKey = createCartKey(baseItem.productId, baseItem.variantId);
    const secondKey = createCartKey(
      secondVariant.productId,
      secondVariant.variantId,
    );

    useCartStore.getState().addItem(baseItem);
    useCartStore.getState().addItem(secondVariant);
    useCartStore.getState().incrementItem(secondKey);
    useCartStore.getState().incrementItem(secondKey);
    useCartStore.getState().decrementItem(firstKey);

    expect(useCartStore.getState().items.find((item) => item.variantId === "variant-020"))
      .toBeUndefined();
    expect(useCartStore.getState().items.find((item) => item.variantId === "variant-045")?.quantity)
      .toBe(3);
  });

  test("decrementing quantity 1 removes the item", async () => {
    const { createCartKey, useCartStore } = await loadFreshStore();

    useCartStore.getState().addItem(baseItem);
    useCartStore.getState().decrementItem(
      createCartKey(baseItem.productId, baseItem.variantId),
    );

    expect(useCartStore.getState().items).toHaveLength(0);
  });

  test("setting quantity 0 removes the item", async () => {
    const { createCartKey, useCartStore } = await loadFreshStore();

    useCartStore.getState().addItem(baseItem);
    useCartStore.getState().setItemQuantity(
      createCartKey(baseItem.productId, baseItem.variantId),
      0,
    );

    expect(useCartStore.getState().items).toHaveLength(0);
  });

  test("stock limit is respected", async () => {
    const { createCartKey, useCartStore } = await loadFreshStore();
    const stockedItem = {
      ...baseItem,
      stock: 3,
      initialQuantity: 2,
    };

    useCartStore.getState().addItem(stockedItem);
    useCartStore.getState().incrementItem(
      createCartKey(stockedItem.productId, stockedItem.variantId),
    );
    useCartStore.getState().incrementItem(
      createCartKey(stockedItem.productId, stockedItem.variantId),
    );

    expect(useCartStore.getState().items[0]?.quantity).toBe(3);
  });

  test("subtotal uses pack price times pack quantity and not pack size", async () => {
    const { useCartStore } = await loadFreshStore();

    useCartStore.getState().addItem({
      ...baseItem,
      packPricePaise: 520000,
      packSize: 100,
      initialQuantity: 2,
    });

    expect(useCartStore.getState().getSubtotalPaise()).toBe(1040000);
    expect(useCartStore.getState().getTotalPieces()).toBe(200);
    expect(useCartStore.getState().getTotalPacks()).toBe(2);
  });

  test("persisted state stores separate variants", async () => {
    const { storage, useCartStore } = await loadFreshStore();

    useCartStore.getState().addItem(baseItem);
    useCartStore.getState().addItem(secondVariant);

    const persistedValue = storage.setItem.mock.calls
      .filter(([key]) => key === "worklab-cart")
      .at(-1)?.[1];

    expect(persistedValue).toBeTruthy();

    const persisted = JSON.parse(String(persistedValue)) as {
      state: { items: Array<{ variantSku: string }> };
    };

    expect(persisted.state.items.map((item) => item.variantSku))
      .toEqual(["OM285-020", "OM285-045"]);
  });
});


describe("identity-scoped cart persistence", () => {
  test("one customer's cart is never shown to another customer", async () => {
    const { setCartIdentity, useCartStore } = await loadFreshStore();

    useCartStore.getState().addItem(baseItem);
    setCartIdentity("customer-a", "CUSTOMER", { mergeGuest: true });
    useCartStore.getState().addItem(secondVariant);

    setCartIdentity(null);
    expect(useCartStore.getState().items).toEqual([]);

    setCartIdentity("customer-b", "CUSTOMER");
    expect(useCartStore.getState().items).toEqual([]);

    setCartIdentity("customer-a", "CUSTOMER");
    expect(useCartStore.getState().items.map((item) => item.variantSku))
      .toEqual(["OM285-020", "OM285-045"]);
  });

  test("role is part of the persisted identity scope", async () => {
    const { setCartIdentity, useCartStore } = await loadFreshStore();

    setCartIdentity("shared-id", "CUSTOMER");
    useCartStore.getState().addItem(baseItem);

    setCartIdentity("shared-id", "ADMIN");
    expect(useCartStore.getState().items).toEqual([]);
  });
});
