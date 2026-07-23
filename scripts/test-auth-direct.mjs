import process from "node:process";
import { registerHooks } from "node:module";
import { Client } from "pg";

registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context);
    } catch (error) {
      if (
        (specifier.startsWith("./") || specifier.startsWith("../")) &&
        !specifier.endsWith(".ts")
      ) {
        return nextResolve(`${specifier}.ts`, context);
      }
      throw error;
    }
  },
});

process.loadEnvFile(".env.test.local");

const required = [
  "DATABASE_URL",
  "TEST_USER_NAME",
  "TEST_USER_EMAIL",
  "TEST_USER_PASSWORD",
];

for (const key of required) {
  if (!process.env[key]) throw new Error(`${key} is required`);
}

const databaseUrl = new URL(process.env.DATABASE_URL);
if (databaseUrl.pathname !== "/workway_test") {
  throw new Error("Refusing to run auth test outside workway_test");
}

const cleanup = new Client({ connectionString: databaseUrl.toString() });
await cleanup.connect();
await cleanup.query("delete from users where email = $1", [
  process.env.TEST_USER_EMAIL,
]);
await cleanup.end();

const { auth } = await import("../src/lib/auth.ts");
const { db } = await import("../src/lib/db.ts");
const {
  getCheckoutLoginPath,
  hasBetterAuthSessionCookie,
} = await import("../src/features/auth/checkout-guard.ts");

async function authRequest(path, body, cookie) {
  return auth.handler(new Request(`http://localhost:3100/api/auth${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      ...(body ? { "content-type": "application/json" } : {}),
      ...(cookie ? { cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  }));
}

function sessionCookie(response) {
  const cookies = response.headers.getSetCookie();
  const session = cookies.find((value) =>
    value.startsWith("better-auth.session_token="),
  );
  if (!session) throw new Error("Session cookie was not issued");
  return session.split(";", 1)[0];
}

const signUp = await authRequest("/sign-up/email", {
  name: process.env.TEST_USER_NAME,
  email: process.env.TEST_USER_EMAIL,
  password: process.env.TEST_USER_PASSWORD,
});

if (!signUp.ok) {
  throw new Error(`Sign-up failed (${signUp.status}): ${await signUp.text()}`);
}

const signIn = await authRequest("/sign-in/email", {
  email: process.env.TEST_USER_EMAIL,
  password: process.env.TEST_USER_PASSWORD,
});

if (!signIn.ok) {
  throw new Error(`Sign-in failed (${signIn.status}): ${await signIn.text()}`);
}

const cookie = sessionCookie(signIn);
const session = await authRequest("/get-session", undefined, cookie);
const sessionData = await session.json();

if (!session.ok || sessionData?.user?.email !== process.env.TEST_USER_EMAIL) {
  throw new Error(`Session verification failed (${session.status})`);
}
const cookieName = cookie.slice(0, cookie.indexOf("="));
if (
  hasBetterAuthSessionCookie([]) ||
  !hasBetterAuthSessionCookie([cookieName]) ||
  getCheckoutLoginPath("/checkout") !==
    "/login?callbackURL=%2Fcheckout&checkout=required"
) {
  throw new Error("Checkout authentication guard logic failed");
}

const persisted = await db.user.findUnique({
  where: { email: process.env.TEST_USER_EMAIL },
  include: { accounts: true, sessions: true },
});

if (!persisted || persisted.accounts.length !== 1 || persisted.sessions.length < 1) {
  throw new Error("Auth records were not persisted correctly");
}

console.log(JSON.stringify({
  database: databaseUrl.pathname.slice(1),
  signUp: signUp.status,
  signIn: signIn.status,
  session: session.status,
  checkoutGuard: true,
  persisted: {
    user: true,
    accounts: persisted.accounts.length,
    sessions: persisted.sessions.length,
  },
}));

await db.$disconnect();
