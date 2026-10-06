import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getCustomerFromHeaders } from "@/features/account/server/account.service";

// Only customers can check out; staff/admin are sent back to their dashboard.
export default async function CheckoutLayout({ children }: { children: React.ReactNode }) {
  const result = await getCustomerFromHeaders(await headers());
  if (!result) redirect("/login?callbackURL=%2Fcheckout&checkout=required");
  if (!result.customer) redirect("/admin");
  return children;
}
