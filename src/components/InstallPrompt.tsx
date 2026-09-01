"use client";

import { DeviceMobile, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

const DISMISSED_KEY = "nem:install-dismissed";

/**
 * Android/Chrome fires `beforeinstallprompt` when the site meets the
 * installability bar. Capturing it lets the invitation appear inside the app's
 * own design at a sensible moment, instead of relying on the reader finding
 * "Add to home screen" buried in the browser menu.
 *
 * Renders nothing at all on iOS (no such event) and on browsers that never
 * fire it — an install button that cannot install is worse than none.
 */
type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<InstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(DISMISSED_KEY)) return;
    } catch {
      // Storage unavailable — fall through and show it.
    }

    function onBeforeInstall(event: Event) {
      // Suppress Chrome's own mini-infobar so ours is the only invitation.
      event.preventDefault();
      setDeferred(event as InstallPromptEvent);
      setVisible(true);
    }

    function onInstalled() {
      setVisible(false);
      setDeferred(null);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      window.localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Not persisting a dismissal is a small cost; never a crash.
    }
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    // The event is single-use; Chrome will re-fire it on a later visit.
    setDeferred(null);
    setVisible(false);
  }

  if (!visible || !deferred) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="install-title"
      className="glass-strong fixed inset-x-4 bottom-4 z-40 flex items-center gap-3 p-4 sm:inset-x-auto sm:end-6 sm:max-w-sm"
    >
      <span
        aria-hidden="true"
        className="grid size-11 shrink-0 place-items-center rounded-xl bg-[color-mix(in_oklab,var(--accent-gold)_16%,transparent)] text-gold"
      >
        <DeviceMobile size={22} />
      </span>

      <div className="min-w-0 flex-1">
        <p id="install-title" className="body-ur text-sm text-foreground">
          ایپ کے طور پر شامل کریں
        </p>
        <p className="body-ur text-xs leading-6 text-muted">
          بغیر انٹرنیٹ بھی پڑھیں
        </p>
      </div>

      <button
        type="button"
        onClick={install}
        className="body-ur tap shrink-0 rounded-full bg-gold px-4 text-sm font-medium text-gold-contrast transition-opacity hover:opacity-90"
      >
        شامل کریں
      </button>

      <button
        type="button"
        onClick={dismiss}
        aria-label="بند کریں"
        className="shrink-0 rounded-lg p-1 text-muted transition-colors hover:text-foreground"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
