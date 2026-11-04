/**
 * Admin password gate — Edge-safe (Web Crypto only), shared by middleware and the login action.
 *
 * Session cookie value: `<expiresAtSeconds>.<hex HMAC-SHA256(expiresAt)>`, keyed by ADMIN_SESSION_SECRET
 * (or ADMIN_PASSWORD when that is not set). Changing the password signs everyone out.
 */
export const SESSION_COOKIE = "ch_admin_session";
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

const enc = new TextEncoder();

export function adminPassword() {
  return process.env.ADMIN_PASSWORD || "";
}

/** In production the admin is locked unless ADMIN_PASSWORD is set. In local dev it's open if unset. */
export function authMode(): "on" | "off" | "misconfigured" {
  if (adminPassword()) return "on";
  return process.env.NODE_ENV === "production" ? "misconfigured" : "off";
}

function signingSecret() {
  return `cheshire-admin:${process.env.ADMIN_SESSION_SECRET || adminPassword()}`;
}

function toHex(buf: ArrayBuffer) {
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

async function hmac(message: string, secret = signingSecret()) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return toHex(await crypto.subtle.sign("HMAC", key, enc.encode(message)));
}

/** Length-independent constant-time comparison of two strings (compares their SHA-256 digests). */
export async function safeEqual(a: string, b: string) {
  const [ha, hb] = await Promise.all([crypto.subtle.digest("SHA-256", enc.encode(a)), crypto.subtle.digest("SHA-256", enc.encode(b))]);
  const x = new Uint8Array(ha);
  const y = new Uint8Array(hb);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

export async function createSessionToken(now = Date.now()) {
  const exp = Math.floor(now / 1000) + SESSION_TTL_SECONDS;
  return `${exp}.${await hmac(String(exp))}`;
}

export async function verifySessionToken(token: string | undefined, now = Date.now()) {
  if (!token || !adminPassword()) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || !/^\d+$/.test(exp) || Number(exp) * 1000 < now) return false;
  return safeEqual(sig, await hmac(exp));
}

/** Only allow same-site relative redirects after login. */
export function safeNext(next: string | null | undefined) {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\") || next.startsWith("/login")) return "/";
  return next;
}
