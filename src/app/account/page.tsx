import Link from "next/link";

import { AccountEmptyState } from "@/features/account/components/empty-state";
import { OrderCard } from "@/features/account/components/order-card";
import { getCustomerOrders, requireCustomerPage, type CustomerOrderTab } from "@/features/account/server/account.service";

const tabs: Array<{ value: CustomerOrderTab; label: string }> = [
  { value: "current", label: "Current" },
  { value: "unpaid", label: "Unpaid" },
  { value: "all", label: "All Orders" },
];

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const customer = await requireCustomerPage();
  const raw = (await searchParams).tab;
  const tab: CustomerOrderTab = typeof raw === "string" && ["current", "unpaid", "all"].includes(raw)
    ? raw as CustomerOrderTab
    : "current";
  const orders = await getCustomerOrders(customer.id, tab);

  const empty = tab === "current"
    ? { title: "No current orders", description: "You do not have any active orders." }
    : tab === "unpaid"
      ? { title: "No unpaid orders", description: "All your orders are paid." }
      : { title: "No orders yet", description: "Your order history will appear here after checkout." };

  return (
    <section aria-labelledby="orders-heading">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Order history</p>
          <h2 id="orders-heading" className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">My Orders</h2>
          <p className="mt-2 text-sm text-slate-500">Review purchases, payments, delivery progress, and returns.</p>
        </div>
      </div>

      <div className="mt-6 border-b border-slate-200" role="tablist" aria-label="Order filters">
        <div className="flex gap-6">
          {tabs.map((item) => {
            const active = item.value === tab;
            return <Link key={item.value} href={item.value === "current" ? "/account" : `/account?tab=${item.value}`} role="tab" aria-selected={active} className={`relative min-h-11 px-1 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${active ? "text-blue-800 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-blue-600" : "text-slate-500 hover:text-slate-900"}`}>{item.label}</Link>;
          })}
        </div>
      </div>

      <div className="mt-5 space-y-5">
        {orders.length ? orders.map((order) => <OrderCard key={order.id} order={order} />) : <AccountEmptyState {...empty} />}
      </div>
    </section>
  );
}
