import type { AuthSession } from "./types";

/**
 * Persists the auth session in localStorage. We deliberately keep the token in
 * JS-readable storage (not httpOnly cookies) since the admin SPA needs it on
 * every fetch from client components. Tradeoff: vulnerable to XSS, so all
 * user-rendered HTML in this app must be sanitized.
 *
 * For production we should switch to httpOnly cookies + a `/api/auth/refresh`
 * endpoint that mints short-lived access tokens.
 */
const KEY = "salonbook.admin.session";

export function readSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed?.accessToken || !parsed?.user || !parsed?.expiresAt) return null;
    if (Date.now() > parsed.expiresAt) {
      window.localStorage.removeItem(KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeSession(session: AuthSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(session));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

export function readToken(): string | null {
  return readSession()?.accessToken ?? null;
}
