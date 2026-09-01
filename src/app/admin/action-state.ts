/**
 * Shared shape for every admin form result.
 *
 * Lives outside actions.ts because a `"use server"` module may only export
 * async functions — a plain const there is a build error.
 */
export type ActionState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Record<string, string>;
};

export const initialActionState: ActionState = { status: "idle", message: "" };
