package mn.salonbook.repository;

import mn.salonbook.domain.entity.StaffSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.DayOfWeek;
import java.util.List;

public interface StaffScheduleRepository extends JpaRepository<StaffSchedule, Long> {

    List<StaffSchedule> findByStaffIdAndDayOfWeek(Long staffId, DayOfWeek dayOfWeek);

    /** Whole-week view, ordered for stable display in admin UI. */
    List<StaffSchedule> findByStaffIdOrderByDayOfWeekAscStartTimeAsc(Long staffId);

    /** Atomic wipe used by the admin "replace schedule" PUT endpoint. */
    @Modifying
    @Query("DELETE FROM StaffSchedule s WHERE s.staff.id = :staffId")
    void deleteByStaffId(@Param("staffId") Long staffId);
}
