package mn.salonbook.web.dto.customer;

import mn.salonbook.domain.entity.Booking;
import mn.salonbook.domain.entity.Salon;
import mn.salonbook.domain.entity.ServiceItem;
import mn.salonbook.domain.enums.BookingStatus;
import mn.salonbook.domain.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Booking row for the "Миний захиалгууд" page. Adds salon + service display
 * names to the base BookingResponse so the customer page does not need extra
 * lookups.
 */
public record CustomerBookingResponse(
    Long id,
    BookingStatus status,
    PaymentStatus paymentStatus,
    Instant startTime,
    Instant endTime,
    String staffName,
    String salonSlug,
    String salonName,
    List<String> serviceNames,
    BigDecimal totalPrice,
    String currency
) {
    public static CustomerBookingResponse of(Booking b, Salon salon) {
        return new CustomerBookingResponse(
            b.getId(),
            b.getStatus(),
            b.getPaymentStatus(),
            b.getStartTime(),
            b.getEndTime(),
            b.getStaff().getDisplayName(),
            salon != null ? salon.getSlug() : null,
            salon != null ? salon.getName() : null,
            b.getServices().stream().map(ServiceItem::getName).toList(),
            b.getTotalPrice(),
            b.getCurrency()
        );
    }
}
