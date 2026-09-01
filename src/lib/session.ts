/**
 * Admin session tokens.
 *
 * Deliberately free of `next/headers` and of any Node-only API: this module is
 * imported by proxy.ts as well as by server actions, so it sticks to Web
 * Crypto and plain strings. Cookie plumbing lives in lib/auth.ts.
 *
 * Token format:  base64url(payload) "." base64url(HMAC-SHA256(payload))
 * There is nothing secret in the payload — the signature is what makes it
 * unforgeable, and `exp` is what makes it expire.
 */

export const SESSION_COOKIE = "nem_admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 12; // 12 hours

type SessionPayload = {
  /** Issued-at, epoch seconds. */
  iat: number;
  /** Expiry, epoch seconds. */
  exp: number;
};

function getSecret(): string | null {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) return null;
  return secret;
}

const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hmac(secret: string, data: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return new Uint8Array(sig);
}

/** Length-independent, early-exit-free comparison. */
export function timingSafeEqual(a: string, b: string): boolean {
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);

  // Compare a fixed-width digest of each side so differing lengths do not
  // short-circuit and leak the true length through timing.
  let diff = aBytes.length ^ bBytes.length;
  const len = Math.max(aBytes.length, bBytes.length);
  for (let i = 0; i < len; i++) {
    diff |= (aBytes[i] ?? 0) ^ (bBytes[i] ?? 0);
  }
  return diff === 0;
}

export async function createSessionToken(): Promise<string | null> {
  const secret = getSecret();
  if (!secret) return null;

  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = { iat: now, exp: now + SESSION_MAX_AGE };
  const encoded = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = toBase64Url(await hmac(secret, encoded));

  return `${encoded}.${signature}`;
}

export async function verifySessionToken(
  token: string | undefined | null,
): Promise<boolean> {
  if (!token) return false;

  const secret = getSecret();
  if (!secret) return false;

  const dot = token.indexOf(".");
  if (dot <= 0) return false;

  const encoded = token.slice(0, dot);
  const signature = token.slice(dot + 1);

  const expected = toBase64Url(await hmac(secret, encoded));
  if (!timingSafeEqual(signature, expected)) return false;

  try {
    const payload = JSON.parse(
      new TextDecoder().decode(fromBase64Url(encoded)),
    ) as SessionPayload;

    return (
      typeof payload.exp === "number" &&
      payload.exp > Math.floor(Date.now() / 1000)
    );
  } catch {
    return false;
  }
}
