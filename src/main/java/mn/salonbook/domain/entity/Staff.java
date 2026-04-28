package mn.salonbook.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
    name = "staff",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_staff_user", columnNames = "user_id"),
        @UniqueConstraint(name = "uk_staff_external_id_salon", columnNames = {"external_id", "salon_id"})
    },
    indexes = {
        @Index(name = "idx_staff_salon", columnList = "salon_id"),
        @Index(name = "idx_staff_active", columnList = "active"),
        @Index(name = "idx_staff_external_id", columnList = "external_id")
    }
)
public class Staff extends TenantAwareEntity {

    /**
     * Stable, human-readable identifier used by client-side code to refer to this row
     * without exposing the internal numeric primary key (e.g. "m-anu").
     */
    @Column(name = "external_id", length = 64)
    private String externalId;

    @NotBlank
    @Column(name = "display_name", nullable = false, length = 200)
    private String displayName;

    @Column(length = 200)
    private String title;

    @Column(length = 1000)
    private String bio;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    /** The login account for this staff member. One User ↔ one Staff row. */
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @jakarta.persistence.ForeignKey(name = "fk_staff_user"))
    private User user;
}
