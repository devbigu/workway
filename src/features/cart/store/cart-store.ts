"use client";

import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware";

import type {
  AddCartItemInput,
  CartItem,
  CartState,
} from "@/features/cart/types";

type InternalCartState = CartState & {
  setHasHydrated: (hasHydrated: boolean) => void;
};

const GUEST_CART_STORAGE_KEY = "worklab-cart";
// null = cart disabled (staff roles): nothing is read or persisted.
let activeCartStorageKey: string | null = GUEST_CART_STORAGE_KEY;

function getUserCartStorageKey(userId: string, role: string): string {
  return `worklab-cart:${encodeURIComponent(role)}:${encodeURIComponent(userId)}`;
}

const scopedStorage: StateStorage = {
  getItem: () => activeCartStorageKey && localStorage.getItem(activeCartStorageKey),
  setItem: (_name, value) => {
    if (activeCartStorageKey) localStorage.setItem(activeCartStorageKey, value);
  },
  removeItem: () => {
    if (activeCartStorageKey) localStorage.removeItem(activeCartStorageKey);
  },
};

export function createCartKey(
  productId: string,
  variantId: string,
): string {
  return `${productId}:${variantId}`;
}

export function getCartItemKey(
  item: Pick<CartItem, "productId" | "variantId">,
): string {
  return createCartKey(item.productId, item.variantId);
}

function normalizeQuantity(
  quantity: number,
  stock?: number,
): number {
  if (!Number.isFinite(quantity)) {
    return 1;
  }

  const wholeQuantity = Math.floor(quantity);

  if (wholeQuantity <= 0) {
    return 0;
  }

  if (typeof stock === "number") {
    return Math.min(wholeQuantity, Math.max(0, stock));
  }

  return wholeQuantity;
}

function toCartItem(item: AddCartItemInput): CartItem | null {
  const quantity = normalizeQuantity(
    item.initialQuantity ?? 1,
    item.stock,
  );

  if (quantity <= 0 || item.packPricePaise < 0 || item.packSize <= 0) {
    return null;
  }

  const { initialQuantity, ...cartItem } = item;
  void initialQuantity;

  return {
    ...cartItem,
    quantity,
  };
}

export function getSubtotalPaise(items: CartItem[]): number {
  return items.reduce(
    (subtotal, item) => subtotal + item.packPricePaise * item.quantity,
    0,
  );
}

export function getTotalPacks(items: CartItem[]): number {
  return items.reduce(
    (totalPacks, item) => totalPacks + item.quantity,
    0,
  );
}

export function getTotalPieces(items: CartItem[]): number {
  return items.reduce(
    (totalPieces, item) => totalPieces + item.packSize * item.quantity,
    0,
  );
}

export const useCartStore = create<InternalCartState>()(
  persist(
    (set, get) => ({
      items: [],
      hasHydrated: false,
      cartEnabled: true,
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      addItem: (item) => {
        const nextItem = toCartItem(item);

        if (!nextItem || !get().cartEnabled) {
          return;
        }

        const nextKey = getCartItemKey(nextItem);

        set((state) => {
          const existingItem = state.items.find(
            (cartItem) => getCartItemKey(cartItem) === nextKey,
          );

          if (!existingItem) {
            return {
              items: [...state.items, nextItem],
            };
          }

          const nextQuantity = normalizeQuantity(
            existingItem.quantity + nextItem.quantity,
            existingItem.stock,
          );

          return {
            items: state.items.map((cartItem) =>
              getCartItemKey(cartItem) === nextKey
                ? {
                    ...cartItem,
                    ...nextItem,
                    quantity: nextQuantity,
                  }
                : cartItem,
            ),
          };
        });
      },
      removeItem: (cartKey) => {
        set((state) => ({
          items: state.items.filter(
            (item) => getCartItemKey(item) !== cartKey,
          ),
        }));
      },
      incrementItem: (cartKey) => {
        set((state) => ({
          items: state.items.map((item) =>
            getCartItemKey(item) === cartKey
              ? {
                  ...item,
                  quantity: normalizeQuantity(
                    item.quantity + 1,
                    item.stock,
                  ),
                }
              : item,
          ),
        }));
      },
      decrementItem: (cartKey) => {
        set((state) => ({
          items: state.items
            .map((item) =>
              getCartItemKey(item) === cartKey
                ? {
                    ...item,
                    quantity: item.quantity - 1,
                  }
                : item,
            )
            .filter((item) => item.quantity > 0),
        }));
      },
      setItemQuantity: (cartKey, quantity) => {
        set((state) => ({
          items: state.items
            .map((item) =>
              getCartItemKey(item) === cartKey
                ? {
                    ...item,
                    quantity: normalizeQuantity(quantity, item.stock),
                  }
                : item,
            )
            .filter((item) => item.quantity > 0),
        }));
      },
      clearCart: () => set({ items: [] }),
      getSubtotalPaise: () => getSubtotalPaise(get().items),
      getTotalPacks: () => getTotalPacks(get().items),
      getTotalPieces: () => getTotalPieces(get().items),
    }),
    {
      name: GUEST_CART_STORAGE_KEY,
      storage: createJSONStorage(() => scopedStorage),
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

function readStoredItems(storageKey: string): CartItem[] {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) ?? "null") as
      | { state?: { items?: CartItem[] } }
      | null;
    return Array.isArray(value?.state?.items) ? value.state.items : [];
  } catch {
    return [];
  }
}

function mergeItems(...groups: CartItem[][]): CartItem[] {
  const merged = new Map<string, CartItem>();
  for (const item of groups.flat()) {
    const key = getCartItemKey(item);
    const existing = merged.get(key);
    merged.set(key, existing
      ? { ...existing, ...item, quantity: Math.max(existing.quantity, item.quantity) }
      : item);
  }
  return Array.from(merged.values());
}

export function setCartIdentity(
  userId: string | null,
  role = "CUSTOMER",
  options: { mergeGuest?: boolean } = {},
): CartItem[] {
  if (typeof localStorage === "undefined") return useCartStore.getState().items;
  const userKey = userId ? getUserCartStorageKey(userId, role) : null;
  const canShop = !userId || role === "CUSTOMER";
  // Staff roles get no cart: drop any old one, never merge the guest cart into it.
  if (userKey && !canShop) localStorage.removeItem(userKey);
  const nextStorageKey = !userKey ? GUEST_CART_STORAGE_KEY : canShop ? userKey : null;
  const shouldMergeGuest = Boolean(userKey && canShop && options.mergeGuest);
  const guestItems = shouldMergeGuest ? readStoredItems(GUEST_CART_STORAGE_KEY) : [];

  if (activeCartStorageKey === nextStorageKey && !shouldMergeGuest) {
    useCartStore.setState({ hasHydrated: true });
    return useCartStore.getState().items;
  }

  const items = nextStorageKey
    ? mergeItems(readStoredItems(nextStorageKey), guestItems)
    : [];
  activeCartStorageKey = nextStorageKey;
  useCartStore.setState({ items, hasHydrated: true, cartEnabled: canShop });
  if (shouldMergeGuest) localStorage.removeItem(GUEST_CART_STORAGE_KEY);
  return items;
}

export function mergeCartForUser(userId: string, role = "CUSTOMER"): CartItem[] {
  return setCartIdentity(userId, role, { mergeGuest: true });
}

export function isolateGuestCart(): CartItem[] {
  return setCartIdentity(null);
}
