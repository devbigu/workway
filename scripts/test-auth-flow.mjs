import process from "node:process";
import { Client } from "pg";

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

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

try {
  await client.query(
    `delete from users where email = $1`,
    [process.env.TEST_USER_EMAIL],
  );
} finally {
  await client.end();
}

const baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3100";
const cookieJar = new Map();

const guestCheckout = await fetch(`${baseUrl}/checkout`, {
  redirect: "manual",
});
const guestLocation = guestCheckout.headers.get("location");

if (
  guestCheckout.status < 300 ||
  guestCheckout.status >= 400 ||
  !guestLocation?.includes("/login") ||
  !guestLocation.includes("callbackURL=%2Fcheckout")
) {
  throw new Error(
    `Guest checkout guard failed (${guestCheckout.status}, ${guestLocation})`,
  );
}

function captureCookies(response) {
  for (const cookie of response.headers.getSetCookie()) {
    const [pair] = cookie.split(";", 1);
    const separator = pair.indexOf("=");
    cookieJar.set(pair.slice(0, separator), pair.slice(separator + 1));
  }
}

function cookieHeader() {
  return Array.from(cookieJar, ([key, value]) => `${key}=${value}`).join("; ");
}

async function post(path, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(cookieJar.size ? { cookie: cookieHeader() } : {}),
    },
    body: JSON.stringify(body),
    redirect: "manual",
  });
  captureCookies(response);
  return response;
}

const signUp = await post("/api/auth/sign-up/email", {
  name: process.env.TEST_USER_NAME,
  email: process.env.TEST_USER_EMAIL,
  password: process.env.TEST_USER_PASSWORD,
});

if (!signUp.ok) {
  throw new Error(`Sign-up failed (${signUp.status}): ${await signUp.text()}`);
}

cookieJar.clear();

const signIn = await post("/api/auth/sign-in/email", {
  email: process.env.TEST_USER_EMAIL,
  password: process.env.TEST_USER_PASSWORD,
});

if (!signIn.ok) {
  throw new Error(`Sign-in failed (${signIn.status}): ${await signIn.text()}`);
}

const session = await fetch(`${baseUrl}/api/auth/get-session`, {
  headers: { cookie: cookieHeader() },
});
const sessionData = await session.json();

if (!session.ok || sessionData?.user?.email !== process.env.TEST_USER_EMAIL) {
  throw new Error(`Session verification failed (${session.status})`);
}

const checkout = await fetch(`${baseUrl}/checkout`, {
  headers: { cookie: cookieHeader() },
  redirect: "manual",
});

if (checkout.status >= 300 && checkout.status < 400) {
  throw new Error(`Authenticated checkout redirected (${checkout.status})`);
}

console.log(JSON.stringify({
  guestCheckout: guestCheckout.status,
  signUp: signUp.status,
  signIn: signIn.status,
  session: session.status,
  checkout: checkout.status,
  authenticatedEmail: sessionData.user.email,
}));
