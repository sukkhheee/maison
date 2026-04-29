import { api } from "./client";

export type CustomerBooking = {
  id: number;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  paymentStatus: "UNPAID" | "PENDING" | "PAID" | "REFUNDED" | "FAILED";
  startTime: string;
  endTime: string;
  staffName: string;
  salonSlug: string | null;
  salonName: string | null;
  serviceNames: string[];
  totalPrice: number;
  currency: string;
};

export function fetchMyBookings() {
  return api<CustomerBooking[]>("/customers/me/bookings");
}
