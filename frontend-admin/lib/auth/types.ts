export type Role = "SUPER_ADMIN" | "SALON_ADMIN" | "STAFF" | "CLIENT";

export interface AuthUser {
  userId: number;
  email: string;
  fullName: string;
  role: Role;
  salonId: number | null;
  salonSlug: string | null;
  salonName: string | null;
  salonTimezone: string | null;
}

export interface AuthSession {
  accessToken: string;
  expiresAt: number; // epoch ms
  user: AuthUser;
}
