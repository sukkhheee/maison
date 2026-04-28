import { api } from "./client";
import { readSession } from "@/lib/auth/storage";

function slug(): string {
  return (
    readSession()?.user.salonSlug ??
    process.env.NEXT_PUBLIC_SALON_SLUG ??
    "maison"
  );
}

export interface AdminServiceItem {
  id: number;
  externalId: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: number;
  currency: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceCreatePayload {
  name: string;
  description?: string;
  price: number;
  durationMinutes: number;
  currency?: string;
  externalId?: string;
  active?: boolean;
}

export interface ServiceUpdatePayload {
  name: string;
  description?: string;
  price: number;
  durationMinutes: number;
  currency?: string;
  active: boolean;
}

export function listServices() {
  return api<AdminServiceItem[]>(`/admin/salons/${slug()}/services`);
}

export function createService(payload: ServiceCreatePayload) {
  return api<AdminServiceItem>(`/admin/salons/${slug()}/services`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateService(id: number, payload: ServiceUpdatePayload) {
  return api<AdminServiceItem>(`/admin/salons/${slug()}/services/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteService(id: number) {
  return api<void>(`/admin/salons/${slug()}/services/${id}`, {
    method: "DELETE"
  });
}
