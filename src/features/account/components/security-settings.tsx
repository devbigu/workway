"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { authClient } from "@/lib/auth-client";

const input = "mt-1.5 min-h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

// Shared by customers (/account/security) and staff (/admin/account); the auth after-hook notifies admins.
export function ChangePasswordForm() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const next = String(form.get("newPassword") ?? "");
    if (next.length < 8 || next !== form.get("confirmPassword")) { setMessage("Passwords must match and contain at least 8 characters"); return; }
    setBusy(true);
    const result = await authClient.changePassword({ currentPassword: String(form.get("currentPassword") ?? ""), newPassword: next, revokeOtherSessions: true });
    setMessage(result.error?.message ?? "Password changed and other sessions signed out");
    if (!result.error) formElement.reset();
    setBusy(false);
  }

  return <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold sm:col-span-2">Current password<input type="password" name="currentPassword" autoComplete="current-password" className={input} required/></label><label className="text-sm font-bold">New password<input type="password" name="newPassword" autoComplete="new-password" className={input} required/></label><label className="text-sm font-bold">Confirm password<input type="password" name="confirmPassword" autoComplete="new-password" className={input} required/></label><button disabled={busy} className="min-h-11 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white sm:col-span-2 sm:w-fit">{busy ? "Updating…" : "Change password"}</button>{message && <p aria-live="polite" className="text-sm text-slate-700 sm:col-span-2">{message}</p>}</form>;
}

export function SecuritySettings({ customer, hasPassword }: { customer: { name: string; email: string; phone: string | null }; hasPassword: boolean }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState("");

  async function profile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy("profile"); setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/account/profile", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: form.get("name"), phone: form.get("phone") }) });
    const result = await response.json() as { error?: string; message?: string };
    setMessage(response.ok ? result.message ?? "Profile updated" : result.error ?? "Unable to update profile");
    setBusy(""); if (response.ok) router.refresh();
  }

  async function revoke() {
    if (!window.confirm("Sign out all other active sessions?")) return;
    setBusy("sessions");
    const response = await fetch("/api/account/sessions", { method: "DELETE" });
    const result = await response.json() as { error?: string; message?: string };
    setMessage(response.ok ? result.message ?? "Other sessions signed out" : result.error ?? "Unable to revoke sessions");
    setBusy(""); if (response.ok) router.refresh();
  }

  return <div className="space-y-5">
    <p aria-live="polite" className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-900">{message || "Sensitive changes are verified on the server."}</p>
    <form onSubmit={profile} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h3 className="text-lg font-black">Personal information</h3><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">Name<input name="name" defaultValue={customer.name} className={input} required maxLength={120}/></label><label className="text-sm font-bold">Phone number<input name="phone" defaultValue={customer.phone ?? ""} className={input} inputMode="tel"/></label><label className="text-sm font-bold sm:col-span-2">Email<input value={customer.email} readOnly className={input + " bg-slate-50 text-slate-500"}/></label></div><button disabled={busy === "profile"} className="mt-5 min-h-11 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white">{busy === "profile" ? "Saving…" : "Save changes"}</button></form>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h3 className="text-lg font-black">Password</h3>{hasPassword ? <ChangePasswordForm /> : <p className="mt-3 text-sm leading-6 text-slate-500">Your account uses a connected provider and does not currently have a password credential.</p>}</section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h3 className="text-lg font-black">Active sessions</h3><p className="mt-2 text-sm text-slate-500">Lost a device? Sign out other sessions without exposing session tokens.</p><button type="button" onClick={revoke} disabled={busy === "sessions"} className="mt-4 min-h-11 rounded-xl border border-red-200 px-4 text-sm font-bold text-red-700">{busy === "sessions" ? "Signing out…" : "Sign out other devices"}</button></section>
  </div>;
}
