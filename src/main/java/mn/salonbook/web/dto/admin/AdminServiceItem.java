package mn.salonbook.web.dto.admin;

import mn.salonbook.domain.entity.ServiceItem;

import java.math.BigDecimal;
import java.time.Instant;

public record AdminServiceItem(
    Long id,
    String externalId,
    String name,
    String description,
    int durationMinutes,
    BigDecimal price,
    String currency,
    boolean active,
    Instant createdAt,
    Instant updatedAt
) {
    public static AdminServiceItem of(ServiceItem s) {
        return new AdminServiceItem(
            s.getId(),
            s.getExternalId(),
            s.getName(),
            s.getDescription(),
            s.getDurationMinutes(),
            s.getPrice(),
            s.getCurrency(),
            s.isActive(),
            s.getCreatedAt(),
            s.getUpdatedAt()
        );
    }
}
