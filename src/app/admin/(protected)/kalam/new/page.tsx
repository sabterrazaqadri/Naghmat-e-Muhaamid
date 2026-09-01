import type { Metadata } from "next";
import Link from "next/link";

import { createKalamAction } from "@/app/admin/actions";
import { KalamForm } from "@/components/admin/KalamForm";
import { adminCategoryOptions } from "@/db/admin-queries";

export const metadata: Metadata = { title: "نیا کلام" };
export const dynamic = "force-dynamic";

export default async function NewKalamPage() {
  const categories = await adminCategoryOptions();

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/kalam"
        className="body-ur text-sm text-muted transition-colors hover:text-foreground"
      >
        تمام کلام
      </Link>

      <h1 className="heading-ur mt-1 text-2xl text-foreground">نیا کلام</h1>

      {categories.length === 0 ? (
        <div className="glass mt-6 p-6">
          <h2 className="heading-ur text-lg text-foreground">
            پہلے کوئی موضوع بنائیں
          </h2>
          <p className="body-ur mt-1 text-sm leading-8 text-muted">
            ہر کلام کسی نہ کسی موضوع سے جُڑا ہوتا ہے، اس لیے پہلے کم از کم ایک
            موضوع درکار ہے۔
          </p>
          <Link
            href="/admin/categories"
            className="body-ur tap mt-4 inline-flex items-center rounded-xl bg-gold px-4 text-sm font-medium text-gold-contrast transition-opacity hover:opacity-90"
          >
            موضوع بنائیں
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
