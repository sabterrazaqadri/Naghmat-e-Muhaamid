"use client";

import { FloppyDisk, Plus } from "@phosphor-icons/react";
import { useActionState, useEffect, useId, useRef } from "react";

import { initialActionState, type ActionState } from "@/app/admin/action-state";
import { ActionToast } from "@/components/admin/ActionToast";
import { Field, inputClass, inputErrorClass } from "@/components/admin/Field";
import { SubmitButton } from "@/components/admin/SubmitButton";

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  mode: "create" | "edit";
  initial?: { id: string; name: string; slug: string; sortOrder: number };
};

export function CategoryForm({ action, mode, initial }: Props) {
  const [state, formAction] = useActionState(action, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);
  const baseId = useId();

  // A create form that keeps the previous values invites accidental duplicates.
  useEffect(() => {
    if (mode === "create" && state.status === "success") {
      formRef.current?.reset();
    }
  }, [mode, state]);

  const nameId = `${baseId}-name`;
  const slugId = `${baseId}-slug`;
  const sortId = `${baseId}-sort`;

  return (
    <>
      <form ref={formRef} action={formAction} className="space-y-5">
        {initial ? <input type="hidden" name="id" value={initial.id} /> : null}

        <Field
          id={nameId}
          label="نام"
          required
          error={state.fieldErrors?.name}
          hint="صفحے پر یہی نام دکھایا جائے گا، مثلاً: نعت"
        >
          <input
            id={nameId}
            name="name"
            dir="rtl"
            defaultValue={initial?.name}
            required
            aria-invalid={state.fieldErrors?.name ? true : undefined}
            aria-describedby={
              state.fieldErrors?.name ? `${nameId}-error` : undefined
            }
            className={state.fieldErrors?.name ? inputErrorClass : inputClass}
          />
        </Field>

        <Field
          id={slugId}
          label="ویب پتا (slug)"
          hint="خالی چھوڑ دیں تو نام سے خود بن جائے گا۔ اردو حروف بھی چلتے ہیں۔"
        >
          <input
            id={slugId}
            name="slug"
            dir="ltr"
            defaultValue={initial?.slug}
            placeholder="naat"
            className={`${inputClass} font-mono text-sm`}
          />
        </Field>

        <Field
          id={sortId}
          label="ترتیب"
          hint="چھوٹا نمبر پہلے دکھایا جاتا ہے۔"
        >
          <input
            id={sortId}
            name="sortOrder"
            type="number"
            dir="ltr"
            defaultValue={initial?.sortOrder ?? 0}
            className={`${inputClass} font-mono text-sm`}
          />
        </Field>

        <SubmitButton
          icon={
            mode === "create" ? (
              <Plus size={16} aria-hidden="true" />
            ) : (
              <FloppyDisk size={16} aria-hidden="true" />
            )
          }
        >
          {mode === "create" ? "موضوع بنائیں" : "محفوظ کریں"}
        </SubmitButton>
      </form>

      <ActionToast state={state} />
    </>
  );
}
