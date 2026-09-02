import { Plus } from "@phosphor-icons/react/ssr";
import type { Metadata } from "next";
import Link from "next/link";

import { AdminKalamTable } from "@/components/admin/AdminKalamTable";
import { adminListKalam } from "@/db/admin-queries";

export const metadata: Metadata = { title: "Kalam" };
export const dynamic = "force-dynamic";

export default async function AdminKalamPage() {
  const items = await adminListKalam();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-foreground">Kalam</h1>
          <p className="text-sm leading-7 text-muted">
            Manage the whole collection
          </p>
        </div>

        <Link
          href="/admin/kalam/new"
          className="tap inline-flex items-center gap-2 rounded-full bg-gold px-5 text-sm font-medium text-gold-contrast transition-opacity hover:opacity-90"
        >
          <Plus size={16} aria-hidden="true" />
          New kalam
        </Link>
      </div>

      <div className="mt-6">
        {items.length === 0 ? (
          <div className="glass px-6 py-14 text-center">
            <h2 className="font-display text-2xl text-foreground">
              No kalam yet
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-muted">
              Add the first one — a title, a topic and the text are enough;
              everything else is generated.
            </p>
            <Link
              href="/admin/kalam/new"
              className="tap mt-5 inline-flex items-center gap-2 rounded-full bg-gold px-5 text-sm font-medium text-gold-contrast transition-opacity hover:opacity-90"
            >
              <Plus size={16} aria-hidden="true" />
              Add the first kalam
            </Link>
          </div>
        ) : (
          <AdminKalamTable items={items} />
        )}
      </div>
    </div>
  );
}
