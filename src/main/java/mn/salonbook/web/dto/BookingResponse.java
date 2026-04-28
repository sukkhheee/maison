package mn.salonbook.web.dto;

import mn.salonbook.domain.entity.Booking;
import mn.salonbook.domain.entity.ServiceItem;
import mn.salonbook.domain.enums.BookingStatus;
import mn.salonbook.domain.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record BookingResponse(
    Long id,
    BookingStatus status,
    PaymentStatus paymentStatus,
    Instant startTime,
    Instant endTime,
    String staffExternalId,
    String staffName,
    List<String> serviceExternalIds,
    BigDecimal totalPrice,
    String currency
) {
    public static BookingResponse of(Booking b) {
        return new BookingResponse(
            b.getId(),
            b.getStatus(),
            b.getPaymentStatus(),
            b.getStartTime(),
            b.getEndTime(),
            b.getStaff().getExternalId(),
            b.getStaff().getDisplayName(),
            b.getServices().stream().map(ServiceItem::getExternalId).toList(),
            b.getTotalPrice(),
            b.getCurrency()
        );
    }
}
