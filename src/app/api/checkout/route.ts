import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { createCheckoutSchema } from "@/features/checkout/schemas";
import {
  CheckoutError,
  createCheckoutOrder,
} from "@/features/checkout/server/checkout.service";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const parsed = createCheckoutSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid checkout details", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const order = await createCheckoutOrder(session.user, parsed.data);
    return NextResponse.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        subtotalPaise: Number(order.subtotalPaise),
        discountPaise: Number(order.discountPaise),
        taxPaise: Number(order.taxPaise),
        shippingPaise: Number(order.shippingPaise),
        totalPaise: Number(order.totalPaise),
        paymentStatus: order.paymentStatus,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}