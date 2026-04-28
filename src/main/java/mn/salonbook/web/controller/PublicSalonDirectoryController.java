package mn.salonbook.web.controller;

import lombok.RequiredArgsConstructor;
import mn.salonbook.repository.SalonRepository;
import mn.salonbook.web.dto.PublicSalonSummary;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Lists every active salon. Powers the customer-facing directory page (the
 * marketing-style index at `/`). Anonymous; no salon-specific scoping needed.
 *
 * <p>The single-salon detail endpoint lives in {@code PublicCatalogController}
 * because it shares the {@code /{salonSlug}} path with /services and /staff.
 */
@RestController
@RequestMapping("/api/v1/public/salons")
@RequiredArgsConstructor
public class PublicSalonDirectoryController {

    private final SalonRepository salonRepo;

    @GetMapping
    @Transactional(readOnly = true)
    public List<PublicSalonSummary> list() {
        return salonRepo.findAllByActiveTrueOrderByNameAsc().stream()
            .map(PublicSalonSummary::of)
            .toList();
    }
}
