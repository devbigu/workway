import { randomBytes } from "node:crypto";

import productsData from "../../../../public/data/nested_omsons_products.json" with { type: "json" };

import type { CreateCheckoutInput } from "@/features/checkout/schemas";
import type { Product } from "@/features/products/types";
import { db } from "@/lib/db";

const products = productsData as Product[];

export class CheckoutError extends Error {
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export async function createCheckoutOrder(
  user: { id: string; name: string; email: string },
  input: CreateCheckoutInput,
) {
  const existing = await db.order.findUnique({
    where: { idempotencyKey: input.idempotencyKey },
  });

  if (existing) {
    if (existing.userId !== user.id) {
      throw new CheckoutError("Invalid idempotency key", 409);
    }
    return existing;
  }

  const resolvedItems = input.items.map((requested) => {
    const product = products.find(({ id }) => id === requested.productId);
    const variant = product?.variants.find(({ id }) => id === requested.variantId);

    if (!product || !variant || !variant.inStock || variant.price === null) {
      throw new CheckoutError("A cart item is unavailable");
    }

    const unitPricePaise = Math.round(variant.price * 100);
    const subtotalPaise = unitPricePaise * requested.quantity;
    return { product, variant, requested, unitPricePaise, subtotalPaise };
  });

  const subtotalPaise = resolvedItems.reduce(
    (total, item) => total + item.subtotalPaise,
    0,
  );
  const discountPaise =
    input.voucher.toUpperCase() === "WORKWAY5"
      ? Math.min(Math.round(subtotalPaise * 0.05), 50_000)
      : 0;
  const taxPaise = Math.round(subtotalPaise * 0.18);
  const shippingPaise = input.delivery === "priority" ? 29_900 : 0;
  const totalPaise =
    subtotalPaise - discountPaise + taxPaise + shippingPaise;
  const orderNumber = `WW-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;

  return db.$transaction(async (transaction) => {
    return transaction.order.create({
      data: {
        orderNumber,
        idempotencyKey: input.idempotencyKey,
        userId: user.id,
        status: "PENDING_PAYMENT",
        paymentStatus:
          input.payment === "cod" ? "NOT_REQUIRED" : "PENDING",
        subtotalPaise,
        discountPaise,
        taxPaise,
        shippingPaise,
        totalPaise,
        billingAddressSnapshot: input.address,
        shippingAddressSnapshot: input.address,
        buyerSnapshot: {
          id: user.id,
          name: user.name,
          email: user.email,
          paymentMethod: input.payment,
          deliveryMethod: input.delivery,
        },
        sellerOrders: {
          create: {
            sellerOrderNumber: `${orderNumber}-01`,
            status: "PENDING",
            subtotalPaise,
            discountPaise,
            taxPaise,
            shippingPaise,
            totalPaise,
            sellerSnapshot: { name: "WorkWay" },
            items: {
              create: resolvedItems.map((item) => ({
                productId: item.product.id,
                productVariantId: item.variant.id,
                productName: item.product.name,
                variantName: item.variant.name,
                sku: item.variant.sku,
                catalogueNumber: item.variant.sku,
                hsnCode: item.product.hsnCode,
                packSize: item.variant.pack,
                quantity: item.requested.quantity,
                unitPricePaise: item.unitPricePaise,
                subtotalPaise: item.subtotalPaise,
                taxableAmountPaise: item.subtotalPaise,
                taxRateBps: 1800,
                taxPaise: Math.round(item.subtotalPaise * 0.18),
                totalPaise:
                  item.subtotalPaise +
                  Math.round(item.subtotalPaise * 0.18),
                productSnapshot: item.product,
                offerSnapshot: {
                  variant: item.variant,
                  voucher: input.voucher || null,
                },
              })),
            },
          },
        },
      },
    });
  });
}
