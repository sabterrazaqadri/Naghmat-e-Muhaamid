import { Star } from "@phosphor-icons/react/ssr";
import Link from "next/link";

import { CategoryNav } from "@/components/CategoryNav";
import { SearchButton } from "@/components/SearchButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { listCategories } from "@/db/queries";
import { site } from "@/lib/site";

/**
 * Sticky glass bar over the ambient backdrop. The category rail is rendered
 * from the database, so a category added in /admin appears here — and gets its
 * public route — without a code change.
 */
export async function SiteHeader() {
  const categories = await listCategories();

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-[color-mix(in_oklab,var(--bg-deep)_72%,transparent)] backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center gap-2">
          <Link
            href="/"
            className="me-auto flex min-w-0 items-center gap-2.5"
            aria-label={`${site.nameLatin} — home`}
          >
            <span
              aria-hidden="true"
              className="grid size-9 shrink-0 place-items-center rounded-xl border border-hairline bg-[color-mix(in_oklab,var(--accent-gold)_16%,transparent)] font-display text-lg text-gold"
            >
              ن
            </span>
            {/* No `truncate` — overflow-hidden would crop the nastaliq
                descenders. The name is short, and the parent's min-w-0 already
                stops it from pushing the header actions off screen. */}
            {/* The wordmark stays Urdu — it is the brand, not interface copy. */}
            <span
              lang="ur"
              dir="rtl"
              className="heading-ur text-lg text-foreground sm:text-xl"
            >
              {site.nameUr}
            </span>
          </Link>

          <SearchButton />

          <Link
            href="/bookmarks"
            aria-label="Saved kalam"
            title="Saved kalam"
            className="tap grid place-items-center rounded-xl border border-hairline text-muted transition-colors hover:border-hairline-strong hover:text-foreground"
          >
            <Star size={20} aria-hidden="true" />
          </Link>

          <ThemeToggle />
        </div>

        <CategoryNav
          categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
        />
      </div>
    </header>
  );
}
