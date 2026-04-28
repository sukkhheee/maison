import { api } from "./client";
import { readSession } from "@/lib/auth/storage";

function slug(): string {
  return (
    readSession()?.user.salonSlug ??
    process.env.NEXT_PUBLIC_SALON_SLUG ??
    "maison"
  );
}

export interface AdminStaffDetail {
  id: number;
  externalId: string;
  displayName: string;
  title: string | null;
  bio: string | null;
  avatarUrl: string | null;
  active: boolean;
  userId: number | null;
  userEmail: string | null;
  userPhone: string | null;
}

export interface StaffCreatePayload {
  displayName: string;
  title?: string;
  bio?: string;
  avatarUrl?: string;
  email: string;
  phone?: string;
}

export interface StaffUpdatePayload {
  displayName: string;
  title?: string;
  bio?: string;
  avatarUrl?: string;
  phone?: string;
  active: boolean;
}

export function listStaffDetail() {
  return api<AdminStaffDetail[]>(`/admin/salons/${slug()}/staff`);
}

export function createStaff(payload: StaffCreatePayload) {
  return api<AdminStaffDetail>(`/admin/salons/${slug()}/staff`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateStaff(id: number, payload: StaffUpdatePayload) {
  return api<AdminStaffDetail>(`/admin/salons/${slug()}/staff/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteStaff(id: number) {
  return api<void>(`/admin/salons/${slug()}/staff/${id}`, {
    method: "DELETE"
  });
}
