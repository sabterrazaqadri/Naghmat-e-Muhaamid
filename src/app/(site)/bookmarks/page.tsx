import type { Metadata } from "next";

import { BookmarksList } from "@/components/BookmarksList";

export const metadata: Metadata = {
  title: "Saved kalam",
  description: "Your saved kalam — kept on this device, no account needed.",
  // A personal, device-local list has nothing to offer a search index.
  robots: { index: false, follow: true },
};

export default function BookmarksPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-16 pt-10 sm:px-6">
      <header className="mb-8">
        <h1 className="font-display text-4xl text-foreground sm:text-5xl">
          Saved kalam
        </h1>
        <p className="mt-1 text-sm leading-7 text-muted">
          This list is stored on this device only
        </p>
      </header>

      <BookmarksList />
    </div>
  );
}
