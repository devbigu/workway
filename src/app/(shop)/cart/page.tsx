"use client";

import Image from "next/image";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { ProceedToCheckoutButton } from "@/features/cart/components/proceed-to-checkout-button";
import {
  getCartItemKey,
  useCartStore,
} from "@/features/cart/store/cart-store";
import type { CartItem } from "@/features/cart/types";
import { Icon } from "@/features/home/components/icon";

function formatPaise(value: number, decimals = 0): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

function getProductVariantHref(item: CartItem): string {
  return `/products/${item.productSlug}?variant=${encodeURIComponent(
    item.variantId,
  )}`;
}

const crumbs = [{ label: "Home", href: "/" }, { label: "Cart" }];

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

  if (!hasHydrated) {
    return (
      <main className="page-wrap pb-16" aria-busy="true">
        <div className="border-b border-line pb-6 pt-8 lg:pt-12">
          <div className="skeleton h-3 w-24" />
          <div className="skeleton mt-4 h-12 w-40" />
        </div>
        <div className="mt-8 grid gap-12 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="grid gap-6">{[1, 2, 3].map((row) => <div key={row} className="skeleton h-20" />)}</div>
          <div className="skeleton h-80 rounded-md" />
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="page-wrap pb-16">
        <PageHeader crumbs={crumbs} title="Cart" />
        <EmptyState
          title={<em>Nothing measured yet.</em>}
          text="Your cart is empty. Add packs from the catalogue and they will appear here."
          action={<Link href="/products" className="btn btn-primary">Explore products</Link>}
        />
      </main>
    );
  }

  const quoteHref = `/contact?${items.map((item) => `sku=${encodeURIComponent(item.variantSku)}&qty=${item.quantity}`).join("&")}`;

  return (
    <main>
      <div className="page-wrap pb-16">
        <PageHeader
          crumbs={crumbs}
          title="Cart"
          meta={`${totalPacks} ${totalPacks === 1 ? "pack" : "packs"} · ${items.length} ${items.length === 1 ? "line" : "lines"}`}
        />

        <div className="mt-8 grid items-start gap-12 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section aria-label="Cart lines">
            <table className="table table-stack">
              <thead>
                <tr>
                  <th scope="col">Product</th>
                  <th scope="col" className="num">Unit price</th>
                  <th scope="col">Qty</th>
                  <th scope="col" className="num">Line total</th>
                  <th scope="col"><span className="sr-only">Remove</span></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const cartKey = getCartItemKey(item);

                  return (
                    <tr key={cartKey}>
                      <td>
                        <div className="flex gap-4">
                          <Link href={getProductVariantHref(item)} className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-sm bg-surface-alt text-ink-3" tabIndex={-1} aria-hidden="true">
                            {item.image ? (
                              <Image src={item.image} alt="" fill sizes="64px" className="object-contain p-2 mix-blend-multiply" />
                            ) : (
                              <Icon name="glassware" className="h-6 w-6" strokeWidth={1} />
                            )}
                          </Link>
                          <div className="min-w-0">
                            <Link href={getProductVariantHref(item)} className="link-quiet font-medium text-ink">
                              {item.productName}
                            </Link>
                            <p className="meta" title={item.variantSku}>{item.variantSku} · Pack of {item.packSize}</p>
                            {item.variantLabel && <p className="text-sm text-ink-3">{item.variantLabel}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="num" data-label="Unit price">
                        <span>
                          {formatPaise(item.packPricePaise)}
                          <span className="meta block">{formatPaise(item.packPricePaise / item.packSize, 2)} per unit</span>
                        </span>
                      </td>
                      <td data-label="Qty">
                        <div className="qty" role="group" aria-label={`Packs of ${item.variantSku}`}>
                          <button type="button" onClick={() => decrementItem(cartKey)} aria-label={`Decrease ${item.variantSku}`}>&minus;</button>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={item.quantity}
                            onChange={(event) =>
                              setItemQuantity(
                                cartKey,
                                Number.parseInt(event.target.value, 10),
                              )
                            }
                            aria-label={`Packs for ${item.variantSku}`}
                          />
                          <button type="button" onClick={() => incrementItem(cartKey)} aria-label={`Increase ${item.variantSku}`}>+</button>
                        </div>
                      </td>
                      <td className="num" data-label="Line total">
                        <span>{formatPaise(item.packPricePaise * item.quantity)}</span>
                      </td>
                      <td data-label="">
                        <button type="button" onClick={() => removeItem(cartKey)} className="btn btn-text text-sm" aria-label={`Remove ${item.productName} ${item.variantSku}`}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="mt-6 flex items-center justify-between gap-4">
              <Link href="/products" className="link link-arrow text-sm">Continue shopping</Link>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Remove every line from your cart?")) clearCart();
                }}
                className="btn btn-text text-sm text-error"
              >
                Clear cart
              </button>
            </div>
          </section>

          <aside className="summary" aria-labelledby="cart-summary">
            <h2 id="cart-summary" className="subsection">Summary</h2>
            <dl className="mt-5 grid gap-3 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-ink-3">Subtotal</dt><dd className="figure">{formatPaise(subtotalPaise)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-ink-3">GST</dt><dd className="text-ink-2">Calculated at checkout</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-ink-3">Shipping</dt><dd className="text-ink-2">Calculated at checkout</dd></div>
              <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-line pt-4">
                <dt className="font-medium text-ink">Total <span className="meta">excl. GST</span></dt>
                <dd className="figure-lg">{formatPaise(subtotalPaise)}</dd>
              </div>
            </dl>
            <div className="mt-6 grid gap-3">
              <ProceedToCheckoutButton />
              <Link href={quoteHref} className="btn btn-secondary btn-block">Request quote for this cart</Link>
            </div>
            <p className="mt-4 text-sm text-ink-3">Prices exclude GST. A GST invoice is issued with every order.</p>
          </aside>
        </div>
      </div>

      <div className="action-bar">
        <span className="figure-lg">{formatPaise(subtotalPaise)}</span>
        <ProceedToCheckoutButton className="btn btn-primary ml-auto" label="Checkout" />
      </div>
    </main>
  );
}
