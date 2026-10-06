"use client";

import { useState } from "react";

import { AddressForm } from "@/features/checkout/components/address-form";
import type { CheckoutAddress } from "@/features/checkout/types";

export function AddressManager({ initial }: { initial: CheckoutAddress[] }) {
  const [addresses, setAddresses] = useState(initial);
  const [editing, setEditing] = useState<CheckoutAddress | null | "new">(null);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");

  function saved(address: CheckoutAddress) {
    setAddresses((current) => {
      const exists = current.some((item) => item.id === address.id);
      const next = exists ? current.map((item) => item.id === address.id ? address : item) : [address, ...current];
      return next.map((item) => address.isDefault && item.id !== address.id ? { ...item, isDefault: false } : item);
    });
    setEditing(null);
    setMessage("Address saved");
  }

  async function change(id: string, method: "DELETE" | "PATCH") {
    if (method === "DELETE" && !window.confirm("Delete this address? Existing order addresses will not change.")) return;
    setBusy(id);
    setMessage("");
    const response = await fetch(`/api/addresses/${id}`, {
      method,
      headers: method === "PATCH" ? { "content-type": "application/json" } : undefined,
      body: method === "PATCH" ? JSON.stringify({ action: "set-default" }) : undefined,
    });
    const result = response.status === 204 ? {} : await response.json() as { address?: CheckoutAddress; error?: string };
    if (!response.ok) setMessage(result.error ?? "Unable to update address");
    else if (method === "DELETE") {
      setAddresses((current) => {
        const remaining = current.filter((item) => item.id !== id);
        if (!remaining.some((item) => item.isDefault) && remaining[0]) remaining[0] = { ...remaining[0], isDefault: true };
        return remaining;
      });
      setMessage("Address deleted");
    } else if (result.address) saved(result.address);
    setBusy("");
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Delivery details</p><h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Your Addresses</h2><p className="mt-2 text-sm text-slate-500">Saved addresses make checkout faster.</p></div>
        <button type="button" onClick={() => setEditing("new")} className="min-h-11 shrink-0 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white">Add address</button>
      </div>
      <p aria-live="polite" className="mt-3 min-h-5 text-sm text-slate-600">{message}</p>
      {editing && <div className="mt-4"><AddressForm initial={editing === "new" ? undefined : editing} onSaved={saved} onCancel={() => setEditing(null)} /></div>}
      {!addresses.length && !editing ? (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><h3 className="font-black">No saved addresses</h3><p className="mt-2 text-sm text-slate-500">Add an address for a faster checkout.</p></div>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {addresses.map((address) => <article key={address.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3"><div><p className="font-black">{address.fullName}</p><p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400">{address.type}</p></div>{address.isDefault && <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-800">Default</span>}</div>
            <address className="mt-4 text-sm not-italic leading-6 text-slate-600">{address.addressLine1}<br/>{address.addressLine2 && <>{address.addressLine2}<br/></>}{address.landmark && <>Near {address.landmark}<br/></>}{address.city}, {address.state} {address.postalCode}<br/>{address.country}<br/>{address.phone}</address>
            <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
              <button type="button" onClick={() => setEditing(address)} className="min-h-11 rounded-xl border px-4 text-sm font-bold">Edit</button>
              {!address.isDefault && <button type="button" disabled={busy === address.id} onClick={() => change(address.id, "PATCH")} className="min-h-11 rounded-xl border px-4 text-sm font-bold">Set default</button>}
              <button type="button" disabled={busy === address.id} onClick={() => change(address.id, "DELETE")} className="min-h-11 rounded-xl border px-4 text-sm font-bold text-red-700">{busy === address.id ? "Working…" : "Delete"}</button>
            </div>
          </article>)}
        </div>
      )}
    </div>
  );
}
