import { NextResponse } from "next/server";

import { getSearchIndex, listCategories } from "@/db/queries";

/**
 * Search index for the ⌘K palette.
 *
 * Shipped on first open rather than embedded in the root layout: the payload
 * grows with the collection, and most visits never open the palette. Fetching
 * it lazily is also what gives the palette a genuine loading state to render a
 * skeleton for.
 */
export async function GET() {
  const [kalam, categories] = await Promise.all([
    getSearchIndex(),
    listCategories(),
  ]);

  return NextResponse.json(
    {
      kalam,
      categories: categories.map((c) => ({
        name: c.name,
        slug: c.slug,
        kalamCount: c.kalamCount,
      })),
    },
    {
      headers: {
        // Content changes only when an admin edits it, so a short shared cache
        // with a long stale window keeps the palette instant without going
        // stale for meaningfully long.
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600",
      },
    },
  );
}
