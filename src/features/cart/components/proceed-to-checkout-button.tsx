"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  CHECKOUT_REDIRECT_KEY,
} from "@/features/auth/redirect";
import { authClient } from "@/lib/auth-client";

export function ProceedToCheckoutButton({ className = "btn btn-primary btn-lg btn-block", label = "Proceed to checkout" }: { className?: string; label?: string }) {
  const router = useRouter();
  const [checking, setChecking] = useState(false);

  async function proceed() {
    setChecking(true);
    const session = await authClient.getSession();

    if (session.data?.user) {
      router.push("/checkout");
      return;
    }

    sessionStorage.setItem(CHECKOUT_REDIRECT_KEY, "/checkout");
    router.push("/login?callbackURL=%2Fcheckout&checkout=required");
  }

  return (
    <button type="button" onClick={proceed} disabled={checking} aria-busy={checking} className={className}>
      {checking && <span className="spinner" aria-hidden="true" />}
      {label}
    </button>
  );
}
