"use client";

import { SignIn, WarningCircle } from "@phosphor-icons/react";
import { useActionState, useId } from "react";

import { initialActionState } from "@/app/admin/action-state";
import { loginAction } from "@/app/admin/actions";
import { SubmitButton } from "@/components/admin/SubmitButton";

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState(loginAction, initialActionState);
  const passwordId = useId();

  return (
    <form action={formAction} className="space-y-5">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      <div>
        <label
          htmlFor={passwordId}
          className="body-ur text-sm text-foreground"
        >
          پاس ورڈ
        </label>
        <input
          id={passwordId}
          name="password"
          type="password"
          dir="ltr"
          required
          autoFocus
          autoComplete="current-password"
          aria-invalid={state.status === "error" ? true : undefined}
          aria-describedby={state.status === "error" ? "login-error" : undefined}
          className={`mt-2 h-11 w-full rounded-xl border bg-elevated px-3 font-sans text-base text-foreground outline-none transition-colors focus:border-gold ${
            state.status === "error" ? "border-destructive" : "border-hairline"
          }`}
        />
      </div>

      {state.status === "error" ? (
        <p
          id="login-error"
          role="alert"
          className="body-ur flex items-start gap-2 text-sm leading-7 text-destructive"
        >
          <WarningCircle size={18} aria-hidden="true" className="mt-1 shrink-0" />
          {state.message}
        </p>
      ) : null}

      <SubmitButton
        className="w-full"
        icon={<SignIn size={16} aria-hidden="true" />}
      >
        داخل ہوں
      </SubmitButton>
    </form>
  );
}
