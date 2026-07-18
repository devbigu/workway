"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

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

export function GlobalHeader() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchAreaRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const miniCartCloseTimerRef = useRef<number | null>(null);
  const items = useCartStore((state) => state.items);
  const hasHydrated = useCartStore((state) => state.hasHydrated);
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
    const update = () => setIsScrolled((current) => {
      const next = window.scrollY > 28;
      return current === next ? current : next;
    });
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    if (!isSearchOpen) {
      return;
    }

    const focusTimer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 120);

    return () => window.clearTimeout(focusTimer);
  }, [isSearchOpen]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (
        isSearchOpen &&
        searchAreaRef.current &&
        !searchAreaRef.current.contains(event.target as Node)
      ) {
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
    if (miniCartCloseTimerRef.current !== null) {
      window.clearTimeout(miniCartCloseTimerRef.current);
    }

    setIsMiniCartOpen(true);
  }

  function closeMiniCartSoon() {
    if (miniCartCloseTimerRef.current !== null) {
      window.clearTimeout(miniCartCloseTimerRef.current);
    }

    miniCartCloseTimerRef.current = window.setTimeout(() => {
      setIsMiniCartOpen(false);
    }, 180);
  }

  function handleSearchKeyDown(
    event: KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key !== "Enter") {
      return;
    }

    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) {
      return;
    }

    router.push(
      `/products?q=${encodeURIComponent(trimmedQuery)}`,
    );
  }

  return (
    <header className={`sticky top-0 z-50 border-b transition-all duration-300 ${isScrolled ? "border-slate-200/90 bg-white/95 shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur-2xl" : "border-slate-200/70 bg-white/85 backdrop-blur-xl"}`}>
      <div className={`mx-auto flex max-w-[1380px] items-center justify-between gap-5 px-4 transition-all duration-300 sm:px-6 lg:px-8 ${isScrolled ? "h-16" : "h-20"}`}>
        <Link href="/" className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" onClick={() => setMobileOpen(false)}>
          <span className={`grid place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 transition-all duration-300 ${isScrolled ? "h-9 w-9" : "h-10 w-10"}`}><Icon name="flask" className={isScrolled ? "h-4.5 w-4.5" : "h-5 w-5"} /></span>
          <span className={`font-bold tracking-[-0.04em] text-slate-950 transition-all duration-300 ${isScrolled ? "text-lg" : "text-xl"}`}>WorkWay</span>
        </Link>
        <DesktopNav compact={isScrolled} />
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div
            ref={searchAreaRef}
            className="relative hidden items-center justify-end sm:flex"
          >
            <div
              className={[
                "absolute right-10 overflow-hidden transition-all duration-[400ms] ease-in-out",
                isSearchOpen
                  ? "w-64 translate-x-0 opacity-100"
                  : "pointer-events-none w-0 translate-x-4 opacity-0",
              ].join(" ")}
            >
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                onKeyDown={handleSearchKeyDown}
                placeholder="Search products..."
                className="h-10 w-full rounded-full border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              type="button"
              onClick={() =>
                setIsSearchOpen((current) => !current)
              }
              aria-label={
                isSearchOpen ? "Close search" : "Open search"
              }
              aria-expanded={isSearchOpen}
              className="grid h-10 w-10 place-items-center rounded-full text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Icon name="search" className="h-5 w-5" />
            </button>
          </div>
          <AccountMenu />
          <Link href="/cart" aria-label="Cart" className="relative grid h-10 w-10 place-items-center rounded-full text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:hidden">
            <Icon name="cart" className="h-5 w-5" />
            {totalCartQuantity > 0 && (
              <span aria-live="polite" className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-blue-600 px-1 text-[9px] font-bold text-white">
                {totalCartQuantity > 99 ? "99+" : totalCartQuantity}
              </span>
            )}
          </Link>
          <div
            className="relative hidden sm:block"
            onMouseEnter={openMiniCart}
            onMouseLeave={closeMiniCartSoon}
            onFocus={openMiniCart}
            onBlur={closeMiniCartSoon}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setIsMiniCartOpen(false);
              }
            }}
          >
            <Link href="/cart" aria-label="Cart" aria-expanded={isMiniCartOpen} className="relative grid h-10 w-10 place-items-center rounded-full text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <Icon name="cart" className="h-5 w-5" />
              {totalCartQuantity > 0 && (
                <span aria-live="polite" className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-blue-600 px-1 text-[9px] font-bold text-white">
                  {totalCartQuantity > 99 ? "99+" : totalCartQuantity}
                </span>
              )}
            </Link>

            <div
              className={[
                "absolute right-0 top-full mt-3 w-80 origin-top-right rounded-[18px] border border-slate-200 bg-white p-4 shadow-[0_18px_55px_rgba(15,23,42,0.16)] transition-all duration-200 ease-out",
                isMiniCartOpen
                  ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                  : "pointer-events-none -translate-y-1 scale-95 opacity-0",
              ].join(" ")}
            >
              {displayItems.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {miniCartItems.map((item) => {
                      const lineTotalPaise =
                        item.packPricePaise * item.quantity;

                      return (
                        <Link
                          key={getCartItemKey(item)}
                          href={getProductVariantHref(item)}
                          className="grid grid-cols-[52px_minmax(0,1fr)] gap-3 rounded-xl p-2 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                        >
                          <span className="relative h-[52px] w-[52px] overflow-hidden rounded-lg bg-slate-50">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt=""
                                fill
                                unoptimized
                                sizes="52px"
                                className="object-contain p-1.5"
                              />
                            ) : null}
                          </span>

                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-slate-950">
                              {item.productName}
                            </span>
                            <span className="mt-0.5 block truncate text-xs text-slate-500">
                              {item.variantSku} - Pack of {item.packSize}
                            </span>
                            <span className="mt-1 flex items-center justify-between gap-2 text-xs font-medium text-slate-600">
                              <span>{item.quantity} packs</span>
                              <span>{formatPaise(lineTotalPaise)}</span>
                            </span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>

                  {remainingMiniCartItems > 0 && (
                    <p className="mt-2 text-center text-xs font-medium text-slate-500">
                      + {remainingMiniCartItems} more items
                    </p>
                  )}

                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span>Total packs</span>
                      <span className="font-semibold text-slate-950">
                        {totalCartQuantity}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
                      <span>Subtotal</span>
                      <span className="font-semibold text-slate-950">
                        {formatPaise(subtotalPaise)}
                      </span>
                    </div>
                    <Link href="/cart" className="mt-4 flex h-10 items-center justify-center rounded-full bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">
                      View Cart
                    </Link>
                  </div>
                </>
              ) : (
                <div className="py-3 text-center">
                  <p className="text-sm font-semibold text-slate-950">
                    Your cart is empty
                  </p>
                  <Link href="/products" className="mt-3 inline-flex h-10 items-center rounded-full bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">
                    Explore Products
                  </Link>
                </div>
              )}
            </div>
          </div>
          <Link href="/contact" className="ww-button-pop hidden rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 md:inline-flex">Request Quote</Link>
          <button type="button" aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen} aria-controls="workway-mobile-menu" onClick={() => setMobileOpen((value) => !value)} className="grid h-10 w-10 place-items-center rounded-full text-slate-800 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:hidden"><Icon name={mobileOpen ? "x" : "menu"} /></button>
        </div>
      </div>
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}


