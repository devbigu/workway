import { APIError } from "better-auth/api";
import type { Auth } from "better-auth";
import { db } from "./db";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

/**
 * Runs before every sign-in. When the submitted credentials match ADMIN_EMAIL /
 * ADMIN_PASSWORD, make sure that user exists with those credentials and the ADMIN
 * role, then fall through so better-auth issues the session as usual. Any other
 * credentials are untouched and take the normal flow.
 */
export async function ensureEnvAdmin(auth: Auth, email: unknown, password: unknown) {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return;
  if (typeof email !== "string" || typeof password !== "string") return;
  if (email.trim().toLowerCase() !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) return;

  const ctx = await auth.$context;
  const existing = await db.user.findUnique({
    where: { email: ADMIN_EMAIL },
    select: { id: true, role: true, emailVerified: true, accessEnabled: true },
  });

  if (!existing) {
    // Sign-up so better-auth owns password hashing and the account row.
    const res = await auth.handler(
      new Request(`${ctx.baseURL}/sign-up/email`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "Administrator", email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
      }),
    );
    if (!res.ok) {
      throw new APIError("INTERNAL_SERVER_ERROR", {
        message: `Could not provision the admin account (${res.status}).`,
      });
    }
  } else {
    // The env password is the source of truth, so re-sync it if it was rotated.
    await ctx.internalAdapter.updatePassword(existing.id, await ctx.password.hash(ADMIN_PASSWORD));
  }

  // role/emailVerified/accessEnabled are input:false in better-auth, so set them here.
  if (!existing || existing.role !== "ADMIN" || !existing.emailVerified || !existing.accessEnabled) {
    await db.user.update({
      where: { email: ADMIN_EMAIL },
      data: { role: "ADMIN", emailVerified: true, accessEnabled: true, blockedAt: null },
    });
  }
}
