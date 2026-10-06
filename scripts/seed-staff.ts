// Seeds four test staff accounts, one per role, top of the hierarchy first.
// Run: bun scripts/seed-staff.ts   (password: STAFF_SEED_PASSWORD, default below)
import { auth } from "../src/lib/auth";
import { db } from "../src/lib/db";

const password = process.env.STAFF_SEED_PASSWORD ?? "Test@12345";

const staff = [
  { email: "rsmtest@rsmtest.com", name: "Rohit Sales Manager", phone: "+919810000001", role: "ADMIN",           permissions: ["settings:write"] },
  { email: "asmtest@asmtest.com", name: "Anita Order Manager", phone: "+919810000002", role: "ORDER_MANAGER",   permissions: ["reports:read"] },
  { email: "smtest@smtest.com",   name: "Sunil Product Manager", phone: "+919810000003", role: "PRODUCT_MANAGER", permissions: ["orders:read"] },
  { email: "stest@stest.com",     name: "Sneha Support Staff", phone: "+919810000004", role: "SUPPORT_STAFF",   permissions: [] },
] as const;

for (const person of staff) {
  const existing = await db.user.findUnique({ where: { email: person.email }, select: { id: true } });

  if (!existing) {
    const res = await auth.handler(new Request("http://localhost/api/auth/sign-up/email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: person.name, email: person.email, password }),
    }));
    if (!res.ok) throw new Error(`Sign-up failed for ${person.email} (${res.status}): ${await res.text()}`);
  }

  // role, permissions and verification are input:false in better-auth, so they are set here.
  const user = await db.user.update({
    where: { email: person.email },
    data: {
      name: person.name,
      phone: person.phone,
      image: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(person.name)}`,
      role: person.role,
      permissions: [...person.permissions],
      emailVerified: true,
      accessEnabled: true,
      blockedAt: null,
    },
    select: { id: true, name: true, email: true, phone: true, role: true, permissions: true, emailVerified: true, accessEnabled: true },
  });
  console.log(existing ? "updated" : "created", user);
}

await db.$disconnect();
