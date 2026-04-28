package mn.salonbook.service.qpay;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.util.List;

/**
 * Wire DTOs for the QPay merchant v2 API. Only the fields we use are mapped;
 * unknown fields are tolerated so QPay can ship additions without breaking us.
 */
public final class QpayDtos {
    private QpayDtos() {}

    /* ------------------------------------------------------------------ */
    /* Auth                                                                */
    /* ------------------------------------------------------------------ */

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record TokenResponse(
        @JsonProperty("access_token") String accessToken,
        @JsonProperty("refresh_token") String refreshToken,
        @JsonProperty("expires_in") Long expiresIn,
        @JsonProperty("refresh_expires_in") Long refreshExpiresIn,
        @JsonProperty("token_type") String tokenType
    ) {
    }

    /* ------------------------------------------------------------------ */
    /* Invoice                                                             */
    /* ------------------------------------------------------------------ */

    public record InvoiceCreateRequest(
        @JsonProperty("invoice_code") String invoiceCode,
        @JsonProperty("sender_invoice_no") String senderInvoiceNo,
        @JsonProperty("invoice_receiver_code") String invoiceReceiverCode,
        @JsonProperty("invoice_description") String invoiceDescription,
        BigDecimal amount,
        @JsonProperty("callback_url") String callbackUrl
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record InvoiceCreateResponse(
        @JsonProperty("invoice_id") String invoiceId,
        @JsonProperty("qr_text") String qrText,
        @JsonProperty("qr_image") String qrImage,
        @JsonProperty("qPay_shortUrl") String qpayShortUrl,
        List<BankUrl> urls
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record BankUrl(
        String name,
        String description,
        String logo,
        String link
    ) {
    }

    /* ------------------------------------------------------------------ */
    /* Payment check                                                       */
    /* ------------------------------------------------------------------ */

    public record PaymentCheckRequest(
        @JsonProperty("object_type") String objectType,
        @JsonProperty("object_id") String objectId,
        Offset offset
    ) {
        public record Offset(
            @JsonProperty("page_number") int pageNumber,
            @JsonProperty("page_limit") int pageLimit
        ) {
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record PaymentCheckResponse(
        @JsonProperty("count") int count,
        @JsonProperty("paid_amount") BigDecimal paidAmount,
        List<Payment> rows
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Payment(
        @JsonProperty("payment_id") String paymentId,
        @JsonProperty("payment_status") String paymentStatus,
        @JsonProperty("payment_amount") BigDecimal paymentAmount,
        @JsonProperty("payment_date") String paymentDate
    ) {
    }
}
