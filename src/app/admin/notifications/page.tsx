import Link from "next/link";
import { revalidatePath } from "next/cache";

import { requireAdminPage } from "@/lib/admin-auth";
import { db } from "@/lib/db";

async function markAllRead() {
  "use server";
  await requireAdminPage("notifications:read");
  await db.adminNotification.updateMany({ where: { readAt: null }, data: { readAt: new Date() } });
  revalidatePath("/admin", "layout");
}

export default async function AdminNotifications() {
  await requireAdminPage("notifications:read");
  const items = await db.adminNotification.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div><p className="text-sm font-semibold text-blue-600">Activity</p><h1 className="text-3xl font-bold">Notifications</h1><p className="text-sm text-slate-500">New orders and password changes.</p></div>
        <form action={markAllRead}><button className="rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold">Mark all read</button></form>
      </div>
      <ul className="divide-y overflow-hidden rounded-2xl border bg-white">
        {items.map((n) => (
          <li key={n.id} className={n.readAt ? "" : "bg-blue-50/60"}>
            <Link href={n.href ?? "#"} className="flex items-start gap-3 p-4 hover:bg-slate-50">
              <span className={"mt-1.5 h-2 w-2 shrink-0 rounded-full " + (n.readAt ? "bg-transparent" : "bg-blue-600")} />
              <span className="min-w-0 flex-1 text-sm">{n.title}</span>
              <time className="shrink-0 text-xs text-slate-500">{n.createdAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</time>
            </Link>
          </li>
        ))}
        {!items.length && <li className="p-14 text-center text-sm text-slate-400">No notifications yet.</li>}
      </ul>
    </div>
  );
}
