"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  getCartItemKey,
  useCartStore,
} from "@/features/cart/store/cart-store";
import type { CartItem } from "@/features/cart/types";
import { Icon } from "@/features/home/components/icon";
import { AccountMenu } from "./account-menu";
import { DesktopNav } from "./desktop-nav";
import { MobileNav } from "./mobile-nav";

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

function CartBadge({ quantity }: { quantity: number }) {
  if (quantity <= 0) return null;
  return (
    <span aria-live="polite" className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 font-mono text-[10px] leading-none text-inverse">
      {quantity > 99 ? "99+" : quantity}
    </span>
  );
}

export function GlobalHeader() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
  const searchAreaRef = useRef<HTMLFormElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const miniCartCloseTimerRef = useRef<number | null>(null);
  const items = useCartStore((state) => state.items);
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const cartEnabled = useCartStore((state) => state.cartEnabled);
  const displayItems = useMemo(
    () => (hasHydrated ? items : []),
    [hasHydrated, items],
  );
  const totalCartQuantity = displayItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );
  const miniCartItems = useMemo(
    () => displayItems.slice(-4).reverse(),
    [displayItems],
  );
  const remainingMiniCartItems = Math.max(
    displayItems.length - miniCartItems.length,
    0,
  );
  const subtotalPaise = displayItems.reduce(
    (total, item) => total + item.packPricePaise * item.quantity,
    0,
  );

  useEffect(() => {
    if (!isSearchOpen) return;
    const focusTimer = window.setTimeout(() => searchInputRef.current?.focus(), 120);
    return () => window.clearTimeout(focusTimer);
  }, [isSearchOpen]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (isSearchOpen && searchAreaRef.current && !searchAreaRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSearchOpen(false);
        setIsMiniCartOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSearchOpen]);

  function openMiniCart() {
    if (miniCartCloseTimerRef.current !== null) window.clearTimeout(miniCartCloseTimerRef.current);
    setIsMiniCartOpen(true);
  }

  function closeMiniCartSoon() {
    if (miniCartCloseTimerRef.current !== null) window.clearTimeout(miniCartCloseTimerRef.current);
    miniCartCloseTimerRef.current = window.setTimeout(() => setIsMiniCartOpen(false), 180);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur-[12px]">
      <div className="page-wrap flex h-[68px] items-center justify-between gap-5">
        <Link href="/" className="flex items-center gap-2 text-ink no-underline" onClick={() => setMobileOpen(false)}>
          <Icon name="flask" className="h-5 w-5" strokeWidth={1.5} />
          <span className="text-lg font-semibold tracking-[-0.02em]">Rootra</span>
        </Link>
        <DesktopNav />
        <div className="flex items-center gap-1 sm:gap-2">
          <form
            ref={searchAreaRef}
            action="/products"
            method="GET"
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              const q = searchInputRef.current?.value.trim();
              if (q) router.push(`/products?q=${encodeURIComponent(q)}`);
            }}
            className={`relative hidden h-11 overflow-hidden rounded-full transition-[width] duration-[350ms] ease-out sm:block ${isSearchOpen ? "w-64" : "w-11"}`}
          >
            <label htmlFor="header-q" className="sr-only">Search products</label>
            <input
              ref={searchInputRef}
              id="header-q"
              name="q"
              type="search"
              required
              autoComplete="off"
              placeholder="Product or catalogue no."
              aria-hidden={!isSearchOpen}
              tabIndex={isSearchOpen ? 0 : -1}
              className={`h-11 w-full rounded-full border border-line-strong bg-surface pl-11 pr-4 text-sm text-ink outline-none placeholder:text-ink-3 focus:border-ink ${isSearchOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
            />
            <button
              type="button"
              onClick={() => setIsSearchOpen((current) => !current)}
              aria-label={isSearchOpen ? "Close search" : "Open search"}
              aria-expanded={isSearchOpen}
              className="btn btn-icon absolute left-0 top-0"
            >
              <Icon name="search" className="h-5 w-5" />
            </button>
          </form>
          <AccountMenu />
          {cartEnabled && (<>
            <Link href="/cart" aria-label="Cart" className="btn btn-icon relative sm:hidden">
              <Icon name="cart" className="h-5 w-5" />
              <CartBadge quantity={totalCartQuantity} />
            </Link>
            <div
              className="relative hidden sm:block"
              onMouseEnter={openMiniCart}
              onMouseLeave={closeMiniCartSoon}
              onFocus={openMiniCart}
              onBlur={closeMiniCartSoon}
            >
              <Link href="/cart" aria-label="Cart" aria-expanded={isMiniCartOpen} className="btn btn-icon relative">
                <Icon name="cart" className="h-5 w-5" />
                <CartBadge quantity={totalCartQuantity} />
              </Link>

              {isMiniCartOpen && (
                <div className="popover absolute right-0 top-full mt-2 w-80 p-3">
                  {displayItems.length > 0 ? (
                    <>
                      <div className="grid gap-1">
                        {miniCartItems.map((item) => (
                          <Link
                            key={getCartItemKey(item)}
                            href={getProductVariantHref(item)}
                            className="grid grid-cols-[52px_minmax(0,1fr)] gap-3 rounded-sm p-2 text-ink no-underline hover:bg-surface-alt"
                          >
                            <span className="relative h-[52px] w-[52px] overflow-hidden rounded-xs bg-surface-alt">
                              {item.image ? (
                                <Image src={item.image} alt="" fill unoptimized sizes="52px" className="object-contain p-1.5 mix-blend-multiply" />
                              ) : null}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium">{item.productName}</span>
                              <span className="meta block truncate">{item.variantSku} · Pack of {item.packSize}</span>
                              <span className="mt-1 flex items-center justify-between gap-2 font-mono text-xs tabular-nums text-ink-2">
                                <span>{item.quantity} packs</span>
                                <span>{formatPaise(item.packPricePaise * item.quantity)}</span>
                              </span>
                            </span>
                          </Link>
                        ))}
                      </div>

                      {remainingMiniCartItems > 0 && (
                        <p className="meta mt-2 text-center">+ {remainingMiniCartItems} more lines</p>
                      )}

                      <dl className="mt-3 grid gap-2 border-t border-line px-2 pt-3 text-sm">
                        <div className="flex justify-between"><dt className="text-ink-3">Total packs</dt><dd className="figure">{totalCartQuantity}</dd></div>
                        <div className="flex justify-between"><dt className="text-ink-3">Subtotal</dt><dd className="figure">{formatPaise(subtotalPaise)}</dd></div>
                      </dl>
                      <Link href="/cart" className="btn btn-primary btn-block mt-3">View cart</Link>
                    </>
                  ) : (
                    <div className="grid justify-items-center gap-3 py-4 text-center">
                      <p className="text-sm font-medium text-ink">Your cart is empty</p>
                      <Link href="/products" className="btn btn-primary">Explore products</Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>)}
          <Link href="/contact" className="btn btn-primary hidden md:inline-flex">Request quote</Link>
          <button type="button" aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen} aria-controls="rootra-mobile-menu" onClick={() => setMobileOpen((value) => !value)} className="btn btn-icon lg:hidden">
            <Icon name={mobileOpen ? "x" : "menu"} />
          </button>
        </div>
      </div>
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
