package mn.salonbook.service;

import lombok.RequiredArgsConstructor;
import mn.salonbook.domain.entity.Booking;
import mn.salonbook.domain.entity.Salon;
import mn.salonbook.domain.enums.BookingStatus;
import mn.salonbook.domain.enums.PaymentStatus;
import mn.salonbook.repository.BookingRepository;
import mn.salonbook.repository.SalonRepository;
import mn.salonbook.repository.StaffRepository;
import mn.salonbook.service.exception.NotFoundException;
import mn.salonbook.web.dto.admin.AdminBookingDetail;
import mn.salonbook.web.dto.admin.AdminStaffSummary;
import mn.salonbook.web.dto.admin.DailyStatsResponse;
import mn.salonbook.web.dto.admin.RevenuePoint;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

/**
 * Read-only queries powering the admin dashboard. Kept separate from
 * BookingService so transactional boundaries and caching can evolve
 * independently of the write path.
 */
@Service
@RequiredArgsConstructor
public class AdminQueryService {

    private final SalonRepository salonRepo;
    private final StaffRepository staffRepo;
    private final BookingRepository bookingRepo;

    /* ------------------------------------------------------------------ */
    /* Bookings                                                            */
    /* ------------------------------------------------------------------ */

    @Transactional(readOnly = true)
    public List<AdminBookingDetail> listBookings(String salonSlug,
                                                 LocalDate from,
                                                 LocalDate to,
                                                 BookingStatus statusFilter) {
        Salon salon = resolveSalon(salonSlug);
        ZoneId zone = ZoneId.of(salon.getTimezone());
        Instant fromInstant = from.atStartOfDay(zone).toInstant();
        Instant toInstant = to.plusDays(1).atStartOfDay(zone).toInstant();

        List<Booking> rows = bookingRepo.findInRange(salon.getId(), fromInstant, toInstant);
        if (statusFilter != null) {
            rows = rows.stream().filter(b -> b.getStatus() == statusFilter).toList();
        }
        return rows.stream().map(AdminBookingDetail::of).toList();
    }

    /* ------------------------------------------------------------------ */
    /* Staff                                                               */
    /* ------------------------------------------------------------------ */

    @Transactional(readOnly = true)
    public List<AdminStaffSummary> listStaff(String salonSlug) {
        Salon salon = resolveSalon(salonSlug);
        return staffRepo.findAllBySalonIdAndActiveTrue(salon.getId()).stream()
            .map(AdminStaffSummary::of)
            .toList();
    }

    /* ------------------------------------------------------------------ */
    /* Daily stats                                                         */
    /* ------------------------------------------------------------------ */

    @Transactional(readOnly = true)
    public DailyStatsResponse getDailyStats(String salonSlug, LocalDate date) {
        Salon salon = resolveSalon(salonSlug);
        ZoneId zone = ZoneId.of(salon.getTimezone());
        Instant from = date.atStartOfDay(zone).toInstant();
        Instant to = date.plusDays(1).atStartOfDay(zone).toInstant();

        List<Booking> bookings = bookingRepo.findInRange(salon.getId(), from, to);
        List<Booking> nonCancelled = bookings.stream()
            .filter(b -> b.getStatus() != BookingStatus.CANCELLED)
            .toList();

        BigDecimal todayRevenue = nonCancelled.stream()
            .filter(b -> b.getPaymentStatus() == PaymentStatus.PAID)
            .map(Booking::getTotalPrice)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Booking> unpaid = nonCancelled.stream()
            .filter(b -> b.getPaymentStatus() != PaymentStatus.PAID)
            .toList();
        BigDecimal pendingPayments = unpaid.stream()
            .map(Booking::getTotalPrice)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        // "New client today" = client whose User.createdAt falls inside the day window.
        long newClients = nonCancelled.stream()
            .map(b -> b.getClient())
            .filter(u -> u.getCreatedAt() != null
                && !u.getCreatedAt().isBefore(from)
                && u.getCreatedAt().isBefore(to))
            .map(u -> u.getId())
            .distinct()
            .count();

        return new DailyStatsResponse(
            date,
            todayRevenue,
            nonCancelled.size(),
            pendingPayments,
            unpaid.size(),
            newClients,
            "MNT"
        );
    }

    /* ------------------------------------------------------------------ */
    /* Weekly revenue                                                      */
    /* ------------------------------------------------------------------ */

    /**
     * Returns 7 entries: the 6 days before {@code endDate} plus {@code endDate}
     * itself, in ascending order. Days with no bookings still appear with zero
     * values so the chart x-axis is always continuous.
     */
    @Transactional(readOnly = true)
    public List<RevenuePoint> getWeeklyRevenue(String salonSlug, LocalDate endDate) {
        Salon salon = resolveSalon(salonSlug);
        ZoneId zone = ZoneId.of(salon.getTimezone());
        LocalDate startDate = endDate.minusDays(6);

        Instant from = startDate.atStartOfDay(zone).toInstant();
        Instant to = endDate.plusDays(1).atStartOfDay(zone).toInstant();

        List<Booking> bookings = bookingRepo.findInRange(salon.getId(), from, to).stream()
            .filter(b -> b.getStatus() != BookingStatus.CANCELLED)
            .toList();

        List<RevenuePoint> points = new ArrayList<>();
        for (long i = 0; i < 7; i++) {
            LocalDate day = startDate.plusDays(i);
            Instant dayStart = day.atStartOfDay(zone).toInstant();
            Instant dayEnd = day.plusDays(1).atStartOfDay(zone).toInstant();

            BigDecimal revenue = BigDecimal.ZERO;
            long count = 0;
            for (Booking b : bookings) {
                if (b.getStartTime().isBefore(dayStart) || !b.getStartTime().isBefore(dayEnd)) {
                    continue;
                }
                count++;
                if (b.getPaymentStatus() == PaymentStatus.PAID) {
                    revenue = revenue.add(b.getTotalPrice());
                }
            }
            points.add(new RevenuePoint(day, revenue, count));
        }
        return points;
    }

    /* ------------------------------------------------------------------ */
    /* Helpers                                                             */
    /* ------------------------------------------------------------------ */

    private Salon resolveSalon(String slug) {
        return salonRepo.findBySlugAndActiveTrue(slug)
            .orElseThrow(() -> new NotFoundException("Salon", slug));
    }
}
