package mn.salonbook.web.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mn.salonbook.domain.entity.User;
import mn.salonbook.service.AuthService;
import mn.salonbook.service.exception.AuthException;
import mn.salonbook.web.dto.auth.AuthResponse;
import mn.salonbook.web.dto.auth.LoginRequest;
import mn.salonbook.web.dto.auth.MeResponse;
import mn.salonbook.web.dto.auth.RegisterSalonRequest;
import mn.salonbook.web.dto.auth.SocialLoginRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register-salon")
    public ResponseEntity<AuthResponse> registerSalon(@Valid @RequestBody RegisterSalonRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registerSalon(req));
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }

    @PostMapping("/social-login")
    public AuthResponse socialLogin(@Valid @RequestBody SocialLoginRequest req) {
        return authService.socialLogin(req);
    }

    @GetMapping("/me")
    public MeResponse me(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User principal)) {
            throw new AuthException("Authenticated user not found in security context.");
        }
        return authService.me(principal.getId());
    }
}
