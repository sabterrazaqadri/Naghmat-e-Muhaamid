"use client";

import { WarningOctagon } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect } from "react";

/**
 * Route-level error boundary. Keeps the site chrome (header, footer, theme)
 * because it renders inside the root layout — only the failed segment is
 * replaced.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[route error]", error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <span
        aria-hidden="true"
        className="grid size-16 place-items-center rounded-full bg-[color-mix(in_oklab,var(--destructive)_16%,transparent)] text-destructive"
      >
        <WarningOctagon size={30} />
      </span>

      <h1 className="heading-ur mt-6 text-3xl text-foreground">
        کچھ غلط ہو گیا
      </h1>

      <p className="body-ur mt-3 max-w-md text-[0.95rem] text-muted">
        یہ صفحہ لوڈ کرتے ہوئے مسئلہ پیش آیا۔ دوبارہ کوشش کریں — مسئلہ برقرار
        رہے تو کچھ دیر بعد آزمائیں۔
      </p>

      {error.digest ? (
        <p className="mt-3 font-mono text-xs text-muted">
          حوالہ: {error.digest}
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="body-ur tap inline-flex items-center rounded-xl bg-gold px-5 text-sm font-medium text-gold-contrast transition-opacity hover:opacity-90"
        >
          دوبارہ کوشش کریں
        </button>
        <Link
          href="/"
          className="body-ur tap inline-flex items-center rounded-xl border border-hairline px-5 text-sm text-foreground transition-colors hover:border-hairline-strong"
        >
          سرورق پر جائیں
        </Link>
      </div>
    </div>
  );
}
