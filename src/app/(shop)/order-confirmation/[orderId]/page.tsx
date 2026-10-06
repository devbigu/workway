import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { CopyButton } from "@/components/shared/copy-button";
import { formatDate } from "@/features/account/presentation";
import { Icon } from "@/features/home/components/icon";
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

  const items = order.sellerOrders.flatMap((sellerOrder) => sellerOrder.items);
  const paid = order.paymentStatus === "PAID";

  return (
    <main className="page-wrap pb-16">
      <section className="mx-auto max-w-[40rem] pt-12 text-center lg:pt-16">
        <Icon name="flask" className="mx-auto h-14 w-14 text-ink" strokeWidth={1} />
        <h1 className="page-title mt-6">Thank you. <em>Order received.</em></h1>
        <div className="mt-6 flex items-center justify-center gap-1">
          <span className="figure-lg">{order.orderNumber}</span>
          <CopyButton value={order.orderNumber} label={`Copy order number ${order.orderNumber}`} />
        </div>
        <p className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <span className="meta">Placed {formatDate(order.placedAt ?? order.createdAt)}</span>
          <span className={paid ? "badge badge-success" : "badge"}>{paid ? "Paid" : "Pay on delivery"}</span>
        </p>
        <p className="mt-4 text-ink-2">A confirmation and delivery updates will go to {session.user.email}.</p>
      </section>

      <section className="mx-auto mt-12 max-w-[40rem]" aria-labelledby="items-title">
        <h2 id="items-title" className="subsection">Items</h2>
        <table className="table table-stack mt-4">
          <thead>
            <tr><th scope="col">Product</th><th scope="col" className="num">Packs</th><th scope="col" className="num">Total</th></tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td><span className="block text-ink">{item.productName}</span><span className="meta">{item.sku}</span></td>
                <td className="num" data-label="Packs"><span>{item.quantity}</span></td>
                <td className="num" data-label="Total"><span>{formatPrice(item.totalPaise)}</span></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr><td colSpan={2}>Order total</td><td className="num" data-label="">{formatPrice(order.totalPaise)}</td></tr>
          </tfoot>
        </table>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href={`/account/orders/${order.id}`} className="btn btn-primary">View order</Link>
          {paid && <a href={`/api/account/orders/${order.id}/invoice`} className="btn btn-secondary">Download invoice</a>}
          <Link href="/products" className="link link-arrow text-sm sm:ml-3">Continue shopping</Link>
        </div>
      </section>
    </main>
  );
}
