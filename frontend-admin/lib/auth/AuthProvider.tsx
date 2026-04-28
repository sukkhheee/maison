"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import {
  fetchMe,
  login as loginApi,
  registerSalon as registerSalonApi,
  type LoginInput,
  type RegisterSalonInput
} from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { clearSession, readSession, writeSession } from "./storage";
import type { AuthSession, AuthUser } from "./types";

type Status = "loading" | "authenticated" | "anonymous";

interface AuthContextValue {
  status: Status;
  user: AuthUser | null;
  login: (input: LoginInput) => Promise<AuthUser>;
  registerSalon: (input: RegisterSalonInput) => Promise<AuthUser>;
  logout: () => void;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);

  // On mount: hydrate from localStorage, then validate the token via /me.
  useEffect(() => {
    const session = readSession();
    if (!session) {
      setStatus("anonymous");
      return;
    }
    setUser(session.user);
    fetchMe()
      .then((fresh) => {
        setUser(fresh);
        writeSession({ ...session, user: fresh });
        setStatus("authenticated");
      })
      .catch(() => {
        // Token invalid — clear and fall back to anonymous.
        clearSession();
        setUser(null);
        setStatus("anonymous");
      });
  }, []);

  const persist = useCallback((session: AuthSession) => {
    writeSession(session);
    setUser(session.user);
    setStatus("authenticated");
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const res = await loginApi(input);
    persist({
      accessToken: res.accessToken,
      expiresAt: Date.now() + res.expiresInSeconds * 1000,
      user: res.user
    });
    return res.user;
  }, [persist]);

  const registerSalon = useCallback(async (input: RegisterSalonInput) => {
    const res = await registerSalonApi(input);
    persist({
      accessToken: res.accessToken,
      expiresAt: Date.now() + res.expiresInSeconds * 1000,
      user: res.user
    });
    return res.user;
  }, [persist]);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setStatus("anonymous");
  }, []);

  const refreshMe = useCallback(async () => {
    try {
      const fresh = await fetchMe();
      const session = readSession();
      if (session) writeSession({ ...session, user: fresh });
      setUser(fresh);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) logout();
    }
  }, [logout]);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, login, registerSalon, logout, refreshMe }),
    [status, user, login, registerSalon, logout, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
