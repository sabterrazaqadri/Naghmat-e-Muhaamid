import type { Metadata } from "next";
import Link from "next/link";

import { createKalamAction } from "@/app/admin/actions";
import { KalamForm } from "@/components/admin/KalamForm";
import { adminCategoryOptions } from "@/db/admin-queries";

export const metadata: Metadata = { title: "New kalam" };
export const dynamic = "force-dynamic";

export default async function NewKalamPage() {
  const categories = await adminCategoryOptions();

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/kalam"
        className="text-sm text-muted transition-colors hover:text-foreground"
      >
        All kalam
      </Link>

      <h1 className="font-display mt-1 text-3xl text-foreground">New kalam</h1>

      {categories.length === 0 ? (
        <div className="glass mt-6 p-6">
          <h2 className="font-display text-xl text-foreground">
            Create a topic first
          </h2>
          <p className="mt-1 text-sm leading-7 text-muted">
            Every kalam belongs to a topic, so at least one is needed before
            you can add verse.
          </p>
          <Link
            href="/admin/categories"
            className="tap mt-4 inline-flex items-center rounded-full bg-gold px-5 text-sm font-medium text-gold-contrast transition-opacity hover:opacity-90"
          >
            Create a topic
          </Link>
        </div>
      ) : (
        <div className="mt-6">
          <KalamForm
            action={createKalamAction}
            mode="create"
            categories={categories}
          />
        </div>
      )}
    </div>
  );
}
