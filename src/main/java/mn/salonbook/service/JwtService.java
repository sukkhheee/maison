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
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;

/**
 * Issues and parses HS256-signed JWTs used for stateless admin / staff auth.
 *
 * <p>The HMAC key is always derived from the configured secret via SHA-256,
 * which guarantees a fixed 256-bit key length regardless of how long the input
 * is — short secrets won't crash startup, but a warning is logged because the
 * cryptographic strength of the JWT still depends on the input's entropy.
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

    /** Bytes; HS256 requires ≥ 32. SHA-256 always produces exactly 32. */
    private static final int RECOMMENDED_MIN_BYTES = 32;

    private final SecretKey key;
    private final Duration ttl;

    public JwtService(
        @Value("${app.security.jwt.secret}") String secret,
        @Value("${app.security.jwt.access-token-ttl-minutes:1440}") long ttlMinutes
    ) {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException(
                "app.security.jwt.secret must be set (env var JWT_SECRET). " +
                "Generate one with: openssl rand -base64 48");
        }

        byte[] secretBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (secretBytes.length < RECOMMENDED_MIN_BYTES) {
            log.warn("JWT_SECRET is shorter than recommended ({} bytes; need {}+). " +
                "Tokens will still sign correctly because the key is derived via SHA-256, " +
                "but the cryptographic strength is bounded by your secret's entropy. " +
                "Rotate to a longer secret in production.",
                secretBytes.length, RECOMMENDED_MIN_BYTES);
        }

        // SHA-256 → exactly 32 bytes → meets jjwt's HS256 minimum without
        // crashing the app on shorter inputs.
        byte[] keyBytes = sha256(secretBytes);
        this.key = Keys.hmacShaKeyFor(keyBytes);
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

    private static byte[] sha256(byte[] input) {
        try {
            return MessageDigest.getInstance("SHA-256").digest(input);
        } catch (NoSuchAlgorithmException e) {
            // SHA-256 is mandated by every JRE; this branch is unreachable.
            throw new IllegalStateException("SHA-256 not available in this JRE", e);
        }
    }
}
