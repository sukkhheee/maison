package mn.salonbook.web.dto;

import mn.salonbook.domain.entity.ServiceItem;

import java.math.BigDecimal;

/**
 * Public-facing service summary — only what the booking widget needs to
 * show + book. Crucially does NOT expose the numeric primary key.
 */
public record PublicServiceItem(
    String externalId,
    String name,
    String description,
    int durationMinutes,
    BigDecimal price,
    String currency
) {
    public static PublicServiceItem of(ServiceItem s) {
        return new PublicServiceItem(
            s.getExternalId(),
            s.getName(),
            s.getDescription(),
            s.getDurationMinutes(),
            s.getPrice(),
            s.getCurrency()
        );
    }
}
