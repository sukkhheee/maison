package mn.salonbook.service;

import lombok.RequiredArgsConstructor;
import mn.salonbook.domain.entity.Salon;
import mn.salonbook.repository.SalonRepository;
import mn.salonbook.security.TenantGuard;
import mn.salonbook.web.dto.admin.AdminSalonSettings;
import mn.salonbook.web.dto.admin.SalonSettingsUpdateRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;

@Service
@RequiredArgsConstructor
public class AdminSalonManagement {

    private final SalonRepository salonRepo;
    private final TenantGuard tenantGuard;

    @Transactional(readOnly = true)
    public AdminSalonSettings get(String salonSlug) {
        return AdminSalonSettings.of(tenantGuard.requireSalonAccess(salonSlug));
    }

    @Transactional
    public AdminSalonSettings update(String salonSlug, SalonSettingsUpdateRequest req) {
        Salon salon = tenantGuard.requireSalonAccess(salonSlug);

        // Validate timezone string up front so we don't persist garbage that
        // would later break booking-time conversions in BookingService.
        try {
            ZoneId.of(req.timezone());
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid IANA timezone: " + req.timezone());
        }

        salon.setName(req.name().trim());
        salon.setEmail(req.email());
        salon.setPhone(req.phone());
        salon.setAddress(req.address());
        salon.setTimezone(req.timezone());
        return AdminSalonSettings.of(salonRepo.save(salon));
    }
}
