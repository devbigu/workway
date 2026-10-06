import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { adminUserUpdate, STAFF_ROLES } from "@/features/users/server/user.service";
import { Prisma } from "@/generated/prisma/client";
import { ADMIN_PERMISSIONS, hasAdminPermission, requireAdminPage } from "@/lib/admin-auth";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const money = (v: bigint) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(v) / 100);
const label = (v: string) => v.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
const input = "mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500";

// Customers need customers:*, staff need staff:* — so support staff can't edit staff accounts.
async function load(userId: string, write: boolean) {
  const actor = await requireAdminPage();
  const target = await db.user.findUnique({ where: { id: userId } });
  if (!target) notFound();
  if (!hasAdminPermission(actor, `${target.role === "CUSTOMER" ? "customers" : "staff"}:${write ? "write" : "read"}`)) redirect("/forbidden");
  return { actor, target };
}

const back: (userId: string, key: "saved" | "error", message: string) => never = (userId, key, message) => redirect(`/admin/users/${userId}?${key}=${encodeURIComponent(message)}`);

export default async function AdminUserPage({ params, searchParams }: { params: Promise<{ userId: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { userId } = await params;
  const q = await searchParams;
  const { actor, target } = await load(userId, false);
  const isStaff = target.role !== "CUSTOMER";
  const canWrite = hasAdminPermission(actor, isStaff ? "staff:write" : "customers:write");
  const self = actor.id === target.id;
  const [orders, addresses] = isStaff ? [[], []] : await Promise.all([
    db.order.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 10 }),
    db.address.findMany({ where: { userId, isSaved: true }, orderBy: { createdAt: "desc" } }),
  ]);

  async function saveDetails(form: FormData) {
    "use server";
    const { actor, target } = await load(userId, true);
    const result = adminUserUpdate(actor.id, target, form);
    if ("error" in result) back(userId, "error", result.error);
    const { data } = result;
    try {
      await db.$transaction([
        db.user.update({ where: { id: userId }, data }),
        // Blocking someone signs them out everywhere.
        ...(data.accessEnabled === false ? [db.session.deleteMany({ where: { userId } })] : []),
        db.auditLog.create({ data: { actorId: actor.id, action: "USER_UPDATED", entityType: "User", entityId: userId, metadata: { fields: Object.keys(data) } } }),
      ]);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") back(userId, "error", "That email is already in use");
      throw error;
    }
    back(userId, "saved", "Details saved");
  }

  async function setPassword(form: FormData) {
    "use server";
    const { actor, target } = await load(userId, true);
    // Admins reset staff passwords only; their own goes through /admin/account (needs the current password).
    if (target.role === "CUSTOMER" || actor.id === target.id) redirect("/forbidden");
    const ctx = await auth.$context;
    const { minPasswordLength, maxPasswordLength } = ctx.password.config;
    const password = String(form.get("password") ?? "");
    if (password.length < minPasswordLength || password.length > maxPasswordLength || password !== form.get("confirmPassword")) {
      back(userId, "error", `Passwords must match and be ${minPasswordLength}–${maxPasswordLength} characters`);
    }
    const account = await db.account.findFirst({ where: { userId, providerId: "credential" }, select: { id: true } });
    if (!account) back(userId, "error", "This staff member has no password login");
    await db.$transaction([
      db.account.update({ where: { id: account.id }, data: { password: await ctx.password.hash(password) } }),
      db.session.deleteMany({ where: { userId } }),
      db.auditLog.create({ data: { actorId: actor.id, action: "STAFF_PASSWORD_RESET", entityType: "User", entityId: userId } }),
      db.adminNotification.create({ data: { title: `${actor.name} reset the password for staff ${target.name} (${target.email})`, href: `/admin/users/${userId}` } }),
    ]);
    back(userId, "saved", "Password updated and their sessions signed out");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div>
        <Link href={isStaff ? "/admin/staff" : "/admin/customers"} className="text-sm font-semibold text-blue-600">← {isStaff ? "Staff" : "Customers"}</Link>
        <h1 className="mt-2 text-3xl font-bold">{target.name}</h1>
        <p className="text-sm text-slate-500">
          {target.email} · {label(target.role)} · {target.accessEnabled ? "Active" : "Blocked"} · {target.emailVerified ? "Verified" : "Unverified"} · Joined {target.createdAt.toLocaleDateString("en-IN")}
        </p>
      </div>
      {q.saved && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{q.saved}</p>}
      {q.error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{q.error}</p>}

      <form action={saveDetails} className="rounded-2xl border bg-white p-5">
        <fieldset disabled={!canWrite} className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-4 font-bold">Details{!canWrite && <span className="ml-2 text-xs font-normal text-slate-500">(view only)</span>}</legend>
          <label className="text-sm font-semibold">Name<input name="name" defaultValue={target.name} required maxLength={120} className={input} /></label>
          <label className="text-sm font-semibold">Email<input name="email" type="email" defaultValue={target.email} required className={input} /></label>
          <label className="text-sm font-semibold">Phone<input name="phone" defaultValue={target.phone ?? ""} inputMode="tel" className={input} /></label>
          {isStaff && (
            <label className="text-sm font-semibold">Role
              <select name="role" defaultValue={target.role} disabled={self} className={input}>{STAFF_ROLES.map((r) => <option key={r} value={r}>{label(r)}</option>)}</select>
            </label>
          )}
          {!self && <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-2"><input type="checkbox" name="accessEnabled" defaultChecked={target.accessEnabled} className="h-4 w-4" />Account access enabled</label>}
          {isStaff && !self && (
            <div className="sm:col-span-2">
              <p className="text-sm font-semibold">Extra permissions <span className="font-normal text-slate-500">(on top of role defaults)</span></p>
              <div className="mt-2 flex flex-wrap gap-3">
                {ADMIN_PERMISSIONS.map((p) => <label key={p} className="flex items-center gap-1.5 text-xs"><input type="checkbox" name="permissions" value={p} defaultChecked={target.permissions.includes(p)} />{p}</label>)}
              </div>
            </div>
          )}
          {canWrite && <button className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white sm:w-fit">Save details</button>}
        </fieldset>
      </form>

      {isStaff && canWrite && (self ? (
        <p className="rounded-2xl border bg-white p-5 text-sm text-slate-600">Change your own password from <Link href="/admin/account" className="font-semibold text-blue-600">your account</Link>.</p>
      ) : (
        <form action={setPassword} className="grid gap-4 rounded-2xl border bg-white p-5 sm:grid-cols-2">
          <h2 className="font-bold sm:col-span-2">Set new password</h2>
          <label className="text-sm font-semibold">New password<input type="password" name="password" autoComplete="new-password" required className={input} /></label>
          <label className="text-sm font-semibold">Confirm password<input type="password" name="confirmPassword" autoComplete="new-password" required className={input} /></label>
          <button className="h-11 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white sm:w-fit">Update password</button>
        </form>
      ))}

      {!isStaff && (
        <>
          <section className="overflow-hidden rounded-2xl border bg-white">
            <h2 className="p-5 font-bold">Recent orders</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-3">Order</th><th>Status</th><th>Total</th><th>Date</th></tr></thead>
                <tbody>{orders.map((o) => <tr key={o.id} className="border-t"><td className="p-3"><Link href={`/admin/orders/${o.id}`} className="font-semibold text-blue-700">{o.orderNumber}</Link></td><td>{label(o.status)}</td><td>{money(o.totalPaise)}</td><td>{o.createdAt.toLocaleDateString("en-IN")}</td></tr>)}</tbody>
              </table>
            </div>
            {!orders.length && <p className="p-8 text-center text-sm text-slate-400">No orders yet.</p>}
          </section>
          <section className="rounded-2xl border bg-white p-5">
            <h2 className="font-bold">Saved addresses</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {addresses.map((a) => <div key={a.id} className="rounded-xl bg-slate-50 p-3 text-sm"><p className="font-semibold">{a.fullName}{a.isDefault && <span className="ml-2 text-xs text-blue-700">Default</span>}</p><p className="text-slate-600">{[a.addressLine1, a.addressLine2, a.landmark, a.city, a.state, a.postalCode, a.country].filter(Boolean).join(", ")}</p><p className="text-xs text-slate-500">{a.phone}</p></div>)}
              {!addresses.length && <p className="text-sm text-slate-400">No saved addresses.</p>}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
