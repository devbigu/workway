import { ChangePasswordForm } from "@/features/account/components/security-settings";
import { requireAdminPage } from "@/lib/admin-auth";

export default async function AdminAccount() {
  const user = await requireAdminPage();
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div><p className="text-sm font-semibold text-blue-600">Your account</p><h1 className="text-3xl font-bold">Change password</h1><p className="text-sm text-slate-500">{user.email} · Other sessions are signed out after the change.</p></div>
      <section className="rounded-2xl border bg-white p-5"><ChangePasswordForm /></section>
    </div>
  );
}
