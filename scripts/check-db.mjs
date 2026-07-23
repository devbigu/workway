import process from "node:process";
import { Client } from "pg";

process.loadEnvFile(process.env.ENV_FILE ?? ".env");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

try {
  await client.connect();
  const result = await client.query(
    `select
      current_database() as database,
      current_user as user_name,
      has_database_privilege(current_user, current_database(), 'CREATE') as can_create_schema,
      rolcreatedb,
      rolcreaterole
    from pg_roles
    where rolname = current_user`,
  );
  console.log(JSON.stringify({ connected: true, ...result.rows[0] }));
} catch (error) {
  console.error(JSON.stringify({
    connected: false,
    code: error instanceof Error && "code" in error ? error.code : undefined,
    message: error instanceof Error ? error.message : "Unknown database error",
  }));
  process.exitCode = 1;
} finally {
  await client.end().catch(() => undefined);
}
