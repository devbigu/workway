import { randomBytes } from "node:crypto";
import { writeFile } from "node:fs/promises";
import process from "node:process";
import { Client } from "pg";

process.loadEnvFile(".env");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required in .env");
}

const databaseName = "workway_test";
const databaseUser = "workway_test_user";
const databasePassword = randomBytes(24).toString("hex");
const authSecret = randomBytes(32).toString("hex");
const testUserPassword = `Ww!${randomBytes(12).toString("hex")}`;
const adminUrl = new URL(process.env.DATABASE_URL);
const client = new Client({ connectionString: adminUrl.toString() });

await client.connect();

try {
  const role = await client.query(
    "select 1 from pg_roles where rolname = $1",
    [databaseUser],
  );

  if (role.rowCount === 0) {
    await client.query(
      `create role "${databaseUser}" login password '${databasePassword}'`,
    );
  } else {
    await client.query(
      `alter role "${databaseUser}" with login password '${databasePassword}'`,
    );
  }

  const database = await client.query(
    "select 1 from pg_database where datname = $1",
    [databaseName],
  );

  if (database.rowCount === 0) {
    await client.query(
      `create database "${databaseName}" owner "${databaseUser}"`,
    );
  } else {
    await client.query(
      `alter database "${databaseName}" owner to "${databaseUser}"`,
    );
  }
} finally {
  await client.end();
}

const testUrl = new URL(adminUrl);
testUrl.username = databaseUser;
testUrl.password = databasePassword;
testUrl.pathname = `/${databaseName}`;

await writeFile(
  ".env.test.local",
  [
    `DATABASE_URL=${testUrl.toString()}`,
    `BETTER_AUTH_SECRET=${authSecret}`,
    "BETTER_AUTH_URL=http://localhost:3100",
    "PAYMENT_SANDBOX_MODE=true",
    "TEST_USER_NAME=Sandbox Buyer",
    "TEST_USER_EMAIL=sandbox.user@workway.test",
    `TEST_USER_PASSWORD=${testUserPassword}`,
    "",
  ].join("\n"),
  { mode: 0o600 },
);

console.log(JSON.stringify({
  created: true,
  database: databaseName,
  databaseUser,
  envFile: ".env.test.local",
}));
