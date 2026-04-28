package mn.salonbook.web.dto;

import mn.salonbook.domain.enums.PaymentStatus;

public record PaymentStatusResponse(
    Long bookingId,
    PaymentStatus paymentStatus,
    String qpayInvoiceId,
    String qpayPaymentId
) {
}
