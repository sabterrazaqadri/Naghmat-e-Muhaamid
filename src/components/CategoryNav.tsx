"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Category rail. Scrolls inside its own box rather than widening the page —
 * however many categories the admin adds, the document never gains a
 * horizontal scrollbar.
 */
export function CategoryNav({
  categories,
}: {
  categories: Array<{ slug: string; name: string }>;
}) {
  const pathname = usePathname();

  if (categories.length === 0) return null;

  return (
    <nav
      aria-label="Topics"
      className="scrollbar-none -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1"
    >
      {categories.map((category) => {
        const href = `/${category.slug}`;
        const isActive = pathname === href;

        return (
          <Link
            key={category.slug}
            href={href}
            aria-current={isActive ? "page" : undefined}
            lang="ur"
            dir="rtl"
            className={`heading-ur shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
              isActive
                ? "border-gold bg-[color-mix(in_oklab,var(--accent-gold)_16%,transparent)] text-gold"
                : "border-hairline text-muted hover:border-hairline-strong hover:text-foreground"
            }`}
          >
            {category.name}
          </Link>
        );
      })}
    </nav>
  );
}
