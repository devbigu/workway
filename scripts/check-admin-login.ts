// Verifies the env-admin sign-in path. Run: bun scripts/check-admin-login.ts
import assert from "node:assert";
import { auth } from "../src/lib/auth";
import { db } from "../src/lib/db";

const email = process.env.ADMIN_EMAIL!.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD!;

const signIn = (e: string, p: string) =>
  auth.handler(new Request("http://localhost:3000/api/auth/sign-in/email", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: e, password: p }),
  }));

// 1. env admin signs in and is provisioned/promoted to ADMIN
let res = await signIn(email, password);
assert.equal(res.status, 200, `admin sign-in failed: ${res.status} ${await res.clone().text()}`);
assert.ok(res.headers.get("set-cookie"), "no session cookie issued");
const user = await db.user.findUnique({ where: { email }, select: { role: true, emailVerified: true, accessEnabled: true } });
assert.equal(user?.role, "ADMIN");
assert.ok(user?.emailVerified && user?.accessEnabled);
console.log("PASS 1: env admin signed in, role =", user?.role);

// 2. wrong password on the admin email must still be rejected
res = await signIn(email, "totally-wrong-password");
assert.notEqual(res.status, 200, "wrong admin password was accepted!");
console.log("PASS 2: wrong admin password rejected ->", res.status);

// 3. normal flow untouched: unknown user still fails
res = await signIn("nobody-here@example.com", "whatever12345");
assert.notEqual(res.status, 200);
console.log("PASS 3: unknown user rejected ->", res.status);

await db.$disconnect();
console.log("ALL CHECKS PASSED");
