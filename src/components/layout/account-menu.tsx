"use client";

import Link from "next/link";

import { Icon } from "@/features/home/components/icon";
import { authClient } from "@/lib/auth-client";

export function AccountMenu() {
  const session = authClient.useSession();
  const user = session.data?.user as
    | { role?: string; emailVerified?: boolean }
    | undefined;
  const isAdmin =
    Boolean(user?.emailVerified) &&
    Boolean(user?.role) &&
    user?.role !== "CUSTOMER";

  if (!session.isPending && !user) {
    return (
      <div className="hidden items-center gap-2 sm:flex">
        <Link
          href="/login"
          className="rounded-full px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-lime-50 hover:text-lime-700 focus:outline-none focus:ring-2 focus:ring-lime-500"
        >
          Log in
        </Link>
        <Link
          href="/register"
          className="rounded-full bg-lime-400 px-4 py-2 text-sm font-bold text-green-950 shadow-sm shadow-lime-500/25 transition hover:bg-lime-300 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-offset-2"
        >
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="hidden items-center gap-1 sm:flex">
      {isAdmin && (
        <Link href="/admin" className="rounded-full bg-lime-50 px-3 py-2 text-xs font-bold text-lime-700">
          Dashboard
        </Link>
      )}
      <Link href="/account" aria-label="Account" className="grid h-10 w-10 place-items-center rounded-full text-slate-700 transition hover:bg-lime-50 focus:outline-none focus:ring-2 focus:ring-lime-500">
        <Icon name="user" className="h-5 w-5" />
      </Link>
    </div>
  );
}