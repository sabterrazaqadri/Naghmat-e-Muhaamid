"use client";

import { FloppyDisk, Plus } from "@phosphor-icons/react";
import Link from "next/link";
import { useActionState, useId } from "react";

import { initialActionState, type ActionState } from "@/app/admin/action-state";
import { ActionToast } from "@/components/admin/ActionToast";
import { Field, inputClass, inputErrorClass } from "@/components/admin/Field";
import { LyricsField } from "@/components/admin/LyricsField";
import { SubmitButton } from "@/components/admin/SubmitButton";

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  mode: "create" | "edit";
  categories: Array<{ id: string; name: string }>;
  initial?: {
    id: string;
    title: string;
    slug: string;
    lyrics: string;
    categoryId: string;
    isFeatured: boolean;
  };
};

export function KalamForm({ action, mode, categories, initial }: Props) {
  const [state, formAction] = useActionState(action, initialActionState);
  const baseId = useId();

  const titleId = `${baseId}-title`;
  const categoryId = `${baseId}-category`;
  const slugId = `${baseId}-slug`;

  return (
    <>
      <form action={formAction} className="space-y-6">
        {initial ? <input type="hidden" name="id" value={initial.id} /> : null}

        <Field
          id={titleId}
          label="Title"
          required
          error={state.fieldErrors?.title}
        >
          <input
            id={titleId}
            name="title"
            lang="ur"
            dir="rtl"
            defaultValue={initial?.title}
            required
            aria-invalid={state.fieldErrors?.title ? true : undefined}
            aria-describedby={
              state.fieldErrors?.title ? `${titleId}-error` : undefined
            }
            className={state.fieldErrors?.title ? inputErrorClass : inputClass}
          />
        </Field>

        <Field
          id={categoryId}
          label="Topic"
          required
          error={state.fieldErrors?.categoryId}
        >
          <select
            id={categoryId}
            name="categoryId"
            lang="ur"
            dir="rtl"
            defaultValue={initial?.categoryId ?? ""}
            required
            aria-invalid={state.fieldErrors?.categoryId ? true : undefined}
            className={
              state.fieldErrors?.categoryId ? inputErrorClass : inputClass
            }
          >
            {/* No trailing ellipsis: the select is RTL for the Urdu topic
                names, which would throw the "…" to the wrong end. */}
            <option value="" disabled>
              Choose a topic
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>

        <Field
          id={slugId}
          label="URL slug"
          hint="Leave blank to generate it from the title."
        >
          <input
            id={slugId}
            name="slug"
            dir="ltr"
            defaultValue={initial?.slug}
            className={`${inputClass} font-mono text-sm`}
          />
        </Field>

        <LyricsField
          defaultValue={initial?.lyrics}
          error={state.fieldErrors?.lyrics}
        />

        <label className="glass flex cursor-pointer items-start gap-3 p-4">
          <input
            type="checkbox"
            name="isFeatured"
            defaultChecked={initial?.isFeatured}
            className="mt-1 size-4 accent-[var(--accent-gold)]"
          />
          <span>
            <span className="block text-sm text-foreground">
              Feature as “Kalam of the day”
            </span>
            <span className="block text-xs leading-6 text-muted">
              Featured kalam appear on the home page. With more than one
              featured, they rotate daily.
            </span>
          </span>
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <SubmitButton
            icon={
              mode === "create" ? (
                <Plus size={16} aria-hidden="true" />
              ) : (
                <FloppyDisk size={16} aria-hidden="true" />
              )
            }
          >
            {mode === "create" ? "Add kalam" : "Save changes"}
          </SubmitButton>

          <Link
            href="/admin/kalam"
            className="tap inline-flex items-center rounded-xl border border-hairline px-4 text-sm text-foreground transition-colors hover:border-hairline-strong"
          >
            Back
          </Link>

          {mode === "edit" && initial ? (
            <Link
              href={`/kalam/${encodeURIComponent(initial.slug)}`}
              target="_blank"
              className="tap ms-auto inline-flex items-center text-sm text-muted transition-colors hover:text-foreground"
            >
              View on site ↗
            </Link>
          ) : null}
        </div>
      </form>

      <ActionToast state={state} />
    </>
  );
}
