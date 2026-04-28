package mn.salonbook.repository;

import mn.salonbook.domain.entity.StaffSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.DayOfWeek;
import java.util.List;

public interface StaffScheduleRepository extends JpaRepository<StaffSchedule, Long> {

    List<StaffSchedule> findByStaffIdAndDayOfWeek(Long staffId, DayOfWeek dayOfWeek);
}
