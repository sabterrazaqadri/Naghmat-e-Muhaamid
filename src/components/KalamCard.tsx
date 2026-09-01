import Link from "next/link";

import { BookmarkButton } from "@/components/BookmarkButton";

export function KalamCard({
  title,
  slug,
  excerpt,
  categoryName,
  categorySlug,
  showCategory = false,
}: {
  title: string;
  slug: string;
  excerpt: string;
  categoryName: string;
  categorySlug: string;
  showCategory?: boolean;
}) {
  return (
    <article className="glass lift group relative flex gap-3 p-5">
      <div className="min-w-0 flex-1">
        <h3 className="heading-ur text-xl text-foreground transition-colors duration-300 group-hover:text-gold">
          {/* Stretched link: the whole card is clickable, but only the title
              text lands in the accessibility tree as the link name. */}
          <Link href={`/kalam/${encodeURIComponent(slug)}`} className="after:absolute after:inset-0">
            {title}
          </Link>
        </h3>

        {excerpt ? (
          <p className="body-ur mt-1 line-clamp-2 text-sm leading-8 text-muted">
            {excerpt}
          </p>
        ) : null}

        {showCategory ? (
          <p className="body-ur mt-2 text-xs leading-6 text-muted">
            <span className="rounded-full border border-hairline px-2 py-0.5">
              {categoryName}
            </span>
          </p>
        ) : null}
      </div>

      {/* Above the stretched link so the star stays clickable. */}
      <div className="relative z-10">
        <BookmarkButton
          entry={{ slug, title, categoryName, categorySlug }}
        />
      </div>
    </article>
  );
}
