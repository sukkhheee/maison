package mn.salonbook.web.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mn.salonbook.domain.entity.Booking;
import mn.salonbook.service.BookingService;
import mn.salonbook.web.dto.BookingCreateRequest;
import mn.salonbook.web.dto.BookingResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/public/salons/{salonSlug}")
@RequiredArgsConstructor
public class PublicBookingController {

    private final BookingService bookingService;

    @PostMapping("/bookings")
    public ResponseEntity<BookingResponse> create(@PathVariable String salonSlug,
                                                  @Valid @RequestBody BookingCreateRequest request) {
        Booking created = bookingService.createBooking(salonSlug, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(BookingResponse.of(created));
    }
}
