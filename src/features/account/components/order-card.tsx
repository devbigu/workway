import Image from "next/image";

import { OrderActions } from "@/features/account/components/order-actions";
import {
  asRecord,
  getOrderItemImage,
  isCancellationEligible,
  isPaymentEligible,
  isReturnEligible,
  canArchiveOrder,
  type CustomerOrder,
} from "@/features/account/server/account.service";
import { formatCurrency, formatDate, labelStatus, paymentLabel, statusTone } from "@/features/account/presentation";

function StatusBadge({ status }: { status: string }) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${statusTone(status)}`}>{labelStatus(status)}</span>;
}

export function OrderCard({ order, archived = false }: { order: CustomerOrder; archived?: boolean }) {
  const items = order.sellerOrders.flatMap((seller) => seller.items);
  const buyer = asRecord(order.buyerSnapshot);
  const address = order.address ?? asRecord(order.shippingAddressSnapshot);
  const paymentMethod = buyer.paymentMethod;
  const invoiceAvailable = ["PAID", "NOT_REQUIRED", "REFUNDED", "PARTIALLY_REFUNDED"].includes(order.paymentStatus);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-black tracking-tight">Order #{order.orderNumber}</h2>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-2 text-sm text-slate-500">
            {items.length} {items.length === 1 ? "product" : "products"} · Ordered by {String(buyer.name ?? "Customer")}
          </p>
          <p className="mt-1 text-sm text-slate-500">Placed on {formatDate(order.placedAt ?? order.createdAt)}</p>
        </div>
        <div className="sm:text-right">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Order total</p>
          <p className="mt-1 text-xl font-black">{formatCurrency(order.totalPaise)}</p>
        </div>
      </div>

      <div className="grid gap-4 bg-slate-50/70 p-5 text-sm sm:grid-cols-3 sm:p-6">
        <div><p className="font-bold text-slate-950">Current status</p><p className="mt-1 text-slate-600">{labelStatus(order.status)}</p></div>
        <div><p className="font-bold text-slate-950">Delivering to</p><p className="mt-1 text-slate-600">{[String("city" in address ? address.city : ""), String("state" in address ? address.state : "")].filter(Boolean).join(", ") || "Address on order"}</p></div>
        <div><p className="font-bold text-slate-950">Payment</p><p className="mt-1 text-slate-600">{paymentLabel(order.paymentStatus, paymentMethod)}</p></div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="grid gap-3 md:grid-cols-2">
          {items.slice(0, 4).map((item) => {
            const image = getOrderItemImage(item);
            return (
              <div key={item.id} className="flex min-w-0 gap-3 rounded-xl border border-slate-100 p-3">
                <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-slate-100 text-xs text-slate-400">
                  {image ? <Image src={image} alt="" width={64} height={64} unoptimized className="h-full w-full object-contain" /> : "No image"}
                </div>
                <div className="min-w-0">
                  <h3 className="line-clamp-2 text-sm font-bold">{item.productName}</h3>
                  <p className="mt-1 truncate text-xs text-slate-500">{item.variantName ?? item.sku}</p>
                  <p className="mt-1 text-xs text-slate-500">Qty {item.quantity} · {formatCurrency(item.unitPricePaise)} each</p>
                  <p className="mt-1 text-sm font-bold">{formatCurrency(item.totalPaise)}</p>
                </div>
              </div>
            );
          })}
        </div>
        {items.length > 4 && <p className="mt-3 text-sm font-semibold text-blue-700">+ {items.length - 4} more products</p>}
        <OrderActions
          orderId={order.id}
          orderNumber={order.orderNumber}
          canCancel={isCancellationEligible(order.status)}
          canReturn={isReturnEligible(order)}
          canPay={isPaymentEligible(order)}
          canArchive={canArchiveOrder(order.status)}
          archived={archived}
          invoiceAvailable={invoiceAvailable}
        />
      </div>
    </article>
  );
}
