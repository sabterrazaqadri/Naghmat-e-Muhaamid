import { Plus } from "@phosphor-icons/react/ssr";
import type { Metadata } from "next";
import Link from "next/link";

import { AdminKalamTable } from "@/components/admin/AdminKalamTable";
import { adminListKalam } from "@/db/admin-queries";

export const metadata: Metadata = { title: "کلام" };
export const dynamic = "force-dynamic";

export default async function AdminKalamPage() {
  const items = await adminListKalam();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="heading-ur text-2xl text-foreground">کلام</h1>
          <p className="body-ur text-sm leading-7 text-muted">
            پورے مجموعے کا انتظام
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

      <div className="mt-6">
        {items.length === 0 ? (
          <div className="glass px-6 py-14 text-center">
            <h2 className="heading-ur text-xl text-foreground">
              ابھی کوئی کلام شامل نہیں
            </h2>
            <p className="body-ur mx-auto mt-2 max-w-sm text-sm leading-8 text-muted">
              پہلا کلام شامل کریں — عنوان، موضوع اور متن کافی ہیں، باقی سب خود
              بن جائے گا۔
            </p>
            <Link
              href="/admin/kalam/new"
              className="body-ur tap mt-5 inline-flex items-center gap-2 rounded-xl bg-gold px-4 text-sm font-medium text-gold-contrast transition-opacity hover:opacity-90"
            >
              <Plus size={16} aria-hidden="true" />
              پہلا کلام شامل کریں
            </Link>
          </div>
        ) : (
          <AdminKalamTable items={items} />
        )}
      </div>
    </div>
  );
}
