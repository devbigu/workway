import { NextResponse } from "next/server";

import { updateAddressSchema } from "@/features/checkout/schemas";
import { AddressError, deleteCustomerAddress, updateCustomerAddress } from "@/features/checkout/server/address.service";
import { requireCustomerApi } from "@/features/account/server/account.service";

type AddressRouteContext = { params: Promise<{ addressId: string }> };

export async function PATCH(request: Request, context: AddressRouteContext) {
  const auth = await requireCustomerApi(request);
  if (!auth) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  if (!auth.customer) return NextResponse.json({ error: "Customer access required" }, { status: 403 });

  const parsed = updateAddressSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Check the highlighted address fields", details: parsed.error.flatten() }, { status: 400 });

  try {
    const { addressId } = await context.params;
    const address = await updateCustomerAddress(auth.customer.id, addressId, parsed.data);
    return NextResponse.json({ address });
  } catch (error) {
    if (error instanceof AddressError) return NextResponse.json({ error: error.message }, { status: error.status });
    throw error;
  }
}

export async function DELETE(request: Request, context: AddressRouteContext) {
  const auth = await requireCustomerApi(request);
  if (!auth) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  if (!auth.customer) return NextResponse.json({ error: "Customer access required" }, { status: 403 });

  try {
    const { addressId } = await context.params;
    await deleteCustomerAddress(auth.customer.id, addressId);
    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof AddressError) return NextResponse.json({ error: error.message }, { status: error.status });
    throw error;
  }
}

