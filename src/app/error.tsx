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

      <h1 className="font-display mt-6 text-3xl text-foreground">
        Something went wrong
      </h1>

      <p className="mt-3 max-w-md text-[0.95rem] leading-7 text-muted">
        This page ran into a problem while loading. Try again — if it keeps
        happening, give it a moment and retry.
      </p>

      {error.digest ? (
        <p className="mt-3 font-mono text-xs text-muted">
          Reference: {error.digest}
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="tap inline-flex items-center rounded-full bg-gold px-5 text-sm font-medium text-gold-contrast transition-opacity hover:opacity-90"
        >
          Try again
        </button>
        <Link
          href="/"
          className="tap inline-flex items-center rounded-full border border-hairline px-5 text-sm text-foreground transition-colors hover:border-hairline-strong"
        >
          Go to home
        </Link>
      </div>
    </div>
  );
}
