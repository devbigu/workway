import { NextResponse } from "next/server";

import { supportRequestSchema } from "@/features/account/schemas";
import { requireCustomerApi } from "@/features/account/server/account.service";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const auth = await requireCustomerApi(request);
  if (!auth) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  if (!auth.customer) return NextResponse.json({ error: "Customer access required" }, { status: 403 });

  const parsed = supportRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check your request" }, { status: 400 });

  if (parsed.data.orderId) {
    const owned = await db.order.findFirst({ where: { id: parsed.data.orderId, userId: auth.customer.id }, select: { id: true } });
    if (!owned) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const ticket = await db.supportRequest.create({
    data: {
      userId: auth.customer.id,
      orderId: parsed.data.orderId,
      category: parsed.data.category,
      subject: parsed.data.subject,
      message: parsed.data.message,
    },
    select: { id: true, status: true, createdAt: true },
  });
  return NextResponse.json({ ticket, message: "Support request submitted" }, { status: 201 });
}
