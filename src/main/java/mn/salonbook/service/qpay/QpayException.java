package mn.salonbook.service.qpay;

public class QpayException extends RuntimeException {
    public QpayException(String message, Throwable cause) {
        super(message, cause);
    }

    public QpayException(String message) {
        super(message);
    }
}
