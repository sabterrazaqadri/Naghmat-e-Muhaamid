import type { Metadata } from "next";

import { NotFoundView } from "@/components/NotFoundView";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

/**
 * Handles `notFound()` from an unknown category or kalam slug. Renders inside
 * the site layout, so the reader keeps the header, the category rail and the
 * search palette — everything they need to recover without a back button.
 */
export default function SiteNotFound() {
  return <NotFoundView />;
}
