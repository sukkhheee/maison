package mn.salonbook.web.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Inbound payload for {@code POST /api/v1/public/salons/{slug}/bookings}.
 *
 * <p>{@code startTime} is a wall-clock {@link LocalDateTime} (no offset). It is
 * resolved against the salon's configured timezone to produce the absolute
 * {@code Instant} used for conflict detection. This decouples the client from
 * the server's local clock.
 */
public record BookingCreateRequest(
    @NotBlank String staffExternalId,
    @NotEmpty List<@NotBlank String> serviceExternalIds,
    @NotNull LocalDateTime startTime,
    @Valid @NotNull CustomerInfo customer,
    @Size(max = 1000) String notes
) {
}
