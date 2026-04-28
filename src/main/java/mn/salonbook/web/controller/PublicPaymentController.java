package mn.salonbook.web.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mn.salonbook.service.PaymentService;
import mn.salonbook.web.dto.InvoiceResponse;
import mn.salonbook.web.dto.PaymentStatusResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
public class PublicPaymentController {

    private final PaymentService paymentService;

    /** Generate (or return existing) QPay invoice for a booking. */
    @PostMapping("/bookings/{bookingId}/invoice")
    public InvoiceResponse createInvoice(@PathVariable Long bookingId) {
        return paymentService.getOrCreateInvoice(bookingId);
    }

    /** Polled by the frontend while the QR is shown. */
    @GetMapping("/bookings/{bookingId}/payment/status")
    public PaymentStatusResponse status(@PathVariable Long bookingId) {
        var r = paymentService.refreshAndGetStatus(bookingId);
        return new PaymentStatusResponse(
            r.bookingId(), r.paymentStatus(), r.qpayInvoiceId(), r.qpayPaymentId());
    }

    /**
     * QPay webhook. They hit this URL after the payer's bank settles.
     * Body is ignored; we always re-verify against {@code /payment/check}.
     */
    @GetMapping("/qpay/callback")
    public ResponseEntity<Void> callbackGet(@RequestParam Long bookingId) {
        log.info("QPay callback (GET) for booking {}", bookingId);
        paymentService.handleCallback(bookingId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/qpay/callback")
    public ResponseEntity<Void> callbackPost(@RequestParam Long bookingId) {
        log.info("QPay callback (POST) for booking {}", bookingId);
        paymentService.handleCallback(bookingId);
        return ResponseEntity.ok().build();
    }
}
