import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const formatPrice = (paise: bigint) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(paise) / 100);

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  const { orderId } = await params;
  const order = await db.order.findFirst({
    where: {
      orderNumber: orderId,
      userId: session.user.id,
      status: "CONFIRMED",
    },
    include: {
      sellerOrders: { include: { items: true } },
    },
  });

  if (!order) notFound();

  const itemCount = order.sellerOrders.reduce(
    (count, sellerOrder) =>
      count + sellerOrder.items.reduce((total, item) => total + item.quantity, 0),
    0,
  );

  return (
    <main className="grid min-h-[75vh] place-items-center bg-[#f6f9fd] px-4 py-12 text-slate-950">
      <section className="w-full max-w-xl rounded-[30px] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_70px_rgba(15,23,42,0.1)] sm:p-12">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-2xl text-emerald-700">&#10003;</span>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Order confirmed</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Thank you for your order</h1>
        <p className="mt-4 text-sm leading-6 text-slate-500">We received {itemCount} pack{itemCount === 1 ? "" : "s"} and will send delivery updates to {session.user.email}.</p>
        <dl className="mt-7 space-y-3 rounded-2xl bg-slate-50 p-4 text-sm">
          <div><dt className="text-xs uppercase tracking-[0.12em] text-slate-400">Order number</dt><dd className="mt-1 text-lg font-bold">{order.orderNumber}</dd></div>
          <div className="flex justify-between border-t border-slate-200 pt-3"><dt className="text-slate-500">Payment</dt><dd className="font-semibold">{order.paymentStatus === "PAID" ? "Paid" : "Pay on delivery"}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500">Total</dt><dd className="font-semibold">{formatPrice(order.totalPaise)}</dd></div>
        </dl>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/account/orders" className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white">View orders</Link>
          <Link href="/products" className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700">Continue shopping</Link>
        </div>
      </section>
    </main>
  );
}