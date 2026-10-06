import { NextResponse } from "next/server";

import productsData from "../../../../../public/data/nested_omsons_products.json" with { type: "json" };

import { savedItemSchema } from "@/features/account/schemas";
import { requireCustomerApi } from "@/features/account/server/account.service";
import type { Product } from "@/features/products/types";
import { db } from "@/lib/db";

const productIds = new Set((productsData as Product[]).map((product) => product.id));

export async function POST(request: Request) {
  const auth = await requireCustomerApi(request);
  if (!auth) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  if (!auth.customer) return NextResponse.json({ error: "Customer access required" }, { status: 403 });
  const parsed = savedItemSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !productIds.has(parsed.data.productId)) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  await db.savedItem.upsert({
    where: { userId_productId: { userId: auth.customer.id, productId: parsed.data.productId } },
    update: {},
    create: { userId: auth.customer.id, productId: parsed.data.productId },
  });
  return NextResponse.json({ message: "Product saved" });
}

export async function DELETE(request: Request) {
  const auth = await requireCustomerApi(request);
  if (!auth) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  if (!auth.customer) return NextResponse.json({ error: "Customer access required" }, { status: 403 });
  const parsed = savedItemSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid product" }, { status: 400 });

  await db.savedItem.deleteMany({ where: { userId: auth.customer.id, productId: parsed.data.productId } });
  return NextResponse.json({ message: "Removed from saved items" });
}
