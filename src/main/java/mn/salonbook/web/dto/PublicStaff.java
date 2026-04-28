package mn.salonbook.web.dto;

import mn.salonbook.domain.entity.Staff;

public record PublicStaff(
    String externalId,
    String displayName,
    String title,
    String bio,
    String avatarUrl
) {
    public static PublicStaff of(Staff s) {
        return new PublicStaff(
            s.getExternalId(),
            s.getDisplayName(),
            s.getTitle(),
            s.getBio(),
            s.getAvatarUrl()
        );
    }
}
