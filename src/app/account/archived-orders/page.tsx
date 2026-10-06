import { AccountEmptyState } from "@/features/account/components/empty-state";
import { OrderCard } from "@/features/account/components/order-card";
import { getCustomerOrders, requireCustomerPage } from "@/features/account/server/account.service";

export default async function ArchivedOrdersPage() {
  const customer = await requireCustomerPage();
  const orders = await getCustomerOrders(customer.id, "all", true);
  return <section><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Order history</p><h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Archived Orders</h2><p className="mt-2 text-sm text-slate-500">Archived orders stay securely stored with their complete history.</p><div className="mt-6 space-y-5">{orders.length?orders.map(order=><OrderCard key={order.id} order={order} archived/>):<AccountEmptyState title="No archived orders" description="Orders you archive will appear here." action={false}/>}</div></section>;
}
