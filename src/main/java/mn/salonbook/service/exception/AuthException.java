package mn.salonbook.service.exception;

/** Login failed — bad credentials, disabled account, etc. */
public class AuthException extends RuntimeException {
    public AuthException(String message) {
        super(message);
    }
}
