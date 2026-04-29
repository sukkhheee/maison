package mn.salonbook.web.dto.admin;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * Atomic replacement payload. Whatever shifts are in {@code schedule}
 * become the staff member's full week — anything previously stored that's
 * not in this list is deleted.
 */
public record StaffScheduleUpdateRequest(
    @NotNull @Valid List<StaffScheduleEntry> schedule
) {
}
