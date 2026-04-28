package mn.salonbook.web.dto.auth;

public record AuthResponse(
    String accessToken,
    String tokenType,
    long expiresInSeconds,
    MeResponse user
) {
    public static AuthResponse of(String token, long ttlSeconds, MeResponse user) {
        return new AuthResponse(token, "Bearer", ttlSeconds, user);
    }
}
