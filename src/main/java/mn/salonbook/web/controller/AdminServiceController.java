package mn.salonbook.web.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mn.salonbook.service.AdminServiceManagement;
import mn.salonbook.web.dto.admin.AdminServiceItem;
import mn.salonbook.web.dto.admin.ServiceCreateRequest;
import mn.salonbook.web.dto.admin.ServiceUpdateRequest;
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
@RequestMapping("/api/v1/admin/salons/{salonSlug}/services")
@RequiredArgsConstructor
public class AdminServiceController {

    private final AdminServiceManagement service;

    @GetMapping
    public List<AdminServiceItem> list(@PathVariable String salonSlug) {
        return service.listAll(salonSlug);
    }

    @PostMapping
    public ResponseEntity<AdminServiceItem> create(
        @PathVariable String salonSlug,
        @Valid @RequestBody ServiceCreateRequest req
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(service.create(salonSlug, req));
    }

    @PutMapping("/{id}")
    public AdminServiceItem update(
        @PathVariable String salonSlug,
        @PathVariable Long id,
        @Valid @RequestBody ServiceUpdateRequest req
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
}
