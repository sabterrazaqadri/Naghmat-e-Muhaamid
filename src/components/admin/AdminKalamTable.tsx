"use client";

import { MagnifyingGlass, PencilSimple, Sparkle } from "@phosphor-icons/react";
import Link from "next/link";
import { useDeferredValue, useId, useMemo, useState } from "react";

import { deleteKalamAction, toggleFeaturedAction } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { bestMatch, normalizeQuery } from "@/lib/fuzzy";

type Item = {
  id: string;
  title: string;
  slug: string;
  isFeatured: boolean;
  categoryName: string;
};

export function AdminKalamTable({ items }: { items: Item[] }) {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const inputId = useId();

  const filtered = useMemo(() => {
    const normalized = normalizeQuery(deferred);
    if (!normalized) return items;

    return items
      .map((item) => ({
        item,
        match: bestMatch(
          [item.title, item.categoryName],
          normalized,
        ),
      }))
      .filter((row) => row.match !== null)
      .sort((a, b) => b.match!.score - a.match!.score)
      .map((row) => row.item);
  }, [items, deferred]);

  return (
    <div>
      <div className="glass flex items-center gap-3 px-4">
        <MagnifyingGlass size={18} aria-hidden="true" className="shrink-0 text-muted" />
        <label htmlFor={inputId} className="sr-only">
          کلام تلاش کریں
        </label>
        <input
          id={inputId}
          type="search"
          dir="auto"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="عنوان یا موضوع سے تلاش کریں…"
          className="body-ur h-11 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
        />
      </div>

      <p aria-live="polite" className="body-ur mt-3 text-sm leading-7 text-muted">
        {query ? `${filtered.length} نتائج` : `${items.length} کلام`}
      </p>

      {filtered.length === 0 ? (
        <p className="body-ur mt-4 rounded-xl border border-hairline px-4 py-8 text-center text-sm text-muted">
          کوئی کلام نہیں ملا۔
        </p>
      ) : (
        <ul className="mt-2 space-y-3">
          {filtered.map((item) => (
            <li
              key={item.id}
              className="glass flex flex-wrap items-center gap-x-4 gap-y-3 p-4"
            >
              <div className="min-w-0 flex-1">
                {/* Sans, not nastaliq: this is a dense dashboard list where
                    truncation is genuinely useful, and truncating nastaliq
                    crops its descenders. §6 puts correctness over register here. */}
                <p className="body-ur truncate text-base text-foreground">
                  {item.title}
                </p>
                <p className="body-ur mt-0.5 flex flex-wrap items-center gap-x-2 text-xs leading-6 text-muted">
                  <span className="rounded-full border border-hairline px-2 py-0.5">
                    {item.categoryName}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* A plain form post, so the toggle works before hydration. */}
                <form action={toggleFeaturedAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <button
                    type="submit"
                    aria-pressed={item.isFeatured}
                    aria-label={
                      item.isFeatured
                        ? `«${item.title}» کو نمایاں فہرست سے نکالیں`
                        : `«${item.title}» کو نمایاں کریں`
                    }
                    title={item.isFeatured ? "نمایاں ہے" : "نمایاں کریں"}
                    className={`tap grid place-items-center rounded-xl border border-hairline transition-colors ${
                      item.isFeatured
                        ? "text-gold"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    <Sparkle
                      size={18}
                      weight={item.isFeatured ? "fill" : "regular"}
                      aria-hidden="true"
                    />
                  </button>
                </form>

                <Link
                  href={`/admin/kalam/${item.id}/edit`}
                  className="body-ur tap inline-flex items-center gap-2 rounded-xl border border-hairline px-3 text-sm text-foreground transition-colors hover:border-hairline-strong"
                >
                  <PencilSimple size={16} aria-hidden="true" />
                  ترمیم
                </Link>

                <DeleteButton
                  action={deleteKalamAction}
                  id={item.id}
                  compact
                  confirmMessage={`«${item.title}» ہمیشہ کے لیے حذف کر دیا جائے؟`}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
