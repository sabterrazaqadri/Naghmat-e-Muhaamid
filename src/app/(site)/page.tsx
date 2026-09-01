import { ArrowLeft, FolderOpen, Sparkle } from "@phosphor-icons/react/ssr";
import Link from "next/link";

import { CategoryCard } from "@/components/CategoryCard";
import { EmptyState } from "@/components/EmptyState";
import { Khatim, OrnamentDivider, SectionRule } from "@/components/Ornament";
import { Reveal } from "@/components/Reveal";
import { SearchButton } from "@/components/SearchButton";
import { getKalamOfTheDay, listCategories } from "@/db/queries";
import { coverArt } from "@/lib/gradient";
import { site } from "@/lib/site";

/** Admin edits should surface without a redeploy. */
export const revalidate = 60;

export default async function HomePage() {
  const [categories, kalamOfTheDay] = await Promise.all([
    listCategories(),
    getKalamOfTheDay(),
  ]);

  const totalKalam = categories.reduce((sum, c) => sum + c.kalamCount, 0);
  const featuredArt = kalamOfTheDay ? coverArt(kalamOfTheDay.categorySlug) : null;

  const openingLines = kalamOfTheDay
    ? kalamOfTheDay.lyrics
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 4)
    : [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      {/* ── Hero ──────────────────────────────────────────────────────
          Centred rather than left-aligned: this is a title page, and the
          symmetry is what makes it read as ceremonial instead of as an app
          landing screen. */}
      <section className="flex flex-col items-center pb-16 pt-10 text-center sm:pt-14">
        <Reveal>
          <Khatim size={22} className="mx-auto text-gold opacity-70" />

          {/* The one and only nastaliq wordmark. `wordmark-ur` supplies the
              line-height and vertical padding that keep `gold-leaf`'s
              bg-clip-text from cropping the descenders. */}
          <h1 className="wordmark-ur gold-leaf mt-4 text-[clamp(2.75rem,10vw,6rem)]">
            {site.nameUr}
          </h1>

          <OrnamentDivider className="mx-auto mt-2 w-full max-w-md" />

          <p className="heading-ur mt-3 text-lg text-muted sm:text-xl">
            {site.poet.nameUr}
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-7 flex w-full justify-center">
          <SearchButton variant="hero" />
        </Reveal>

        {totalKalam > 0 ? (
          <Reveal delay={0.16} className="mt-7">
            <dl className="flex items-center justify-center gap-8 sm:gap-12">
              <div>
                <dd className="font-display text-4xl text-gold sm:text-5xl">
                  {categories.length}
                </dd>
                <dt className="body-ur mt-1 text-xs tracking-wide text-muted">
                  موضوعات
                </dt>
              </div>

              <span aria-hidden="true" className="h-10 w-px bg-hairline" />

              <div>
                <dd className="font-display text-4xl text-gold sm:text-5xl">
                  {totalKalam}
                </dd>
                <dt className="body-ur mt-1 text-xs tracking-wide text-muted">
                  کلام
                </dt>
              </div>
            </dl>
          </Reveal>
        ) : null}
      </section>

      {/* ── Kalam of the day ──────────────────────────────────────────
          Full editorial treatment: the generated art bleeds behind the type,
          the opening misra are set at reading size against a gold margin rule,
          and the panel reads as one gesture rather than a stack of chrome. */}
      {kalamOfTheDay && featuredArt ? (
        <Reveal className="pb-24">
          <section aria-labelledby="kalam-of-the-day">
            <div className="glass grain relative overflow-hidden">
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-50"
                style={{
                  backgroundImage: featuredArt.backgroundImage,
                  backgroundSize: featuredArt.backgroundSize,
                }}
              />
              {/* Legibility floor over art whose hue varies per category. */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[linear-gradient(to_top,var(--bg-deep)_4%,transparent_72%)]"
              />

              <div className="relative px-6 py-12 sm:px-14 sm:py-16">
                <p
                  id="kalam-of-the-day"
                  className="body-ur flex items-center gap-2 text-xs tracking-[0.2em] text-gold"
                >
                  <Sparkle size={15} weight="fill" aria-hidden="true" />
                  کلامِ روز
                </p>

                <h2 className="heading-ur mt-3 text-[clamp(1.9rem,5vw,3.25rem)] text-foreground">
                  {kalamOfTheDay.title}
                </h2>

                {/* Logical border-inline-end: the rule sits on the reading
                    edge in RTL without a direction-specific override. */}
                <div className="mt-8 max-w-2xl border-e-2 border-gold/40 pe-5">
                  {openingLines.map((line, i) => (
                    <p
                      key={i}
                      className="poetry-ur text-lg text-foreground sm:text-xl"
                    >
                      {line}
                    </p>
                  ))}
                </div>

                <Link
                  href={`/kalam/${encodeURIComponent(kalamOfTheDay.slug)}`}
                  className="body-ur tap mt-10 inline-flex items-center gap-2.5 rounded-full bg-gold px-6 text-sm font-medium text-gold-contrast transition-all duration-300 ease-[var(--ease-out-soft)] hover:gap-4"
                >
                  مکمل کلام پڑھیں
                  <ArrowLeft size={17} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </section>
        </Reveal>
      ) : null}

      {/* ── Topic grid ────────────────────────────────────────────────── */}
      <section aria-labelledby="topics" className="pb-12">
        <Reveal>
          <h2
            id="topics"
            className="heading-ur text-[clamp(1.6rem,4vw,2.4rem)] text-foreground"
          >
            موضوعات
          </h2>
          <SectionRule className="mt-3" />
        </Reveal>

        {categories.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              icon={<FolderOpen size={26} aria-hidden="true" />}
              title="ابھی کوئی موضوع موجود نہیں"
              body="انتظامیہ کے صفحے سے پہلا موضوع بنائیں — نیا موضوع بناتے ہی اس کا صفحہ خود بخود بن جائے گا۔"
              action={
                <Link
                  href="/admin"
                  className="body-ur tap inline-flex items-center rounded-full border border-hairline px-5 text-sm text-foreground transition-colors hover:border-hairline-strong"
                >
                  انتظامیہ کھولیں
                </Link>
              }
            />
          </div>
        ) : (
          <Reveal
            group
            className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {categories.map((category, index) => (
              <CategoryCard
                key={category.id}
                index={index + 1}
                name={category.name}
                slug={category.slug}
                kalamCount={category.kalamCount}
                gradientSeed={category.coverGradientSeed}
              />
            ))}
          </Reveal>
        )}
      </section>
    </div>
  );
}
