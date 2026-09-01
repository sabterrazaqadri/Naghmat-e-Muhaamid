import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteKalamAction, updateKalamAction } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { KalamForm } from "@/components/admin/KalamForm";
import { adminCategoryOptions, adminGetKalam } from "@/db/admin-queries";

export const metadata: Metadata = { title: "کلام میں ترمیم" };
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
        className="body-ur text-sm text-muted transition-colors hover:text-foreground"
      >
        تمام کلام
      </Link>

      <h1 className="heading-ur mt-1 text-2xl text-foreground">
        «{kalam.title}» میں ترمیم
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
        <h2 className="heading-ur text-base text-destructive">خطرناک عمل</h2>
        <p className="body-ur mb-3 mt-1 text-xs leading-6 text-muted">
          حذف کیا گیا کلام واپس نہیں آ سکتا۔
        </p>
        <DeleteButton
          action={deleteKalamAction}
          id={kalam.id}
          confirmMessage={`«${kalam.title}» ہمیشہ کے لیے حذف کر دیا جائے؟`}
          label="یہ کلام حذف کریں"
        />
      </div>
    </div>
  );
}
