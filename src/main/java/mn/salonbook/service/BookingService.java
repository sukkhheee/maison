package mn.salonbook.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mn.salonbook.domain.entity.Booking;
import mn.salonbook.domain.entity.Salon;
import mn.salonbook.domain.entity.ServiceItem;
import mn.salonbook.domain.entity.Staff;
import mn.salonbook.domain.entity.StaffSchedule;
import mn.salonbook.domain.entity.User;
import mn.salonbook.domain.enums.BookingStatus;
import mn.salonbook.domain.enums.PaymentStatus;
import mn.salonbook.domain.enums.Role;
import mn.salonbook.repository.BookingRepository;
import mn.salonbook.repository.SalonRepository;
import mn.salonbook.repository.ServiceItemRepository;
import mn.salonbook.repository.StaffRepository;
import mn.salonbook.repository.StaffScheduleRepository;
import mn.salonbook.repository.UserRepository;
import mn.salonbook.service.exception.BookingConflictException;
import mn.salonbook.service.exception.NotFoundException;
import mn.salonbook.service.exception.OutsideWorkingHoursException;
import mn.salonbook.web.dto.BookingCreateRequest;
import mn.salonbook.web.dto.CustomerInfo;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.EnumSet;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Booking lifecycle service. Sole place where the conflict-detection rule lives,
 * so all entry points (public widget, salon admin, mobile) go through it.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BookingService {

    /** Statuses that occupy a slot. CANCELLED / NO_SHOW free it. */
    private static final Set<BookingStatus> BLOCKING_STATUSES =
        EnumSet.of(BookingStatus.PENDING, BookingStatus.CONFIRMED);

    private final SalonRepository salonRepo;
    private final StaffRepository staffRepo;
    private final StaffScheduleRepository scheduleRepo;
    private final ServiceItemRepository serviceRepo;
    private final BookingRepository bookingRepo;
    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    /**
     * Creates a booking after validating tenant scope, staff working hours and
     * absence of overlapping appointments.
     *
     * <p>The whole flow runs inside one transaction. We acquire a
     * {@code PESSIMISTIC_WRITE} lock on the staff row first; that serializes
     * concurrent creates against the same master and prevents the classic
     * read-then-insert race where two clients both pass the conflict check.
     */
    @Transactional
    public Booking createBooking(String salonSlug, BookingCreateRequest req) {
        Salon salon = salonRepo.findBySlugAndActiveTrue(salonSlug)
            .orElseThrow(() -> new NotFoundException("Salon", salonSlug));

        // 1. Lock the staff row → all create-bookings for this staff are now serialized.
        Staff staff = resolveAndLockStaff(req.staffExternalId(), salon.getId());

        // 2. Resolve services (must all belong to this salon).
        List<ServiceItem> services = resolveServices(req.serviceExternalIds(), salon.getId());

        // 3. Compute the absolute time window using the salon's timezone.
        ZoneId zone = ZoneId.of(salon.getTimezone());
        int totalMinutes = services.stream().mapToInt(ServiceItem::getDurationMinutes).sum();
        Instant start = req.startTime().atZone(zone).toInstant();
        Instant end = start.plus(totalMinutes, ChronoUnit.MINUTES);

        // 4. Slot must fall inside the staff member's published working hours.
        validateWithinWorkingHours(staff, zone, req.startTime(), req.startTime().plusMinutes(totalMinutes));

        // 5. Conflict check — the heart of the system.
        List<Booking> conflicts = bookingRepo.findOverlapping(
            salon.getId(), staff.getId(), start, end, BLOCKING_STATUSES);
        if (!conflicts.isEmpty()) {
            Booking c = conflicts.get(0);
            log.info("Booking conflict on staff={} window=[{},{}] vs existing=[{},{}]",
                staff.getId(), start, end, c.getStartTime(), c.getEndTime());
            throw new BookingConflictException(c.getStartTime(), c.getEndTime());
        }

        // 6. Resolve / create the client account.
        User client = findOrCreateClient(req.customer());

        // 7. Persist.
        BigDecimal totalPrice = services.stream()
            .map(ServiceItem::getPrice)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        Booking booking = Booking.builder()
            .staff(staff)
            .client(client)
            .startTime(start)
            .endTime(end)
            .status(BookingStatus.PENDING)
            .paymentStatus(PaymentStatus.UNPAID)
            .totalPrice(totalPrice)
            .currency("MNT")
            .services(new HashSet<>(services))
            .notes(req.notes())
            .build();
        booking.setSalonId(salon.getId());

        Booking saved = bookingRepo.save(booking);
        log.info("Booking created id={} salon={} staff={} window=[{},{}]",
            saved.getId(), salon.getId(), staff.getId(), start, end);
        return saved;
    }

    @Transactional(readOnly = true)
    public List<Booking> listForClient(Long clientId) {
        return bookingRepo.findAllByClientIdWithDetails(clientId);
    }

    /* ----------------------------------------------------------------------- */
    /* Helpers                                                                  */
    /* ----------------------------------------------------------------------- */

    private Staff resolveAndLockStaff(String externalId, Long salonId) {
        Staff staff = staffRepo.findByExternalIdAndSalonId(externalId, salonId)
            .orElseThrow(() -> new NotFoundException("Staff", externalId));
        // Re-fetch with a write lock so this transaction owns the staff row
        // for the duration of the booking insert.
        return staffRepo.findByIdAndSalonIdForUpdate(staff.getId(), salonId)
            .orElseThrow(() -> new NotFoundException("Staff", externalId));
    }

    private List<ServiceItem> resolveServices(List<String> externalIds, Long salonId) {
        List<ServiceItem> services = serviceRepo
            .findAllByExternalIdInAndSalonId(externalIds, salonId);
        if (services.size() != externalIds.size()) {
            // At least one requested id wasn't found in this tenant.
            Set<String> found = new HashSet<>();
            services.forEach(s -> found.add(s.getExternalId()));
            String missing = externalIds.stream()
                .filter(id -> !found.contains(id))
                .findFirst()
                .orElse("?");
            throw new NotFoundException("Service", missing);
        }
        return services;
    }

    private void validateWithinWorkingHours(Staff staff, ZoneId zone,
                                            LocalDateTime localStart,
                                            LocalDateTime localEnd) {
        LocalDate startDate = localStart.toLocalDate();
        LocalDate endDate = localEnd.toLocalDate();
        if (!startDate.equals(endDate)) {
            throw new OutsideWorkingHoursException(
                "Booking cannot span midnight in salon timezone " + zone);
        }
        DayOfWeek dow = localStart.getDayOfWeek();
        List<StaffSchedule> shifts = scheduleRepo
            .findByStaffIdAndDayOfWeek(staff.getId(), dow);
        if (shifts.isEmpty()) {
            throw new OutsideWorkingHoursException(
                "Staff %s does not work on %s".formatted(staff.getDisplayName(), dow));
        }
        LocalTime startTime = localStart.toLocalTime();
        LocalTime endTime = localEnd.toLocalTime();
        boolean covered = shifts.stream().anyMatch(s ->
            !startTime.isBefore(s.getStartTime()) && !endTime.isAfter(s.getEndTime()));
        if (!covered) {
            throw new OutsideWorkingHoursException(
                "Requested slot %s–%s is outside %s's published hours"
                    .formatted(startTime, endTime, staff.getDisplayName()));
        }
    }

    private User findOrCreateClient(CustomerInfo customer) {
        // For demo: identify clients by email; in production we'd add SMS-OTP
        // verification before treating the account as a real identity.
        String email = customer.email() != null ? customer.email().toLowerCase().trim() : null;
        if (email != null) {
            var existing = userRepo.findFirstByEmailAndRole(email, Role.CLIENT);
            if (existing.isPresent()) {
                return existing.get();
            }
        }
        User created = User.builder()
            .email(email != null ? email : generatePlaceholderEmail(customer.phone()))
            .passwordHash(passwordEncoder.encode("__guest__" + System.nanoTime()))
            .fullName(customer.name())
            .phone(customer.phone())
            .role(Role.CLIENT)
            .salonId(null)
            .enabled(true)
            .build();
        return userRepo.save(created);
    }

    private String generatePlaceholderEmail(String phone) {
        String digits = phone.replaceAll("[^0-9]", "");
        return "guest-" + digits + "@maison.local";
    }
}
