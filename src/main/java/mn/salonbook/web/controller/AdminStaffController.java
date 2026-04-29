package mn.salonbook.web.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mn.salonbook.service.AdminStaffManagement;
import mn.salonbook.web.dto.admin.AdminStaffDetail;
import mn.salonbook.web.dto.admin.StaffCreateRequest;
import mn.salonbook.web.dto.admin.StaffScheduleEntry;
import mn.salonbook.web.dto.admin.StaffScheduleUpdateRequest;
import mn.salonbook.web.dto.admin.StaffUpdateRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/salons/{salonSlug}/staff")
@RequiredArgsConstructor
public class AdminStaffController {

    private final AdminStaffManagement service;

    @GetMapping
    public List<AdminStaffDetail> list(@PathVariable String salonSlug) {
        return service.list(salonSlug);
    }

    @PostMapping
    public ResponseEntity<AdminStaffDetail> create(
        @PathVariable String salonSlug,
        @Valid @RequestBody StaffCreateRequest req
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(service.create(salonSlug, req));
    }

    @PutMapping("/{id}")
    public AdminStaffDetail update(
        @PathVariable String salonSlug,
        @PathVariable Long id,
        @Valid @RequestBody StaffUpdateRequest req
    ) {
        return service.update(salonSlug, id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
        @PathVariable String salonSlug,
        @PathVariable Long id
    ) {
        service.delete(salonSlug, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/schedule")
    public List<StaffScheduleEntry> getSchedule(
        @PathVariable String salonSlug,
        @PathVariable Long id
    ) {
        return service.getSchedule(salonSlug, id);
    }

    @PutMapping("/{id}/schedule")
    public List<StaffScheduleEntry> replaceSchedule(
        @PathVariable String salonSlug,
        @PathVariable Long id,
        @Valid @RequestBody StaffScheduleUpdateRequest req
    ) {
        return service.replaceSchedule(salonSlug, id, req);
    }
}
