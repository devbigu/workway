import { z } from "zod";

import { profileSchema } from "@/features/account/schemas";
import type { Prisma } from "@/generated/prisma/client";
import type { UserRole } from "@/generated/prisma/enums";
import { ADMIN_PERMISSIONS } from "@/lib/admin-auth";

export const STAFF_ROLES = ["ADMIN", "ORDER_MANAGER", "PRODUCT_MANAGER", "SUPPORT_STAFF"] as const satisfies readonly UserRole[];

const detailsSchema = profileSchema.extend({
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email")),
  role: z.enum(STAFF_ROLES).optional(),
});

/**
 * Turns an admin's edit form into a user update. Customers never get a role or permissions,
 * and admins editing themselves can't change their own role, access or permissions (no self-lockout).
 */
export function adminUserUpdate(actorId: string, target: { id: string; role: UserRole; blockedAt: Date | null }, form: FormData): { error: string } | { data: Prisma.UserUpdateInput } {
  const parsed = detailsSchema.safeParse({
    name: form.get("name"),
    email: form.get("email"),
    phone: form.get("phone") ?? "",
    role: form.get("role") ?? undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the details" };

  const data: Prisma.UserUpdateInput = { name: parsed.data.name, email: parsed.data.email, phone: parsed.data.phone || null };
  if (actorId === target.id) return { data };

  const accessEnabled = form.get("accessEnabled") === "on";
  data.accessEnabled = accessEnabled;
  data.blockedAt = accessEnabled ? null : target.blockedAt ?? new Date();
  if (target.role !== "CUSTOMER") {
    data.role = parsed.data.role ?? target.role;
    data.permissions = form.getAll("permissions").map(String).filter((p) => (ADMIN_PERMISSIONS as readonly string[]).includes(p));
  }
  return { data };
}
