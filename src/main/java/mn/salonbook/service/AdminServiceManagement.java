package mn.salonbook.service;

import lombok.RequiredArgsConstructor;
import mn.salonbook.domain.entity.Salon;
import mn.salonbook.domain.entity.ServiceItem;
import mn.salonbook.repository.ServiceItemRepository;
import mn.salonbook.security.TenantGuard;
import mn.salonbook.service.exception.NotFoundException;
import mn.salonbook.web.dto.admin.AdminServiceItem;
import mn.salonbook.web.dto.admin.ServiceCreateRequest;
import mn.salonbook.web.dto.admin.ServiceUpdateRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;

/**
 * Admin-side CRUD for {@link ServiceItem}. All entry points require the
 * authenticated user to belong to the salon (or be a SUPER_ADMIN), enforced by
 * {@link TenantGuard}.
 */
@Service
@RequiredArgsConstructor
public class AdminServiceManagement {

    private final ServiceItemRepository serviceRepo;
    private final TenantGuard tenantGuard;

    @Transactional(readOnly = true)
    public List<AdminServiceItem> list(String salonSlug) {
        Salon salon = tenantGuard.requireSalonAccess(salonSlug);
        return serviceRepo.findAllBySalonIdAndActiveTrue(salon.getId()).stream()
            .sorted(Comparator.comparing(ServiceItem::getName))
            .map(AdminServiceItem::of)
            .toList();
    }

    /**
     * Includes inactive services as well — for the admin UI.
     */
    @Transactional(readOnly = true)
    public List<AdminServiceItem> listAll(String salonSlug) {
        Salon salon = tenantGuard.requireSalonAccess(salonSlug);
        return serviceRepo.findAll().stream()
            .filter(s -> salon.getId().equals(s.getSalonId()))
            .sorted(Comparator.comparing(ServiceItem::getName))
            .map(AdminServiceItem::of)
            .toList();
    }

    @Transactional
    public AdminServiceItem create(String salonSlug, ServiceCreateRequest req) {
        Salon salon = tenantGuard.requireSalonAccess(salonSlug);

        String externalId = (req.externalId() != null && !req.externalId().isBlank())
            ? req.externalId().toLowerCase(Locale.ROOT)
            : generateExternalId(req.name(), salon.getId());

        ServiceItem si = ServiceItem.builder()
            .externalId(externalId)
            .name(req.name().trim())
            .description(req.description())
            .price(req.price())
            .currency(req.currency() != null && !req.currency().isBlank() ? req.currency() : "MNT")
            .durationMinutes(req.durationMinutes())
            .active(req.active() == null || req.active())
            .build();
        si.setSalonId(salon.getId());
        return AdminServiceItem.of(serviceRepo.save(si));
    }

    @Transactional
    public AdminServiceItem update(String salonSlug, Long id, ServiceUpdateRequest req) {
        Salon salon = tenantGuard.requireSalonAccess(salonSlug);
        ServiceItem si = loadInTenant(id, salon.getId());

        si.setName(req.name().trim());
        si.setDescription(req.description());
        si.setPrice(req.price());
        si.setDurationMinutes(req.durationMinutes());
        if (req.currency() != null && !req.currency().isBlank()) si.setCurrency(req.currency());
        si.setActive(req.active());
        return AdminServiceItem.of(serviceRepo.save(si));
    }

    @Transactional
    public void delete(String salonSlug, Long id) {
        Salon salon = tenantGuard.requireSalonAccess(salonSlug);
        ServiceItem si = loadInTenant(id, salon.getId());
        // Soft-delete: keep historic bookings linkable. Hard delete would break
        // the booking_services FK if any past booking referenced this row.
        si.setActive(false);
        serviceRepo.save(si);
    }

    /* ------------------------------------------------------------------ */

    private ServiceItem loadInTenant(Long id, Long salonId) {
        ServiceItem si = serviceRepo.findById(id)
            .orElseThrow(() -> new NotFoundException("Service", String.valueOf(id)));
        if (!salonId.equals(si.getSalonId())) {
            // Defense in depth: should be impossible if TenantGuard ran first,
            // but blocks any accidental direct lookups across tenants.
            throw new NotFoundException("Service", String.valueOf(id));
        }
        return si;
    }

    private String generateExternalId(String name, Long salonId) {
        String base = name.toLowerCase(Locale.ROOT)
            .replaceAll("[^a-z0-9\\s-]", "")
            .trim()
            .replaceAll("\\s+", "-");
        if (base.isBlank()) base = "service";
        // Ensure uniqueness within the tenant by appending a counter if needed.
        String candidate = base;
        int n = 2;
        while (!serviceRepo.findAllByExternalIdInAndSalonId(List.of(candidate), salonId).isEmpty()) {
            candidate = base + "-" + n++;
            if (n > 999) {
                candidate = base + "-" + System.currentTimeMillis();
                break;
            }
        }
        return candidate;
    }
}
