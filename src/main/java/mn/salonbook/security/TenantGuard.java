package mn.salonbook.security;

import lombok.RequiredArgsConstructor;
import mn.salonbook.domain.entity.Salon;
import mn.salonbook.domain.entity.User;
import mn.salonbook.domain.enums.Role;
import mn.salonbook.repository.SalonRepository;
import mn.salonbook.service.exception.ForbiddenException;
import mn.salonbook.service.exception.NotFoundException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Objects;

/**
 * Resolves a {@link Salon} from the URL slug and verifies the authenticated
 * principal is allowed to act on it. Use in every admin controller that takes
 * {@code {salonSlug}} from the path so a SALON_ADMIN of salon A can't probe
 * salon B by changing the URL.
 *
 * <p>SUPER_ADMIN bypasses the check (platform operations).
 */
@Component
@RequiredArgsConstructor
public class TenantGuard {

    private final SalonRepository salonRepo;

    /**
     * @return the Salon matching {@code slug}, after verifying the current
     *         principal owns or works at it.
     * @throws NotFoundException  if the slug doesn't resolve to an active salon.
     * @throws ForbiddenException if the principal belongs to a different salon.
     */
    public Salon requireSalonAccess(String slug) {
        Salon salon = salonRepo.findBySlugAndActiveTrue(slug)
            .orElseThrow(() -> new NotFoundException("Salon", slug));

        User principal = currentUser();
        if (principal.getRole() == Role.SUPER_ADMIN) return salon;

        if (!Objects.equals(principal.getSalonId(), salon.getId())) {
            throw new ForbiddenException(
                "Та энэ салоны мэдээлэлд хандах эрхгүй байна.");
        }
        return salon;
    }

    public User currentUser() {
        Object principal = SecurityContextHolder.getContext()
            .getAuthentication()
            .getPrincipal();
        if (principal instanceof User u) return u;
        throw new ForbiddenException("Authenticated user not found in context.");
    }
}
