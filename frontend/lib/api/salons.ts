import { api } from "./client";

export interface PublicSalon {
  slug: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  timezone: string;
}

/** Directory listing — every active salon on the platform. */
export function fetchSalons(): Promise<PublicSalon[]> {
  return api<PublicSalon[]>("/public/salons");
}

/** Single salon details — used by the salon-specific landing header. */
export function fetchSalon(slug: string): Promise<PublicSalon> {
  return api<PublicSalon>(`/public/salons/${encodeURIComponent(slug)}`);
}
