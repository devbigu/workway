import { headers } from "next/headers";
import { redirect } from "next/navigation";

import type { OrderStatus } from "@/generated/prisma/enums";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const ACTIVE_ORDER_STATUSES: OrderStatus[] = [
  "PLACED",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
];

export const CANCELLABLE_ORDER_STATUSES: OrderStatus[] = [
  "PENDING_PAYMENT",
  "PLACED",
  "CONFIRMED",
  "PROCESSING",
];

export const TERMINAL_ORDER_STATUSES: OrderStatus[] = [
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
  "REFUNDED",
];

export const RETURN_WINDOW_DAYS = 14;

export type CustomerOrderTab = "current" | "unpaid" | "all";

export async function getCustomerFromHeaders(requestHeaders: Headers) {
  const session = await auth.api.getSession({ headers: requestHeaders });
  if (!session?.user?.id) return null;

  const customer = await db.user.findFirst({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      emailVerified: true,
      createdAt: true,
      role: true,
      accessEnabled: true,
    },
  });
  if (!customer || customer.role !== "CUSTOMER" || !customer.accessEnabled) {
    return { session, customer: null };
  }
  return { session, customer };
}

export async function requireCustomerPage() {
  const result = await getCustomerFromHeaders(await headers());
  if (!result) redirect("/login?redirect=/account");
  if (!result.customer) redirect("/forbidden");
  return result.customer;
}

export async function requireCustomerApi(request: Request) {
  return getCustomerFromHeaders(request.headers);
}

const customerOrderInclude = {
  address: true,
  sellerOrders: {
    include: {
      items: true,
    },
  },
  statusHistory: {
    orderBy: { createdAt: "asc" as const },
  },
} as const;

export type CustomerOrder = NonNullable<
  Awaited<ReturnType<typeof getCustomerOrder>>
>;

export async function getCustomerOrders(
  userId: string,
  tab: CustomerOrderTab = "current",
  archived = false,
) {
  const where =
    tab === "current"
      ? { status: { in: ACTIVE_ORDER_STATUSES } }
      : tab === "unpaid"
        ? {
            paymentStatus: { in: ["PENDING" as const, "FAILED" as const] },
            NOT: {
              buyerSnapshot: {
                path: ["paymentMethod"],
                equals: "cod",
              },
            },
          }
        : {};

  return db.order.findMany({
    where: {
      userId,
      archivedAt: archived ? { not: null } : null,
      ...where,
    },
    include: customerOrderInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getCustomerOrder(userId: string, orderId: string) {
  return db.order.findFirst({
    where: { id: orderId, userId },
    include: customerOrderInclude,
  });
}

export function isCancellationEligible(status: OrderStatus) {
  return CANCELLABLE_ORDER_STATUSES.includes(status);
}

export function getDeliveredAt(order: {
  status: OrderStatus;
  updatedAt: Date;
  statusHistory: Array<{ toStatus: OrderStatus; createdAt: Date }>;
}) {
  return (
    [...order.statusHistory]
      .reverse()
      .find((event) => event.toStatus === "DELIVERED")?.createdAt ??
    (order.status === "DELIVERED" ? order.updatedAt : null)
  );
}

export function isReturnEligible(order: {
  status: OrderStatus;
  updatedAt: Date;
  statusHistory: Array<{ toStatus: OrderStatus; createdAt: Date }>;
}, now = new Date()) {
  if (order.status !== "DELIVERED") return false;
  const deliveredAt = getDeliveredAt(order);
  if (!deliveredAt) return false;
  return now.getTime() - deliveredAt.getTime() <= RETURN_WINDOW_DAYS * 86_400_000;
}

export function isPaymentEligible(order: {
  status: OrderStatus;
  paymentStatus: string;
  buyerSnapshot: unknown;
}) {
  const buyer = asRecord(order.buyerSnapshot);
  return (
    buyer.paymentMethod === "online" &&
    ["PENDING", "FAILED"].includes(order.paymentStatus) &&
    ["PENDING_PAYMENT", "PLACED"].includes(order.status)
  );
}

export function canArchiveOrder(status: OrderStatus) {
  return TERMINAL_ORDER_STATUSES.includes(status);
}

export async function performCustomerOrderAction(
  userId: string,
  orderId: string,
  action: "cancel" | "return" | "archive" | "restore",
) {
  const order = await getCustomerOrder(userId, orderId);
  if (!order) return { ok: false as const, status: 404, message: "Order not found" };

  if (action === "archive" || action === "restore") {
    if (action === "archive" && !canArchiveOrder(order.status)) {
      return { ok: false as const, status: 403, message: "This order cannot be archived yet" };
    }
    await db.order.updateMany({
      where: { id: orderId, userId },
      data: { archivedAt: action === "archive" ? new Date() : null },
    });
    return { ok: true as const, message: action === "archive" ? "Order archived" : "Order restored" };
  }

  if (action === "cancel" && !isCancellationEligible(order.status)) {
    return { ok: false as const, status: 403, message: "This order can no longer be cancelled" };
  }
  if (action === "return" && !isReturnEligible(order)) {
    return { ok: false as const, status: 403, message: "This order is outside the return window" };
  }

  const nextStatus: OrderStatus = action === "cancel" ? "CANCELLED" : "RETURN_REQUESTED";
  await db.$transaction(async (transaction) => {
    const updated = await transaction.order.updateMany({
      where: { id: orderId, userId, status: order.status },
      data: {
        status: nextStatus,
        cancelledAt: action === "cancel" ? new Date() : undefined,
      },
    });
    if (updated.count !== 1) throw new Error("Order changed while the request was being processed");

    await transaction.orderStatusHistory.create({
      data: {
        orderId,
        fromStatus: order.status,
        toStatus: nextStatus,
        changedById: userId,
        reason: action === "cancel" ? "Cancelled by customer" : "Return requested by customer",
      },
    });
  });

  return { ok: true as const, message: action === "cancel" ? "Order cancelled" : "Return requested" };
}

export async function listCustomerSecurity(userId: string) {
  const [accounts, sessions] = await Promise.all([
    db.account.findMany({
      where: { userId },
      select: { id: true, providerId: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    db.session.findMany({
      where: { userId },
      select: {
        id: true,
        createdAt: true,
        expiresAt: true,
        ipAddress: true,
        userAgent: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return {
    accounts,
    sessions,
    hasPassword: accounts.some((account) => account.providerId === "credential"),
  };
}

export async function listSavedItemIds(userId: string) {
  return db.savedItem.findMany({
    where: { userId },
    select: { id: true, productId: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function listSupportRequests(userId: string) {
  return db.supportRequest.findMany({
    where: { userId },
    select: {
      id: true,
      category: true,
      subject: true,
      message: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      order: { select: { orderNumber: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function listSupportOrderOptions(userId: string) {
  return db.order.findMany({
    where: { userId },
    select: { id: true, orderNumber: true },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
}

export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function getOrderItemImage(item: { productSnapshot: unknown; offerSnapshot: unknown }) {
  const offer = asRecord(item.offerSnapshot);
  const variant = asRecord(offer.variant);
  const product = asRecord(item.productSnapshot);
  const images = Array.isArray(variant.images)
    ? variant.images
    : Array.isArray(product.images)
      ? product.images
      : [];
  return typeof images[0] === "string" ? images[0] : null;
}
