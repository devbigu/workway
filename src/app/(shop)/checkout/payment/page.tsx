"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { Breadcrumbs } from "@/components/shared/page-header";
import {
  CHECKOUT_REDIRECT_KEY,
} from "@/features/auth/redirect";
import { CheckoutSkeleton, CheckoutSteps } from "@/features/checkout/components/checkout-form";
import { Icon } from "@/features/home/components/icon";
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
      const value = sessionStorage.getItem("worklab-payment-summary");
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

      sessionStorage.removeItem("worklab-payment-summary");
      sessionStorage.removeItem("worklab-checkout-idempotency");
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
    return <CheckoutSkeleton />;
  }

  if (!summary || !items.length) {
    return (
      <main className="page-wrap">
        <EmptyState
          title="This payment session has ended."
          text="Review your checkout details again to continue."
          action={<Link href="/checkout" className="btn btn-primary">Return to checkout</Link>}
        />
      </main>
    );
  }

  const online = summary.payment === "online";

  return (
    <main className="page-wrap pb-16">
      <div className="mx-auto max-w-[40rem]">
        <header className="border-b border-line pb-6 pt-8 lg:pt-12">
          <Breadcrumbs items={[{ label: "Cart", href: "/cart" }, { label: "Checkout", href: "/checkout" }, { label: "Payment" }]} />
          <h1 className="page-title mt-4">{online ? "Payment" : "Confirm your order"}</h1>
          <div className="mt-6"><CheckoutSteps current={3} /></div>
        </header>

        <section className="mt-8 lg:mt-12" aria-labelledby="payment-summary">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="payment-summary" className="subsection">Order {summary.orderNumber}</h2>
            <p className="meta">{items.length} {items.length === 1 ? "line" : "lines"}</p>
          </div>
          <dl className="mt-4 grid gap-3 border-t border-line pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-ink-3">Products</dt><dd className="figure">{formatPrice(summary.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-3">GST</dt><dd className="figure">{formatPrice(summary.tax)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-3">Delivery</dt><dd className="figure">{summary.delivery ? formatPrice(summary.delivery) : "Free"}</dd></div>
            {summary.discount > 0 && <div className="flex justify-between"><dt className="text-ink-3">Discount</dt><dd className="figure text-success">−{formatPrice(summary.discount)}</dd></div>}
            <div className="mt-2 flex items-baseline justify-between border-t border-line pt-4"><dt className="font-medium text-ink">Total</dt><dd className="figure-lg">{formatPrice(summary.total)}</dd></div>
          </dl>

          {paymentError && (
            <div role="alert" className="alert alert-error mt-6">
              <Icon name="alert" />
              <p>{paymentError}</p>
            </div>
          )}

          <button type="button" onClick={completePayment} disabled={processing} aria-busy={processing} className="btn btn-primary btn-lg btn-block mt-6">
            {processing && <span className="spinner" aria-hidden="true" />}
            {online ? `Pay ${formatPrice(summary.total)}` : "Place order"}
          </button>
          <div className="mt-3 flex items-center justify-between gap-4">
            <Link href="/checkout" className="btn btn-text text-sm">Back to checkout</Link>
            <p className="text-sm text-ink-3">Your session and order are checked before confirmation.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
