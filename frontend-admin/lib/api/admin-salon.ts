import { api } from "./client";
import { readSession } from "@/lib/auth/storage";

function slug(): string {
  return (
    readSession()?.user.salonSlug ??
    process.env.NEXT_PUBLIC_SALON_SLUG ??
    "maison"
  );
}

export interface AdminSalonSettings {
  id: number;
  slug: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  timezone: string;
  active: boolean;
}

export interface SalonSettingsPayload {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  timezone: string;
}

export function getSalonSettings() {
  return api<AdminSalonSettings>(`/admin/salons/${slug()}/settings`);
}

export function updateSalonSettings(payload: SalonSettingsPayload) {
  return api<AdminSalonSettings>(`/admin/salons/${slug()}/settings`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}
