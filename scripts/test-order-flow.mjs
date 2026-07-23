import { registerHooks } from "node:module";
import process from "node:process";
import { Client } from "pg";

const sourceRoot = new URL("../src/", import.meta.url);
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      return nextResolve(
        new URL(`${specifier.slice(2)}.ts`, sourceRoot).href,
        context,
      );
    }

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
const databaseUrl = new URL(process.env.DATABASE_URL);
if (databaseUrl.pathname !== "/workway_test") {
  throw new Error("Refusing to run order flow outside workway_test");
}

const cleanup = new Client({ connectionString: databaseUrl.toString() });
await cleanup.connect();
try {
  const user = await cleanup.query(
    "select id from users where email = $1",
    [process.env.TEST_USER_EMAIL],
  );
  const userId = user.rows[0]?.id;
  if (userId) {
    await cleanup.query(
      `delete from order_items
       where "sellerOrderId" in (
         select id from seller_orders
         where "orderId" in (select id from orders where "userId" = $1)
       )`,
      [userId],
    );
    await cleanup.query(
      `delete from seller_orders
       where "orderId" in (select id from orders where "userId" = $1)`,
      [userId],
    );
    await cleanup.query('delete from orders where "userId" = $1', [userId]);
    await cleanup.query("delete from users where id = $1", [userId]);
  }
} finally {
  await cleanup.end();
}

const { auth } = await import("../src/lib/auth.ts");
const { db } = await import("../src/lib/db.ts");
const {
  createCheckoutOrder,
} = await import("../src/features/checkout/server/checkout.service.ts");
const {
  completeOrderPayment,
} = await import("../src/features/payments/server/payment.service.ts");

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

const signUp = await authRequest("/sign-up/email", {
  name: process.env.TEST_USER_NAME,
  email: process.env.TEST_USER_EMAIL,
  password: process.env.TEST_USER_PASSWORD,
});
if (!signUp.ok) throw new Error(`Sign-up failed: ${signUp.status}`);

const signIn = await authRequest("/sign-in/email", {
  email: process.env.TEST_USER_EMAIL,
  password: process.env.TEST_USER_PASSWORD,
});
if (!signIn.ok) throw new Error(`Sign-in failed: ${signIn.status}`);

const sessionCookie = signIn.headers.getSetCookie()
  .find((value) => value.startsWith("better-auth.session_token="))
  ?.split(";", 1)[0];
if (!sessionCookie) throw new Error("Login did not issue a session cookie");

const sessionResponse = await authRequest(
  "/get-session",
  undefined,
  sessionCookie,
);
const session = await sessionResponse.json();
if (!session?.user) throw new Error("Authenticated session was not restored");

const checkoutInput = {
  items: [{ productId: "1", variantId: "1/1", quantity: 2 }],
  address: {
    name: "Sandbox Buyer",
    phone: "9876543210",
    email: process.env.TEST_USER_EMAIL,
    address: "42 Test Lab Road",
    city: "Bengaluru",
    state: "Karnataka",
    pin: "560001",
    gstin: "",
  },
  delivery: "priority",
  payment: "online",
  voucher: "WORKWAY5",
  idempotencyKey: `sandbox-order-${Date.now()}`,
};

const order = await createCheckoutOrder(session.user, checkoutInput);
const repeatedOrder = await createCheckoutOrder(session.user, checkoutInput);
if (repeatedOrder.id !== order.id) {
  throw new Error("Checkout idempotency failed");
}

const confirmed = await completeOrderPayment(
  session.user.id,
  order.id,
  "online",
);

const persisted = await db.order.findUnique({
  where: { id: order.id },
  include: {
    sellerOrders: { include: { items: true } },
  },
});

if (
  !persisted ||
  confirmed.status !== "CONFIRMED" ||
  confirmed.paymentStatus !== "PAID" ||
  persisted.sellerOrders.length !== 1 ||
  persisted.sellerOrders[0].items.length !== 1 ||
  persisted.sellerOrders[0].items[0].quantity !== 2
) {
  throw new Error("Persisted order flow verification failed");
}

const userOrderCount = await db.order.count({
  where: { userId: session.user.id },
});
if (userOrderCount !== 1) {
  throw new Error(`Expected one idempotent order, found ${userOrderCount}`);
}

console.log(JSON.stringify({
  database: "workway_test",
  authentication: "passed",
  order: {
    id: persisted.id,
    orderNumber: persisted.orderNumber,
    status: persisted.status,
    paymentStatus: persisted.paymentStatus,
    subtotalPaise: Number(persisted.subtotalPaise),
    discountPaise: Number(persisted.discountPaise),
    taxPaise: Number(persisted.taxPaise),
    shippingPaise: Number(persisted.shippingPaise),
    totalPaise: Number(persisted.totalPaise),
    sellerOrders: persisted.sellerOrders.length,
    lineItems: persisted.sellerOrders[0].items.length,
    quantity: persisted.sellerOrders[0].items[0].quantity,
  },
  idempotency: "passed",
}));

await db.$disconnect();
