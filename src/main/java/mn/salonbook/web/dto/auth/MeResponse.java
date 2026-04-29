package mn.salonbook.web.dto.auth;

import mn.salonbook.domain.entity.Salon;
import mn.salonbook.domain.entity.User;
import mn.salonbook.domain.enums.Role;

public record MeResponse(
    Long userId,
    String email,
    String fullName,
    Role role,
    Long salonId,
    String salonSlug,
    String salonName,
    String salonTimezone,
    String avatarUrl
) {
    public static MeResponse of(User user, Salon salon) {
        return new MeResponse(
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            user.getRole(),
            user.getSalonId(),
            salon != null ? salon.getSlug() : null,
            salon != null ? salon.getName() : null,
            salon != null ? salon.getTimezone() : null,
            user.getAvatarUrl()
        );
    }
}
