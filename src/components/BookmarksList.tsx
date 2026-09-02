"use client";

import { Star, Trash } from "@phosphor-icons/react";
import Link from "next/link";
import { useSyncExternalStore } from "react";

import {
  clearBookmarks,
  getBookmarks,
  getServerBookmarks,
  removeBookmark,
  subscribeToBookmarks,
} from "@/lib/bookmarks";

export function BookmarksList() {
  const bookmarks = useSyncExternalStore(
    subscribeToBookmarks,
    getBookmarks,
    getServerBookmarks,
  );

  if (bookmarks.length === 0) {
    return (
      <div className="glass flex flex-col items-center gap-3 px-6 py-16 text-center">
        <span
          aria-hidden="true"
          className="grid size-14 place-items-center rounded-full bg-[color-mix(in_oklab,var(--accent-gold)_14%,transparent)] text-gold"
        >
          <Star size={26} />
        </span>
        <h2 className="font-display text-2xl text-foreground">
          Nothing saved yet
        </h2>
        <p className="max-w-sm text-[0.95rem] leading-7 text-muted">
          Tap the star on any kalam and it is kept here. This list lives on this
          device only — no account needed.
        </p>
        <Link
          href="/"
          className="tap mt-2 inline-flex items-center rounded-full border border-hairline px-5 text-sm text-foreground transition-colors hover:border-hairline-strong"
        >
          Browse the collection
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p aria-live="polite" className="text-sm leading-7 text-muted">
          {bookmarks.length} saved
        </p>
        <button
          type="button"
          onClick={() => {
            if (
              window.confirm("Remove all saved kalam from this list?")
            ) {
              clearBookmarks();
            }
          }}
          className="tap inline-flex items-center gap-2 rounded-xl border border-hairline px-3 text-sm text-muted transition-colors hover:border-destructive hover:text-destructive"
        >
          <Trash size={16} aria-hidden="true" />
          Clear all
        </button>
      </div>

      <ul className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        {bookmarks.map((bookmark) => (
          <li key={bookmark.slug} className="glass relative flex gap-3 p-4">
            <div className="min-w-0 flex-1">
              <h2
                lang="ur"
                dir="rtl"
                className="heading-ur text-lg text-foreground"
              >
                <Link
                  href={`/kalam/${encodeURIComponent(bookmark.slug)}`}
                  className="after:absolute after:inset-0"
                >
                  {bookmark.title}
                </Link>
              </h2>
              <p className="mt-1 text-xs leading-6 text-muted">
                <span
                  lang="ur"
                  dir="rtl"
                  className="inline-block rounded-full border border-hairline px-2 py-0.5"
                >
                  {bookmark.categoryName}
                </span>
              </p>
            </div>

            <button
              type="button"
              onClick={() => removeBookmark(bookmark.slug)}
              aria-label={`Remove “${bookmark.title}” from saved`}
              className="tap relative z-10 grid shrink-0 place-items-center rounded-xl text-muted transition-colors hover:text-destructive"
            >
              <Trash size={18} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
