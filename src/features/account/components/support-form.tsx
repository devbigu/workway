"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function SupportForm({ orders, selectedOrder }: { orders: Array<{ id: string; orderNumber: string }>; selectedOrder?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/account/support", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(form)) });
    const result = await response.json() as { error?: string; message?: string };
    setMessage(response.ok ? result.message ?? "Request submitted" : result.error ?? "Unable to submit request");
    setBusy(false); if (response.ok) { event.currentTarget.reset(); router.refresh(); }
  }
  const field = "mt-1.5 min-h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";
  return <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h3 className="text-lg font-black">Contact Support</h3><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">Issue category<select name="category" className={field} defaultValue="ORDER">{["ORDER","REFUND","DELIVERY","PAYMENT","PRODUCT","ACCOUNT","OTHER"].map(x=><option key={x} value={x}>{x.toLowerCase().replaceAll("_"," ")}</option>)}</select></label><label className="text-sm font-bold">Related order (optional)<select name="orderId" className={field} defaultValue={orders.find(x=>x.orderNumber===selectedOrder)?.id ?? ""}><option value="">No related order</option>{orders.map(x=><option key={x.id} value={x.id}>#{x.orderNumber}</option>)}</select></label><label className="text-sm font-bold sm:col-span-2">Subject<input name="subject" required minLength={4} maxLength={140} className={field}/></label><label className="text-sm font-bold sm:col-span-2">Message<textarea name="message" required minLength={12} maxLength={3000} rows={6} className={field + " py-3"}/></label></div><button disabled={busy} className="mt-5 min-h-11 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white">{busy ? "Submitting…" : "Submit request"}</button><p aria-live="polite" className="mt-3 min-h-5 text-sm text-slate-600">{message}</p></form>;
}
