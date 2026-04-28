package mn.salonbook.service.qpay;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mn.salonbook.config.QpayProperties;
import mn.salonbook.service.qpay.QpayDtos.InvoiceCreateRequest;
import mn.salonbook.service.qpay.QpayDtos.InvoiceCreateResponse;
import mn.salonbook.service.qpay.QpayDtos.PaymentCheckRequest;
import mn.salonbook.service.qpay.QpayDtos.PaymentCheckResponse;
import mn.salonbook.service.qpay.QpayDtos.TokenResponse;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;

/**
 * Thin client for the QPay merchant v2 API.
 *
 * <ul>
 *   <li>Caches the access token until ~30 seconds before expiry, then refreshes.</li>
 *   <li>Falls back to a deterministic mock when credentials are absent — lets the
 *       full booking flow work in local dev without a QPay merchant account.</li>
 * </ul>
 *
 * <p>This class is intentionally synchronous (RestTemplate); QPay calls happen
 * inside a request thread that is already blocking on JPA, so reactive WebClient
 * adds complexity without buying us anything.
 */
@Slf4j
@Service
public class QpayApiClient {

    private final QpayProperties props;
    private final RestTemplate restTemplate;

    private volatile String cachedAccessToken;
    private volatile Instant cachedAccessTokenExpiresAt = Instant.EPOCH;

    public QpayApiClient(QpayProperties props, RestTemplateBuilder builder) {
        this.props = props;
        this.restTemplate = builder
            .setConnectTimeout(Duration.ofSeconds(5))
            .setReadTimeout(Duration.ofSeconds(15))
            .build();
    }

    /* ====================================================================== */
    /* Public API                                                              */
    /* ====================================================================== */

    public InvoiceCreateResponse createInvoice(InvoiceCreateRequest request) {
        if (props.isMockMode()) {
            return mockInvoice(request);
        }
        try {
            HttpHeaders headers = bearer();
            return restTemplate.exchange(
                props.getBaseUrl() + "/invoice",
                HttpMethod.POST,
                new HttpEntity<>(request, headers),
                InvoiceCreateResponse.class
            ).getBody();
        } catch (HttpStatusCodeException e) {
            log.error("QPay /invoice failed: status={} body={}",
                e.getStatusCode(), e.getResponseBodyAsString());
            throw new QpayException("QPay invoice creation failed", e);
        }
    }

    public PaymentCheckResponse checkPayment(String invoiceId) {
        if (props.isMockMode()) {
            return mockPaymentCheck(invoiceId);
        }
        try {
            HttpHeaders headers = bearer();
            PaymentCheckRequest body = new PaymentCheckRequest(
                "INVOICE", invoiceId,
                new PaymentCheckRequest.Offset(1, 100)
            );
            return restTemplate.exchange(
                props.getBaseUrl() + "/payment/check",
                HttpMethod.POST,
                new HttpEntity<>(body, headers),
                PaymentCheckResponse.class
            ).getBody();
        } catch (HttpStatusCodeException e) {
            log.error("QPay /payment/check failed: status={} body={}",
                e.getStatusCode(), e.getResponseBodyAsString());
            throw new QpayException("QPay payment check failed", e);
        }
    }

    /* ====================================================================== */
    /* Auth                                                                    */
    /* ====================================================================== */

    private HttpHeaders bearer() {
        HttpHeaders h = new HttpHeaders();
        h.setContentType(MediaType.APPLICATION_JSON);
        h.setBearerAuth(getAccessToken());
        return h;
    }

    private synchronized String getAccessToken() {
        if (cachedAccessToken != null
            && Instant.now().isBefore(cachedAccessTokenExpiresAt.minusSeconds(30))) {
            return cachedAccessToken;
        }
        TokenResponse token = fetchToken();
        cachedAccessToken = token.accessToken();
        long ttl = token.expiresIn() != null ? token.expiresIn() : 3600;
        cachedAccessTokenExpiresAt = Instant.now().plusSeconds(ttl);
        log.info("QPay token refreshed; expires in {}s", ttl);
        return cachedAccessToken;
    }

    private TokenResponse fetchToken() {
        String basic = Base64.getEncoder().encodeToString(
            (props.getUsername() + ":" + props.getPassword()).getBytes(StandardCharsets.UTF_8));
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Basic " + basic);
        headers.setContentType(MediaType.APPLICATION_JSON);
        try {
            return restTemplate.exchange(
                props.getBaseUrl() + "/auth/token",
                HttpMethod.POST,
                new HttpEntity<>(null, headers),
                TokenResponse.class
            ).getBody();
        } catch (HttpStatusCodeException e) {
            log.error("QPay /auth/token failed: status={} body={}",
                e.getStatusCode(), e.getResponseBodyAsString());
            throw new QpayException("QPay auth failed", e);
        }
    }

    /* ====================================================================== */
    /* Mock mode (dev convenience)                                             */
    /* ====================================================================== */

    /**
     * In-memory store of mock invoices so {@link #checkPayment} can simulate
     * "payment received after N seconds".
     */
    private final java.util.concurrent.ConcurrentHashMap<String, Instant> mockInvoiceCreatedAt =
        new java.util.concurrent.ConcurrentHashMap<>();

    private InvoiceCreateResponse mockInvoice(InvoiceCreateRequest req) {
        String id = "mock-" + UUID.randomUUID();
        mockInvoiceCreatedAt.put(id, Instant.now());
        log.warn("QPay running in MOCK mode (no credentials). Invoice {} will auto-pay in ~10s.", id);
        // The QR text encodes a fake "qpay://" deep link. Real merchants get
        // qpay://q?<base64-payload> back from QPay; the format here is just for
        // visual fidelity in dev.
        String qrText = "qpay://mock?invoice=" + id + "&amount=" + req.amount();
        return new InvoiceCreateResponse(
            id,
            qrText,
            null,                        // no qr_image in mock
            "https://qpay.mn/short/" + id,
            java.util.List.of(
                new QpayDtos.BankUrl("Khan Bank", "Хаан Банк", null, qrText),
                new QpayDtos.BankUrl("State Bank", "Төрийн Банк", null, qrText),
                new QpayDtos.BankUrl("Golomt", "Голомт Банк", null, qrText),
                new QpayDtos.BankUrl("MonPay", "MonPay", null, qrText),
                new QpayDtos.BankUrl("SocialPay", "SocialPay", null, qrText)
            )
        );
    }

    private PaymentCheckResponse mockPaymentCheck(String invoiceId) {
        Instant created = mockInvoiceCreatedAt.get(invoiceId);
        boolean paid = created != null && Instant.now().isAfter(created.plusSeconds(10));
        if (paid) {
            QpayDtos.Payment p = new QpayDtos.Payment(
                "pay-" + invoiceId,
                "PAID",
                java.math.BigDecimal.ZERO,
                Instant.now().toString()
            );
            return new PaymentCheckResponse(1, java.math.BigDecimal.ZERO, java.util.List.of(p));
        }
        return new PaymentCheckResponse(0, java.math.BigDecimal.ZERO, java.util.List.of());
    }
}
