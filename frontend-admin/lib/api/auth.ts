import { api } from "./client";
import type { AuthUser } from "@/lib/auth/types";

interface AuthResponseDto {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  user: AuthUser;
}

export interface RegisterSalonInput {
  salonName: string;
  salonSlug: string;
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  timezone?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export function registerSalon(input: RegisterSalonInput) {
  return api<AuthResponseDto>("/auth/register-salon", {
    method: "POST",
    body: JSON.stringify(input),
    anonymous: true
  });
}

export function login(input: LoginInput) {
  return api<AuthResponseDto>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
    anonymous: true
  });
}

export function fetchMe() {
  return api<AuthUser>("/auth/me");
}
