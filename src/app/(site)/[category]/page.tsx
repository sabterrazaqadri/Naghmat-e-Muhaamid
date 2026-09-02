import { FileText } from "@phosphor-icons/react/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EmptyState } from "@/components/EmptyState";
import { KalamFilterList } from "@/components/KalamFilterList";
import { Reveal } from "@/components/Reveal";
import { getCategoryBySlug, listKalamByCategory } from "@/db/queries";
import { coverArt } from "@/lib/gradient";
import { site } from "@/lib/site";

export const revalidate = 60;

type Params = { params: Promise<{ category: string }> };

/**
 * This single dynamic segment is what makes categories extensible: creating
 * one in /admin gives it a live public route immediately, with no code change
 * and no redeploy. Static segments like /kalam and /bookmarks take precedence
 * over it, so they are never shadowed.
 */
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(decodeURIComponent(slug));

  if (!category) return { title: "Topic not found" };

  const title = category.name;
  const description = `${category.name} — ${site.description}`;

  return {
    title,
    description,
    alternates: { canonical: `/${category.slug}` },
    openGraph: {
      type: "website",
      title: `${title} — ${site.nameLatin}`,
      description,
      url: `/${category.slug}`,
    },
  };
}

export default async function CategoryPage({ params }: Params) {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(decodeURIComponent(slug));

  if (!category) notFound();

  const items = await listKalamByCategory(category.id);
  const art = coverArt(category.coverGradientSeed ?? category.slug);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-16 pt-10 sm:px-6">
      <Reveal>
        <header className="glass relative overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-45"
            style={{
              backgroundImage: art.backgroundImage,
              backgroundSize: art.backgroundSize,
            }}
          />
          <div className="relative px-6 py-10 sm:px-10">
            <Link
              href="/"
              className="text-sm leading-7 text-muted transition-colors hover:text-foreground"
            >
              All topics
            </Link>
            <h1
              lang="ur"
              dir="rtl"
              className="heading-ur mt-1 text-4xl text-foreground sm:text-5xl"
            >
              {category.name}
            </h1>
            <p className="mt-1 text-sm leading-7 text-muted">
              {items.length} kalam
            </p>
          </div>
        </header>
      </Reveal>

      <div className="mt-8">
        {items.length === 0 ? (
          <EmptyState
            icon={<FileText size={26} aria-hidden="true" />}
            title="No kalam in this topic yet"
            body="Add the first kalam to this topic from the admin panel."
            action={
              <Link
                href="/admin/kalam/new"
                className="tap inline-flex items-center rounded-full border border-hairline px-5 text-sm text-foreground transition-colors hover:border-hairline-strong"
              >
                Add a kalam
              </Link>
            }
          />
        ) : (
          <KalamFilterList
            items={items}
            categoryName={category.name}
            categorySlug={category.slug}
          />
        )}
      </div>
    </div>
  );
}
