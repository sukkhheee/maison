package mn.salonbook.web.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mn.salonbook.service.AdminSalonManagement;
import mn.salonbook.web.dto.admin.AdminSalonSettings;
import mn.salonbook.web.dto.admin.SalonSettingsUpdateRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/salons/{salonSlug}/settings")
@RequiredArgsConstructor
public class AdminSalonController {

    private final AdminSalonManagement service;

    @GetMapping
    public AdminSalonSettings get(@PathVariable String salonSlug) {
        return service.get(salonSlug);
    }

    @PutMapping
    public AdminSalonSettings update(
        @PathVariable String salonSlug,
        @Valid @RequestBody SalonSettingsUpdateRequest req
    ) {
        return service.update(salonSlug, req);
    }
}
