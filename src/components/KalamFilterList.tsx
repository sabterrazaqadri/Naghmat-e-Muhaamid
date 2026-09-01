"use client";

import { MagnifyingGlass, SmileySad } from "@phosphor-icons/react";
import { useDeferredValue, useId, useMemo, useState } from "react";

import { KalamCard } from "@/components/KalamCard";
import { bestMatch, normalizeQuery } from "@/lib/fuzzy";

type Item = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
};

/**
 * In-page filter for a single category.
 *
 * Filtering happens against the already-loaded list rather than round-tripping
 * to the server: a category holds tens of items, not thousands, so the result
 * is instant and works offline. `useDeferredValue` keeps typing responsive if
 * a category ever does grow large.
 */
export function KalamFilterList({
  items,
  categoryName,
  categorySlug,
}: {
  items: Item[];
  categoryName: string;
  categorySlug: string;
}) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const inputId = useId();

  const filtered = useMemo(() => {
    const normalized = normalizeQuery(deferredQuery);
    if (!normalized) return items;

    return items
      .map((item) => ({
        item,
        match: bestMatch([item.title, item.excerpt], normalized),
      }))
      .filter((row) => row.match !== null)
      .sort((a, b) => b.match!.score - a.match!.score)
      .map((row) => row.item);
  }, [items, deferredQuery]);

  return (
    <div>
      <div className="glass flex items-center gap-3 px-4">
        <MagnifyingGlass size={20} aria-hidden="true" className="shrink-0 text-muted" />
        <label htmlFor={inputId} className="sr-only">
          {categoryName} میں تلاش کریں
        </label>
        <input
          id={inputId}
          type="search"
          dir="auto"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="اس موضوع میں تلاش کریں…"
          className="body-ur h-12 w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted"
        />
      </div>

      {/* Announced politely so screen-reader users hear the list shrink. */}
      <p aria-live="polite" className="body-ur mt-3 text-sm leading-7 text-muted">
        {query
          ? `${filtered.length} نتائج`
          : `${items.length} کلام`}
      </p>

      {filtered.length === 0 ? (
        <div className="glass mt-4 flex flex-col items-center gap-3 px-6 py-14 text-center">
          <span
            aria-hidden="true"
            className="grid size-14 place-items-center rounded-full bg-[color-mix(in_oklab,var(--accent-gold)_14%,transparent)] text-gold"
          >
            <SmileySad size={26} />
          </span>
          <h2 className="heading-ur text-xl text-foreground">کوئی کلام نہیں ملا</h2>
          <p className="body-ur max-w-sm text-[0.95rem] text-muted">
            «{query}» سے کچھ نہیں ملا۔ املا بدل کر دیکھیں، یا ⌘K دبا کر پورے
            مجموعے میں تلاش کریں۔
          </p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {filtered.map((item) => (
            <KalamCard
              key={item.id}
              title={item.title}
              slug={item.slug}
              excerpt={item.excerpt}
              categoryName={categoryName}
              categorySlug={categorySlug}
            />
          ))}
        </div>
      )}
    </div>
  );
}
