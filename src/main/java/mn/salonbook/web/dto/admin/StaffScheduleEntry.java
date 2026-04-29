package mn.salonbook.web.dto.admin;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import mn.salonbook.domain.entity.StaffSchedule;

import java.time.DayOfWeek;
import java.time.LocalTime;

/**
 * One shift on one day. Multiple entries for the same {@code dayOfWeek} are
 * allowed (e.g. morning and afternoon shifts) — uniqueness is enforced by
 * (staff_id, day_of_week, start_time).
 */
public record StaffScheduleEntry(
    @NotNull DayOfWeek dayOfWeek,

    @NotNull
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm[:ss]")
    LocalTime startTime,

    @NotNull
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm[:ss]")
    LocalTime endTime
) {
    public static StaffScheduleEntry of(StaffSchedule s) {
        return new StaffScheduleEntry(s.getDayOfWeek(), s.getStartTime(), s.getEndTime());
    }
}
