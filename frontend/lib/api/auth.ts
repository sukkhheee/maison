import { api } from "./client";

export type AuthUser = {
  userId: number;
  email: string;
  fullName: string;
  role: "SUPER_ADMIN" | "SALON_ADMIN" | "STAFF" | "CLIENT";
  salonId: number | null;
  salonSlug: string | null;
  salonName: string | null;
  salonTimezone: string | null;
  avatarUrl: string | null;
};

export type AuthResponse = {
  accessToken: string;
  tokenType: "Bearer";
  expiresInSeconds: number;
  user: AuthUser;
};

export function socialLogin(provider: "google", idToken: string) {
  return api<AuthResponse>("/auth/social-login", {
    method: "POST",
    body: JSON.stringify({ provider, idToken })
  });
}

export function fetchMe(token: string) {
  return api<AuthUser>("/auth/me", {
    headers: { Authorization: `Bearer ${token}` }
  });
}
