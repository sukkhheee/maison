package mn.salonbook.web.dto.admin;

import mn.salonbook.domain.entity.Staff;

public record AdminStaffDetail(
    Long id,
    String externalId,
    String displayName,
    String title,
    String bio,
    String avatarUrl,
    boolean active,
    Long userId,
    String userEmail,
    String userPhone
) {
    public static AdminStaffDetail of(Staff s) {
        var u = s.getUser();
        return new AdminStaffDetail(
            s.getId(),
            s.getExternalId(),
            s.getDisplayName(),
            s.getTitle(),
            s.getBio(),
            s.getAvatarUrl(),
            s.isActive(),
            u != null ? u.getId() : null,
            u != null ? u.getEmail() : null,
            u != null ? u.getPhone() : null
        );
    }
}
