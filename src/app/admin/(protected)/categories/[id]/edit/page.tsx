import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { updateCategoryAction } from "@/app/admin/actions";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { adminGetCategory } from "@/db/admin-queries";

export const metadata: Metadata = { title: "موضوع میں ترمیم" };
export const dynamic = "force-dynamic";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await adminGetCategory(id);

  if (!category) notFound();

  return (
    <div className="max-w-lg">
      <Link
        href="/admin/categories"
        className="body-ur text-sm text-muted transition-colors hover:text-foreground"
      >
        تمام موضوعات
      </Link>

      <h1 className="heading-ur mt-1 text-2xl text-foreground">
        «{category.name}» میں ترمیم
      </h1>

      <div className="glass mt-6 p-5">
        <CategoryForm
          action={updateCategoryAction}
          mode="edit"
          initial={{
            id: category.id,
            name: category.name,
            slug: category.slug,
            sortOrder: category.sortOrder,
          }}
        />
      </div>

      <p className="body-ur mt-4 text-xs leading-6 text-muted">
        ویب پتا بدلنے سے پرانا لنک کام کرنا چھوڑ دے گا۔
      </p>
    </div>
  );
}
