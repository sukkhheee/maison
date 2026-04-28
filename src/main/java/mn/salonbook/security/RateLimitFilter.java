package mn.salonbook.security;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.List;

/**
 * In-memory token-bucket rate limiter for the public auth endpoints.
 *
 * <p>Two limits per IP:
 * <ul>
 *   <li>{@code /api/v1/auth/login}: 10 req / minute — allows quick retry on
 *       typo'd password but blocks credential-stuffing tools.</li>
 *   <li>{@code /api/v1/auth/register-salon}: 5 req / hour — registration is
 *       a once-per-tenant action; aggressive limit deters spam onboarding.</li>
 * </ul>
 *
 * <p>Buckets are keyed by client IP and held in a Caffeine cache that evicts
 * after 1 hour of inactivity, so memory stays bounded under traffic from many
 * unique IPs. For multi-instance deploys swap the cache for Redis-backed
 * Bucket4j; the filter signature stays the same.
 */
@Slf4j
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final List<Endpoint> LIMITED = List.of(
        new Endpoint("/api/v1/auth/login",
            Bandwidth.builder().capacity(10).refillIntervally(10, Duration.ofMinutes(1)).build()),
        new Endpoint("/api/v1/auth/register-salon",
            Bandwidth.builder().capacity(5).refillIntervally(5, Duration.ofHours(1)).build())
    );

    private final Cache<String, Bucket> buckets = Caffeine.newBuilder()
        .expireAfterAccess(Duration.ofHours(1))
        .maximumSize(10_000)
        .build();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String path = request.getRequestURI();
        Endpoint match = LIMITED.stream()
            .filter(e -> e.path.equals(path))
            .findFirst()
            .orElse(null);

        if (match == null) {
            chain.doFilter(request, response);
            return;
        }

        String key = match.path + "|" + clientIp(request);
        Bucket bucket = buckets.get(key, k -> Bucket.builder().addLimit(match.bandwidth).build());

        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);
        if (probe.isConsumed()) {
            response.setHeader("X-RateLimit-Remaining", String.valueOf(probe.getRemainingTokens()));
            chain.doFilter(request, response);
            return;
        }

        long waitSeconds = Math.max(1, probe.getNanosToWaitForRefill() / 1_000_000_000L);
        log.warn("Rate limit hit on {} for ip={} retryAfterSec={}", path, clientIp(request), waitSeconds);
        // Jakarta's HttpServletResponse doesn't ship a 429 constant — use the literal.
        response.setStatus(429);
        response.setHeader("Retry-After", String.valueOf(waitSeconds));
        response.setHeader("X-RateLimit-Remaining", "0");
        response.setContentType("application/json");
        response.getWriter().write(
            "{\"code\":\"RATE_LIMITED\",\"message\":\"Хэт олон хүсэлт илгээгдлээ. " + waitSeconds
                + " секундын дараа дахин оролдоно уу.\"}");
    }

    /**
     * Best-effort client IP extraction. Honors the platform load balancer's
     * X-Forwarded-For first hop (Railway/Render/Fly all set this).
     */
    private String clientIp(HttpServletRequest req) {
        String xff = req.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            int comma = xff.indexOf(',');
            return (comma > 0 ? xff.substring(0, comma) : xff).trim();
        }
        return req.getRemoteAddr();
    }

    private record Endpoint(String path, Bandwidth bandwidth) {}
}
