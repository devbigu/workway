"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

import { authClient } from "@/lib/auth-client";
import { setCartIdentity, useCartStore } from "../store/cart-store";

type ScopedUser = { id: string; role?: string };

export function CartScopeProvider({ children }: { children: ReactNode }) {
  const session = authClient.useSession();
  const user = session.data?.user as ScopedUser | undefined;
  const previousUserId = useRef<string | null | undefined>(undefined);

  useLayoutEffect(() => {
    if (session.isPending) {
      useCartStore.setState({ hasHydrated: false });
      return;
    }

    const userId = user?.id ?? null;
    setCartIdentity(userId, user?.role ?? "CUSTOMER", {
      mergeGuest: Boolean(userId && previousUserId.current === null),
    });
    previousUserId.current = userId;
  }, [session.isPending, user?.id, user?.role]);

  return children;
}

