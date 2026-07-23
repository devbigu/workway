import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  PaymentError,
  completeOrderPayment,
} from "@/features/payments/server/payment.service";
import { auth } from "@/lib/auth";

const requestSchema = z.object({
  orderId: z.string().min(1),
  paymentMethod: z.enum(["online", "cod"]),
});

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payment details" }, { status: 400 });
  }

  try {
    const order = await completeOrderPayment(
      session.user.id,
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