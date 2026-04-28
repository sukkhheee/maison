package mn.salonbook.web.dto;

import mn.salonbook.service.qpay.QpayDtos;

import java.math.BigDecimal;
import java.util.List;

public record InvoiceResponse(
    Long bookingId,
    String invoiceId,
    String qrText,
    String qrImage,
    String shortUrl,
    BigDecimal amount,
    String currency,
    List<BankLink> bankLinks
) {
    public record BankLink(String name, String description, String logo, String link) {
        public static BankLink from(QpayDtos.BankUrl u) {
            return new BankLink(u.name(), u.description(), u.logo(), u.link());
        }
    }
}
