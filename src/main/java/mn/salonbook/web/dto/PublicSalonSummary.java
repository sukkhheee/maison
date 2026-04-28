package mn.salonbook.web.dto;

import mn.salonbook.domain.entity.Salon;

/**
 * Public-facing salon summary used by the directory page (`GET /salons`) and
 * the salon-specific landing (`GET /salons/{slug}`). No internal ids exposed —
 * customers reach a salon by its slug only.
 */
public record PublicSalonSummary(
    String slug,
    String name,
    String address,
    String phone,
    String email,
    String timezone
) {
    public static PublicSalonSummary of(Salon s) {
        return new PublicSalonSummary(
            s.getSlug(),
            s.getName(),
            s.getAddress(),
            s.getPhone(),
            s.getEmail(),
            s.getTimezone()
        );
    }
}
