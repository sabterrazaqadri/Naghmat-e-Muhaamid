import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

/**
 * Schema authoring + migration generation always runs against the
 * privileged connection — the read-only role has no DDL rights.
 */
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL_ADMIN ?? process.env.DATABASE_URL ?? "",
  },
  strict: true,
  verbose: true,
});
