"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

import {
  CHECKOUT_REDIRECT_KEY,
  getSafeCheckoutRedirect,
} from "@/features/auth/redirect";
import { mergeCartForUser } from "@/features/cart/store/cart-store";
import { authClient } from "@/lib/auth-client";

type AuthMode = "login" | "register";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
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
      mergeCartForUser(session.data.user.id);
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
    <main className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden bg-[#f3f8e9] px-4 py-10 text-slate-950">
      <div aria-hidden="true" className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-lime-300/25 blur-3xl" />
      <div aria-hidden="true" className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-green-300/25 blur-3xl" />
      <div className="relative z-10 mx-auto grid w-full max-w-5xl overflow-hidden rounded-[34px] border border-lime-100 bg-white shadow-[0_28px_80px_rgba(54,83,20,0.18)] md:min-h-[610px] md:grid-cols-[0.95fr_1.05fr]">
        <section className="relative flex min-h-64 flex-col items-center justify-center overflow-hidden rounded-b-[64px] bg-gradient-to-br from-[#164e3a] via-[#3f7d32] to-[#84cc16] p-10 text-center text-white md:min-h-full md:rounded-b-none md:rounded-r-[118px]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-lime-100">
              WorkWay account
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em]">
              {isRegister ? "Welcome Back!" : "Hello, Friend!"}
            </h1>
            <p className="mt-5 text-sm leading-7 text-slate-300">
              {isRegister
                ? "Already have an account? Sign in to access your orders, saved addresses and wishlist."
                : "Create an account for faster checkout, order tracking and a more personal experience."}
            </p>
          </div>
          <Link
            href={alternateHref}
            className="mt-8 inline-flex min-w-40 items-center justify-center rounded-full border border-white/70 bg-white/10 px-7 py-3 text-sm font-semibold uppercase tracking-wide text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-lime-300 hover:text-green-950 focus:outline-none focus:ring-4 focus:ring-white/25"
          >
            {isRegister ? "Sign in" : "Sign up"}
          </Link>
        </section>

        <section className="flex items-center p-6 sm:p-10 md:px-14">
          <div className="w-full">
          {searchParams.get("checkout") === "required" && (
            <div className="mb-6 rounded-2xl border border-lime-200 bg-lime-50 p-4 text-sm leading-6 text-green-900">
              Please log in or create an account to continue to checkout. Your
              cart items will remain saved.
            </div>
          )}

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-lime-700">
            {isRegister ? "Create account" : "Welcome back"}
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
            {isRegister ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="mt-3 text-sm text-slate-500">
            {isRegister
              ? "Create your WorkWay account and return to checkout."
              : "Use your WorkWay account to complete your order."}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {isRegister && (
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.1em] text-slate-500">
                  Full name
                </span>
                <input
                  name="name"
                  required
                  autoComplete="name"
                  placeholder="Your full name"
                  className="h-12 w-full rounded-xl border border-transparent bg-lime-50/70 px-4 text-sm outline-none transition focus:border-lime-500 focus:bg-white focus:ring-4 focus:ring-lime-400/15"
                />
              </label>
            )}
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.1em] text-slate-500">
                Email address
              </span>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@company.com"
                className="h-12 w-full rounded-xl border border-transparent bg-lime-50/70 px-4 text-sm outline-none transition focus:border-lime-500 focus:bg-white focus:ring-4 focus:ring-lime-400/15"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.1em] text-slate-500">
                Password
              </span>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete={isRegister ? "new-password" : "current-password"}
                placeholder="At least 8 characters"
                className="h-12 w-full rounded-xl border border-transparent bg-lime-50/70 px-4 text-sm outline-none transition focus:border-lime-500 focus:bg-white focus:ring-4 focus:ring-lime-400/15"
              />
            </label>

            {error && (
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-lime-400 to-lime-500 px-5 text-sm font-bold uppercase tracking-wide text-green-950 shadow-lg shadow-lime-500/25 transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70"
            >
              {pending
                ? isRegister ? "Creating account..." : "Signing in..."
                : isRegister ? "Sign up" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            {isRegister ? "Already have an account?" : "New to WorkWay?"}{" "}
            <Link href={alternateHref} className="font-semibold text-lime-700 hover:text-green-800">
              {isRegister ? "Log in" : "Create an account"}
            </Link>
          </p>
          </div>
        </section>
      </div>
    </main>
  );
}
