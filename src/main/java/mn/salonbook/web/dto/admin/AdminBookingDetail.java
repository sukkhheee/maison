package mn.salonbook.web.dto.admin;

import mn.salonbook.domain.entity.Booking;
import mn.salonbook.domain.entity.ServiceItem;
import mn.salonbook.domain.enums.BookingStatus;
import mn.salonbook.domain.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Admin-facing booking row. Distinct from the public response: exposes client
 * contact info, all services in the booking, and creation timestamp — fields
 * the public widget should never see.
 */
public record AdminBookingDetail(
    Long id,
    BookingStatus status,
    PaymentStatus paymentStatus,
    Instant startTime,
    Instant endTime,
    int durationMinutes,
    String staffExternalId,
    String staffName,
    String clientName,
    String clientPhone,
    String clientEmail,
    List<String> serviceNames,
    BigDecimal totalPrice,
    String currency,
    Instant createdAt
) {
    public static AdminBookingDetail of(Booking b) {
        long durationSec = (b.getEndTime().toEpochMilli() - b.getStartTime().toEpochMilli()) / 1000;
        return new AdminBookingDetail(
            b.getId(),
            b.getStatus(),
            b.getPaymentStatus(),
            b.getStartTime(),
            b.getEndTime(),
            (int) (durationSec / 60),
            b.getStaff().getExternalId(),
            b.getStaff().getDisplayName(),
            b.getClient().getFullName(),
            b.getClient().getPhone(),
            b.getClient().getEmail(),
            b.getServices().stream().map(ServiceItem::getName).toList(),
            b.getTotalPrice(),
            b.getCurrency(),
            b.getCreatedAt()
        );
    }
}
