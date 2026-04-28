import { api } from "./client";
import { readSession } from "@/lib/auth/storage";

/**
 * Resolves the salon slug for the currently logged-in admin from localStorage
 * session. Falls back to the env value for local dev / storybook scenarios
 * where no real login has happened.
 */
function currentSalonSlug(): string {
  const session = readSession();
  if (session?.user.salonSlug) return session.user.salonSlug;
  return process.env.NEXT_PUBLIC_SALON_SLUG ?? "maison";
}

/* ------------------------------------------------------------------------- */
/* Types — must mirror src/main/java/mn/salonbook/web/dto/admin/*.java       */
/* ------------------------------------------------------------------------- */

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export type PaymentStatus =
  | "UNPAID"
  | "PENDING"
  | "PAID"
  | "REFUNDED"
  | "FAILED";

export interface AdminBookingDetail {
  id: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  staffExternalId: string;
  staffName: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string | null;
  serviceNames: string[];
  totalPrice: number;
  currency: string;
  createdAt: string;
}

export interface AdminStaffSummary {
  externalId: string;
  displayName: string;
  title: string | null;
  avatarUrl: string | null;
  active: boolean;
}

export interface DailyStatsResponse {
  date: string;
  todayRevenue: number;
  todayBookingCount: number;
  pendingPayments: number;
  pendingPaymentCount: number;
  newClientsToday: number;
  currency: string;
}

export interface RevenuePoint {
  date: string;
  revenue: number;
  bookingCount: number;
}

/* ------------------------------------------------------------------------- */
/* Calls                                                                      */
/* ------------------------------------------------------------------------- */

function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function listBookings(params: {
  from: Date;
  to: Date;
  status?: BookingStatus;
}) {
  const q = new URLSearchParams({
    from: ymd(params.from),
    to: ymd(params.to)
  });
  if (params.status) q.set("status", params.status);
  return api<AdminBookingDetail[]>(
    `/admin/salons/${currentSalonSlug()}/bookings?${q.toString()}`
  );
}

export function listStaff() {
  return api<AdminStaffSummary[]>(`/admin/salons/${currentSalonSlug()}/staff`);
}

export function getDailyStats(date?: Date) {
  const q = date ? `?date=${ymd(date)}` : "";
  return api<DailyStatsResponse>(
    `/admin/salons/${currentSalonSlug()}/stats/daily${q}`
  );
}

export function getWeeklyRevenue(endDate?: Date) {
  const q = endDate ? `?endDate=${ymd(endDate)}` : "";
  return api<RevenuePoint[]>(
    `/admin/salons/${currentSalonSlug()}/stats/revenue/weekly${q}`
  );
}
