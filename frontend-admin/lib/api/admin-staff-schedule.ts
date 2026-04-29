import { api } from "./client";
import { readSession } from "@/lib/auth/storage";

function slug(): string {
  return (
    readSession()?.user.salonSlug ??
    process.env.NEXT_PUBLIC_SALON_SLUG ??
    "maison"
  );
}

export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface StaffScheduleEntry {
  dayOfWeek: DayOfWeek;
  /** "HH:MM" or "HH:MM:SS" — backend accepts both. */
  startTime: string;
  endTime: string;
}

export function fetchSchedule(staffId: number) {
  return api<StaffScheduleEntry[]>(
    `/admin/salons/${slug()}/staff/${staffId}/schedule`
  );
}

export function updateSchedule(
  staffId: number,
  schedule: StaffScheduleEntry[]
) {
  return api<StaffScheduleEntry[]>(
    `/admin/salons/${slug()}/staff/${staffId}/schedule`,
    {
      method: "PUT",
      body: JSON.stringify({ schedule })
    }
  );
}
