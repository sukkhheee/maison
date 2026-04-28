package mn.salonbook.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import mn.salonbook.domain.entity.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;

/**
 * Issues and parses HS256-signed JWTs used for stateless admin / staff auth.
 *
 * <p>Claims layout:
 * <pre>
 *   sub      = user.id           (Long, primary identity)
 *   email    = user.email
 *   role     = SALON_ADMIN | STAFF | SUPER_ADMIN | CLIENT
 *   salonId  = tenant id (null for SUPER_ADMIN / CLIENT)
 * </pre>
 */
@Slf4j
@Service
public class JwtService {

    private final SecretKey key;
    private final Duration ttl;

    public JwtService(
        @Value("${app.security.jwt.secret}") String secret,
        @Value("${app.security.jwt.access-token-ttl-minutes:1440}") long ttlMinutes
    ) {
        if (secret.length() < 32) {
            // HS256 requires a 256-bit key. Anything shorter would silently fail in jjwt.
            throw new IllegalStateException(
                "app.security.jwt.secret must be at least 32 characters; got " + secret.length());
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.ttl = Duration.ofMinutes(ttlMinutes);
    }

    public long getTtlSeconds() {
        return ttl.toSeconds();
    }

    public String generateAccessToken(User user) {
        Instant now = Instant.now();
        return Jwts.builder()
            .subject(String.valueOf(user.getId()))
            .claim("email", user.getEmail())
            .claim("role", user.getRole().name())
            .claim("salonId", user.getSalonId())
            .issuedAt(Date.from(now))
            .expiration(Date.from(now.plus(ttl)))
            .signWith(key)
            .compact();
    }

    /**
     * Verifies signature + expiry. Throws on invalid token — callers should
     * treat any throw as "request is anonymous".
     */
    public Claims parse(String token) {
        return Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }
}
