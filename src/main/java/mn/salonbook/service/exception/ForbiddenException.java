package mn.salonbook.service.exception;

/** Authenticated but not authorized — usually a cross-tenant access attempt. */
public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) {
        super(message);
    }
}
