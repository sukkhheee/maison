package mn.salonbook.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mn.salonbook.config.QpayProperties;
import mn.salonbook.domain.entity.Booking;
import mn.salonbook.domain.enums.BookingStatus;
import mn.salonbook.domain.enums.PaymentStatus;
import mn.salonbook.repository.BookingRepository;
import mn.salonbook.service.exception.NotFoundException;
import mn.salonbook.service.qpay.QpayApiClient;
import mn.salonbook.service.qpay.QpayDtos;
import mn.salonbook.web.dto.InvoiceResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Bridge between the booking domain and the QPay merchant API.
 *
 * <p>Holds the rule: an invoice is generated lazily — first time a client asks
 * to pay, we hit QPay and persist the invoice id + qr_text on the booking, so
 * subsequent retries (page reload, second tab) reuse the same invoice instead
 * of double-charging.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final BookingRepository bookingRepo;
    private final QpayApiClient qpay;
    private final QpayProperties qpayProps;

    /**
     * Returns an invoice for the booking, creating one in QPay if not yet present.
     * Booking must be PENDING and unpaid.
     */
    @Transactional
    public InvoiceResponse getOrCreateInvoice(Long bookingId) {
        Booking booking = bookingRepo.findById(bookingId)
            .orElseThrow(() -> new NotFoundException("Booking", String.valueOf(bookingId)));

        if (booking.getPaymentStatus() == PaymentStatus.PAID) {
            // Idempotent: returning a "paid" pseudo-invoice lets the UI close the dialog gracefully.
            return new InvoiceResponse(
                booking.getId(),
                booking.getQpayInvoiceId(),
                booking.getQpayQrText(),
                null,
                null,
                booking.getTotalPrice(),
                booking.getCurrency(),
                List.of()
            );
        }

        if (booking.getQpayInvoiceId() != null) {
            log.debug("Booking {} already has invoice {}; reusing.",
                booking.getId(), booking.getQpayInvoiceId());
            return invoiceFromBooking(booking);
        }

        QpayDtos.InvoiceCreateRequest req = new QpayDtos.InvoiceCreateRequest(
            qpayProps.getInvoiceCode().isBlank() ? "MOCK_INVOICE_CODE" : qpayProps.getInvoiceCode(),
            "BK-" + booking.getId(),
            String.valueOf(booking.getClient().getId()),
            "Maison захиалга #" + booking.getId(),
            booking.getTotalPrice(),
            qpayProps.getPublicBaseUrl()
                + "/api/v1/public/qpay/callback?bookingId=" + booking.getId()
        );

        QpayDtos.InvoiceCreateResponse resp = qpay.createInvoice(req);

        booking.setQpayInvoiceId(resp.invoiceId());
        booking.setQpayQrText(resp.qrText());
        booking.setQpayInvoiceCreatedAt(Instant.now());
        booking.setPaymentStatus(PaymentStatus.PENDING);
        bookingRepo.save(booking);

        return new InvoiceResponse(
            booking.getId(),
            resp.invoiceId(),
            resp.qrText(),
            resp.qrImage(),
            resp.qpayShortUrl(),
            booking.getTotalPrice(),
            booking.getCurrency(),
            Optional.ofNullable(resp.urls()).orElse(List.of())
                .stream().map(InvoiceResponse.BankLink::from).toList()
        );
    }

    /**
     * Polls QPay for the invoice and, if paid, marks the booking as PAID + CONFIRMED.
     * Idempotent — safe to call repeatedly while the user waits in front of the QR.
     */
    @Transactional
    public PaymentStatusResult refreshAndGetStatus(Long bookingId) {
        Booking booking = bookingRepo.findById(bookingId)
            .orElseThrow(() -> new NotFoundException("Booking", String.valueOf(bookingId)));

        if (booking.getPaymentStatus() == PaymentStatus.PAID) {
            return PaymentStatusResult.of(booking);
        }
        if (booking.getQpayInvoiceId() == null) {
            return PaymentStatusResult.of(booking);
        }

        QpayDtos.PaymentCheckResponse check = qpay.checkPayment(booking.getQpayInvoiceId());
        QpayDtos.Payment paid = Optional.ofNullable(check.rows()).orElse(List.of()).stream()
            .filter(p -> "PAID".equalsIgnoreCase(p.paymentStatus()))
            .findFirst()
            .orElse(null);

        if (paid != null) {
            markPaid(booking, paid.paymentId());
        }
        return PaymentStatusResult.of(booking);
    }

    /**
     * Webhook handler — called by QPay when an invoice is settled. We trust the
     * call only enough to trigger a re-check against QPay; never mutate state
     * just from the webhook payload.
     */
    @Transactional
    public void handleCallback(Long bookingId) {
        Booking booking = bookingRepo.findById(bookingId).orElse(null);
        if (booking == null || booking.getQpayInvoiceId() == null) {
            log.warn("QPay callback for unknown booking {}", bookingId);
            return;
        }
        QpayDtos.PaymentCheckResponse check = qpay.checkPayment(booking.getQpayInvoiceId());
        Optional.ofNullable(check.rows()).orElse(List.of()).stream()
            .filter(p -> "PAID".equalsIgnoreCase(p.paymentStatus()))
            .findFirst()
            .ifPresent(p -> markPaid(booking, p.paymentId()));
    }

    private void markPaid(Booking booking, String paymentId) {
        if (booking.getPaymentStatus() == PaymentStatus.PAID) return;
        booking.setPaymentStatus(PaymentStatus.PAID);
        booking.setQpayPaymentId(paymentId);
        booking.setQpayPaidAt(Instant.now());
        // Auto-confirm the booking when payment lands.
        if (booking.getStatus() == BookingStatus.PENDING) {
            booking.setStatus(BookingStatus.CONFIRMED);
        }
        bookingRepo.save(booking);
        log.info("Booking {} marked PAID via QPay payment {}", booking.getId(), paymentId);
    }

    private InvoiceResponse invoiceFromBooking(Booking b) {
        return new InvoiceResponse(
            b.getId(),
            b.getQpayInvoiceId(),
            b.getQpayQrText(),
            null,
            null,
            b.getTotalPrice(),
            b.getCurrency(),
            List.of()
        );
    }

    public record PaymentStatusResult(
        Long bookingId,
        PaymentStatus paymentStatus,
        String qpayInvoiceId,
        String qpayPaymentId
    ) {
        public static PaymentStatusResult of(Booking b) {
            return new PaymentStatusResult(
                b.getId(),
                b.getPaymentStatus(),
                b.getQpayInvoiceId(),
                b.getQpayPaymentId()
            );
        }
    }
}
