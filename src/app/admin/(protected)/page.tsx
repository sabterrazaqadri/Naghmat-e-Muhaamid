import {
  BookOpenText,
  FolderSimple,
  Plus,
  Sparkle,
  WarningCircle,
} from "@phosphor-icons/react/ssr";
import Link from "next/link";

import { adminCounts, adminListKalam } from "@/db/admin-queries";

/** Counts must be live, never a build-time snapshot. */
export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  icon,
  href,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <Link href={href} className="glass block p-5 transition-colors hover:border-hairline-strong">
      <span aria-hidden="true" className="text-gold">
        {icon}
      </span>
      <p className="mt-3 font-display text-4xl text-foreground">{value}</p>
      <p className="body-ur mt-1 text-sm leading-7 text-muted">{label}</p>
    </Link>
  );
}

export default async function AdminDashboard() {
  let counts: Awaited<ReturnType<typeof adminCounts>> | null = null;
  let recent: Awaited<ReturnType<typeof adminListKalam>> = [];
  let configError: string | null = null;

  try {
    [counts, recent] = await Promise.all([adminCounts(), adminListKalam()]);
  } catch (error) {
    // A missing privileged connection string is a setup problem, not a crash.
    // Showing it here beats a 500 with no explanation.
    console.error("[admin dashboard]", error);
    configError =
      error instanceof Error && error.message.includes("DATABASE_URL_ADMIN")
        ? "DATABASE_URL_ADMIN مقرر نہیں۔ .env.local میں Neon کا privileged رابطہ شامل کریں۔"
        : "ڈیٹا بیس سے رابطہ نہ ہو سکا۔";
  }

  if (configError) {
    return (
      <div className="glass flex items-start gap-3 p-6">
        <WarningCircle
          size={24}
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-destructive"
        />
        <div>
          <h1 className="heading-ur text-xl text-foreground">
            ڈیٹا بیس تیار نہیں
          </h1>
          <p className="body-ur mt-1 text-sm leading-8 text-muted">
            {configError}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="heading-ur text-2xl text-foreground">خلاصہ</h1>
          <p className="body-ur text-sm leading-7 text-muted">
            مجموعے کی موجودہ صورتِ حال
          </p>
        </div>

        <Link
          href="/admin/kalam/new"
          className="body-ur tap inline-flex items-center gap-2 rounded-xl bg-gold px-4 text-sm font-medium text-gold-contrast transition-opacity hover:opacity-90"
        >
          <Plus size={16} aria-hidden="true" />
          نیا کلام
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="موضوعات"
          value={counts!.categories}
          href="/admin/categories"
          icon={<FolderSimple size={24} />}
        />
        <StatCard
          label="کل کلام"
          value={counts!.kalam}
          href="/admin/kalam"
          icon={<BookOpenText size={24} />}
        />
        <StatCard
          label="نمایاں کلام"
          value={counts!.featured}
          href="/admin/kalam"
          icon={<Sparkle size={24} />}
        />
      </div>

      <section className="mt-10">
        <h2 className="heading-ur text-lg text-foreground">تازہ ترین کلام</h2>

        {recent.length === 0 ? (
          <p className="body-ur mt-3 text-sm leading-8 text-muted">
            ابھی کوئی کلام شامل نہیں کیا گیا۔{" "}
            <Link href="/admin/kalam/new" className="text-gold underline">
              پہلا کلام شامل کریں
            </Link>
            ۔
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--border-glass)] overflow-hidden rounded-xl border border-hairline">
            {recent.slice(0, 8).map((item) => (
              <li key={item.id}>
                <Link
                  href={`/admin/kalam/${item.id}/edit`}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-elevated"
                >
                  <span className="body-ur min-w-0 flex-1 truncate text-sm text-foreground">
                    {item.title}
                  </span>
                  {item.isFeatured ? (
                    <Sparkle
                      size={14}
                      weight="fill"
                      aria-label="نمایاں"
                      className="shrink-0 text-gold"
                    />
                  ) : null}
                  <span className="body-ur shrink-0 rounded-full border border-hairline px-2 py-0.5 text-xs text-muted">
                    {item.categoryName}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
