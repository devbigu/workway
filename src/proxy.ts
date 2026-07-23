import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  getCheckoutLoginPath,
  hasBetterAuthSessionCookie,
} from "@/features/auth/checkout-guard";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (!pathname.startsWith("/checkout")) {
    return NextResponse.next();
  }

  const hasSessionCookie = hasBetterAuthSessionCookie(
    request.cookies.getAll().map(({ name }) => name),
  );

  if (hasSessionCookie) {
    return NextResponse.next();
  }

  const loginUrl = new URL(getCheckoutLoginPath(pathname), request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/checkout/:path*"],
};
