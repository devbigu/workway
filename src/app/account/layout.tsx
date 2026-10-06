import type { Metadata } from "next";
import Image from "next/image";

import { AccountNavigation } from "@/features/account/components/account-navigation";
import { requireCustomerPage } from "@/features/account/server/account.service";

export const metadata: Metadata = {
  title: "Your Account | worklab",
  description: "Manage your worklab orders and account.",
};

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "CU";
}

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const customer = await requireCustomerPage();

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#f5f7f2] text-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        <header className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-4 p-5 sm:p-7">
            {customer.image ? (
              <Image src={customer.image} alt="" width={64} height={64} unoptimized className="h-14 w-14 rounded-full object-cover sm:h-16 sm:w-16" />
            ) : (
              <div aria-hidden="true" className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-blue-100 text-lg font-black text-blue-800 sm:h-16 sm:w-16">
                {initials(customer.name)}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Your Account</p>
              <h1 className="mt-1 truncate text-xl font-bold tracking-tight sm:text-2xl">{customer.name}</h1>
              <p className="mt-1 truncate text-sm text-slate-500">{customer.email}</p>
            </div>
          </div>
        </header>
        <div className="lg:hidden"><AccountNavigation /></div>
        <div className="mt-5 grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <div className="hidden lg:block"><AccountNavigation /></div>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </main>
  );
}
