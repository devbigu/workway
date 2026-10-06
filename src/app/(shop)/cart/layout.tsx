import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getCustomerFromHeaders } from "@/features/account/server/account.service";

// Guests and customers can use the cart; signed-in staff/admin cannot.
export default async function CartLayout({ children }: { children: React.ReactNode }) {
  const result = await getCustomerFromHeaders(await headers());
  if (result && !result.customer) redirect("/admin");
  return children;
}
