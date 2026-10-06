import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { CheckoutForm } from "@/features/checkout/components/checkout-form";
import { listSavedAddresses } from "@/features/checkout/server/address.service";
import { auth } from "@/lib/auth";

export default async function CheckoutPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login?callbackURL=%2Fcheckout&checkout=required");

  const addresses = await listSavedAddresses(session.user.id);
  return <CheckoutForm initialAddresses={addresses} />;
}
