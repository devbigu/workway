import { NextResponse } from "next/server";

import { requireCustomerApi } from "@/features/account/server/account.service";
import { db } from "@/lib/db";

export async function DELETE(request: Request) {
  const auth = await requireCustomerApi(request);
  if (!auth) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  if (!auth.customer) return NextResponse.json({ error: "Customer access required" }, { status: 403 });

  const currentToken = request.headers.get("cookie")?.match(/(?:^|;\s*)better-auth\.session_token=([^;]+)/)?.[1];
  await db.session.deleteMany({
    where: {
      userId: auth.customer.id,
      ...(currentToken ? { token: { not: decodeURIComponent(currentToken) } } : {}),
    },
  });
  return NextResponse.json({ message: currentToken ? "Other sessions signed out" : "Active sessions revoked" });
}
