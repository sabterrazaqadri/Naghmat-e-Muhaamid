import type { MetadataRoute } from "next";

import { getSitemapEntries } from "@/db/queries";
import { siteUrl } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = siteUrl();
  const { categories, kalam } = await getSitemapEntries();

  return [
    {
      url: `${origin}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...categories.map((category) => ({
      url: `${origin}/${encodeURIComponent(category.slug)}`,
      lastModified: category.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...kalam.map((poem) => ({
      url: `${origin}/kalam/${encodeURIComponent(poem.slug)}`,
      lastModified: poem.createdAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
