import "server-only";

import { cookies } from "next/headers";

import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  timingSafeEqual,
  verifySessionToken,
} from "./session";

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

export async function startAdminSession(): Promise<boolean> {
  const token = await createSessionToken();
  if (!token) return false;

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return true;
}

export async function endAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/**
 * Best-effort in-process throttle on login attempts.
 *
 * On serverless this is per-instance rather than global, so it is a speed bump
 * and not a guarantee — which is exactly what §7 asks for ("rate-limit or at
 * minimum…"). It costs nothing and blunts casual scripted guessing.
 */
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 8;

export function registerLoginAttempt(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  entry.count += 1;

  // Opportunistic cleanup so the map cannot grow without bound.
  if (attempts.size > 500) {
    for (const [k, v] of attempts) if (v.resetAt < now) attempts.delete(k);
  }

  return entry.count <= MAX_ATTEMPTS;
}

export function clearLoginAttempts(key: string): void {
  attempts.delete(key);
}

/**
 * A wrong password and an unset ADMIN_PASSWORD both return false, and the
 * caller shows one identical message for either case (§7) — an attacker must
 * not be able to distinguish "you guessed wrong" from "this deployment is
 * misconfigured". The distinction is logged server-side instead.
 */
export function checkAdminPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    console.error(
      "[auth] ADMIN_PASSWORD is not set — admin login is disabled until it is configured.",
    );
    return false;
  }

  return timingSafeEqual(candidate, expected);
}
