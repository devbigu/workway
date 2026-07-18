"use client";

import { create } from "zustand";
import {
  createJSONStorage,
  persist,
} from "zustand/middleware";

import type {
  AddCartItemInput,
  CartItem,
  CartState,
} from "@/features/cart/types";

type InternalCartState = CartState & {
  setHasHydrated: (hasHydrated: boolean) => void;
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
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      addItem: (item) => {
        const nextItem = toCartItem(item);

        if (!nextItem) {
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
      name: "workway-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
