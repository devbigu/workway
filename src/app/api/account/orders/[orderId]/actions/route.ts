import { NextResponse } from "next/server";

import { orderActionSchema } from "@/features/account/schemas";
import { performCustomerOrderAction, requireCustomerApi } from "@/features/account/server/account.service";

export async function POST(request: Request, context: { params: Promise<{ orderId: string }> }) {
  const auth = await requireCustomerApi(request);
  if (!auth) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  if (!auth.customer) return NextResponse.json({ error: "Customer access required" }, { status: 403 });

  const parsed = orderActionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid order action" }, { status: 400 });

  const { orderId } = await context.params;
  try {
    const result = await performCustomerOrderAction(auth.customer.id, orderId, parsed.data.action);
    if (!result.ok) return NextResponse.json({ error: result.message }, { status: result.status });
    return NextResponse.json({ message: result.message });
  } catch {
    return NextResponse.json({ error: "The order changed. Refresh and try again." }, { status: 409 });
  }
}
