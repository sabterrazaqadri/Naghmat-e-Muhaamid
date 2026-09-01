import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

config({ path: ".env.local" });

/**
 * Applies everything in ./drizzle that has not been applied yet.
 * Runs on the privileged connection — the read role has no DDL rights.
 */
async function main() {
  const url = process.env.DATABASE_URL_ADMIN ?? process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL_ADMIN is not set. Add it to .env.local before running migrations.",
    );
  }

  const db = drizzle(neon(url));

  console.log("→ applying migrations from ./drizzle …");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("✓ migrations up to date");
}

main().catch((error) => {
  console.error("✗ migration failed:", error);
  process.exit(1);
});
