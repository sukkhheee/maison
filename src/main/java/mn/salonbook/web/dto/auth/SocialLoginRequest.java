package mn.salonbook.web.dto.auth;

import jakarta.validation.constraints.NotBlank;

/**
 * Body of {@code POST /api/v1/auth/social-login}. Today only Google is wired,
 * but {@code provider} is part of the contract so adding Facebook / Apple later
 * does not require a new endpoint.
 */
public record SocialLoginRequest(
    @NotBlank String provider,
    @NotBlank String idToken
) {}
