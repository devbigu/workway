"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

import {
  CHECKOUT_REDIRECT_KEY,
  getSafeCheckoutRedirect,
} from "@/features/auth/redirect";
import { Icon } from "@/features/home/components/icon";
import { mergeCartForUser } from "@/features/cart/store/cart-store";
import { authClient } from "@/lib/auth-client";

type AuthMode = "login" | "register";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isRegister = mode === "register";
  const queryRedirect = searchParams.get("redirect") ?? searchParams.get("callbackURL");
  const redirectPath = getSafeCheckoutRedirect(
    queryRedirect ??
      (typeof window !== "undefined"
        ? sessionStorage.getItem(CHECKOUT_REDIRECT_KEY)
        : null),
  );

  async function finishAuthentication() {
    const session = await authClient.getSession();

    if (session.data?.user.id) {
      const user = session.data.user as { id: string; role?: string };
      mergeCartForUser(user.id, user.role);
    }

    sessionStorage.removeItem(CHECKOUT_REDIRECT_KEY);
    router.replace(redirectPath);
    router.refresh();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const name = String(formData.get("name") ?? "").trim();

    const result = isRegister
      ? await authClient.signUp.email({
          name,
          email,
          password,
          callbackURL: redirectPath,
        })
      : await authClient.signIn.email({
          email,
          password,
          callbackURL: redirectPath,
        });

    if (result.error) {
      setError(
        result.error.message ??
          "We could not sign you in. Please check your details and try again.",
      );
      setPending(false);
      return;
    }

    await finishAuthentication();
  }

  const alternateHref = isRegister
    ? `/login?callbackURL=${encodeURIComponent(redirectPath)}`
    : `/register?callbackURL=${encodeURIComponent(redirectPath)}`;

  return (
    <main className="page-wrap py-12 lg:py-16">
      <div className="mx-auto max-w-[26rem]">
        <Link href="/" className="inline-flex items-center gap-2 text-ink no-underline">
          <Icon name="flask" className="h-5 w-5" strokeWidth={1.5} />
          <span className="font-semibold tracking-[-0.02em]">Rootra</span>
        </Link>
        <h1 className="page-title mt-8">{isRegister ? "Create an account" : "Sign in"}</h1>
        <p className="mt-3 text-ink-2">
          {isRegister
            ? "Track orders, save delivery addresses and check out faster."
            : "Use your Rootra account to see orders and complete checkout."}
        </p>

        {searchParams.get("checkout") === "required" && (
          <div role="status" className="alert alert-info mt-8">
            <Icon name="info" />
            <p>Sign in or create an account to continue to checkout. Your cart stays saved.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
          {error && (
            <div role="alert" className="alert alert-error">
              <Icon name="alert" />
              <p>{error}</p>
            </div>
          )}

          {isRegister && (
            <div className="field">
              <label htmlFor="auth-name" className="field-label">Full name</label>
              <input id="auth-name" name="name" required autoComplete="name" className="input" />
            </div>
          )}
          <div className="field">
            <label htmlFor="auth-email" className="field-label">Email address</label>
            <input id="auth-email" name="email" type="email" required autoComplete="email" placeholder="you@company.com" className="input" />
          </div>
          <div className="field">
            <label htmlFor="auth-password" className="field-label">Password</label>
            {isRegister && <p id="auth-password-help" className="field-help">At least 8 characters.</p>}
            <div className="relative">
              <input
                id="auth-password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                autoComplete={isRegister ? "new-password" : "current-password"}
                aria-describedby={isRegister ? "auth-password-help" : undefined}
                className="input pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="btn btn-icon absolute right-0.5 top-0.5"
              >
                <Icon name="eye" className="h-4 w-4" />
              </button>
            </div>
          </div>

          <button type="submit" disabled={pending} aria-busy={pending} className="btn btn-primary btn-lg btn-block mt-2">
            {pending && <span className="spinner" aria-hidden="true" />}
            {isRegister ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="mt-8 border-t border-line pt-6 text-sm text-ink-2">
          {isRegister ? "Already have an account?" : "New to Rootra?"}{" "}
          <Link href={alternateHref} className="link">
            {isRegister ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </div>
    </main>
  );
}
