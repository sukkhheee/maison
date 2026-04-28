package mn.salonbook.service.exception;

import java.time.Instant;

/**
 * Thrown when a requested booking slot overlaps with at least one existing
 * PENDING/CONFIRMED booking for the same staff member.
 *
 * <p>The conflicting window is exposed so the API can return it to the client
 * and let the UI suggest the next free slot.
 */
public class BookingConflictException extends RuntimeException {

    private final Instant conflictingStart;
    private final Instant conflictingEnd;

    public BookingConflictException(Instant conflictingStart, Instant conflictingEnd) {
        super("Booking conflicts with existing slot %s – %s"
            .formatted(conflictingStart, conflictingEnd));
        this.conflictingStart = conflictingStart;
        this.conflictingEnd = conflictingEnd;
    }

    public Instant getConflictingStart() {
        return conflictingStart;
    }

    public Instant getConflictingEnd() {
        return conflictingEnd;
    }
}
