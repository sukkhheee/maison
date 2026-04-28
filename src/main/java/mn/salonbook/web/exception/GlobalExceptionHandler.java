package mn.salonbook.web.exception;

import lombok.extern.slf4j.Slf4j;
import mn.salonbook.service.exception.AuthException;
import mn.salonbook.service.exception.BookingConflictException;
import mn.salonbook.service.exception.ConflictException;
import mn.salonbook.service.exception.ForbiddenException;
import mn.salonbook.service.exception.NotFoundException;
import mn.salonbook.service.exception.OutsideWorkingHoursException;
import mn.salonbook.web.dto.ApiError;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(NotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
            ApiError.of("NOT_FOUND", ex.getMessage(),
                Map.of("resource", ex.getResource(), "identifier", ex.getIdentifier())));
    }

    @ExceptionHandler(BookingConflictException.class)
    public ResponseEntity<ApiError> handleConflict(BookingConflictException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
            ApiError.of("BOOKING_CONFLICT",
                "Сонгосон цаг өөр захиалгатай давхцаж байна. Өөр цаг сонгоно уу.",
                Map.of(
                    "conflictingStart", ex.getConflictingStart(),
                    "conflictingEnd", ex.getConflictingEnd()
                )));
    }

    @ExceptionHandler(OutsideWorkingHoursException.class)
    public ResponseEntity<ApiError> handleOutsideHours(OutsideWorkingHoursException ex) {
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(
            ApiError.of("OUTSIDE_WORKING_HOURS",
                "Сонгосон цаг мастерын ажлын цагт багтахгүй байна.",
                Map.of("detail", ex.getMessage())));
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiError> handleConflict(ConflictException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
            ApiError.of(ex.getCode(), ex.getMessage()));
    }

    @ExceptionHandler(AuthException.class)
    public ResponseEntity<ApiError> handleAuth(AuthException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
            ApiError.of("AUTH_FAILED", ex.getMessage()));
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ApiError> handleForbidden(ForbiddenException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
            ApiError.of("FORBIDDEN", ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, Object> fields = new HashMap<>();
        for (FieldError err : ex.getBindingResult().getFieldErrors()) {
            fields.put(err.getField(), err.getDefaultMessage());
        }
        return ResponseEntity.badRequest().body(
            ApiError.of("VALIDATION_ERROR", "Илгээсэн өгөгдөл буруу байна.", fields));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnexpected(Exception ex) {
        log.error("Unhandled exception", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
            ApiError.of("INTERNAL_ERROR", "Системийн алдаа гарлаа."));
    }
}
