"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";
import { isolateGuestCart } from "@/features/cart/store/cart-store";

const items = [
  { href: "/account", label: "My Orders", icon: "package" },
  { href: "/account/addresses", label: "Your Addresses", icon: "pin" },
  { href: "/account/security", label: "Login & Security", icon: "shield" },
  { href: "/account/payments", label: "Payments", icon: "card" },
  { href: "/account/archived-orders", label: "Archived Orders", icon: "archive" },
  { href: "/account/saved-items", label: "Saved Items", icon: "heart" },
  { href: "/account/support", label: "Customer Support", icon: "support" },
] as const;

function NavIcon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    package: <><path d="m4 7 8-4 8 4-8 4-8-4Z" /><path d="M4 7v10l8 4 8-4V7M12 11v10" /></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    shield: <><path d="M12 3 20 6v6c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6l8-3Z" /><path d="m9 12 2 2 4-4" /></>,
    card: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h3" /></>,
    archive: <><path d="M4 7h16v13H4zM3 3h18v4H3z" /><path d="M9 12h6" /></>,
    heart: <path d="M20.8 5.2a5.2 5.2 0 0 0-7.4 0L12 6.6l-1.4-1.4a5.2 5.2 0 1 0-7.4 7.4L12 21l8.8-8.4a5.2 5.2 0 0 0 0-7.4Z" />,
    support: <><circle cx="12" cy="12" r="9" /><path d="M7 13v-2a5 5 0 0 1 10 0v2M7 13H5v4h3v-4Zm10 0h2v4h-3v-4ZM16 19c-1 1-2 1-4 1" /></>,
    logout: <><path d="M10 5H5v14h5M14 8l4 4-4 4M8 12h10" /></>,
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

export function AccountNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function logout() {
    setSigningOut(true);
    isolateGuestCart();
    await authClient.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <>
      <nav aria-label="Account navigation" className="hidden lg:block">
        <div className="space-y-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          {items.map((item) => {
            const active = item.href === "/account"
              ? pathname === "/account" || pathname.startsWith("/account/orders")
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-12 items-center gap-3 rounded-xl px-3.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${active ? "bg-blue-50 text-blue-800" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}
              >
                <span className={active ? "text-blue-600" : "text-slate-400"}><NavIcon name={item.icon} /></span>
                {item.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={logout}
            disabled={signingOut}
            className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3.5 text-left text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:opacity-60"
          >
            <span className="text-slate-400"><NavIcon name="logout" /></span>
            {signingOut ? "Logging outâ€¦" : "Log Out"}
          </button>
        </div>
      </nav>

      <nav aria-label="Mobile account navigation" className="-mx-4 overflow-x-auto px-4 pb-2 lg:hidden">
        <div className="flex min-w-max gap-2">
          {items.map((item) => {
            const active = item.href === "/account"
              ? pathname === "/account" || pathname.startsWith("/account/orders")
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${active ? "border-blue-200 bg-blue-50 text-blue-800" : "border-slate-200 bg-white text-slate-600"}`}
              >
                <NavIcon name={item.icon} />{item.label}
              </Link>
            );
          })}
          <button type="button" onClick={logout} disabled={signingOut} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 disabled:opacity-60">
            <NavIcon name="logout" />{signingOut ? "Logging outâ€¦" : "Log Out"}
          </button>
        </div>
      </nav>
    </>
  );
}

