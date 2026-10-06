"use client";

import type { ReactNode } from "react";

import type { AddCartItemInput } from "@/features/cart/types";
import {
  createCartKey,
  useCartStore,
} from "@/features/cart/store/cart-store";

type AddToCartButtonProps = {
  item: AddCartItemInput | null;
  disabled?: boolean;
  className?: string;
  counterClassName?: string;
  children: ReactNode;
  ariaLabel?: string;
  onAdded?: () => void;
};

const defaultCounterClassName = "qty qty-block";

export function AddToCartButton({
  item,
  disabled = false,
  className,
  counterClassName,
  children,
  ariaLabel,
  onAdded,
}: AddToCartButtonProps) {
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const incrementItem = useCartStore((state) => state.incrementItem);
  const decrementItem = useCartStore((state) => state.decrementItem);
  const cartEnabled = useCartStore((state) => state.cartEnabled);
  const isDisabled = disabled || !item;
  const cartKey = item
    ? createCartKey(item.productId, item.variantId)
    : null;
  const cartQuantity = cartKey
    ? items.find(
        (cartItem) =>
          createCartKey(cartItem.productId, cartItem.variantId) === cartKey,
      )?.quantity ?? 0
    : 0;

  if (!cartEnabled) return null;

  if (item && cartKey && cartQuantity > 0) {
    return (
      <div
        role="group"
        className={counterClassName ?? defaultCounterClassName}
        aria-label={`${item.productName} ${item.variantSku} quantity in cart`}
      >
        <button
          type="button"
          onClick={() => decrementItem(cartKey)}
          aria-label={`Decrease ${item.productName} ${item.variantSku} pack quantity`}
        >
          &minus;
        </button>

        <output aria-live="polite">{cartQuantity}</output>

        <button
          type="button"
          onClick={() => incrementItem(cartKey)}
          aria-label={`Increase ${item.productName} ${item.variantSku} pack quantity`}
        >
          +
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={() => {
        if (!item) {
          return;
        }

        addItem(item);
        onAdded?.();
      }}
      aria-label={ariaLabel}
      className={className}
    >
      {children}
    </button>
  );
}

export default AddToCartButton;
