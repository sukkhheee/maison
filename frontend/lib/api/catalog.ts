import { api } from "./client";
import type { ServiceItem, ServiceCategory } from "@/lib/data/services";
import type { Master } from "@/lib/data/masters";

const SALON_SLUG =
  process.env.NEXT_PUBLIC_SALON_SLUG ?? "maison";

interface PublicServiceDto {
  externalId: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: number;
  currency: "MNT" | string;
}

interface PublicStaffDto {
  externalId: string;
  displayName: string;
  title: string | null;
  bio: string | null;
  avatarUrl: string | null;
}

export async function fetchServices(): Promise<ServiceItem[]> {
  const dto = await api<PublicServiceDto[]>(
    `/public/salons/${SALON_SLUG}/services`
  );
  return dto.map(toService);
}

export async function fetchMasters(): Promise<Master[]> {
  const dto = await api<PublicStaffDto[]>(
    `/public/salons/${SALON_SLUG}/staff`
  );
  // The "any master" sentinel is dropped for now: backend has no auto-pick
  // logic so the simpler UX is to let the customer always pick explicitly.
  return dto.map(toMaster);
}

/* -------------------------------------------------------------------------- */
/* Adapters: API DTO → existing UI shapes                                      */
/* -------------------------------------------------------------------------- */

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80"
];

const PLACEHOLDER_AVATARS = [
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1545996124-0501ebae84d0?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80"
];

function toService(dto: PublicServiceDto): ServiceItem {
  return {
    id: dto.externalId,
    name: dto.name,
    description: dto.description ?? "",
    durationMinutes: dto.durationMinutes,
    price: dto.price,
    currency: "MNT",
    // Backend doesn't model categories yet — bucket everything under "hair".
    // Future: add a `category` column to ServiceItem and persist it.
    category: "hair" as ServiceCategory,
    image: pickImage(dto.externalId, PLACEHOLDER_IMAGES)
  };
}

function toMaster(dto: PublicStaffDto): Master {
  return {
    id: dto.externalId,
    name: dto.displayName,
    title: dto.title ?? "",
    avatar: dto.avatarUrl || pickImage(dto.externalId, PLACEHOLDER_AVATARS),
    // Backend doesn't expose ratings yet — placeholder until review aggregation lands.
    rating: 4.9,
    reviewCount: 0,
    yearsExperience: 0,
    specialties: dto.bio ? dto.bio.split(",").map((s) => s.trim()).slice(0, 2) : [],
    fromPrice: 0
  };
}

/** Deterministic image pick from id → keeps the same service/staff visually consistent across reloads. */
function pickImage(seed: string, pool: string[]): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return pool[Math.abs(hash) % pool.length];
}
