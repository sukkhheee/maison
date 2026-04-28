package mn.salonbook.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.ZoneId;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
    name = "salons",
    uniqueConstraints = {
        @jakarta.persistence.UniqueConstraint(name = "uk_salons_slug", columnNames = "slug")
    },
    indexes = {
        @Index(name = "idx_salons_active", columnList = "active")
    }
)
public class Salon extends BaseEntity {

    @NotBlank
    @Size(max = 200)
    @Column(nullable = false, length = 200)
    private String name;

    /** URL-friendly tenant identifier, e.g. "elegance-spa" */
    @NotBlank
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String slug;

    @Email
    @Column(length = 200)
    private String email;

    @Column(length = 32)
    private String phone;

    @Column(length = 500)
    private String address;

    /** IANA TZ identifier; defaults to Asia/Ulaanbaatar */
    @Column(name = "timezone", nullable = false, length = 64)
    @Builder.Default
    private String timezone = ZoneId.of("Asia/Ulaanbaatar").getId();

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
}
