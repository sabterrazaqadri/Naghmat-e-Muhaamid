import { PencilSimple } from "@phosphor-icons/react/ssr";
import type { Metadata } from "next";
import Link from "next/link";

import { createCategoryAction, deleteCategoryAction } from "@/app/admin/actions";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { adminListCategories } from "@/db/admin-queries";

export const metadata: Metadata = { title: "Topics" };
export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await adminListCategories();

  return (
    <div>
      <h1 className="font-display text-3xl text-foreground">Topics</h1>
      <p className="text-sm leading-7 text-muted">
        Creating a topic publishes its public page automatically — no code
        change needed.
      </p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[22rem_1fr]">
        <section className="glass h-fit p-5">
          <h2 className="font-display text-xl text-foreground">New topic</h2>
          <div className="mt-4">
            <CategoryForm action={createCategoryAction} mode="create" />
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl text-foreground">
            Existing topics ({categories.length})
          </h2>

          {categories.length === 0 ? (
            <p className="mt-3 text-sm leading-7 text-muted">
              No topics yet. Create the first one using the form alongside.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {categories.map((category) => (
                <li
                  key={category.id}
                  className="glass flex flex-wrap items-center gap-x-4 gap-y-3 p-4"
                >
                  <div className="min-w-0 flex-1">
                    <p
                      lang="ur"
                      dir="rtl"
                      className="heading-ur text-lg text-foreground"
                    >
                      {category.name}
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-muted" dir="ltr">
                      /{category.slug}
                    </p>
                    <p className="text-xs leading-6 text-muted">
                      {category.kalamCount} kalam · order {category.sortOrder}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/categories/${category.id}/edit`}
                      className="tap inline-flex items-center gap-2 rounded-xl border border-hairline px-3 text-sm text-foreground transition-colors hover:border-hairline-strong"
                    >
                      <PencilSimple size={16} aria-hidden="true" />
                      Edit
                    </Link>

                    {/* The cascade is stated outright — an admin should never
                        learn about it by losing kalam. */}
                    <DeleteButton
                      action={deleteCategoryAction}
                      id={category.id}
                      confirmMessage={
                        category.kalamCount > 0
                          ? `Deleting "${category.name}" will also permanently delete its ${category.kalamCount} kalam. Continue?`
                          : `Delete "${category.name}"?`
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
