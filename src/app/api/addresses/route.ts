import { NextResponse } from "next/server";

import { createAddressSchema } from "@/features/checkout/schemas";
import { AddressError, createCustomerAddress, listSavedAddresses } from "@/features/checkout/server/address.service";
import { requireCustomerApi } from "@/features/account/server/account.service";

export async function GET(request: Request) {
  const auth = await requireCustomerApi(request);
  if (!auth) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  if (!auth.customer) return NextResponse.json({ error: "Customer access required" }, { status: 403 });

  return NextResponse.json({ addresses: await listSavedAddresses(auth.customer.id) });
}

export async function POST(request: Request) {
  const auth = await requireCustomerApi(request);
  if (!auth) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  if (!auth.customer) return NextResponse.json({ error: "Customer access required" }, { status: 403 });

  const parsed = createAddressSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Check the highlighted address fields", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const address = await createCustomerAddress(auth.customer.id, parsed.data);
    return NextResponse.json({ address }, { status: 201 });
  } catch (error) {
    if (error instanceof AddressError) return NextResponse.json({ error: error.message }, { status: error.status });
    throw error;
  }
}

