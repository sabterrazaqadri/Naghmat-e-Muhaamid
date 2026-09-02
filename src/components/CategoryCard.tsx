import { ArrowRight } from "@phosphor-icons/react/ssr";
import Link from "next/link";

import { Khatim } from "@/components/Ornament";
import { coverArt } from "@/lib/gradient";

/**
 * Cover art is generated, never uploaded: the gradient is a pure function of
 * the category's seed (or its slug), so a category created in /admin arrives
 * with distinct artwork and nothing to manage.
 */
export function CategoryCard({
  index,
  name,
  slug,
  kalamCount,
  gradientSeed,
}: {
  index: number;
  name: string;
  slug: string;
  kalamCount: number;
  gradientSeed: string | null;
}) {
  const art = coverArt(gradientSeed ?? slug);

  return (
    <Link
      href={`/${slug}`}
      className="glass lift group relative flex flex-col overflow-hidden"
    >
      <div className="relative h-36 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.08]"
          style={{
            backgroundImage: art.backgroundImage,
            backgroundSize: art.backgroundSize,
          }}
        />
        {/* Grounds the art into the card body instead of ending on a hard seam. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_top,var(--bg-base),transparent_65%)]"
        />

        <Khatim
          size={92}
          className="absolute -top-5 left-[-1.25rem] text-foreground opacity-[0.07] transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:rotate-45"
        />

        {/* Old-style numerals read as a printed index, not a UI badge. */}
        <span
          aria-hidden="true"
          className="absolute bottom-3 end-5 font-display text-5xl leading-none text-foreground/25"
        >
          {String(index).padStart(2, "0")}
        </span>
      </div>

      <div className="flex flex-1 items-center gap-4 px-5 pb-5 pt-4">
        <div className="min-w-0 flex-1">
          {/* No `truncate`: overflow-hidden crops nastaliq's descenders. */}
          <h3 lang="ur" dir="rtl" className="heading-ur text-2xl text-foreground">
            {name}
          </h3>
          <p className="text-xs uppercase tracking-[0.14em] text-muted">
            {kalamCount} {kalamCount === 1 ? "kalam" : "kalam"}
          </p>
        </div>

        {/* A rule bridges the gap to the arrow, so the two halves of the card
            foot read as one line instead of two stranded objects. */}
        <span aria-hidden="true" className="rule-fade hidden flex-1 sm:block" />

        <span
          aria-hidden="true"
          className="grid size-9 shrink-0 place-items-center rounded-full border border-hairline text-muted transition-all duration-300 ease-[var(--ease-out-soft)] group-hover:border-gold group-hover:bg-[color-mix(in_oklab,var(--accent-gold)_14%,transparent)] group-hover:text-gold"
        >
          <ArrowRight size={16} />
        </span>
      </div>
    </Link>
  );
}
