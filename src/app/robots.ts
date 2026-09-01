import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The admin panel and the search index endpoint have no business in a
      // search index; /bookmarks is device-local and would only ever be empty.
      disallow: ["/admin", "/admin/", "/api/", "/bookmarks", "/offline"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
