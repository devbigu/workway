"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { Breadcrumbs } from "@/components/shared/page-header";
import { AddressForm } from "@/features/checkout/components/address-form";
import { getCartItemKey, useCartStore } from "@/features/cart/store/cart-store";
import type { CheckoutAddress } from "@/features/checkout/types";
import { Icon } from "@/features/home/components/icon";

type Delivery = "standard" | "priority";
type Payment = "online" | "cod";
const money = (paise: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(paise / 100);

const deliveryOptions = [
  { id: "standard", title: "Standard", text: "4–6 days", price: "Free" },
  { id: "priority", title: "Priority", text: "2–3 days", price: "₹299" },
];
const paymentOptions = [
  { id: "online", title: "Pay online", text: "Pay securely after you review the order" },
  { id: "cod", title: "Pay on delivery", text: "Pay when the order arrives" },
];

const STEPS = ["Details", "Review", "Payment"];

export function CheckoutSteps({ current }: { current: number }) {
  return (
    <nav aria-label="Checkout progress" className="font-mono text-xs tracking-[0.02em]">
      <p className="text-ink sm:hidden">Step {current} of {STEPS.length} · {STEPS[current - 1]}</p>
      <ol className="hidden items-center gap-3 sm:flex">
        {STEPS.map((step, index) => {
          const number = index + 1;
          const state = number < current ? "done" : number === current ? "current" : "upcoming";
          return (
            <li key={step} className="flex items-center gap-3" aria-current={state === "current" ? "step" : undefined}>
              {index > 0 && <span aria-hidden="true" className="h-px w-8 bg-line-hover" />}
              <span className={state === "upcoming" ? "text-ink-3" : state === "current" ? "text-ink underline underline-offset-4" : "text-ink"}>
                {String(number).padStart(2, "0")} {step}{state === "done" && " ✓"}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function CheckoutForm({ initialAddresses }: { initialAddresses: CheckoutAddress[] }) {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const hydrated = useCartStore((state) => state.hasHydrated);
  const removeItem = useCartStore((state) => state.removeItem);
  const subtotal = useCartStore((state) => state.getSubtotalPaise());
  const [addresses, setAddresses] = useState(initialAddresses);
  const [selectedId, setSelectedId] = useState(initialAddresses.find((a) => a.isDefault)?.id ?? initialAddresses[0]?.id ?? "");
  const [editing, setEditing] = useState<CheckoutAddress | "new" | null>(initialAddresses.length ? null : "new");
  const [deleteTarget, setDeleteTarget] = useState<CheckoutAddress | null>(null);
  const [delivery, setDelivery] = useState<Delivery>("standard");
  const [payment, setPayment] = useState<Payment>("online");
  const [voucher, setVoucher] = useState("");
  const [voucherValid, setVoucherValid] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const deleteDialogRef = useRef<HTMLDialogElement>(null);
  const shipping = delivery === "priority" ? 29_900 : 0;
  const discount = voucherValid ? Math.min(Math.round(subtotal * 0.05), 50_000) : 0;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax - discount;
  const selected = useMemo(() => addresses.find((a) => a.id === selectedId), [addresses, selectedId]);

  useEffect(() => {
    if (deleteTarget) deleteDialogRef.current?.showModal();
    else deleteDialogRef.current?.close();
  }, [deleteTarget]);

  function saved(address: CheckoutAddress) {
    setAddresses((current) => {
      const active = current.filter((item) => item.isSaved || item.id === address.id);
      const next = active.some((item) => item.id === address.id)
        ? active.map((item) => item.id === address.id ? address : address.isDefault ? { ...item, isDefault: false } : item)
        : [address, ...active.map((item) => address.isDefault ? { ...item, isDefault: false } : item)];
      return next;
    });
    setSelectedId(address.id);
    setEditing(null);
    setReviewing(false);
    setNotice("Address saved and selected");
  }

  async function setDefault(address: CheckoutAddress) {
    setBusy(address.id); setError("");
    try {
      const response = await fetch(`/api/addresses/${address.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "set-default" }) });
      const result = await response.json() as { address?: CheckoutAddress; error?: string };
      if (!response.ok || !result.address) throw new Error(result.error ?? "Unable to update the default address");
      setAddresses((current) => current.map((item) => ({ ...item, isDefault: item.id === address.id })));
      setSelectedId(address.id); setNotice("Default address updated");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to update the address"); }
    finally { setBusy(""); }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setBusy(deleteTarget.id); setError("");
    try {
      const response = await fetch(`/api/addresses/${deleteTarget.id}`, { method: "DELETE" });
      if (!response.ok) { const result = await response.json() as { error?: string }; throw new Error(result.error ?? "Unable to delete this address"); }
      const remaining = addresses.filter((item) => item.id !== deleteTarget.id);
      setAddresses(remaining);
      if (selectedId === deleteTarget.id) setSelectedId(remaining.find((item) => item.isDefault)?.id ?? remaining[0]?.id ?? "");
      if (!remaining.length) setEditing("new");
      setDeleteTarget(null); setNotice("Address deleted"); setReviewing(false);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to delete this address"); }
    finally { setBusy(""); }
  }

  async function placeOrder() {
    if (!selectedId) { setError("Select or add a delivery address"); return; }
    setBusy("order"); setError("");
    try {
      const idempotencyKey = sessionStorage.getItem("worklab-checkout-idempotency") ?? crypto.randomUUID();
      sessionStorage.setItem("worklab-checkout-idempotency", idempotencyKey);
      const response = await fetch("/api/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({
        items: items.map((item) => ({ productId: item.productId, variantId: item.variantId, quantity: item.quantity })),
        addressId: selectedId, delivery, payment, voucher: voucherValid ? voucher : "", idempotencyKey,
      }) });
      const result = await response.json() as { error?: string; order?: { id: string; orderNumber: string; subtotalPaise: number; discountPaise: number; taxPaise: number; shippingPaise: number; totalPaise: number } };
      if (response.status === 401) { router.replace("/login?callbackURL=%2Fcheckout&checkout=required"); return; }
      if (!response.ok || !result.order) throw new Error(result.error ?? "Unable to create your order");
      sessionStorage.setItem("worklab-payment-summary", JSON.stringify({ orderId: result.order.id, orderNumber: result.order.orderNumber, subtotal: result.order.subtotalPaise, tax: result.order.taxPaise, delivery: result.order.shippingPaise, discount: result.order.discountPaise, total: result.order.totalPaise, payment }));
      router.push("/checkout/payment");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to create your order"); }
    finally { setBusy(""); }
  }

  function onContinue() {
    if (reviewing) { void placeOrder(); return; }
    if (!selectedId) { setError("Select or add a delivery address"); return; }
    setError("");
    setReviewing(true);
    window.scrollTo({ top: 0 });
  }

  if (!hydrated) return <CheckoutSkeleton />;
  if (!items.length) {
    return (
      <main className="page-wrap">
        <EmptyState
          title={<em>Nothing measured yet.</em>}
          text="Your cart is empty, so there is nothing to check out."
          action={<Link href="/products" className="btn btn-primary">Explore products</Link>}
        />
      </main>
    );
  }

  const ordering = busy === "order";
  const continueLabel = reviewing ? "Place order" : "Review order";

  return (
    <main>
      <div className="page-wrap pb-16">
        <header className="border-b border-line pb-6 pt-8 lg:pt-12">
          <Breadcrumbs items={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
          <h1 className="page-title mt-4">Checkout</h1>
          <div className="mt-6"><CheckoutSteps current={reviewing ? 2 : 1} /></div>
        </header>

        <div className="mt-8 grid items-start gap-12 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="grid max-w-[40rem] gap-10">
            {notice && (
              <div role="status" className="alert alert-success">
                <Icon name="check" />
                <p>{notice}</p>
                <button type="button" onClick={() => setNotice("")} className="btn btn-icon -my-3 -mr-3" aria-label="Dismiss"><Icon name="x" className="h-4 w-4" /></button>
              </div>
            )}
            {error && (
              <div role="alert" className="alert alert-error">
                <Icon name="alert" />
                <p>{error}</p>
              </div>
            )}

            {reviewing && selected ? (
              <section aria-labelledby="review-title">
                <h2 id="review-title" className="subsection">Review your order</h2>
                <dl className="specs mt-4">
                  <dt>Deliver to</dt>
                  <dd className="specs-text">{selected.fullName}<br />{selected.addressLine1}{selected.addressLine2 ? `, ${selected.addressLine2}` : ""}<br />{selected.city}, {selected.state} {selected.postalCode} · {selected.phone}</dd>
                  <dt>Delivery</dt>
                  <dd className="specs-text">{delivery === "priority" ? "Priority · 2–3 days" : "Standard · 4–6 days"}</dd>
                  <dt>Payment</dt>
                  <dd className="specs-text">{payment === "online" ? "Pay online" : "Pay on delivery"}</dd>
                </dl>
                <button type="button" onClick={() => setReviewing(false)} className="btn btn-text mt-4 text-sm">Edit details</button>
              </section>
            ) : editing ? (
              <AddressForm initial={editing === "new" ? undefined : editing} onSaved={saved} onCancel={addresses.length ? () => setEditing(null) : undefined} />
            ) : (
              <>
                <section aria-labelledby="address-title">
                  <div className="flex items-center justify-between gap-4">
                    <h2 id="address-title" className="subsection">Delivery address</h2>
                    <button type="button" onClick={() => setEditing("new")} className="btn btn-text text-sm">Add new address</button>
                  </div>
                  <div role="radiogroup" aria-labelledby="address-title" className="mt-4 grid gap-4 sm:grid-cols-2">
                    {addresses.map((address) => {
                      const isSelected = selectedId === address.id;
                      return (
                        <div key={address.id} className="card card-interactive p-5">
                          <button type="button" role="radio" aria-checked={isSelected} onClick={() => setSelectedId(address.id)} className="w-full cursor-pointer text-left">
                            <span className="flex items-center justify-between gap-3">
                              <span className="eyebrow">{address.type}</span>
                              {address.isDefault ? <span className="badge badge-info">Default</span> : !address.isSaved ? <span className="meta">This checkout only</span> : null}
                            </span>
                            <span className="mt-3 block font-medium text-ink">{address.fullName}</span>
                            <span className="mt-1 block text-sm text-ink-2">
                              {address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ""}<br />
                              {address.landmark ? `${address.landmark}, ` : ""}{address.city}, {address.state} {address.postalCode}<br />
                              {address.country} · {address.phone}
                            </span>
                          </button>
                          <div className="mt-3 flex flex-wrap gap-x-4 border-t border-line pt-1">
                            <button type="button" onClick={() => setEditing(address)} className="btn btn-text text-sm">Edit</button>
                            <button type="button" onClick={() => setDeleteTarget(address)} className="btn btn-text text-sm text-error">Delete</button>
                            {address.isSaved && !address.isDefault && <button type="button" disabled={busy === address.id} onClick={() => setDefault(address)} className="btn btn-text text-sm">Set as default</button>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
                <ChoiceGroup label="Delivery" name="delivery" value={delivery} onChange={(value) => setDelivery(value as Delivery)} options={deliveryOptions} />
                <ChoiceGroup label="Payment" name="payment" value={payment} onChange={(value) => setPayment(value as Payment)} options={paymentOptions} />
              </>
            )}
          </div>

          <OrderSummary
            items={items}
            subtotal={subtotal}
            tax={tax}
            shipping={shipping}
            discount={discount}
            total={total}
            voucher={voucher}
            setVoucher={(value) => { setVoucher(value); setVoucherValid(false); }}
            applyVoucher={() => { const valid = voucher.trim().toUpperCase() === "worklab5"; setVoucherValid(valid); setError(valid ? "" : "That voucher code is not valid"); }}
            removeItem={removeItem}
            reviewing={reviewing}
            action={!editing && (
              <button type="button" disabled={ordering} aria-busy={ordering} onClick={onContinue} className="btn btn-primary btn-lg btn-block mt-6 hidden lg:inline-flex">
                {ordering && <span className="spinner" aria-hidden="true" />}
                {continueLabel}
              </button>
            )}
          />
        </div>
      </div>

      {!editing && (
        <div className="action-bar">
          <span className="figure-lg">{money(total)}</span>
          <button type="button" disabled={ordering} aria-busy={ordering} onClick={onContinue} className="btn btn-primary ml-auto">
            {ordering && <span className="spinner" aria-hidden="true" />}
            {continueLabel}
          </button>
        </div>
      )}

      <dialog ref={deleteDialogRef} aria-labelledby="delete-title" onClose={() => setDeleteTarget(null)} className="dialog">
        <h2 id="delete-title" className="section-title">Delete this address?</h2>
        <p className="mt-3 text-ink-2">This removes {deleteTarget?.fullName}’s saved delivery address. Previous orders keep their original delivery details.</p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => setDeleteTarget(null)} className="btn btn-secondary">Cancel</button>
          <button type="button" disabled={Boolean(busy)} aria-busy={Boolean(busy)} onClick={confirmDelete} className="btn btn-danger-solid">
            {busy && <span className="spinner" aria-hidden="true" />}
            Delete address
          </button>
        </div>
      </dialog>
    </main>
  );
}

function ChoiceGroup({ label, name, value, onChange, options }: { label: string; name: string; value: string; onChange: (value: string) => void; options: Array<{ id: string; title: string; text: string; price?: string }> }) {
  return (
    <fieldset>
      <legend className="subsection">{label}</legend>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {options.map((option) => (
          <label key={option.id} className="card card-interactive flex cursor-pointer items-start gap-3 p-4">
            <input type="radio" name={name} checked={value === option.id} onChange={() => onChange(option.id)} className="radio card-radio mt-0.5" />
            <span className="min-w-0 flex-1">
              <span className="block font-medium text-ink">{option.title}</span>
              <span className="block text-sm text-ink-3">{option.text}</span>
            </span>
            {option.price && <span className="figure">{option.price}</span>}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

type SummaryProps = { items: ReturnType<typeof useCartStore.getState>["items"]; subtotal: number; tax: number; shipping: number; discount: number; total: number; voucher: string; setVoucher: (value: string) => void; applyVoucher: () => void; removeItem: (key: string) => void; reviewing: boolean; action: React.ReactNode };

function OrderSummary(props: SummaryProps) {
  const lines = props.items.length;
  return (
    <aside className="summary" aria-labelledby="summary-title">
      <h2 id="summary-title" className="subsection">{props.reviewing ? "Order review" : "Order summary"}</h2>
      <details className="group mt-4 border-y border-line" open={props.reviewing}>
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-sm text-ink-2 [&::-webkit-details-marker]:hidden">
          {lines} {lines === 1 ? "line" : "lines"} · View
          <Icon name="chevron" className="h-4 w-4 rotate-90 transition-transform group-open:-rotate-90" />
        </summary>
        <ul className="grid max-h-64 gap-4 overflow-y-auto pb-4">
          {props.items.map((item) => (
            <li key={getCartItemKey(item)} className="flex justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{item.productName}</p>
                <p className="meta">{item.quantity} × pack of {item.packSize} · {item.variantSku}</p>
                <button type="button" onClick={() => props.removeItem(getCartItemKey(item))} className="btn btn-text min-h-8 text-xs">Remove</button>
              </div>
              <span className="figure">{money(item.packPricePaise * item.quantity)}</span>
            </li>
          ))}
        </ul>
      </details>
      <div className="mt-4 flex gap-2">
        <label className="min-w-0 flex-1">
          <span className="sr-only">Voucher code</span>
          <input value={props.voucher} onChange={(event) => props.setVoucher(event.target.value)} placeholder="Voucher code" className="input input-mono uppercase" />
        </label>
        <button type="button" onClick={props.applyVoucher} className="btn btn-secondary">Apply</button>
      </div>
      <dl className="mt-5 grid gap-3 text-sm">
        <div className="flex justify-between"><dt className="text-ink-3">Subtotal</dt><dd className="figure">{money(props.subtotal)}</dd></div>
        <div className="flex justify-between"><dt className="text-ink-3">Delivery</dt><dd className="figure">{props.shipping ? money(props.shipping) : "Free"}</dd></div>
        <div className="flex justify-between"><dt className="text-ink-3">GST (18%)</dt><dd className="figure">{money(props.tax)}</dd></div>
        {props.discount > 0 && <div className="flex justify-between"><dt className="text-ink-3">Discount</dt><dd className="figure text-success">−{money(props.discount)}</dd></div>}
        <div className="mt-2 flex items-baseline justify-between border-t border-line pt-4"><dt className="font-medium text-ink">Total</dt><dd className="figure-lg">{money(props.total)}</dd></div>
      </dl>
      {props.action}
      {props.reviewing && <p className="mt-3 text-sm text-ink-3">By placing this order you agree to our <Link href="/terms" className="link">terms</Link>.</p>}
    </aside>
  );
}

export function CheckoutSkeleton() {
  return (
    <main className="page-wrap pb-16" aria-busy="true">
      <div className="border-b border-line pb-6 pt-8 lg:pt-12">
        <div className="skeleton h-3 w-32" />
        <div className="skeleton mt-4 h-12 w-56" />
        <div className="skeleton mt-6 h-3 w-64" />
      </div>
      <div className="mt-8 grid gap-12 lg:mt-12 lg:grid-cols-[1fr_380px]">
        <div className="grid max-w-[40rem] gap-4">{[1, 2, 3].map((item) => <div key={item} className="skeleton h-36 rounded-md" />)}</div>
        <div className="skeleton h-96 rounded-md" />
      </div>
    </main>
  );
}
