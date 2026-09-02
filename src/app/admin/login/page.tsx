import { Lock } from "@phosphor-icons/react/ssr";
import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/admin/LoginForm";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Sign in" };

/**
 * Sits outside the (protected) group, so the layout's auth check never runs
 * here — which is what keeps the redirect from looping. The proxy still guards
 * it in the other direction: an already-authenticated visitor is bounced to
 * the dashboard.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center px-4 py-16">
      <div className="glass p-8">
        <span
          aria-hidden="true"
          className="grid size-12 place-items-center rounded-xl bg-[color-mix(in_oklab,var(--accent-gold)_14%,transparent)] text-gold"
        >
          <Lock size={24} />
        </span>

        <h1 className="font-display mt-5 text-3xl text-foreground">
          Admin sign in
        </h1>
        <p className="mt-1 text-sm leading-7 text-muted">
          A password is required to manage the {site.nameLatin} collection.
        </p>

        <div className="mt-6">
          {/* Only same-origin admin paths are forwarded; actions.ts re-checks. */}
          <LoginForm next={next?.startsWith("/admin") ? next : undefined} />
        </div>
      </div>

      <Link
        href="/"
        className="mt-6 text-center text-sm text-muted transition-colors hover:text-foreground"
      >
        Back to the site
      </Link>
    </div>
  );
}
