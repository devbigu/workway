"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  CHECKOUT_REDIRECT_KEY,
} from "@/features/auth/redirect";
import { useCartStore } from "@/features/cart/store/cart-store";
import { authClient } from "@/lib/auth-client";

type PaymentSummary = {
  orderId: string;
  orderNumber: string;
  subtotal: number;
  tax: number;
  delivery: number;
  discount: number;
  total: number;
  payment: "online" | "cod";
};

const formatPrice = (paise: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);

export default function PaymentPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const items = useCartStore((state) => state.items);
  const hydrated = useCartStore((state) => state.hasHydrated);
  const clearCart = useCartStore((state) => state.clearCart);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      sessionStorage.setItem(CHECKOUT_REDIRECT_KEY, "/checkout/payment");
      router.replace("/login?callbackURL=%2Fcheckout%2Fpayment&checkout=required");
      return;
    }

    let paymentSummary: PaymentSummary | null = null;
    try {
      const value = sessionStorage.getItem("workway-payment-summary");
      paymentSummary = value ? JSON.parse(value) as PaymentSummary : null;
    } catch {
      paymentSummary = null;
    }

    const frame = window.requestAnimationFrame(() => {
      setSummary(paymentSummary);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [isPending, router, session?.user]);

  async function completePayment() {
    if (!summary) return;
    setProcessing(true);
    setPaymentError("");

    try {
      const response = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          orderId: summary.orderId,
          paymentMethod: summary.payment,
        }),
      });
      const result = await response.json() as {
        error?: string;
        order?: { orderNumber: string };
      };

      if (!response.ok || !result.order) {
        throw new Error(result.error ?? "Unable to confirm your order");
      }

      sessionStorage.removeItem("workway-payment-summary");
      sessionStorage.removeItem("workway-checkout-idempotency");
      clearCart();
      router.replace(`/order-confirmation/${result.order.orderNumber}`);
    } catch (error) {
      setPaymentError(
        error instanceof Error ? error.message : "Unable to confirm your order",
      );
      setProcessing(false);
    }
  }

  if (isPending || !session?.user || !hydrated) {
    return <main className="min-h-screen animate-pulse bg-[#f6f9fd] p-8" />;
  }

  if (!summary || !items.length) {
    return (
      <main className="grid min-h-[70vh] place-items-center bg-[#f6f9fd] px-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-2xl font-semibold">Payment session unavailable</h1>
          <p className="mt-3 text-sm text-slate-500">Review checkout details again to continue.</p>
          <Link href="/checkout" className="mt-6 inline-flex rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white">Return to checkout</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f9fd] px-4 py-10 text-slate-950">
      <div className="mx-auto max-w-2xl">
        <Link href="/checkout" className="text-sm font-semibold text-blue-600">← Back to checkout</Link>
        <section className="mt-5 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.09)]">
          <div className="border-b border-slate-100 p-7">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Final step</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
              {summary.payment === "online" ? "Secure payment" : "Confirm pay on delivery"}
            </h1>
            <p className="mt-3 text-sm text-slate-500">{items.length} product variants in this order</p>
          </div>
          <dl className="space-y-3 p-7 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Products</dt><dd>{formatPrice(summary.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">GST</dt><dd>{formatPrice(summary.tax)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Delivery</dt><dd>{summary.delivery ? formatPrice(summary.delivery) : "Free"}</dd></div>
            {summary.discount > 0 && <div className="flex justify-between text-emerald-600"><dt>Discount</dt><dd>-{formatPrice(summary.discount)}</dd></div>}
            <div className="flex justify-between border-t border-slate-200 pt-4 text-lg font-bold"><dt>Total</dt><dd>{formatPrice(summary.total)}</dd></div>
          </dl>
          <div className="border-t border-slate-100 bg-slate-50 p-7">
            {paymentError && <p role="alert" className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{paymentError}</p>}
            <button onClick={completePayment} disabled={processing} className="h-13 w-full rounded-[14px] bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70">
              {processing ? "Confirming order…" : summary.payment === "online" ? `Pay ${formatPrice(summary.total)}` : "Place order"}
            </button>
            <p className="mt-3 text-center text-xs text-slate-400">Your session and order details are checked before confirmation.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
