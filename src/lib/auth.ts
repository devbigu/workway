import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createAuthMiddleware, isAPIError } from "better-auth/api";
import { ensureEnvAdmin } from "./admin-bootstrap";
import { db } from "./db";

export const auth = betterAuth({
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-in/email") return;
      const body = ctx.body as { email?: unknown; password?: unknown } | undefined;
      await ensureEnvAdmin(auth, body?.email, body?.password);
    }),
    // After-hooks also run on failure (returned is then an APIError), so only notify on success.
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/change-password" || isAPIError(ctx.context.returned)) return;
      const id = (ctx.context.returned as { user?: { id?: string } } | undefined)?.user?.id;
      const user = id ? await db.user.findUnique({ where: { id }, select: { name: true, email: true, role: true } }) : null;
      if (!user) return;
      await db.adminNotification.create({
        data: { title: `${user.role === "CUSTOMER" ? "Customer" : "Staff"} ${user.name} (${user.email}) changed their password`, href: `/admin/users/${id}` },
      });
    }),
  },
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "CUSTOMER", input: false },
      permissions: { type: "string[]", required: false, defaultValue: [], input: false },
      accessEnabled: { type: "boolean", required: false, defaultValue: true, input: false },
    },
  },
  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  secret: process.env.BETTER_AUTH_SECRET ?? "worklab-development-secret-change-before-production",
});
