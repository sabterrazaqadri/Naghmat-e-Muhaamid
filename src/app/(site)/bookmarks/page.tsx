import type { Metadata } from "next";

import { BookmarksList } from "@/components/BookmarksList";

export const metadata: Metadata = {
  title: "نشان زد کلام",
  description: "آپ کے محفوظ کردہ کلام — اسی آلے پر، بغیر کسی کھاتے کے۔",
  // A personal, device-local list has nothing to offer a search index.
  robots: { index: false, follow: true },
};

export default function BookmarksPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-16 pt-10 sm:px-6">
      <header className="mb-8">
        <h1 className="heading-ur text-3xl text-foreground sm:text-4xl">
          نشان زد کلام
        </h1>
        <p className="body-ur mt-1 text-sm leading-7 text-muted">
          یہ فہرست صرف اسی آلے میں محفوظ ہے
        </p>
      </header>

      <BookmarksList />
    </div>
  );
}
