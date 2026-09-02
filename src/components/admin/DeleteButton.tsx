"use client";

import { Trash } from "@phosphor-icons/react";

import { SubmitButton } from "@/components/admin/SubmitButton";

/**
 * Destructive actions always confirm first. For a category the message spells
 * out the cascade — the FK drops every kalam inside it, and that is not
 * something an admin should discover afterwards.
 */
export function DeleteButton({
  action,
  id,
  confirmMessage,
  label = "Delete",
  compact = false,
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  confirmMessage: string;
  label?: string;
  compact?: boolean;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <SubmitButton tone="danger" icon={<Trash size={16} aria-hidden="true" />}>
        {compact ? <span className="sr-only">{label}</span> : label}
      </SubmitButton>
    </form>
  );
}
