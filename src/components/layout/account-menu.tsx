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
      <div className="hidden items-center gap-1 sm:flex">
        <Link href="/login" className="btn btn-text text-sm">Log in</Link>
        <Link href="/register" className="btn btn-secondary">Sign up</Link>
      </div>
    );
  }

  return (
    <div className="hidden items-center gap-1 sm:flex">
      {isAdmin && <Link href="/admin" className="btn btn-text text-sm">Dashboard</Link>}
      <Link href="/account" aria-label="Account" className="btn btn-icon">
        <Icon name="user" className="h-5 w-5" />
      </Link>
    </div>
  );
}
