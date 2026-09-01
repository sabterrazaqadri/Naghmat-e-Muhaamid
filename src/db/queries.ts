import "server-only";

import { asc, desc, eq, sql } from "drizzle-orm";

import { getReadDb } from "./read";
import { categories, kalam, type KalamWithCategory } from "./schema";

export type CategoryWithCount = {
  id: string;
  name: string;
  slug: string;
  coverGradientSeed: string | null;
  sortOrder: number;
  kalamCount: number;
};

export type KalamListItem = {
  id: string;
  title: string;
  slug: string;
  isFeatured: boolean;
  /** First few lines, for the card preview. */
  excerpt: string;
};

export type SearchEntry = {
  id: string;
  title: string;
  slug: string;
  categoryName: string;
  categorySlug: string;
};

/** Cheap server-side excerpt: first two non-empty lines of the lyrics. */
const excerptSql = sql<string>`
  array_to_string(
    (array_remove(string_to_array(replace(${kalam.lyrics}, E'\r', ''), E'\n'), ''))[1:2],
    ' — '
  )
`;

/** Every category, ordered for display, with a live kalam count. */
export async function listCategories(): Promise<CategoryWithCount[]> {
  const db = getReadDb();
  if (!db) return [];

  return db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      coverGradientSeed: categories.coverGradientSeed,
      sortOrder: categories.sortOrder,
      kalamCount: sql<number>`count(${kalam.id})::int`,
    })
    .from(categories)
    .leftJoin(kalam, eq(kalam.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}

export async function getCategoryBySlug(slug: string) {
  const db = getReadDb();
  if (!db) return null;

  const [row] = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);

  return row ?? null;
}

export async function listKalamByCategory(
  categoryId: string,
): Promise<KalamListItem[]> {
  const db = getReadDb();
  if (!db) return [];

  return db
    .select({
      id: kalam.id,
      title: kalam.title,
      slug: kalam.slug,
      isFeatured: kalam.isFeatured,
      excerpt: excerptSql,
    })
    .from(kalam)
    .where(eq(kalam.categoryId, categoryId))
    .orderBy(desc(kalam.isFeatured), asc(kalam.title));
}

export async function getKalamBySlug(
  slug: string,
): Promise<KalamWithCategory | null> {
  const db = getReadDb();
  if (!db) return null;

  const [row] = await db
    .select({
      id: kalam.id,
      title: kalam.title,
      lyrics: kalam.lyrics,
      categoryId: kalam.categoryId,
      slug: kalam.slug,
      isFeatured: kalam.isFeatured,
      createdAt: kalam.createdAt,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(kalam)
    .innerJoin(categories, eq(kalam.categoryId, categories.id))
    .where(eq(kalam.slug, slug))
    .limit(1);

  return row ?? null;
}

/**
 * "کلامِ روز" — the featured kalam, or, when nothing is flagged, a pick that
 * is random across the collection but stable for the whole day. Hashing the
 * row id against today's date keeps the homepage from reshuffling on every
 * request while still rotating daily.
 */
export async function getKalamOfTheDay(): Promise<KalamWithCategory | null> {
  const db = getReadDb();
  if (!db) return null;

  const today = new Date().toISOString().slice(0, 10);

  const [row] = await db
    .select({
      id: kalam.id,
      title: kalam.title,
      lyrics: kalam.lyrics,
      categoryId: kalam.categoryId,
      slug: kalam.slug,
      isFeatured: kalam.isFeatured,
      createdAt: kalam.createdAt,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(kalam)
    .innerJoin(categories, eq(kalam.categoryId, categories.id))
    .orderBy(desc(kalam.isFeatured), sql`md5(${kalam.id}::text || ${today})`)
    .limit(1);

  return row ?? null;
}

/** Flat index powering the ⌘K command palette's fuzzy search. */
export async function getSearchIndex(): Promise<SearchEntry[]> {
  const db = getReadDb();
  if (!db) return [];

  return db
    .select({
      id: kalam.id,
      title: kalam.title,
      slug: kalam.slug,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(kalam)
    .innerJoin(categories, eq(kalam.categoryId, categories.id))
    .orderBy(asc(kalam.title));
}

/** Slugs + timestamps for sitemap.xml. */
export async function getSitemapEntries() {
  const db = getReadDb();
  if (!db) return { categories: [], kalam: [] };

  const [cats, poems] = await Promise.all([
    db
      .select({ slug: categories.slug, createdAt: categories.createdAt })
      .from(categories),
    db.select({ slug: kalam.slug, createdAt: kalam.createdAt }).from(kalam),
  ]);

  return { categories: cats, kalam: poems };
}
