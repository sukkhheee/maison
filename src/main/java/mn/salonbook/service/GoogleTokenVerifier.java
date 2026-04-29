package mn.salonbook.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import mn.salonbook.service.exception.AuthException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

/**
 * Verifies Google ID tokens against Google's tokeninfo endpoint and returns the
 * verified claims we care about.
 *
 * <p>We deliberately avoid the {@code google-api-client} dependency: tokeninfo
 * is HTTPS-served by Google itself, performs signature + expiry + issuer
 * validation server-side, and is the documented fallback path for backends
 * that don't want to ship a JOSE library. The trade-off is one extra HTTPS
 * round-trip per login — fine at our login volume.
 *
 * <p>Reference:
 * https://developers.google.com/identity/sign-in/web/backend-auth#verify-the-integrity-of-the-id-token
 */
@Slf4j
@Service
public class GoogleTokenVerifier {

    private static final String TOKENINFO_URL =
        "https://oauth2.googleapis.com/tokeninfo?id_token=";

    private final HttpClient http = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(5))
        .build();
    private final ObjectMapper json = new ObjectMapper();

    private final String expectedAudience;

    public GoogleTokenVerifier(@Value("${app.security.google.client-id:}") String clientId) {
        this.expectedAudience = clientId == null ? "" : clientId.trim();
    }

    /** Verified subset of Google's ID token payload. */
    public record GoogleIdentity(
        String googleSub,
        String email,
        boolean emailVerified,
        String name,
        String picture
    ) {}

    public GoogleIdentity verify(String idToken) {
        if (idToken == null || idToken.isBlank()) {
            throw new AuthException("Google ID token дутуу байна.");
        }
        if (expectedAudience.isBlank()) {
            // Misconfiguration — fail loud rather than silently accept any token.
            throw new AuthException(
                "Google client-id серверт тохируулагдаагүй байна (app.security.google.client-id).");
        }

        JsonNode payload = fetchTokenInfo(idToken);

        String aud = textOrNull(payload, "aud");
        if (aud == null || !aud.equals(expectedAudience)) {
            log.warn("Google token audience mismatch: got={} expected={}", aud, expectedAudience);
            throw new AuthException("Google token-ийн audience таарахгүй байна.");
        }

        String iss = textOrNull(payload, "iss");
        if (iss == null
            || !(iss.equals("accounts.google.com") || iss.equals("https://accounts.google.com"))) {
            throw new AuthException("Google token-ийн issuer хүлээгдсэнтэй таарсангүй.");
        }

        String sub = textOrNull(payload, "sub");
        String email = textOrNull(payload, "email");
        if (sub == null || email == null) {
            throw new AuthException("Google token-аас хэрэглэгчийн мэдээлэл уншигдсангүй.");
        }
        boolean emailVerified =
            payload.has("email_verified")
                && Boolean.parseBoolean(payload.get("email_verified").asText());

        return new GoogleIdentity(
            sub,
            email.toLowerCase(),
            emailVerified,
            textOrNull(payload, "name"),
            textOrNull(payload, "picture")
        );
    }

    private JsonNode fetchTokenInfo(String idToken) {
        String url = TOKENINFO_URL + URLEncoder.encode(idToken, StandardCharsets.UTF_8);
        HttpRequest req = HttpRequest.newBuilder(URI.create(url))
            .timeout(Duration.ofSeconds(5))
            .GET()
            .build();
        HttpResponse<String> res;
        try {
            res = http.send(req, HttpResponse.BodyHandlers.ofString());
        } catch (Exception e) {
            log.error("Google tokeninfo call failed", e);
            throw new AuthException("Google баталгаажуулалт амжилтгүй боллоо.");
        }
        if (res.statusCode() != 200) {
            log.warn("Google tokeninfo returned {}: {}", res.statusCode(), res.body());
            throw new AuthException("Google токен хүчингүй буюу хугацаа дууссан байна.");
        }
        try {
            return json.readTree(res.body());
        } catch (Exception e) {
            throw new AuthException("Google-ийн хариуг уншиж чадсангүй.");
        }
    }

    private static String textOrNull(JsonNode node, String field) {
        JsonNode v = node.get(field);
        return v == null || v.isNull() ? null : v.asText();
    }
}
