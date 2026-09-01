import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";

import * as schema from "./schema";

export type AdminDb = NeonHttpDatabase<typeof schema>;

let cached: AdminDb | null = null;

/**
 * Privileged write path. Reachable only from /admin server actions and the
 * migrate/seed scripts — never from a client component, never from a public
 * page. `server-only` makes an accidental client import a build error rather
 * than a leaked connection string.
 *
 * LAZY on purpose (§2): building this at module top-level would mean any page
 * that transitively imports the actions file crashes at build time when
 * DATABASE_URL_ADMIN is unset. Instantiating inside the function keeps the
 * failure where it belongs — at the moment a write is actually attempted.
 *
 * Unlike the read path this throws, because an admin mutation that silently
 * no-ops is far worse than one that reports a clear misconfiguration.
 */
export function getAdminDb(): AdminDb {
  if (cached) return cached;

  const url = process.env.DATABASE_URL_ADMIN;
  if (!url) {
    throw new Error(
      "DATABASE_URL_ADMIN is not set. The admin write path requires a privileged Neon connection string.",
    );
  }

  cached = drizzle(neon(url), { schema });
  return cached;
}
