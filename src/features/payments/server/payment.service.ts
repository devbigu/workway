import { db } from "@/lib/db";

export class PaymentError extends Error {
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export async function completeOrderPayment(
  userId: string,
  orderId: string,
  paymentMethod: "online" | "cod",
) {
  const order = await db.order.findFirst({
    where: { id: orderId, userId },
  });

  if (!order) throw new PaymentError("Order not found", 404);
  if (order.status === "CONFIRMED") return order;

  const snapshot = order.buyerSnapshot as Record<string, unknown>;
  if (snapshot.paymentMethod !== paymentMethod) {
    throw new PaymentError("Payment method does not match the order", 409);
  }

  if (
    paymentMethod === "online" &&
    process.env.PAYMENT_SANDBOX_MODE !== "true"
  ) {
    throw new PaymentError("Online payment gateway is not configured", 503);
  }

  return db.$transaction(async (transaction) => {
    const updated = await transaction.order.update({
      where: { id: order.id },
      data: {
        status: "CONFIRMED",
        paymentStatus: paymentMethod === "online" ? "PAID" : "NOT_REQUIRED",
        placedAt: new Date(),
      },
    });

    await transaction.sellerOrder.updateMany({
      where: { orderId: order.id },
      data: { status: "CONFIRMED" },
    });

    return updated;
  });
}
