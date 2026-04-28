package mn.salonbook.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.DayOfWeek;
import java.time.LocalTime;

/**
 * Recurring weekly working hours for a Staff member.
 * The booking conflict-checker uses these rows to validate that a requested
 * time slot falls inside the staff member's working window.
 *
 * One staff can have multiple rows per day (e.g. 09:00–13:00 and 14:00–18:00).
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
    name = "staff_schedules",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_staff_schedule_slot",
            columnNames = {"staff_id", "day_of_week", "start_time"}
        )
    },
    indexes = {
        @Index(name = "idx_staff_schedule_staff", columnList = "staff_id"),
        @Index(name = "idx_staff_schedule_salon", columnList = "salon_id")
    }
)
public class StaffSchedule extends TenantAwareEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "staff_id", nullable = false,
        foreignKey = @ForeignKey(name = "fk_staff_schedule_staff"))
    private Staff staff;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week", nullable = false, length = 16)
    private DayOfWeek dayOfWeek;

    @NotNull
    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @NotNull
    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;
}
