package mn.salonbook.web.dto.admin;

import mn.salonbook.domain.entity.Salon;

public record AdminSalonSettings(
    Long id,
    String slug,
    String name,
    String email,
    String phone,
    String address,
    String timezone,
    boolean active
) {
    public static AdminSalonSettings of(Salon s) {
        return new AdminSalonSettings(
            s.getId(),
            s.getSlug(),
            s.getName(),
            s.getEmail(),
            s.getPhone(),
            s.getAddress(),
            s.getTimezone(),
            s.isActive()
        );
    }
}
