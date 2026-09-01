"use client";

import { Star } from "@phosphor-icons/react";
import { useSyncExternalStore } from "react";

import {
  getBookmarks,
  getServerBookmarks,
  subscribeToBookmarks,
  toggleBookmark,
  type Bookmark,
} from "@/lib/bookmarks";

/**
 * `useSyncExternalStore` rather than `useState` + `useEffect`: the server and
 * the first client render both report "no bookmarks", so hydration matches,
 * and every mounted star updates together the moment one of them is toggled —
 * including the copies on the /bookmarks page.
 */
export function BookmarkButton({
  entry,
  className = "",
}: {
  entry: Omit<Bookmark, "savedAt">;
  className?: string;
}) {
  const bookmarks = useSyncExternalStore(
    subscribeToBookmarks,
    getBookmarks,
    getServerBookmarks,
  );

  const saved = bookmarks.some((b) => b.slug === entry.slug);
  const label = saved ? "نشان زد فہرست سے نکالیں" : "نشان زد کریں";

  return (
    <button
      type="button"
      // The click target sits inside a card-wide <Link>; without these the
      // browser follows the link instead of toggling.
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleBookmark(entry);
      }}
      aria-pressed={saved}
      aria-label={label}
      title={label}
      className={`tap grid shrink-0 place-items-center rounded-xl transition-colors ${
        saved ? "text-gold" : "text-muted hover:text-foreground"
      } ${className}`}
    >
      <Star size={20} weight={saved ? "fill" : "regular"} aria-hidden="true" />
    </button>
  );
}
