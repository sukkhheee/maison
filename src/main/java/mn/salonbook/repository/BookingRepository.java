package mn.salonbook.repository;

import mn.salonbook.domain.entity.Booking;
import mn.salonbook.domain.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Collection;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    /**
     * Conflict-detection query — Алхам 2-ийн гол query.
     *
     * <p>Two intervals [a.start, a.end) and [b.start, b.end) overlap iff
     * {@code a.start < b.end AND a.end > b.start}. We translate that into the
     * indexed condition below: any existing booking whose {@code startTime}
     * is strictly before the requested {@code end} AND whose {@code endTime}
     * is strictly after the requested {@code start}.
     *
     * <p>Filters by:
     * <ul>
     *   <li>{@code salonId} — multi-tenancy guard (discriminator column).</li>
     *   <li>{@code staffId} — only the same master can conflict with itself.</li>
     *   <li>{@code statuses} — only PENDING / CONFIRMED block the slot;
     *       CANCELLED and NO_SHOW must free it up.</li>
     * </ul>
     *
     * <p>Powered by the composite index
     * {@code idx_bookings_staff_window(staff_id, start_time, end_time, status)}.
     */
    @Query("""
        SELECT b FROM Booking b
        WHERE b.salonId = :salonId
          AND b.staff.id = :staffId
          AND b.status IN :statuses
          AND b.startTime < :requestedEnd
          AND b.endTime   > :requestedStart
        ORDER BY b.startTime ASC
        """)
    List<Booking> findOverlapping(@Param("salonId") Long salonId,
                                  @Param("staffId") Long staffId,
                                  @Param("requestedStart") Instant requestedStart,
                                  @Param("requestedEnd") Instant requestedEnd,
                                  @Param("statuses") Collection<BookingStatus> statuses);

    List<Booking> findAllByClientIdOrderByStartTimeDesc(Long clientId);

    /**
     * Admin query — all bookings whose start_time falls in [from, to). Used by
     * the calendar (single day), the booking table (range), and the stats
     * aggregator. Eagerly fetches services + staff + client to avoid N+1 in DTO mapping.
     */
    @Query("""
        SELECT DISTINCT b FROM Booking b
          LEFT JOIN FETCH b.staff s
          LEFT JOIN FETCH b.client c
          LEFT JOIN FETCH b.services
        WHERE b.salonId = :salonId
          AND b.startTime >= :from
          AND b.startTime <  :to
        ORDER BY b.startTime ASC
        """)
    List<Booking> findInRange(@Param("salonId") Long salonId,
                              @Param("from") Instant from,
                              @Param("to") Instant to);
}
