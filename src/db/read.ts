import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";

import * as schema from "./schema";

export type ReadDb = NeonHttpDatabase<typeof schema>;

let cached: ReadDb | null = null;
let warned = false;

/**
 * Public read path. Point DATABASE_URL at a Neon role holding SELECT-only
 * grants — it is the credential every public page runs on, and it must never
 * be able to write.
 *
 * LAZY on purpose (§2): the client is built on first *call*, not at module
 * load. Importing this file with no env set is harmless, so `next build` can
 * compile every route that merely imports it.
 *
 * Returns null — rather than throwing — when the variable is simply absent.
 * That is a configuration gap, not a runtime fault, and the query helpers
 * degrade to empty results so a secretless build still succeeds. Genuine
 * query failures are left to propagate.
 */
export function getReadDb(): ReadDb | null {
  if (cached) return cached;

  const url = process.env.DATABASE_URL;
  if (!url) {
    if (!warned) {
      warned = true;
      console.warn(
        "[db] DATABASE_URL is not set — public queries will return empty results.",
      );
    }
    return null;
  }

  cached = drizzle(neon(url), { schema });
  return cached;
}
