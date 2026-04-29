"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import type { AuthUser } from "@/lib/api/auth";

/**
 * Lightweight auth state for the customer app. Token + profile live in
 * localStorage so the user stays signed in across reloads; there is no
 * refresh-token flow yet — when the backend JWT expires (default 24h) the
 * next protected fetch returns 401 and we drop the session.
 *
 * For higher security (HttpOnly cookies) we'd need a Next.js API route to
 * proxy auth — out of scope for this iteration.
 */

const TOKEN_KEY = "maison.auth.token";
const USER_KEY = "maison.auth.user";

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  ready: boolean;
  signIn: (token: string, user: AuthUser) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    try {
      const t = window.localStorage.getItem(TOKEN_KEY);
      const u = window.localStorage.getItem(USER_KEY);
      if (t && u) {
        setToken(t);
        setUser(JSON.parse(u) as AuthUser);
      }
    } catch {
      /* ignore corrupt local storage */
    } finally {
      setReady(true);
    }
  }, []);

  const signIn = useCallback((nextToken: string, nextUser: AuthUser) => {
    window.localStorage.setItem(TOKEN_KEY, nextToken);
    window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const signOut = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ token, user, ready, signIn, signOut }),
    [token, user, ready, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}

/** Read the token outside of React (for one-off fetch helpers). */
export function readAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}
