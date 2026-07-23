"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Icon } from "@/features/home/components/icon";
import { getCartItemKey, useCartStore } from "@/features/cart/store/cart-store";
import { CHECKOUT_REDIRECT_KEY } from "@/features/auth/redirect";
import { authClient } from "@/lib/auth-client";

type Delivery = "standard" | "priority";
type Payment = "online" | "cod";
const deliveryMethods = [
  { id: "standard" as const, name: "Standard delivery", detail: "4-6 business days", price: 0 },
  { id: "priority" as const, name: "Priority delivery", detail: "2-3 business days", price: 29900 },
];
const formatPrice = (paise: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(paise / 100);

function Field({ label, name, placeholder, type = "text", required = true }: { label: string; name: string; placeholder: string; type?: string; required?: boolean }) {
  return <label><span className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</span><input name={name} type={type} required={required} placeholder={placeholder} className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /></label>;
}
function Section({ icon, step, title, children }: { icon: "user" | "package" | "truck" | "shield"; step: string; title: string; children: ReactNode }) {
  return <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)] sm:p-7"><div className="flex items-center gap-3 border-b border-slate-100 pb-5"><span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-600"><Icon name={icon} className="h-4.5 w-4.5" /></span><div><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-600">{step}</p><h2 className="text-lg font-semibold">{title}</h2></div></div>{children}</section>;
}
function Choice({ checked }: { checked: boolean }) {
  return <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border ${checked ? "border-blue-600" : "border-slate-300"}`}>{checked && <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />}</span>;
}

export default function CheckoutPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const { data: session, isPending: authPending } = authClient.useSession();
  const items = useCartStore((state) => state.items);
  const hydrated = useCartStore((state) => state.hasHydrated);
  const removeItem = useCartStore((state) => state.removeItem);
  const subtotal = useCartStore((state) => state.getSubtotalPaise());
  const totalPacks = useCartStore((state) => state.getTotalPacks());
  const [delivery, setDelivery] = useState<Delivery>("standard");
  const [payment, setPayment] = useState<Payment>("online");
  const [voucher, setVoucher] = useState("");
  const [voucherStatus, setVoucherStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const selectedDelivery = useMemo(() => deliveryMethods.find((item) => item.id === delivery) ?? deliveryMethods[0], [delivery]);
  const discount = voucherStatus === "valid" ? Math.min(Math.round(subtotal * 0.05), 50000) : 0;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax + selectedDelivery.price - discount;
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const currentSession = await authClient.getSession();

    if (!currentSession.data?.user) {
      sessionStorage.setItem("workway-checkout-state", JSON.stringify({
        fields: Object.fromEntries(new FormData(form).entries()),
        delivery,
        payment,
        voucher,
      }));
      sessionStorage.setItem(CHECKOUT_REDIRECT_KEY, "/checkout");
      router.replace("/login?callbackURL=%2Fcheckout&checkout=required");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const fields = Object.fromEntries(new FormData(form).entries());
      const idempotencyKey =
        sessionStorage.getItem("workway-checkout-idempotency") ??
        crypto.randomUUID();
      sessionStorage.setItem("workway-checkout-idempotency", idempotencyKey);

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
          address: fields,
          delivery,
          payment,
          voucher,
          idempotencyKey,
        }),
      });
      const result = await response.json() as {
        error?: string;
        order?: {
          id: string;
          orderNumber: string;
          subtotalPaise: number;
          discountPaise: number;
          taxPaise: number;
          shippingPaise: number;
          totalPaise: number;
        };
      };

      if (response.status === 401) {
        sessionStorage.setItem(CHECKOUT_REDIRECT_KEY, "/checkout");
        router.replace("/login?callbackURL=%2Fcheckout&checkout=required");
        return;
      }
      if (!response.ok || !result.order) {
        throw new Error(result.error ?? "Unable to create your order");
      }

      localStorage.setItem(
        `workway-address:${currentSession.data.user.id}`,
        JSON.stringify({ fields }),
      );
      sessionStorage.setItem("workway-payment-summary", JSON.stringify({
        orderId: result.order.id,
        orderNumber: result.order.orderNumber,
        subtotal: result.order.subtotalPaise,
        tax: result.order.taxPaise,
        delivery: result.order.shippingPaise,
        discount: result.order.discountPaise,
        total: result.order.totalPaise,
        payment,
      }));
      sessionStorage.removeItem("workway-checkout-state");
      router.push("/checkout/payment");
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Unable to create your order",
      );
    } finally {
      setSubmitting(false);
    }
  };
  const applyVoucher = () => setVoucherStatus(voucher.trim().toUpperCase() === "WORKWAY5" ? "valid" : "invalid");

  useEffect(() => {
    if (authPending) return;

    if (!session?.user) {
      sessionStorage.setItem(CHECKOUT_REDIRECT_KEY, "/checkout");
      router.replace("/login?callbackURL=%2Fcheckout&checkout=required");
      return;
    }

    const saved = sessionStorage.getItem("workway-checkout-state") ??
      localStorage.getItem(`workway-address:${session.user.id}`);
    if (!saved || !formRef.current) return;

    try {
      const draft = JSON.parse(saved) as {
        fields?: Record<string, string>;
        delivery?: Delivery;
        payment?: Payment;
        voucher?: string;
      };
      const frame = window.requestAnimationFrame(() => {
        if (draft.delivery) setDelivery(draft.delivery);
        if (draft.payment) setPayment(draft.payment);
        if (draft.voucher) setVoucher(draft.voucher);
        for (const [name, value] of Object.entries(draft.fields ?? {})) {
          const field = formRef.current?.elements.namedItem(name);
          if (field instanceof HTMLInputElement) field.value = value;
        }
      });
      return () => window.cancelAnimationFrame(frame);
    } catch {
      sessionStorage.removeItem("workway-checkout-state");
    }
  }, [authPending, router, session?.user]);

  if (authPending || !session?.user || !hydrated) return <main className="min-h-screen bg-[#f6f9fd] p-8"><div className="mx-auto h-96 max-w-[1180px] animate-pulse rounded-3xl bg-white" /></main>;
  if (!items.length) return <main className="grid min-h-[70vh] place-items-center bg-[#f6f9fd] px-4"><div className="max-w-md rounded-3xl border border-slate-200 bg-white p-9 text-center shadow-xl shadow-slate-200/50"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-600"><Icon name="cart" /></span><h1 className="mt-5 text-2xl font-semibold">Your cart is empty</h1><p className="mt-3 text-sm text-slate-500">Add products before starting checkout.</p><Link href="/products" className="mt-6 inline-flex rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white">Browse products</Link></div></main>;

  return <main className="min-h-screen bg-[#f6f9fd] text-slate-950">
    <header className="border-b border-slate-200 bg-white"><div className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6 lg:px-8"><div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><Link href="/cart" className="text-sm font-semibold text-blue-600">&larr; Back to cart</Link><h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Secure checkout</h1><p className="mt-2 text-sm text-slate-500">Complete your delivery and payment details.</p></div><p className="flex items-center gap-2 text-xs font-semibold text-slate-500"><Icon name="shield" className="h-5 w-5 text-emerald-600" />Secure payments - GST invoice included</p></div><ol className="mt-8 grid max-w-2xl grid-cols-3" aria-label="Checkout progress">{["Cart", "Details", "Confirmation"].map((label, index) => <li key={label} className="flex items-center"><span className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${index < 2 ? "bg-blue-600 text-white" : "border border-slate-300 text-slate-400"}`}>{index === 0 ? <Icon name="check" className="h-4 w-4" /> : index + 1}</span><span className={`ml-2 text-xs font-semibold ${index === 1 ? "text-blue-700" : "text-slate-500"}`}>{label}</span>{index < 2 && <span className="mx-3 h-px flex-1 bg-slate-200" />}</li>)}</ol></div></header>
    <form ref={formRef} onSubmit={submit} className="mx-auto grid max-w-[1180px] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-8">
      <div className="space-y-5">
        <Section icon="user" step="Step 1" title="Contact details"><div className="mt-6 grid gap-5 sm:grid-cols-2"><Field label="Full name" name="name" placeholder="Your full name" /><Field label="Phone number" name="phone" placeholder="10-digit mobile number" type="tel" /><div className="sm:col-span-2"><Field label="Email address" name="email" placeholder="you@company.com" type="email" /></div></div></Section>
        <Section icon="package" step="Step 2" title="Delivery address"><div className="mt-6 grid gap-5 sm:grid-cols-2"><div className="sm:col-span-2"><Field label="Address" name="address" placeholder="Building, street and area" /></div><Field label="City" name="city" placeholder="City" /><Field label="State" name="state" placeholder="State" /><Field label="PIN code" name="pin" placeholder="6-digit PIN code" /><Field label="GSTIN (optional)" name="gstin" placeholder="For GST invoice" required={false} /></div></Section>
        <Section icon="truck" step="Step 3" title="Delivery method"><div className="mt-5 space-y-3">{deliveryMethods.map((item) => { const active = delivery === item.id; return <label key={item.id} className={`flex cursor-pointer gap-4 rounded-2xl border p-4 transition ${active ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500" : "border-slate-200 hover:border-slate-300"}`}><input className="sr-only" type="radio" name="delivery" checked={active} onChange={() => setDelivery(item.id)} /><Choice checked={active} /><span className="flex flex-1 justify-between gap-4"><span><b className="block text-sm">{item.name}</b><span className="mt-1 block text-xs text-slate-500">{item.detail}</span></span><b className="text-sm">{item.price ? formatPrice(item.price) : "Free"}</b></span></label>; })}</div></Section>
        <Section icon="shield" step="Step 4" title="Payment method"><div className="mt-5 grid gap-3 sm:grid-cols-2">{([{ id: "online", name: "Pay securely online", detail: "UPI, cards, net banking" }, { id: "cod", name: "Pay on delivery", detail: "Subject to eligibility" }] as const).map((item) => { const active = payment === item.id; return <label key={item.id} className={`flex cursor-pointer gap-3 rounded-2xl border p-4 ${active ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500" : "border-slate-200"}`}><input className="sr-only" type="radio" name="payment" checked={active} onChange={() => setPayment(item.id)} /><Choice checked={active} /><span><b className="block text-sm">{item.name}</b><span className="mt-1 block text-xs text-slate-500">{item.detail}</span></span></label>; })}</div></Section>
      </div>
      <aside className="h-fit space-y-5 lg:sticky lg:top-24"><section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.08)]"><div className="flex items-center justify-between border-b border-slate-100 p-5"><h2 className="text-lg font-semibold">Order summary</h2><Link href="/cart" className="text-xs font-semibold text-blue-600">Edit cart</Link></div><div className="max-h-[310px] space-y-4 overflow-y-auto p-5">{items.map((item) => <article key={getCartItemKey(item)} className="grid grid-cols-[64px_minmax(0,1fr)_auto] gap-3"><div className="relative h-16 w-16 overflow-hidden rounded-xl bg-slate-50">{item.image && <Image src={item.image} alt="" fill unoptimized sizes="64px" className="object-contain p-1.5" />}</div><div className="min-w-0"><h3 className="truncate text-sm font-semibold">{item.productName}</h3><p className="mt-1 truncate text-xs text-slate-500">{item.variantSku} - Pack of {item.packSize}</p><p className="mt-1 text-xs text-slate-600">Qty {item.quantity}</p></div><div className="text-right"><b className="text-sm">{formatPrice(item.packPricePaise * item.quantity)}</b><button type="button" onClick={() => removeItem(getCartItemKey(item))} className="mt-2 block text-[11px] font-semibold text-red-500">Remove</button></div></article>)}</div>
        <div className="border-t border-slate-100 p-5"><label className="text-xs font-semibold text-slate-600">Have a voucher?</label><div className="mt-2 flex"><input value={voucher} onChange={(event) => { setVoucher(event.target.value); setVoucherStatus("idle"); }} placeholder="Enter code" className="h-11 min-w-0 flex-1 rounded-l-xl border border-slate-200 px-3 text-sm uppercase outline-none focus:border-blue-500" /><button type="button" onClick={applyVoucher} className="rounded-r-xl bg-slate-950 px-4 text-xs font-bold uppercase text-white hover:bg-blue-600">Apply</button></div><p className={`mt-2 text-xs ${voucherStatus === "valid" ? "text-emerald-600" : voucherStatus === "invalid" ? "text-red-600" : "text-slate-400"}`}>{voucherStatus === "valid" ? "5% discount applied (up to Rs. 500)." : voucherStatus === "invalid" ? "That voucher code is not valid." : "Try WORKWAY5"}</p></div>
        <dl className="space-y-3 border-t border-slate-100 bg-slate-50/70 p-5 text-sm"><div className="flex justify-between"><dt className="text-slate-500">Subtotal ({totalPacks} packs)</dt><dd className="font-semibold">{formatPrice(subtotal)}</dd></div><div className="flex justify-between"><dt className="text-slate-500">Delivery</dt><dd className="font-semibold">{selectedDelivery.price ? formatPrice(selectedDelivery.price) : "Free"}</dd></div><div className="flex justify-between"><dt className="text-slate-500">GST (18%)</dt><dd className="font-semibold">{formatPrice(tax)}</dd></div>{discount > 0 && <div className="flex justify-between text-emerald-600"><dt>Voucher discount</dt><dd>-{formatPrice(discount)}</dd></div>}<div className="flex items-end justify-between border-t border-slate-200 pt-4"><dt><b className="block text-base">Total</b><span className="text-[11px] text-slate-400">Inclusive of applicable taxes</span></dt><dd className="text-xl font-bold">{formatPrice(total)}</dd></div></dl>
        <div className="p-5">{submitError && <p role="alert" className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{submitError}</p>}<button type="submit" disabled={submitting} className="flex h-13 w-full items-center justify-center gap-2 rounded-[14px] bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:cursor-wait disabled:opacity-70">{submitting ? "Creating order…" : payment === "online" ? "Proceed to secure payment" : "Place order"}<Icon name="arrow" className="h-4 w-4" /></button><p className="mt-3 text-center text-[11px] leading-5 text-slate-400">By placing your order, you agree to our <Link href="/terms" className="underline">terms</Link> and <Link href="/privacy" className="underline">privacy policy</Link>.</p></div></section></aside>
    </form>
  </main>;
}
