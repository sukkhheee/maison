package mn.salonbook.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mn.salonbook.domain.enums.Role;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
    name = "users",
    uniqueConstraints = {
        // A given email is unique per role-context. Same person can be CLIENT in salon A
        // and STAFF in salon B with different account rows; SUPER_ADMIN/CLIENT have no salon.
        @UniqueConstraint(name = "uk_users_email_salon", columnNames = {"email", "salon_id"})
    },
    indexes = {
        @Index(name = "idx_users_email", columnList = "email"),
        @Index(name = "idx_users_salon", columnList = "salon_id"),
        @Index(name = "idx_users_role", columnList = "role")
    }
)
public class User extends BaseEntity {

    @NotBlank
    @Email
    @Column(nullable = false, length = 200)
    private String email;

    /**
     * BCrypt-encoded password hash. Always present today — social-login users
     * still get a randomly-generated hash so this column stays NOT NULL and the
     * existing password-login code path keeps working unchanged.
     */
    @NotBlank
    @Column(name = "password_hash", nullable = false, length = 100)
    private String passwordHash;

    @Column(name = "full_name", nullable = false, length = 200)
    private String fullName;

    @Column(length = 32)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private Role role;

    /**
     * Tenant binding for SALON_ADMIN and STAFF. NULL for SUPER_ADMIN and CLIENT
     * (clients are global accounts that may book at multiple salons).
     */
    @Column(name = "salon_id")
    private Long salonId;

    @Column(nullable = false)
    @Builder.Default
    private boolean enabled = true;

    /** Google "sub" claim — stable user id from Google. NULL for password accounts. */
    @Column(name = "google_id", length = 64)
    private String googleId;

    /** Cached profile picture URL from the social provider. */
    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;
}
