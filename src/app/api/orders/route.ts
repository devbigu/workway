import { NextResponse } from "next/server";

import { requireCustomerApi } from "@/features/account/server/account.service";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const auth = await requireCustomerApi(request);
  if (!auth) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  if (!auth.customer) return NextResponse.json({ error: "Customer access required" }, { status: 403 });

  const orders = await db.order.findMany({
    where: { userId: auth.customer.id },
    orderBy: { createdAt: "desc" },
    include: {
      sellerOrders: {
        include: { items: true },
      },
    },
  });

  return NextResponse.json({
    orders: orders.map((order) => ({
      ...order,
      subtotalPaise: Number(order.subtotalPaise),
      discountPaise: Number(order.discountPaise),
      taxPaise: Number(order.taxPaise),
      shippingPaise: Number(order.shippingPaise),
      roundingPaise: Number(order.roundingPaise),
      totalPaise: Number(order.totalPaise),
      sellerOrders: order.sellerOrders.map((sellerOrder) => ({
        ...sellerOrder,
        subtotalPaise: Number(sellerOrder.subtotalPaise),
        discountPaise: Number(sellerOrder.discountPaise),
        taxPaise: Number(sellerOrder.taxPaise),
        shippingPaise: Number(sellerOrder.shippingPaise),
        roundingPaise: Number(sellerOrder.roundingPaise),
        totalPaise: Number(sellerOrder.totalPaise),
        items: sellerOrder.items.map((item) => ({
          ...item,
          unitPricePaise: Number(item.unitPricePaise),
          subtotalPaise: Number(item.subtotalPaise),
          discountPaise: Number(item.discountPaise),
          taxableAmountPaise: Number(item.taxableAmountPaise),
          taxPaise: Number(item.taxPaise),
          totalPaise: Number(item.totalPaise),
        })),
      })),
    })),
  });
}
