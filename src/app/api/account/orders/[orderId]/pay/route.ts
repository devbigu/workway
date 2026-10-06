import { NextResponse } from "next/server";

import { getCustomerOrder, isPaymentEligible, requireCustomerApi } from "@/features/account/server/account.service";
import { completeOrderPayment, PaymentError } from "@/features/payments/server/payment.service";

export async function POST(request: Request, context: { params: Promise<{ orderId: string }> }) {
  const auth = await requireCustomerApi(request);
  if (!auth) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  if (!auth.customer) return NextResponse.json({ error: "Customer access required" }, { status: 403 });

  const { orderId } = await context.params;
  const order = await getCustomerOrder(auth.customer.id, orderId);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (!isPaymentEligible(order)) return NextResponse.json({ error: "This order is not eligible for payment" }, { status: 403 });

  try {
    await completeOrderPayment(auth.customer.id, orderId, "online");
    return NextResponse.json({ message: "Payment confirmed and order placed" });
  } catch (error) {
    if (error instanceof PaymentError) return NextResponse.json({ error: error.message }, { status: error.status });
    throw error;
  }
}
