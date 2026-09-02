import Link from "next/link";

import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-hairline">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            {/* The romanised wordmark, in the display serif. */}
            <p className="font-display text-2xl tracking-wide text-gold">
              {site.nameLatin}
            </p>
            <p className="mt-3 text-sm leading-7 text-muted">{site.tagline}</p>
          </div>

          <div className="text-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              Poet
            </p>
            <p
              lang="ur"
              dir="rtl"
              className="heading-ur text-lg text-foreground"
            >
              {site.poet.nameUr}
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-hairline pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p className="leading-7">
            © {new Date().getFullYear()} {site.nameLatin}
          </p>
          <Link
            href="/admin"
            className="leading-7 transition-colors hover:text-foreground"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
