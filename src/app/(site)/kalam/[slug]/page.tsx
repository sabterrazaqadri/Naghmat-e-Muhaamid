import { ArrowLeft } from "@phosphor-icons/react/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { KalamReader } from "@/components/KalamReader";
import { PoetCredit } from "@/components/PoetCredit";
import { ReadingProgress } from "@/components/ReadingProgress";
import { Reveal } from "@/components/Reveal";
import { getKalamBySlug } from "@/db/queries";
import { site, siteUrl } from "@/lib/site";

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

/** A one-line summary drawn from the opening misra, for search results. */
function buildDescription(lyrics: string): string {
  const opening = lyrics
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 2)
    .join(" — ");

  // The collection's single poet is the credit; there is no per-kalam author.
  return `${opening} · ${site.poet.nameLatin}`.slice(0, 300);
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const kalam = await getKalamBySlug(decodeURIComponent(slug));

  if (!kalam) return { title: "Kalam not found" };

  const description = buildDescription(kalam.lyrics);
  const path = `/kalam/${encodeURIComponent(kalam.slug)}`;

  return {
    title: kalam.title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      title: `${kalam.title} — ${site.nameLatin}`,
      description,
      url: path,
      section: kalam.categoryName,
    },
    twitter: {
      card: "summary",
      title: kalam.title,
      description,
    },
  };
}

export default async function KalamPage({ params }: Params) {
  const { slug } = await params;
  const kalam = await getKalamBySlug(decodeURIComponent(slug));

  if (!kalam) notFound();

  const shareUrl = `${siteUrl()}/kalam/${encodeURIComponent(kalam.slug)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: kalam.title,
    genre: kalam.categoryName,
    inLanguage: "ur",
    author: { "@type": "Person", name: site.poet.nameLatin },
    isPartOf: { "@type": "Collection", name: site.nameLatin },
    url: shareUrl,
    datePublished: kalam.createdAt.toISOString(),
  };

  return (
    <>
      <ReadingProgress />

      {/* Reading measure: ~48rem, per §4. */}
      <div className="mx-auto w-full max-w-3xl px-4 pb-20 pt-8 sm:px-6">
        <Reveal>
          <nav aria-label="Breadcrumb" className="mb-6">
            <Link
              href={`/${kalam.categorySlug}`}
              className="inline-flex items-center gap-1.5 text-sm leading-7 text-muted transition-colors hover:text-foreground"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              <span lang="ur" dir="rtl" className="heading-ur">
                {kalam.categoryName}
              </span>
            </Link>
          </nav>

          <header className="mb-8">
            <h1
              lang="ur"
              dir="rtl"
              className="heading-ur text-3xl text-foreground sm:text-4xl"
            >
              {kalam.title}
            </h1>
          </header>
        </Reveal>

        <KalamReader
          title={kalam.title}
          slug={kalam.slug}
          lyrics={kalam.lyrics}
          categoryName={kalam.categoryName}
          categorySlug={kalam.categorySlug}
          shareUrl={shareUrl}
        />

        <PoetCredit />

        <Reveal className="mt-12">
          <Link
            href={`/${kalam.categorySlug}`}
            className="tap inline-flex items-center gap-2 rounded-full border border-hairline px-5 text-sm text-foreground transition-colors hover:border-hairline-strong"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            More in
            <span lang="ur" dir="rtl" className="heading-ur">
              {kalam.categoryName}
            </span>
          </Link>
        </Reveal>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
