import "server-only";

import { asc, desc, eq, sql } from "drizzle-orm";

import { getAdminDb } from "./admin";
import { categories, kalam } from "./schema";

/**
 * Reads for the admin panel run on the privileged connection.
 *
 * Not for convenience — the admin must see the true current state of the
 * database the moment after it writes, and the public read path is behind a
 * cache and a role that may not even be able to see every column.
 */

export async function adminCounts() {
  const db = getAdminDb();

  const [[categoryRow], [kalamRow]] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(categories),
    db
      .select({
        count: sql<number>`count(*)::int`,
        featured: sql<number>`count(*) filter (where ${kalam.isFeatured})::int`,
      })
      .from(kalam),
  ]);

  return {
    categories: categoryRow?.count ?? 0,
    kalam: kalamRow?.count ?? 0,
    featured: kalamRow?.featured ?? 0,
  };
}

export async function adminListCategories() {
  const db = getAdminDb();

  return db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      sortOrder: categories.sortOrder,
      coverGradientSeed: categories.coverGradientSeed,
      kalamCount: sql<number>`count(${kalam.id})::int`,
    })
    .from(categories)
    .leftJoin(kalam, eq(kalam.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}

export async function adminGetCategory(id: string) {
  const db = getAdminDb();

  const [row] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);

  return row ?? null;
}

export async function adminListKalam() {
  const db = getAdminDb();

  return db
    .select({
      id: kalam.id,
      title: kalam.title,
      slug: kalam.slug,
      isFeatured: kalam.isFeatured,
      createdAt: kalam.createdAt,
      categoryId: kalam.categoryId,
      categoryName: categories.name,
    })
    .from(kalam)
    .innerJoin(categories, eq(kalam.categoryId, categories.id))
    .orderBy(desc(kalam.createdAt));
}

export async function adminGetKalam(id: string) {
  const db = getAdminDb();

  const [row] = await db.select().from(kalam).where(eq(kalam.id, id)).limit(1);
  return row ?? null;
}

/** Category options for the kalam form's <select>. */
export async function adminCategoryOptions() {
  const db = getAdminDb();

  return db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}
