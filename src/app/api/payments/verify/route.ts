import { NextResponse } from "next/server";
import { z } from "zod";

import {
  PaymentError,
  completeOrderPayment,
} from "@/features/payments/server/payment.service";
import { requireCustomerApi } from "@/features/account/server/account.service";

const requestSchema = z.object({
  orderId: z.string().min(1),
  paymentMethod: z.enum(["online", "cod"]),
});

export async function POST(request: Request) {
  const auth = await requireCustomerApi(request);
  if (!auth) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  if (!auth.customer) return NextResponse.json({ error: "Customer access required" }, { status: 403 });

  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payment details" }, { status: 400 });
  }

  try {
    const order = await completeOrderPayment(
      auth.customer.id,
      parsed.data.orderId,
      parsed.data.paymentMethod,
    );
    return NextResponse.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        totalPaise: Number(order.totalPaise),
      },
    });
  } catch (error) {
    if (error instanceof PaymentError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}

