"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Action = "cancel" | "return" | "archive" | "restore";

export function OrderActions({
  orderId,
  orderNumber,
  canCancel,
  canReturn,
  canPay,
  canArchive,
  archived = false,
  invoiceAvailable,
}: {
  orderId: string;
  orderNumber: string;
  canCancel: boolean;
  canReturn: boolean;
  canPay: boolean;
  canArchive: boolean;
  archived?: boolean;
  invoiceAvailable: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function run(action: Action) {
    const prompt: Record<Action, string> = {
      cancel: "Cancel this order? This action may not be reversible.",
      return: "Submit a return request for this order?",
      archive: "Archive this order? You can restore it later.",
      restore: "Restore this order to your order history?",
    };
    if (!window.confirm(prompt[action])) return;
    setBusy(action);
    setMessage("");
    try {
      const response = await fetch(`/api/account/orders/${orderId}/actions`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const result = await response.json() as { error?: string; message?: string };
      if (!response.ok) throw new Error(result.error ?? "Unable to update this order");
      setMessage(result.message ?? "Order updated");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update this order");
    } finally {
      setBusy(null);
    }
  }

  async function pay() {
    setBusy("pay");
    setMessage("");
    try {
      const response = await fetch(`/api/account/orders/${orderId}/pay`, { method: "POST" });
      const result = await response.json() as { error?: string; message?: string };
      if (!response.ok) throw new Error(result.error ?? "Payment could not be completed");
      setMessage(result.message ?? "Payment confirmed");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Payment could not be completed");
    } finally {
      setBusy(null);
    }
  }

  const button = "inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-60";

  return (
    <div className="mt-5 border-t border-slate-100 pt-5">
      <div className="flex flex-wrap gap-2">
        <Link href={`/account/orders/${orderId}`} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">
          View Order Details
        </Link>
        {canPay && <button type="button" disabled={Boolean(busy)} onClick={pay} className={button}>{busy === "pay" ? "Processing…" : "Pay Now"}</button>}
        {invoiceAvailable && <a href={`/api/account/orders/${orderId}/invoice`} className={button}>Download Invoice</a>}
        {canCancel && <button type="button" disabled={Boolean(busy)} onClick={() => run("cancel")} className={button}>{busy === "cancel" ? "Cancelling…" : "Cancel Order"}</button>}
        {canReturn && <button type="button" disabled={Boolean(busy)} onClick={() => run("return")} className={button}>{busy === "return" ? "Submitting…" : "Request Return"}</button>}
        <Link href={`/account/support?order=${encodeURIComponent(orderNumber)}`} className={button}>Contact Support</Link>
        {archived ? (
          <button type="button" disabled={Boolean(busy)} onClick={() => run("restore")} className={button}>{busy === "restore" ? "Restoring…" : "Restore Order"}</button>
        ) : canArchive ? (
          <button type="button" disabled={Boolean(busy)} onClick={() => run("archive")} className={button}>{busy === "archive" ? "Archiving…" : "Archive Order"}</button>
        ) : null}
      </div>
      <p aria-live="polite" className="mt-3 min-h-5 text-sm text-slate-600">{message}</p>
    </div>
  );
}
