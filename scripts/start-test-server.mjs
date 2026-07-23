import process from "node:process";

process.loadEnvFile(".env.test.local");
process.argv = [
  process.execPath,
  "next",
  "dev",
  "--hostname",
  "127.0.0.1",
  "--port",
  "3100",
];

await import("../node_modules/next/dist/bin/next");
