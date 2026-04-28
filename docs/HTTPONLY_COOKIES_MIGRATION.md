# JWT-ийг httpOnly cookie-руу шилжүүлэх төлөвлөгөө

## Одоогийн төлөв (test deploy-д тохиромжтой)

- Backend: `POST /auth/login` нь `AuthResponse { accessToken, user }`-ийг JSON-аар буцаана.
- Frontend admin: token-ыг `localStorage.salonbook.admin.session`-д хадгалж, дараагийн request бүрд `Authorization: Bearer ...` header-аар илгээдэг.
- Эрсдэл: **XSS аюул** — өөр script DOM-руу нэвтэрвэл token-ыг уншиж, parallel session үүсгэж чадна.

## Зорилго

JWT-ыг JS-аар уншигдахгүй `httpOnly` cookie дотор хадгалах. Browser нь cookie-г автоматаар request-д чиглүүлдэг тул front-end-д token-той ажиллах шаардлагагүй.

## Backend өөрчлөлтүүд

### 1. AuthController-д cookie set хийх

```java
// web/controller/AuthController.java
@PostMapping("/login")
public AuthResponse login(@Valid @RequestBody LoginRequest req,
                          HttpServletResponse response) {
    AuthResponse res = authService.login(req);
    addAuthCookie(response, res.accessToken(), res.expiresInSeconds());
    return res;  // Body-р мөн token буцаах нь backwards compat (legacy clients)
}

private void addAuthCookie(HttpServletResponse response, String token, long ttlSec) {
    ResponseCookie cookie = ResponseCookie.from("auth-token", token)
        .httpOnly(true)
        .secure(true)              // HTTPS-only — prod дээр зөвхөн TLS-аар явна
        .sameSite("Lax")           // CSRF-аас сэргийлэх; "Strict" хүсвэл cross-site link-ээс орох үед login алдагдана
        .path("/")
        .maxAge(ttlSec)
        .build();
    response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
}

@PostMapping("/logout")
public ResponseEntity<Void> logout(HttpServletResponse response) {
    ResponseCookie expired = ResponseCookie.from("auth-token", "")
        .httpOnly(true).secure(true).sameSite("Lax").path("/").maxAge(0).build();
    response.addHeader(HttpHeaders.SET_COOKIE, expired.toString());
    return ResponseEntity.noContent().build();
}
```

### 2. JwtAuthenticationFilter-д cookie унших

```java
// security/JwtAuthenticationFilter.java
private String extractToken(HttpServletRequest req) {
    // 1. Authorization header (хуучин client-уудтай compat)
    String header = req.getHeader("Authorization");
    if (header != null && header.startsWith("Bearer ")) {
        return header.substring("Bearer ".length()).trim();
    }
    // 2. httpOnly cookie (шинэ pattern)
    if (req.getCookies() != null) {
        for (Cookie c : req.getCookies()) {
            if ("auth-token".equals(c.getName())) return c.getValue();
        }
    }
    return null;
}
```

### 3. CORS — credentials allow

`CorsConfig.java` дотор `setAllowCredentials(true)` аль хэдийн байгаа. Гэхдээ `*` allowed-origins ажиллахгүй — explicit домэйн заавал.

## Frontend өөрчлөлтүүд

### 1. API client — `credentials: "include"` flag

```ts
// lib/api/client.ts
res = await fetch(`${API_BASE}${path}`, {
  ...init,
  credentials: "include",   // ← cookie-г include хийнэ
  headers: { ... }
});
```

`Authorization` header-ийг хасахгүй — backward compat-аар хоёр channel-аар явах боломжтой. Нэг өдөр localStorage code-уудыг бүрэн арилгана.

### 2. AuthProvider — token-ыг state-д хадгалахгүй

```ts
// lib/auth/AuthProvider.tsx
// Хуучин: writeSession({ accessToken, expiresAt, user })
// Шинэ:   writeSession({ user })  ← зөвхөн UI-д үзүүлэх user info

// Browser session-ийг restore хийх:
useEffect(() => {
  fetchMe()                            // cookie автоматаар явна
    .then((u) => { setUser(u); setStatus("authenticated"); })
    .catch(() => setStatus("anonymous"));
}, []);
```

`localStorage`-аас зөвхөн UI-д харуулдаг user data (full name, salon name) хадгална. Token нь зөвхөн cookie-д.

### 3. Logout

```ts
// Хуучин: clearSession()
// Шинэ:   await api("/auth/logout", { method: "POST" });  + UI-аас user-ийг unset
```

### 4. CSRF хамгаалалт

`SameSite=Lax` cookie нь POST/PUT/DELETE-ийн ихэнх CSRF-аас хамгаалдаг. Гэхдээ super-secure хийе гэвэл:
- Backend нь login дээр `csrf-token` cookie (NOT httpOnly) нэмж буцаана.
- Frontend бүх mutating request-д `X-CSRF-Token` header-аар тэр утгыг илгээнэ.
- Backend filter нь cookie-г header-той тулгана.
- Spring Security-ийн `CookieCsrfTokenRepository.withHttpOnlyFalse()` энэ pattern-ийг хийдэг.

## Хийх дараалал

1. ✅ **Test deploy** — одоогийн localStorage-тэй явсан, traffic-гүй MVP-д tolerable.
2. ⏳ **Phase 1**: backend-д cookie + header dual support нэмэх. Frontend `credentials: "include"` нэмэх. Хоёулаа ажиллана.
3. ⏳ **Phase 2**: AuthProvider-аас accessToken state хасах (UI зөвхөн user info). Frontend бодит ашиглалт нь cookie-аар.
4. ⏳ **Phase 3**: backward-compat header support-ыг хасах. Зөвхөн cookie. Бүх mutating endpoint CSRF-protected.

## Шилжих эрсдэлүүд

- **Cookie domain mismatch**: Frontend `*.vercel.app` дээр, backend `*.up.railway.app` дээр гэвэл browser cookie cross-domain-аар явахгүй. Шийдэл: custom domain ашиглаж хоёуланг нь нэг родовой домэйн доор оруулах (`api.maison.mn` + `app.maison.mn`).
- **Subdomain rewriting**: `Set-Cookie: Domain=.maison.mn` → бүх subdomain хүртэл.
- **Local dev mismatch**: localhost-аас Railway-руу cookie явахгүй (browser block). Local dev-д Authorization header pattern хадгалах нь ухаалаг.

## Шалгалтын checklist

Phase 1-ийг хийсний дараа:

- [ ] `POST /auth/login` response-д `Set-Cookie: auth-token=...; HttpOnly; Secure` байна.
- [ ] DevTools → Application → Cookies дотор `auth-token` харагдана. JS console-д `document.cookie` хийхэд **энэ cookie харагдахгүй** (httpOnly).
- [ ] Network tab дээр follow-up `/admin/...` request-д Cookie header автоматаар явна.
- [ ] Browser refresh-аас дараа login-той үлдэнэ (cookie persists, localStorage өөр).
- [ ] `POST /auth/logout` дараа cookie устаж, дараагийн request 401-аар буцна.
