import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { OrderActions } from "@/features/account/components/order-actions";
import { OrderTimeline } from "@/features/account/components/order-timeline";
import { formatCurrency, formatDate, labelStatus, paymentLabel, statusTone } from "@/features/account/presentation";
import {
  asRecord,
  canArchiveOrder,
  getCustomerOrder,
  getOrderItemImage,
  isCancellationEligible,
  isPaymentEligible,
  isReturnEligible,
  requireCustomerPage,
} from "@/features/account/server/account.service";

function AddressBlock({ value }: { value: unknown }) {
  const address = asRecord(value);
  const lines = [
    address.fullName,
    address.addressLine1,
    address.addressLine2,
    address.landmark,
    [address.city, address.state, address.postalCode].filter(Boolean).join(", "),
    address.country,
    address.phone,
  ].filter((line) => typeof line === "string" && line.trim());
  return <address className="mt-3 text-sm not-italic leading-6 text-slate-600">{lines.map((line, index) => <span className="block" key={index}>{String(line)}</span>)}</address>;
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const customer = await requireCustomerPage();
  const { orderId } = await params;
  const order = await getCustomerOrder(customer.id, orderId);
  if (!order) notFound();

  const items = order.sellerOrders.flatMap((seller) => seller.items);
  const buyer = asRecord(order.buyerSnapshot);
  const invoiceAvailable = ["PAID", "NOT_REQUIRED", "REFUNDED", "PARTIALLY_REFUNDED"].includes(order.paymentStatus);

  return (
    <article>
      <Link href="/account?tab=all" className="inline-flex min-h-11 items-center text-sm font-bold text-blue-700 hover:text-blue-900">← Back to orders</Link>
      <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Order details</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Order #{order.orderNumber}</h2>
          <p className="mt-2 text-sm text-slate-500">Placed {formatDate(order.placedAt ?? order.createdAt, true)}</p>
        </div>
        <span className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset ${statusTone(order.status)}`}>{labelStatus(order.status)}</span>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5 sm:p-6"><h3 className="text-lg font-black">Purchased products</h3></div>
            <div className="divide-y divide-slate-100">
              {items.map((item) => {
                const image = getOrderItemImage(item);
                return (
                  <div key={item.id} className="flex gap-4 p-5 sm:p-6">
                    <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-slate-100 text-xs text-slate-400">
                      {image ? <Image src={image} alt="" width={80} height={80} unoptimized className="h-full w-full object-contain" /> : "No image"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold">{item.productName}</h4>
                      <p className="mt-1 text-sm text-slate-500">Variant: {item.variantName ?? item.sku}</p>
                      <p className="mt-1 text-sm text-slate-500">Quantity: {item.quantity} · Unit price: {formatCurrency(item.unitPricePaise)}</p>
                    </div>
                    <p className="shrink-0 font-black">{formatCurrency(item.totalPaise)}</p>
                  </div>
                );
              })}
            </div>
            <dl className="ml-auto max-w-md space-y-3 border-t border-slate-100 p-5 text-sm sm:p-6">
              <div className="flex justify-between"><dt className="text-slate-500">Subtotal</dt><dd>{formatCurrency(order.subtotalPaise)}</dd></div>
              {Number(order.discountPaise) > 0 && <div className="flex justify-between text-emerald-700"><dt>Discount</dt><dd>-{formatCurrency(order.discountPaise)}</dd></div>}
              <div className="flex justify-between"><dt className="text-slate-500">GST / taxes</dt><dd>{formatCurrency(order.taxPaise)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Delivery</dt><dd>{order.shippingPaise ? formatCurrency(order.shippingPaise) : "Free"}</dd></div>
              <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-black"><dt>Grand total</dt><dd>{formatCurrency(order.totalPaise)}</dd></div>
            </dl>
          </section>

          <section className="grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h3 className="font-black">Delivery address</h3><AddressBlock value={order.shippingAddressSnapshot} /></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h3 className="font-black">Billing address</h3><AddressBlock value={order.billingAddressSnapshot} /></div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-lg font-black">Order actions</h3>
            <OrderActions orderId={order.id} orderNumber={order.orderNumber} canCancel={isCancellationEligible(order.status)} canReturn={isReturnEligible(order)} canPay={isPaymentEligible(order)} canArchive={canArchiveOrder(order.status)} archived={Boolean(order.archivedAt)} invoiceAvailable={invoiceAvailable} />
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-lg font-black">Order progress</h3>
            <OrderTimeline status={order.status} createdAt={order.placedAt ?? order.createdAt} history={order.statusHistory} />
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="font-black">Payment & delivery</h3>
            <dl className="mt-4 space-y-4 text-sm">
              <div><dt className="text-slate-500">Payment status</dt><dd className="mt-1 font-bold">{paymentLabel(order.paymentStatus, buyer.paymentMethod)}</dd></div>
              <div><dt className="text-slate-500">Payment method</dt><dd className="mt-1 font-bold">{buyer.paymentMethod === "cod" ? "Cash on delivery" : buyer.paymentMethod === "online" ? "Online payment" : "Not available"}</dd></div>
              <div><dt className="text-slate-500">Courier</dt><dd className="mt-1 font-bold">Not assigned</dd></div>
              <div><dt className="text-slate-500">Tracking number</dt><dd className="mt-1 font-bold">Not available</dd></div>
              <div><dt className="text-slate-500">Estimated delivery</dt><dd className="mt-1 font-bold">We’ll update this when dispatched</dd></div>
            </dl>
          </section>
        </aside>
      </div>
    </article>
  );
}
