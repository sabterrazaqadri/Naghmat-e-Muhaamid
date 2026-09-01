import { Compass } from "@phosphor-icons/react/ssr";
import Link from "next/link";

/**
 * Shared by both 404 boundaries: the one inside `(site)`, which renders with
 * the full header and footer, and the root one that catches URLs matching no
 * route at all.
 */
export function NotFoundView() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <span
        aria-hidden="true"
        className="grid size-16 place-items-center rounded-full bg-[color-mix(in_oklab,var(--accent-gold)_14%,transparent)] text-gold"
      >
        <Compass size={30} />
      </span>

      <p className="mt-6 font-display text-5xl text-gold">404</p>

      <h1 className="heading-ur mt-2 text-3xl text-foreground">
        یہ صفحہ نہیں ملا
      </h1>

      <p className="body-ur mt-3 max-w-md text-[0.95rem] text-muted">
        ممکن ہے یہ کلام یا موضوع ہٹا دیا گیا ہو، یا پتا درست نہ ہو۔ سرورق سے
        دوبارہ شروع کریں، یا ⌘K دبا کر پورے مجموعے میں تلاش کریں۔
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="body-ur tap inline-flex items-center rounded-xl bg-gold px-5 text-sm font-medium text-gold-contrast transition-opacity hover:opacity-90"
        >
          سرورق پر جائیں
        </Link>
        <Link
          href="/bookmarks"
          className="body-ur tap inline-flex items-center rounded-xl border border-hairline px-5 text-sm text-foreground transition-colors hover:border-hairline-strong"
        >
          نشان زد کلام
        </Link>
      </div>
    </div>
  );
}
