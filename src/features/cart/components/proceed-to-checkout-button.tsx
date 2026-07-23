"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  CHECKOUT_REDIRECT_KEY,
} from "@/features/auth/redirect";
import { authClient } from "@/lib/auth-client";

export function ProceedToCheckoutButton() {
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
    <button
      type="button"
      onClick={proceed}
      disabled={checking}
      className="mt-6 flex w-full justify-center rounded-[14px] bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-70"
    >
      {checking ? "Checking your account?" : "Proceed to checkout"}
    </button>
  );
}
