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

const defaultCounterClassName =
  "mt-5 grid w-full grid-cols-[44px_minmax(0,1fr)_44px] overflow-hidden rounded-[13px] border border-blue-200 bg-blue-50 text-sm font-semibold text-blue-700 shadow-[0_8px_20px_rgba(37,99,235,0.12)]";

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

  if (item && cartKey && cartQuantity > 0) {
    return (
      <div
        className={counterClassName ?? defaultCounterClassName}
        aria-label={`${item.productName} ${item.variantSku} quantity in cart`}
      >
        <button
          type="button"
          onClick={() => decrementItem(cartKey)}
          aria-label={`Decrease ${item.productName} ${item.variantSku} pack quantity`}
          className="grid h-11 place-items-center text-lg transition hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-inset"
        >
          -
        </button>

        <span className="grid h-11 place-items-center border-x border-blue-200 bg-white text-slate-950">
          {cartQuantity}
        </span>

        <button
          type="button"
          onClick={() => incrementItem(cartKey)}
          aria-label={`Increase ${item.productName} ${item.variantSku} pack quantity`}
          className="grid h-11 place-items-center text-lg transition hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-inset"
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
