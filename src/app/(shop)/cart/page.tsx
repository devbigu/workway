"use client";

import Image from "next/image";
import Link from "next/link";

import {
  getCartItemKey,
  useCartStore,
} from "@/features/cart/store/cart-store";
import type { CartItem } from "@/features/cart/types";

function formatPaise(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value / 100);
}

function getProductVariantHref(item: CartItem): string {
  return `/products/${item.productSlug}?variant=${encodeURIComponent(
    item.variantId,
  )}`;
}

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const incrementItem = useCartStore((state) => state.incrementItem);
  const decrementItem = useCartStore((state) => state.decrementItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const setItemQuantity = useCartStore(
    (state) => state.setItemQuantity,
  );
  const clearCart = useCartStore((state) => state.clearCart);
  const subtotalPaise = useCartStore((state) => state.getSubtotalPaise());
  const totalPacks = useCartStore((state) => state.getTotalPacks());
  const totalPieces = useCartStore((state) => state.getTotalPieces());

  if (!hasHydrated) {
    return (
      <main className="min-h-screen bg-[#f8fbff] px-4 py-12 text-slate-950">
        <div className="mx-auto max-w-[1180px]">
          <div className="h-48 animate-pulse rounded-[24px] border border-slate-200 bg-white" />
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="grid min-h-[70vh] place-items-center bg-[#f8fbff] px-4 text-slate-950">
        <div className="max-w-md rounded-[24px] border border-slate-200 bg-white p-8 text-center shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <h1 className="text-2xl font-semibold tracking-[-0.03em]">
            Your cart is empty
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Explore the catalogue and add priced product variants to your cart.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Explore Products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fbff] text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold tracking-[-0.04em]">
            Cart
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Review selected catalogue variants before checkout.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1180px] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8">
        <section className="space-y-4">
          {items.map((item) => {
            const cartKey = getCartItemKey(item);
            const lineTotalPaise = item.packPricePaise * item.quantity;
            const totalItemPieces = item.packSize * item.quantity;
            const perPiecePaise = Math.round(
              item.packPricePaise / item.packSize,
            );

            return (
              <article
                key={cartKey}
                className="grid gap-4 rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_12px_35px_rgba(15,23,42,0.06)] sm:grid-cols-[120px_minmax(0,1fr)]"
              >
                <Link
                  href={getProductVariantHref(item)}
                  className="relative aspect-square overflow-hidden rounded-[16px] bg-slate-50"
                >
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.productName}
                      fill
                      sizes="120px"
                      className="object-contain p-3"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-xs text-slate-400">
                      No image
                    </div>
                  )}
                </Link>

                <div className="min-w-0">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <Link
                        href={getProductVariantHref(item)}
                        className="text-lg font-semibold tracking-[-0.02em] text-slate-950 transition hover:text-blue-700"
                      >
                        {item.productName}
                      </Link>
                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {item.variantName}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Cat. No. {item.variantSku}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        {item.variantLabel || "Selected specification"}
                      </p>
                    </div>

                    <div className="text-left lg:text-right">
                      <p className="text-lg font-bold text-slate-950">
                        {formatPaise(lineTotalPaise)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatPaise(item.packPricePaise)} per pack
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
                    <div>
                      <span className="block text-xs text-slate-400">Pack size</span>
                      <strong className="font-semibold text-slate-900">
                        {item.packSize} pieces
                      </strong>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-400">Price per piece</span>
                      <strong className="font-semibold text-slate-900">
                        {formatPaise(perPiecePaise)}
                      </strong>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-400">Total pieces</span>
                      <strong className="font-semibold text-slate-900">
                        {totalItemPieces}
                      </strong>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white">
                      <button
                        type="button"
                        onClick={() => decrementItem(cartKey)}
                        aria-label={`Decrease ${item.variantSku}`}
                        className="grid h-10 w-10 place-items-center text-lg text-slate-600 transition hover:bg-slate-50 hover:text-blue-700"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={0}
                        max={item.stock}
                        value={item.quantity}
                        onChange={(event) =>
                          setItemQuantity(
                            cartKey,
                            Number.parseInt(event.target.value, 10),
                          )
                        }
                        aria-label={`Packs for ${item.variantSku}`}
                        className="h-10 w-16 border-x border-slate-200 text-center text-sm font-semibold text-slate-950 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => incrementItem(cartKey)}
                        aria-label={`Increase ${item.variantSku}`}
                        className="grid h-10 w-10 place-items-center text-lg text-slate-600 transition hover:bg-slate-50 hover:text-blue-700"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm text-slate-500">
                      {item.quantity} packs
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(cartKey)}
                      className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <aside className="h-fit rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] lg:sticky lg:top-28">
          <h2 className="text-lg font-semibold tracking-[-0.02em]">
            Summary
          </h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Variants</dt>
              <dd className="font-semibold text-slate-950">{items.length}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Total packs</dt>
              <dd className="font-semibold text-slate-950">{totalPacks}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Total pieces</dt>
              <dd className="font-semibold text-slate-950">{totalPieces}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-slate-100 pt-4 text-base">
              <dt className="font-semibold text-slate-700">Subtotal</dt>
              <dd className="font-bold text-slate-950">
                {formatPaise(subtotalPaise)}
              </dd>
            </div>
          </dl>
          <Link
            href="/checkout"
            className="mt-6 flex w-full justify-center rounded-[14px] bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Proceed to checkout
          </Link>
          <button
            type="button"
            onClick={clearCart}
            className="mt-3 w-full rounded-[14px] border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Clear cart
          </button>
        </aside>
      </div>
    </main>
  );
}
