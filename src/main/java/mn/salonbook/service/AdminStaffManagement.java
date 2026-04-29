package mn.salonbook.service;

import lombok.RequiredArgsConstructor;
import mn.salonbook.domain.entity.Salon;
import mn.salonbook.domain.entity.Staff;
import mn.salonbook.domain.entity.StaffSchedule;
import mn.salonbook.domain.entity.User;
import mn.salonbook.domain.enums.Role;
import mn.salonbook.repository.StaffRepository;
import mn.salonbook.repository.StaffScheduleRepository;
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

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminStaffManagement {

    /** Default working hours seeded for newly-created staff. Until we ship a
     *  schedule editor in the admin UI, every staff opens 09:00–20:00 every
     *  day; admins can adjust per-row in the DB if needed. */
    private static final LocalTime DEFAULT_START = LocalTime.of(9, 0);
    private static final LocalTime DEFAULT_END = LocalTime.of(20, 0);

    private final StaffRepository staffRepo;
    private final UserRepository userRepo;
    private final StaffScheduleRepository scheduleRepo;
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
        Staff saved = staffRepo.save(staff);

        seedDefaultSchedule(saved);
        return AdminStaffDetail.of(saved);
    }

    /**
     * Creates a default Mon-Sun, 09:00–20:00 schedule so new staff can
     * receive bookings immediately. Without this, BookingService rejects
     * every slot with "OUTSIDE_WORKING_HOURS" because no shifts are defined.
     */
    private void seedDefaultSchedule(Staff staff) {
        for (DayOfWeek day : DayOfWeek.values()) {
            StaffSchedule shift = StaffSchedule.builder()
                .staff(staff)
                .dayOfWeek(day)
                .startTime(DEFAULT_START)
                .endTime(DEFAULT_END)
                .build();
            shift.setSalonId(staff.getSalonId());
            scheduleRepo.save(shift);
        }
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
    /* Working-hours (StaffSchedule) management                            */
    /* ------------------------------------------------------------------ */

    @Transactional(readOnly = true)
    public List<mn.salonbook.web.dto.admin.StaffScheduleEntry> getSchedule(
        String salonSlug, Long staffId
    ) {
        Salon salon = tenantGuard.requireSalonAccess(salonSlug);
        Staff staff = loadInTenant(staffId, salon.getId());
        return scheduleRepo.findByStaffIdOrderByDayOfWeekAscStartTimeAsc(staff.getId())
            .stream()
            .map(mn.salonbook.web.dto.admin.StaffScheduleEntry::of)
            .toList();
    }

    /**
     * Atomic replacement: wipes all existing schedule rows for {@code staffId}
     * and inserts the new set. Sent as a single PUT so the admin UI doesn't
     * need to track per-row CRUD operations.
     */
    @Transactional
    public List<mn.salonbook.web.dto.admin.StaffScheduleEntry> replaceSchedule(
        String salonSlug, Long staffId,
        mn.salonbook.web.dto.admin.StaffScheduleUpdateRequest req
    ) {
        Salon salon = tenantGuard.requireSalonAccess(salonSlug);
        Staff staff = loadInTenant(staffId, salon.getId());

        // Validate each entry: end strictly after start, no zero-length slots.
        for (var entry : req.schedule()) {
            if (!entry.startTime().isBefore(entry.endTime())) {
                throw new IllegalArgumentException(
                    "Shift on %s must end after it starts (got %s–%s)"
                        .formatted(entry.dayOfWeek(), entry.startTime(), entry.endTime()));
            }
        }

        // Replace strategy — simpler than diffing for the admin UI's "save all" pattern.
        scheduleRepo.deleteByStaffId(staff.getId());
        // Force flush so the DELETE precedes the INSERTs in the same transaction;
        // otherwise Hibernate's reorder may try to insert duplicates and trip the
        // (staff_id, day_of_week, start_time) unique constraint.
        scheduleRepo.flush();

        List<StaffSchedule> created = req.schedule().stream().map(e -> {
            StaffSchedule shift = StaffSchedule.builder()
                .staff(staff)
                .dayOfWeek(e.dayOfWeek())
                .startTime(e.startTime())
                .endTime(e.endTime())
                .build();
            shift.setSalonId(salon.getId());
            return shift;
        }).toList();
        scheduleRepo.saveAll(created);

        return created.stream()
            .map(mn.salonbook.web.dto.admin.StaffScheduleEntry::of)
            .toList();
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
