package mn.salonbook.web.dto.admin;

import mn.salonbook.domain.entity.Staff;

public record AdminStaffSummary(
    String externalId,
    String displayName,
    String title,
    String avatarUrl,
    boolean active
) {
    public static AdminStaffSummary of(Staff s) {
        return new AdminStaffSummary(
            s.getExternalId(),
            s.getDisplayName(),
            s.getTitle(),
            s.getAvatarUrl(),
            s.isActive()
        );
    }
}
