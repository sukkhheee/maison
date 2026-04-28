package mn.salonbook.web.controller;

import lombok.RequiredArgsConstructor;
import mn.salonbook.domain.entity.Salon;
import mn.salonbook.domain.entity.ServiceItem;
import mn.salonbook.domain.entity.Staff;
import mn.salonbook.repository.SalonRepository;
import mn.salonbook.repository.ServiceItemRepository;
import mn.salonbook.repository.StaffRepository;
import mn.salonbook.service.exception.NotFoundException;
import mn.salonbook.web.dto.PublicSalonSummary;
import mn.salonbook.web.dto.PublicServiceItem;
import mn.salonbook.web.dto.PublicStaff;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.List;

/**
 * Anonymous read-only catalog for the booking widget. Only returns active rows
 * — admins toggle "Идэвхгүй" off to hide a service/staff without deleting it.
 */
@RestController
@RequestMapping("/api/v1/public/salons/{salonSlug}")
@RequiredArgsConstructor
public class PublicCatalogController {

    private final SalonRepository salonRepo;
    private final ServiceItemRepository serviceRepo;
    private final StaffRepository staffRepo;

    @GetMapping
    @Transactional(readOnly = true)
    public PublicSalonSummary getSalon(@PathVariable String salonSlug) {
        return PublicSalonSummary.of(resolveSalon(salonSlug));
    }

    @GetMapping("/services")
    @Transactional(readOnly = true)
    public List<PublicServiceItem> listServices(@PathVariable String salonSlug) {
        Salon salon = resolveSalon(salonSlug);
        return serviceRepo.findAllBySalonIdAndActiveTrue(salon.getId()).stream()
            .sorted(Comparator.comparing(ServiceItem::getName))
            .map(PublicServiceItem::of)
            .toList();
    }

    @GetMapping("/staff")
    @Transactional(readOnly = true)
    public List<PublicStaff> listStaff(@PathVariable String salonSlug) {
        Salon salon = resolveSalon(salonSlug);
        return staffRepo.findAllBySalonIdAndActiveTrue(salon.getId()).stream()
            .sorted(Comparator.comparing(Staff::getDisplayName))
            .map(PublicStaff::of)
            .toList();
    }

    private Salon resolveSalon(String slug) {
        return salonRepo.findBySlugAndActiveTrue(slug)
            .orElseThrow(() -> new NotFoundException("Salon", slug));
    }
}
