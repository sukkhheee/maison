import { api } from "./client";

export interface CreateBookingRequest {
  staffExternalId: string;
  serviceExternalIds: string[];
  /** Local wall-clock datetime — "yyyy-MM-ddTHH:mm:ss" — interpreted in the salon's timezone. */
  startTime: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  notes?: string;
}

export interface BookingResponse {
  id: number;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  paymentStatus: "UNPAID" | "PENDING" | "PAID" | "REFUNDED" | "FAILED";
  startTime: string;
  endTime: string;
  staffExternalId: string;
  staffName: string;
  serviceExternalIds: string[];
  totalPrice: number;
  currency: string;
}

export function createBooking(salonSlug: string, req: CreateBookingRequest) {
  return api<BookingResponse>(
    `/public/salons/${encodeURIComponent(salonSlug)}/bookings`,
    {
      method: "POST",
      body: JSON.stringify(req)
    }
  );
}

/** Builds the wall-clock ISO string the backend expects from a Date + "HH:MM" pair. */
export function toLocalDateTimeString(date: Date, hhmm: string): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hhmm}:00`;
}
