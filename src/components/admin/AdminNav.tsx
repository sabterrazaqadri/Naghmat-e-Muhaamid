"use client";

import { BookOpenText, FolderSimple, House, SignOut } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { logoutAction } from "@/app/admin/actions";
import { site } from "@/lib/site";

const LINKS = [
  { href: "/admin", label: "خلاصہ", Icon: House },
  { href: "/admin/categories", label: "موضوعات", Icon: FolderSimple },
  { href: "/admin/kalam", label: "کلام", Icon: BookOpenText },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-[color-mix(in_oklab,var(--bg-deep)_78%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/admin" className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="grid size-8 place-items-center rounded-lg border border-hairline bg-[color-mix(in_oklab,var(--accent-gold)_16%,transparent)] font-display text-gold"
          >
            ن
          </span>
          <span className="heading-ur text-base text-foreground">انتظامیہ</span>
        </Link>

        <nav aria-label="انتظامیہ" className="flex items-center gap-1">
          {LINKS.map(({ href, label, Icon }) => {
            // /admin must not light up for /admin/kalam, so the root link
            // matches exactly while the others match their subtree.
            const isActive =
              href === "/admin" ? pathname === href : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`body-ur tap inline-flex items-center gap-2 rounded-xl px-3 text-sm transition-colors ${
                  isActive
                    ? "bg-[color-mix(in_oklab,var(--accent-gold)_16%,transparent)] text-gold"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <Icon size={18} aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="ms-auto flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="body-ur tap hidden items-center text-sm text-muted transition-colors hover:text-foreground sm:inline-flex"
          >
            {site.nameUr} ↗
          </Link>

          <form action={logoutAction}>
            <button
              type="submit"
              className="body-ur tap inline-flex items-center gap-2 rounded-xl border border-hairline px-3 text-sm text-muted transition-colors hover:border-hairline-strong hover:text-foreground"
            >
              <SignOut size={18} aria-hidden="true" />
              <span className="hidden sm:inline">باہر نکلیں</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
