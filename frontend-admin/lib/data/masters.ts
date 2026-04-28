import type { AdminStaffSummary } from "@/lib/api/admin";

export type Hue = "indigo" | "rose" | "emerald" | "amber" | "sky" | "violet";

export interface AdminMaster {
  id: string;
  name: string;
  title: string;
  initials: string;
  hue: Hue;
  rating: number;
  reviewCount: number;
}

const HUES: Hue[] = ["indigo", "rose", "emerald", "amber", "sky", "violet"];

/**
 * Deterministic hue assignment from a stable id so the same staff always gets
 * the same color across reloads (and across users — important for shared UIs).
 */
function hueFromId(id: string): Hue {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return HUES[Math.abs(hash) % HUES.length];
}

function initialsFromName(name: string): string {
  // Mongolian names tend to be 1–2 words; take first letter of each word, max 2 chars.
  const parts = name.trim().split(/\s+/).slice(0, 2);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/** Convert a backend staff row to the admin UI's `AdminMaster` shape. */
export function staffToMaster(s: AdminStaffSummary): AdminMaster {
  return {
    id: s.externalId,
    name: s.displayName,
    title: s.title ?? "",
    initials: initialsFromName(s.displayName),
    hue: hueFromId(s.externalId),
    // Backend doesn't yet return ratings — placeholder until we add review aggregation.
    rating: 4.9,
    reviewCount: 0
  };
}

/* -------------------------------------------------------------------------- */
/* Tailwind class triples per hue. Listed literally so the JIT keeps them.    */
/* -------------------------------------------------------------------------- */

export const hueClasses: Record<
  Hue,
  { bg: string; border: string; text: string; ring: string; dot: string }
> = {
  indigo: {
    bg: "bg-indigo-50 dark:bg-indigo-500/10",
    border: "border-indigo-200 dark:border-indigo-500/30",
    text: "text-indigo-900 dark:text-indigo-100",
    ring: "ring-indigo-500/30",
    dot: "bg-indigo-500"
  },
  rose: {
    bg: "bg-rose-50 dark:bg-rose-500/10",
    border: "border-rose-200 dark:border-rose-500/30",
    text: "text-rose-900 dark:text-rose-100",
    ring: "ring-rose-500/30",
    dot: "bg-rose-500"
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    border: "border-emerald-200 dark:border-emerald-500/30",
    text: "text-emerald-900 dark:text-emerald-100",
    ring: "ring-emerald-500/30",
    dot: "bg-emerald-500"
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-500/10",
    border: "border-amber-200 dark:border-amber-500/30",
    text: "text-amber-900 dark:text-amber-100",
    ring: "ring-amber-500/30",
    dot: "bg-amber-500"
  },
  sky: {
    bg: "bg-sky-50 dark:bg-sky-500/10",
    border: "border-sky-200 dark:border-sky-500/30",
    text: "text-sky-900 dark:text-sky-100",
    ring: "ring-sky-500/30",
    dot: "bg-sky-500"
  },
  violet: {
    bg: "bg-violet-50 dark:bg-violet-500/10",
    border: "border-violet-200 dark:border-violet-500/30",
    text: "text-violet-900 dark:text-violet-100",
    ring: "ring-violet-500/30",
    dot: "bg-violet-500"
  }
};

/* -------------------------------------------------------------------------- */
/* Demo seed (used only as fallback when API is unavailable in storybook etc.)*/
/* -------------------------------------------------------------------------- */

export const masters: AdminMaster[] = [
  { id: "m-anu",  name: "Анужин",     title: "Senior Stylist",     initials: "АН", hue: "indigo",  rating: 4.95, reviewCount: 412 },
  { id: "m-bilg", name: "Билгүүн",    title: "Color Specialist",   initials: "БГ", hue: "rose",    rating: 4.88, reviewCount: 287 },
  { id: "m-soyo", name: "Соёлмаа",    title: "Master Artist",      initials: "СО", hue: "emerald", rating: 5.0,  reviewCount: 521 },
  { id: "m-tem",  name: "Тэмүүлэн",   title: "Barber & Cut",       initials: "ТМ", hue: "amber",   rating: 4.9,  reviewCount: 198 },
  { id: "m-ode",  name: "Одончимэг",  title: "Nail Artist",        initials: "ОД", hue: "sky",     rating: 4.92, reviewCount: 342 },
  { id: "m-ulm",  name: "Уламбаяр",   title: "Spa Therapist",      initials: "УЛ", hue: "violet",  rating: 4.95, reviewCount: 156 }
];
