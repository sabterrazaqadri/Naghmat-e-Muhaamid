import { PencilSimple } from "@phosphor-icons/react/ssr";
import type { Metadata } from "next";
import Link from "next/link";

import { createCategoryAction, deleteCategoryAction } from "@/app/admin/actions";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { adminListCategories } from "@/db/admin-queries";

export const metadata: Metadata = { title: "موضوعات" };
export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await adminListCategories();

  return (
    <div>
      <h1 className="heading-ur text-2xl text-foreground">موضوعات</h1>
      <p className="body-ur text-sm leading-7 text-muted">
        نیا موضوع بناتے ہی اس کا عوامی صفحہ خود بخود بن جاتا ہے — کوئی کوڈ بدلنے
        کی ضرورت نہیں۔
      </p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[22rem_1fr]">
        <section className="glass h-fit p-5">
          <h2 className="heading-ur text-lg text-foreground">نیا موضوع</h2>
          <div className="mt-4">
            <CategoryForm action={createCategoryAction} mode="create" />
          </div>
        </section>

        <section>
          <h2 className="heading-ur text-lg text-foreground">
            موجودہ موضوعات ({categories.length})
          </h2>

          {categories.length === 0 ? (
            <p className="body-ur mt-3 text-sm leading-8 text-muted">
              ابھی کوئی موضوع نہیں۔ ساتھ والے خانے سے پہلا موضوع بنائیں۔
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {categories.map((category) => (
                <li
                  key={category.id}
                  className="glass flex flex-wrap items-center gap-x-4 gap-y-3 p-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="heading-ur text-lg text-foreground">
                      {category.name}
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-muted" dir="ltr">
                      /{category.slug}
                    </p>
                    <p className="body-ur text-xs leading-6 text-muted">
                      {category.kalamCount} کلام · ترتیب {category.sortOrder}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/categories/${category.id}/edit`}
                      className="body-ur tap inline-flex items-center gap-2 rounded-xl border border-hairline px-3 text-sm text-foreground transition-colors hover:border-hairline-strong"
                    >
                      <PencilSimple size={16} aria-hidden="true" />
                      ترمیم
                    </Link>

                    {/* The cascade is stated outright — an admin should never
                        learn about it by losing kalam. */}
                    <DeleteButton
                      action={deleteCategoryAction}
                      id={category.id}
                      confirmMessage={
                        category.kalamCount > 0
                          ? `«${category.name}» حذف کرنے سے اس کے ${category.kalamCount} کلام بھی ہمیشہ کے لیے حذف ہو جائیں گے۔ کیا آپ واقعی جاری رکھنا چاہتے ہیں؟`
                          : `«${category.name}» حذف کر دیا جائے؟`
                      }
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
