"use client";

import { useSyncExternalStore } from "react";

/** Never changes, so React never resubscribes. */
const noopSubscribe = () => () => {};

/**
 * Reads a value that only exists in the browser (navigator, screen, …) without
 * an effect and without a hydration mismatch.
 *
 * React renders `serverValue` on the server and on the hydrating client pass,
 * then swaps to `getClientValue()` — which is exactly the contract
 * `useSyncExternalStore` exists to provide. Copying the value into state
 * inside an effect would do the same thing with an extra render and a lint
 * violation.
 *
 * `getClientValue` must return a primitive (or a stable reference); an object
 * literal rebuilt each call would loop forever.
 */
export function useClientValue<T>(getClientValue: () => T, serverValue: T): T {
  return useSyncExternalStore(
    noopSubscribe,
    getClientValue,
    () => serverValue,
  );
}
