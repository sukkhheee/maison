package mn.salonbook.web.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * One-shot onboarding payload — creates a {@code Salon} tenant + the first
 * {@code SALON_ADMIN} user atomically. Used by {@code POST /api/v1/auth/register-salon}.
 */
public record RegisterSalonRequest(
    @NotBlank @Size(max = 200) String salonName,

    /** URL-safe identifier, e.g. "elegance-spa". Lowercase letters, digits, hyphens. */
    @NotBlank
    @Size(min = 3, max = 60)
    @Pattern(regexp = "^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$",
        message = "Slug нь жижиг үсэг, тоо, дунд нь зураас байж болно")
    String salonSlug,

    @NotBlank @Size(max = 200) String fullName,

    @NotBlank @Email @Size(max = 200) String email,

    @NotBlank @Size(min = 8, max = 128, message = "Нууц үг 8-аас доошгүй тэмдэгт байх ёстой")
    String password,

    @Size(max = 32) String phone,

    /** IANA TZ id; defaults applied server-side if null. */
    @Size(max = 64) String timezone
) {
}
