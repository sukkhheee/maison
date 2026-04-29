package mn.salonbook.web.controller;

import lombok.RequiredArgsConstructor;
import mn.salonbook.domain.entity.Booking;
import mn.salonbook.domain.entity.Salon;
import mn.salonbook.domain.entity.User;
import mn.salonbook.repository.SalonRepository;
import mn.salonbook.service.BookingService;
import mn.salonbook.service.exception.AuthException;
import mn.salonbook.web.dto.customer.CustomerBookingResponse;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Endpoints scoped to "the currently authenticated customer". Today this is
 * just listing your own bookings; a future "cancel booking" / "reschedule"
 * endpoint would land here too.
 *
 * <p>Authentication is required (no public access) — protected by the
 * {@code anyRequest().authenticated()} catch-all in SecurityConfig.
 */
@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
public class CustomerBookingController {

    private final BookingService bookingService;
    private final SalonRepository salonRepo;

    @GetMapping("/me/bookings")
    public List<CustomerBookingResponse> myBookings(Authentication authentication) {
        if (authentication == null
            || !(authentication.getPrincipal() instanceof User principal)) {
            throw new AuthException("Нэвтэрсэн хэрэглэгч олдсонгүй.");
        }

        List<Booking> bookings = bookingService.listForClient(principal.getId());
        if (bookings.isEmpty()) return List.of();

        // Salons are tiny relative to bookings — one batched lookup beats N queries.
        Map<Long, Salon> salonsById = new HashMap<>();
        bookings.stream()
            .map(Booking::getSalonId)
            .distinct()
            .forEach(id -> salonRepo.findById(id).ifPresent(s -> salonsById.put(id, s)));

        return bookings.stream()
            .map(b -> CustomerBookingResponse.of(b, salonsById.get(b.getSalonId())))
            .toList();
    }
}
