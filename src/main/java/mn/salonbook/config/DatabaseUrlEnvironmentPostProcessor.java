package mn.salonbook.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.Map;

/**
 * Heroku-style {@code DATABASE_URL} support — parses the connection string
 * once at startup and exposes the parts as {@code PGHOST / PGPORT / PGDATABASE
 * / PGUSER / PGPASSWORD / DB_SSLMODE} so the rest of the application.yml
 * resolution (which already reads those vars) works unchanged.
 *
 * <p>Accepts either {@code postgres://} or {@code postgresql://} schemes; if the
 * env var is absent or malformed, falls through silently and lets the existing
 * PG* fallbacks apply.
 *
 * <p>Triggered by an entry in
 * {@code src/main/resources/META-INF/spring/org.springframework.boot.env.EnvironmentPostProcessor.imports}
 * — runs before any @Bean is wired so spring.datasource.url already has the
 * resolved host/port by the time HikariCP starts.
 */
public class DatabaseUrlEnvironmentPostProcessor implements EnvironmentPostProcessor {

    private static final String SOURCE_NAME = "databaseUrlExtracted";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment env, SpringApplication application) {
        String databaseUrl = env.getProperty("DATABASE_URL");
        if (databaseUrl == null || databaseUrl.isBlank()) return;
        if (!databaseUrl.startsWith("postgres://") && !databaseUrl.startsWith("postgresql://")) return;

        try {
            URI uri = new URI(databaseUrl);

            Map<String, Object> resolved = new HashMap<>();
            resolved.put("PGHOST", uri.getHost());
            resolved.put("PGPORT", String.valueOf(uri.getPort() < 0 ? 5432 : uri.getPort()));

            String path = uri.getPath();
            if (path != null && path.startsWith("/")) {
                resolved.put("PGDATABASE", path.substring(1));
            }

            String userInfo = uri.getUserInfo();
            if (userInfo != null) {
                int colon = userInfo.indexOf(':');
                if (colon >= 0) {
                    resolved.put("PGUSER", urlDecode(userInfo.substring(0, colon)));
                    resolved.put("PGPASSWORD", urlDecode(userInfo.substring(colon + 1)));
                } else {
                    resolved.put("PGUSER", urlDecode(userInfo));
                }
            }

            // Extract sslmode from the query string if present (Neon defaults to require).
            String query = uri.getQuery();
            if (query != null) {
                for (String pair : query.split("&")) {
                    int eq = pair.indexOf('=');
                    if (eq > 0 && "sslmode".equalsIgnoreCase(pair.substring(0, eq))) {
                        resolved.put("DB_SSLMODE", pair.substring(eq + 1));
                    }
                }
            }

            // addFirst → these win over already-set OS env vars, which is the
            // intended priority: DATABASE_URL is the single source of truth.
            env.getPropertySources().addFirst(new MapPropertySource(SOURCE_NAME, resolved));
        } catch (URISyntaxException ignored) {
            // Malformed URL — let the existing config defaults take over.
        }
    }

    private static String urlDecode(String s) {
        return java.net.URLDecoder.decode(s, java.nio.charset.StandardCharsets.UTF_8);
    }
}
