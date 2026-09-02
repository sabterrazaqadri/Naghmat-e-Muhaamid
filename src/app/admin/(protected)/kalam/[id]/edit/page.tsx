import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteKalamAction, updateKalamAction } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { KalamForm } from "@/components/admin/KalamForm";
import { adminCategoryOptions, adminGetKalam } from "@/db/admin-queries";

export const metadata: Metadata = { title: "Edit kalam" };
export const dynamic = "force-dynamic";

export default async function EditKalamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [kalam, categories] = await Promise.all([
    adminGetKalam(id),
    adminCategoryOptions(),
  ]);

  if (!kalam) notFound();

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/kalam"
        className="text-sm text-muted transition-colors hover:text-foreground"
      >
        All kalam
      </Link>

      <h1 className="font-display mt-1 text-3xl text-foreground">
        Edit{" "}
        <span lang="ur" dir="rtl" className="heading-ur">
          {kalam.title}
        </span>
      </h1>

      <div className="mt-6">
        <KalamForm
          action={updateKalamAction}
          mode="edit"
          categories={categories}
          initial={{
            id: kalam.id,
            title: kalam.title,
            slug: kalam.slug,
            lyrics: kalam.lyrics,
            categoryId: kalam.categoryId,
            isFeatured: kalam.isFeatured,
          }}
        />
      </div>

      <div className="mt-10 border-t border-hairline pt-6">
        <h2 className="font-display text-lg text-destructive">Danger zone</h2>
        <p className="mb-3 mt-1 text-xs leading-6 text-muted">
          A deleted kalam cannot be recovered.
        </p>
        <DeleteButton
          action={deleteKalamAction}
          id={kalam.id}
          confirmMessage={`Permanently delete "${kalam.title}"?`}
          label="Delete this kalam"
        />
      </div>
    </div>
  );
}
