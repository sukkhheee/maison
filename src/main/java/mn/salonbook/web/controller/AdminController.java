package mn.salonbook.web.controller;

import lombok.RequiredArgsConstructor;
import mn.salonbook.domain.enums.BookingStatus;
import mn.salonbook.service.AdminQueryService;
import mn.salonbook.web.dto.admin.AdminBookingDetail;
import mn.salonbook.web.dto.admin.DailyStatsResponse;
import mn.salonbook.web.dto.admin.RevenuePoint;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

/**
 * Admin-scoped read endpoints used by the dashboard frontend.
 *
 * <p>SECURITY TODO: these endpoints currently rely on the same permitAll
 * baseline as {@code /api/v1/public/**}. In Step 3 they will move behind a JWT
 * filter requiring {@code SALON_ADMIN} or {@code STAFF} role for the matching
 * salon slug.
 */
@RestController
@RequestMapping("/api/v1/admin/salons/{salonSlug}")
@RequiredArgsConstructor
public class AdminController {

    private final AdminQueryService adminQueryService;

    /**
     * Bookings in a date range. Used by the calendar (single day) and the
     * booking table (multi-day).
     */
    @GetMapping("/bookings")
    public List<AdminBookingDetail> listBookings(
        @PathVariable String salonSlug,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
        @RequestParam(required = false) BookingStatus status
    ) {
        return adminQueryService.listBookings(salonSlug, from, to, status);
    }

    @GetMapping("/stats/daily")
    public DailyStatsResponse dailyStats(
        @PathVariable String salonSlug,
        @RequestParam(required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return adminQueryService.getDailyStats(
            salonSlug,
            date != null ? date : LocalDate.now()
        );
    }

    @GetMapping("/stats/revenue/weekly")
    public List<RevenuePoint> weeklyRevenue(
        @PathVariable String salonSlug,
        @RequestParam(required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return adminQueryService.getWeeklyRevenue(
            salonSlug,
            endDate != null ? endDate : LocalDate.now()
        );
    }
}
