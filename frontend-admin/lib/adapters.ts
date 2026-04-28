import type { AdminBookingDetail } from "@/lib/api/admin";
import type {
  AdminBooking,
  AdminBookingStatus,
  AdminPaymentStatus
} from "@/lib/data/mockBookings";

/**
 * Adapt a backend {@link AdminBookingDetail} (string dates, array of services)
 * into the UI's {@link AdminBooking} (Date objects, single joined service line).
 *
 * <p>This is the only place where API ⇄ UI shape diverges, so refactors of
 * either side stay local.
 */
export function adaptBooking(api: AdminBookingDetail): AdminBooking {
  return {
    id: api.id,
    staffId: api.staffExternalId,
    clientName: api.clientName,
    clientPhone: api.clientPhone,
    service: api.serviceNames.join(" · ") || "—",
    start: new Date(api.startTime),
    end: new Date(api.endTime),
    status: (api.status === "NO_SHOW" ? "CANCELLED" : api.status) as AdminBookingStatus,
    paymentStatus: (api.paymentStatus === "PAID" ? "PAID" : "UNPAID") as AdminPaymentStatus,
    totalPrice: api.totalPrice
  };
}
