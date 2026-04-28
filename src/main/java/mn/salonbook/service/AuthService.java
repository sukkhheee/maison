package mn.salonbook.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mn.salonbook.domain.entity.Salon;
import mn.salonbook.domain.entity.User;
import mn.salonbook.domain.enums.Role;
import mn.salonbook.repository.SalonRepository;
import mn.salonbook.repository.UserRepository;
import mn.salonbook.service.exception.AuthException;
import mn.salonbook.service.exception.ConflictException;
import mn.salonbook.service.exception.NotFoundException;
import mn.salonbook.web.dto.auth.AuthResponse;
import mn.salonbook.web.dto.auth.LoginRequest;
import mn.salonbook.web.dto.auth.MeResponse;
import mn.salonbook.web.dto.auth.RegisterSalonRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Onboarding + login orchestration. {@link #registerSalon} is the *only* entry
 * point that creates a new tenant, so the Salon ↔ first-admin invariant
 * (every salon has at least one SALON_ADMIN) lives here.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final SalonRepository salonRepo;
    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse registerSalon(RegisterSalonRequest req) {
        String email = req.email().trim().toLowerCase();
        String slug = req.salonSlug().trim().toLowerCase();

        if (userRepo.existsByEmailAndRole(email, Role.SALON_ADMIN)) {
            throw new ConflictException("EMAIL_TAKEN",
                "Энэ имэйлээр бүртгэлтэй админ аккаунт байна.");
        }
        if (salonRepo.existsBySlug(slug)) {
            throw new ConflictException("SLUG_TAKEN",
                "Энэ slug бусад салонд бүртгэгдсэн байна. Өөр slug сонгоно уу.");
        }

        Salon salon = salonRepo.save(Salon.builder()
            .name(req.salonName().trim())
            .slug(slug)
            .email(email)
            .phone(req.phone())
            .timezone(req.timezone() != null && !req.timezone().isBlank()
                ? req.timezone()
                : "Asia/Ulaanbaatar")
            .active(true)
            .build());

        User admin = userRepo.save(User.builder()
            .email(email)
            .passwordHash(passwordEncoder.encode(req.password()))
            .fullName(req.fullName().trim())
            .phone(req.phone())
            .role(Role.SALON_ADMIN)
            .salonId(salon.getId())
            .enabled(true)
            .build());

        log.info("New salon registered: slug={} adminEmail={}", salon.getSlug(), admin.getEmail());

        String token = jwtService.generateAccessToken(admin);
        return AuthResponse.of(token, jwtService.getTtlSeconds(), MeResponse.of(admin, salon));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        String email = req.email().trim().toLowerCase();
        List<User> candidates = userRepo.findLoginCandidatesByEmail(email);
        User user = candidates.stream()
            .filter(u -> passwordEncoder.matches(req.password(), u.getPasswordHash()))
            .findFirst()
            .orElseThrow(() -> new AuthException("Имэйл эсвэл нууц үг буруу байна."));

        Salon salon = user.getSalonId() != null
            ? salonRepo.findById(user.getSalonId()).orElse(null)
            : null;

        String token = jwtService.generateAccessToken(user);
        return AuthResponse.of(token, jwtService.getTtlSeconds(), MeResponse.of(user, salon));
    }

    @Transactional(readOnly = true)
    public MeResponse me(Long userId) {
        User user = userRepo.findById(userId)
            .orElseThrow(() -> new NotFoundException("User", String.valueOf(userId)));
        Salon salon = user.getSalonId() != null
            ? salonRepo.findById(user.getSalonId()).orElse(null)
            : null;
        return MeResponse.of(user, salon);
    }
}
