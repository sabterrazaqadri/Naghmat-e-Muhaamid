"use client";

import { CheckCircle, WarningCircle, X } from "@phosphor-icons/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import type { ActionState } from "@/app/admin/action-state";

const TOAST_MS = 4500;

function Toast({
  tone,
  message,
  onDismiss,
}: {
  tone: "success" | "error";
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div
      // Errors interrupt; successes wait their turn.
      role={tone === "error" ? "alert" : "status"}
      aria-live={tone === "error" ? "assertive" : "polite"}
      className="glass-strong fixed inset-x-4 bottom-6 z-50 flex items-start gap-3 p-4 sm:inset-x-auto sm:end-6 sm:max-w-sm"
    >
      <span
        aria-hidden="true"
        className={tone === "success" ? "text-gold" : "text-destructive"}
      >
        {tone === "success" ? (
          <CheckCircle size={22} weight="fill" />
        ) : (
          <WarningCircle size={22} weight="fill" />
        )}
      </span>

      <p className="flex-1 text-sm leading-7 text-foreground">
        {message}
      </p>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="shrink-0 rounded-lg p-1 text-muted transition-colors hover:text-foreground"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

/** Feedback for a form that stayed on the page (update, inline create). */
export function ActionToast({ state }: { state: ActionState }) {
  const [dismissed, setDismissed] = useState(false);

  // Each new action result re-opens the toast. Adjusting during render rather
  // than in an effect means a rapid second submit never shows the stale
  // message for a frame.
  const [shownState, setShownState] = useState(state);
  if (shownState !== state) {
    setShownState(state);
    setDismissed(false);
  }

  useEffect(() => {
    if (state.status === "idle" || dismissed) return;
    const timer = setTimeout(() => setDismissed(true), TOAST_MS);
    return () => clearTimeout(timer);
  }, [state, dismissed]);

  if (state.status === "idle" || dismissed) return null;

  return (
    <Toast
      tone={state.status === "success" ? "success" : "error"}
      message={state.message}
      onDismiss={() => setDismissed(true)}
    />
  );
}

const FLASH_MESSAGES: Record<string, string> = {
  created: "Kalam saved.",
  "category-deleted": "Topic and all its kalam were deleted.",
  "kalam-deleted": "Kalam deleted.",
};

/**
 * Feedback for a mutation that ended in a redirect — a redirect on its own
 * leaves the admin guessing whether anything happened. The parameter is
 * stripped from the URL straight away so a refresh or a shared link does not
 * replay the message.
 */
export function FlashToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const flash = searchParams.get("flash");

  // The message is copied into state rather than read from the URL on every
  // render, because the effect below immediately strips `?flash`. Deriving it
  // from searchParams would make the toast vanish the instant it appeared.
  // The initial value is captured lazily so the very first flash — the common
  // case, since we arrive here by redirect — is not missed.
  const [message, setMessage] = useState<string | null>(() =>
    flash ? (FLASH_MESSAGES[flash] ?? null) : null,
  );
  const [seenFlash, setSeenFlash] = useState(flash);

  if (seenFlash !== flash) {
    setSeenFlash(flash);
    // Clearing the param must not clear the message — only a new one replaces it.
    if (flash) setMessage(FLASH_MESSAGES[flash] ?? null);
  }

  // Strip the parameter so a refresh or a shared link cannot replay the toast.
  useEffect(() => {
    if (flash) router.replace(pathname, { scroll: false });
  }, [flash, pathname, router]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), TOAST_MS);
    return () => clearTimeout(timer);
  }, [message]);

  if (!message) return null;

  return (
    <Toast tone="success" message={message} onDismiss={() => setMessage(null)} />
  );
}
