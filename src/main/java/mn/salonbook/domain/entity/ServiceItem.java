package mn.salonbook.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * A bookable service offered by a salon (e.g. "Үс засуулах", "Маникюр").
 * Named ServiceItem to avoid clashing with Spring's @Service stereotype
 * and the SQL reserved word "service".
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
    name = "services",
    uniqueConstraints = {
        @jakarta.persistence.UniqueConstraint(
            name = "uk_services_external_id_salon",
            columnNames = {"external_id", "salon_id"})
    },
    indexes = {
        @Index(name = "idx_services_salon", columnList = "salon_id"),
        @Index(name = "idx_services_active", columnList = "active"),
        @Index(name = "idx_services_external_id", columnList = "external_id")
    }
)
public class ServiceItem extends TenantAwareEntity {

    /** Stable client-facing identifier (e.g. "svc-signature-cut"). */
    @Column(name = "external_id", length = 64)
    private String externalId;

    @NotBlank
    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 1000)
    private String description;

    @NotNull
    @PositiveOrZero
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    /** Currency ISO code, default MNT (Mongolian Tugrik). */
    @Column(nullable = false, length = 3)
    @Builder.Default
    private String currency = "MNT";

    /** Service duration in minutes. Used by the booking engine to compute end_time. */
    @NotNull
    @Positive
    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
}
