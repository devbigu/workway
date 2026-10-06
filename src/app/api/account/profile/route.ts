import { NextResponse } from "next/server";

import { profileSchema } from "@/features/account/schemas";
import { requireCustomerApi } from "@/features/account/server/account.service";
import { db } from "@/lib/db";

export async function PATCH(request: Request) {
  const auth = await requireCustomerApi(request);
  if (!auth) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  if (!auth.customer) return NextResponse.json({ error: "Customer access required" }, { status: 403 });
  const parsed = profileSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check your details" }, { status: 400 });

  const customer = await db.user.update({
    where: { id: auth.customer.id },
    data: { name: parsed.data.name, phone: parsed.data.phone || null },
    select: { name: true, email: true, phone: true },
  });
  return NextResponse.json({ customer, message: "Profile updated" });
}
