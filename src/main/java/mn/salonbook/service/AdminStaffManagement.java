package mn.salonbook.service;

import lombok.RequiredArgsConstructor;
import mn.salonbook.domain.entity.Salon;
import mn.salonbook.domain.entity.Staff;
import mn.salonbook.domain.entity.User;
import mn.salonbook.domain.enums.Role;
import mn.salonbook.repository.StaffRepository;
import mn.salonbook.repository.UserRepository;
import mn.salonbook.security.TenantGuard;
import mn.salonbook.service.exception.ConflictException;
import mn.salonbook.service.exception.NotFoundException;
import mn.salonbook.web.dto.admin.AdminStaffDetail;
import mn.salonbook.web.dto.admin.StaffCreateRequest;
import mn.salonbook.web.dto.admin.StaffUpdateRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminStaffManagement {

    private final StaffRepository staffRepo;
    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final TenantGuard tenantGuard;

    @Transactional(readOnly = true)
    public List<AdminStaffDetail> list(String salonSlug) {
        Salon salon = tenantGuard.requireSalonAccess(salonSlug);
        return staffRepo.findAll().stream()
            .filter(s -> salon.getId().equals(s.getSalonId()))
            .sorted(Comparator.comparing(Staff::getDisplayName))
            .map(AdminStaffDetail::of)
            .toList();
    }

    @Transactional
    public AdminStaffDetail create(String salonSlug, StaffCreateRequest req) {
        Salon salon = tenantGuard.requireSalonAccess(salonSlug);
        String email = req.email().trim().toLowerCase(Locale.ROOT);

        // Reuse an existing STAFF account in this salon if one exists with this email,
        // otherwise create a new one. SALON_ADMIN accounts are NOT promoted to staff.
        User user = userRepo.findByEmailAndSalonId(email, salon.getId())
            .filter(u -> u.getRole() == Role.STAFF)
            .orElseGet(() -> {
                if (userRepo.existsByEmailAndRole(email, Role.SALON_ADMIN)) {
                    throw new ConflictException("EMAIL_TAKEN_BY_ADMIN",
                        "Энэ имэйл нь админ аккаунттай давхцаж байна.");
                }
                return userRepo.save(User.builder()
                    .email(email)
                    .passwordHash(passwordEncoder.encode("__pending__" + UUID.randomUUID()))
                    .fullName(req.displayName())
                    .phone(req.phone())
                    .role(Role.STAFF)
                    .salonId(salon.getId())
                    .enabled(true)
                    .build());
            });

        // One-staff-per-user: if this user is already linked, reject.
        if (staffRepo.findAll().stream().anyMatch(s -> s.getUser().getId().equals(user.getId()))) {
            throw new ConflictException("STAFF_ALREADY_LINKED",
                "Энэ хэрэглэгч аль хэдийн ажилтнаар бүртгэгдсэн байна.");
        }

        Staff staff = Staff.builder()
            .externalId(generateExternalId(req.displayName(), salon.getId()))
            .displayName(req.displayName().trim())
            .title(req.title())
            .bio(req.bio())
            .avatarUrl(req.avatarUrl())
            .active(true)
            .user(user)
            .build();
        staff.setSalonId(salon.getId());
        return AdminStaffDetail.of(staffRepo.save(staff));
    }

    @Transactional
    public AdminStaffDetail update(String salonSlug, Long id, StaffUpdateRequest req) {
        Salon salon = tenantGuard.requireSalonAccess(salonSlug);
        Staff staff = loadInTenant(id, salon.getId());

        staff.setDisplayName(req.displayName().trim());
        staff.setTitle(req.title());
        staff.setBio(req.bio());
        staff.setAvatarUrl(req.avatarUrl());
        staff.setActive(req.active());

        if (req.phone() != null && staff.getUser() != null) {
            staff.getUser().setPhone(req.phone());
        }
        return AdminStaffDetail.of(staffRepo.save(staff));
    }

    @Transactional
    public void delete(String salonSlug, Long id) {
        Salon salon = tenantGuard.requireSalonAccess(salonSlug);
        Staff staff = loadInTenant(id, salon.getId());
        // Soft-delete: existing bookings keep working. Hard delete would break booking FKs.
        staff.setActive(false);
        staffRepo.save(staff);
    }

    /* ------------------------------------------------------------------ */

    private Staff loadInTenant(Long id, Long salonId) {
        Staff s = staffRepo.findById(id)
            .orElseThrow(() -> new NotFoundException("Staff", String.valueOf(id)));
        if (!salonId.equals(s.getSalonId())) {
            throw new NotFoundException("Staff", String.valueOf(id));
        }
        return s;
    }

    private String generateExternalId(String name, Long salonId) {
        String base = name.toLowerCase(Locale.ROOT)
            .replaceAll("[^a-z0-9\\s-]", "")
            .trim()
            .replaceAll("\\s+", "-");
        if (base.isBlank()) base = "staff";
        String candidate = "m-" + base;
        int n = 2;
        while (staffRepo.findByExternalIdAndSalonId(candidate, salonId).isPresent()) {
            candidate = "m-" + base + "-" + n++;
            if (n > 999) {
                candidate = "m-" + base + "-" + System.currentTimeMillis();
                break;
            }
        }
        return candidate;
    }
}
