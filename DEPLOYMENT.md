# Deployment Guide — Railway + Vercel

Энэ нь **Salonbook**-ийг тестээр интернэт дээр гаргах step-by-step гарын авлага.
Үнийн дүн: ~$5–10/сар (Railway $5 hobby + Postgres + Vercel free tier).

> **Бэлтгэл шаардлага:**
> - GitHub эсвэл GitLab repo (Railway/Vercel хоёул GitHub-аар authenticate хийдэг)
> - Railway аккаунт (https://railway.app)
> - Vercel аккаунт (https://vercel.com)

---

## Архитектурын зураг

```
┌─────────────────────────────┐    ┌─────────────────────────────┐
│  frontend.vercel.app        │    │  admin.vercel.app           │
│  (client booking widget)    │    │  (salon admin dashboard)    │
└──────────────┬──────────────┘    └──────────────┬──────────────┘
               │                                  │
               │   HTTPS + JWT Bearer             │
               └──────────────┬───────────────────┘
                              ▼
            ┌─────────────────────────────────────┐
            │  api.up.railway.app                 │
            │  Spring Boot 3.3 + Java 21          │
            │  ↕ Postgres (Railway add-on)        │
            │  ↔ QPay merchant API                │
            └─────────────────────────────────────┘
```

---

## 1. Backend — Railway-руу deploy

### 1.1. Postgres add-on үүсгэх

1. Railway dashboard → **New Project** → **Provision PostgreSQL**.
2. Project үүссэний дараа `Postgres` service дээр товшоод **Variables** tab-ийг нээ. Дараах переменные нь автоматаар үүснэ:
   - `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`
   - `DATABASE_URL`, `DATABASE_PRIVATE_URL`
3. Эдгээрийг гар хийсэнгүй — backend service-ээс reference хийнэ.

### 1.2. Backend service үүсгэх

1. Тэр project дотроо → **+ New** → **GitHub Repo** → таны `saas` repo-г сонго.
2. **Settings** → **Source** дотор:
   - **Root Directory**: хоосон үлдээ (repo root)
   - **Build Command**: автоматаар `./mvnw clean package -DskipTests`
   - **Start Command**: автоматаар `java -jar target/*.jar`
   - Хэрэв Railway автоматаар тогтоохгүй бол дээрх 2 командыг гараар оруул.
3. **Settings** → **Networking** → **Generate Domain** дарж public URL үүсгэ. Үр дүн нь:
   `https://salonbook-api-production.up.railway.app` маягтай.
   Энэ URL-ыг `BACKEND_URL` гэж тэмдэглэн авч ява.

### 1.3. Environment variables

Backend service → **Variables** tab → **+ New Variable**. Дараах переменние оруул:

| Хувьсагч | Утга | Тайлбар |
|----------|------|---------|
| `SPRING_PROFILES_ACTIVE` | `prod` | DataSeeder-ийн "maison" demo салон үүсгэхгүй |
| `JWT_SECRET` | (доорх) | 32+ тэмдэгт hex/base64 string |
| `APP_PUBLIC_BASE_URL` | `${BACKEND_URL}` | QPay callback-д ашиглана |
| `APP_ALLOWED_ORIGINS` | `https://your-frontend.vercel.app,https://your-admin.vercel.app` | Vercel домэйн нэмэгдсэний дараа шинэчил |
| `QPAY_USERNAME` | (хоосон үлдээж болно) | Mock mode-оор ажиллана |
| `QPAY_PASSWORD` | (хоосон) |  |
| `QPAY_INVOICE_CODE` | (хоосон) |  |

**`JWT_SECRET` үүсгэх:** Local terminal-аас:
```bash
openssl rand -base64 48
# жишээ output: jxK8aH2nL+vR9... (66 тэмдэгт)
```

**Postgres variables linking:**
Backend service → **Variables** → "Add Reference Variable" → Postgres-аас сонго:
- `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`

(Шүү ингэснээр `application.yml` дотрох default `${PGHOST}` бичлэгүүд бөглөгдөнө.)

### 1.4. Deploy + verify

1. **Deploy** товчийг дарж эхний build хийлгэ (~3-5 мин).
2. **Logs** хайтан харна — `Started SalonbookApplication in N.NNNs` гэж гарвал амжилттай.
3. Тест:
   ```bash
   curl https://your-backend.up.railway.app/actuator/health
   # → {"status":"UP"}
   ```

---

## 2. Frontend (client) — Vercel-руу deploy

1. https://vercel.com/new → **Import Git Repository** → `saas` repo.
2. **Configure Project**:
   - **Framework Preset**: Next.js (автомат)
   - **Root Directory**: `frontend` ⚠ заавал тохируул
   - **Build Command**: автомат (`next build`)
   - **Install Command**: автомат
3. **Environment Variables** дотор:
   - `NEXT_PUBLIC_API_BASE_URL` = `https://your-backend.up.railway.app/api/v1`
   - `NEXT_PUBLIC_SALON_SLUG` = `maison` (эсвэл таны үндсэн салоны slug)
4. **Deploy** товч → 1-2 минут хүлээ.
5. Үүссэн URL-ийг тэмдэглэн ав: `https://your-frontend.vercel.app`.

---

## 3. Frontend (admin) — Vercel-руу

Дээрх алхамыг яг адил давтана, ялгаа нь:
- **Root Directory**: `frontend-admin`
- **Project Name**: `salonbook-admin` (эсвэл хүсэлтэй нэр)
- Environment variables ижил.

URL: `https://your-admin.vercel.app`

---

## 4. CORS-ийг шинэчлэх

Backend service-ийн `APP_ALLOWED_ORIGINS`-руу одоо хоёр URL-ыг нэмнэ:
```
https://your-frontend.vercel.app,https://your-admin.vercel.app
```

Railway → Variables → save хийсний дараа service автоматаар restart болно.

---

## 5. Туршилтын flow

1. **Admin бүртгэл:** `https://your-admin.vercel.app` → /get-started → шинэ салон үүсгэ.
2. **Үйлчилгээ + ажилтан:** /services + /staff дээр 2-3 мөр оруул.
3. **Public widget:** `https://your-frontend.vercel.app/book` → таны seed-сэн данные дээр захиалга хий.
4. **QPay mock-ээр төлөх:** ~10 секунд хүлээгээд автоматаар PAID болж confirmation screen гарна.
5. **Admin dashboard:** `https://your-admin.vercel.app` → шинэ захиалга stats + calendar дээр шууд харагдана.

---

## Production-readiness checklist

Тестээр гарсаны дараа production launch-аас өмнө **заавал** засах ёстой зүйлс:

### Хатуу шаардлага (security)
- [ ] **`JWT_SECRET`-ийг 32+ random byte болгох** (default утгыг production-д хэзээ ч ашиглахгүй).
- [ ] **HTTPS-only**: Railway/Vercel хоёул автоматаар TLS өгдөг — өөрийн домэйн залгасан тохиолдолд DNS дээр CAA record шалга.
- [ ] **`SPRING_PROFILES_ACTIVE=prod`** — DataSeeder ажиллахгүй болж, демо данные leak хийгдэхгүй.
- [ ] **CORS allowed-origins** нь зөвхөн жинхэнэ frontend домэйнуудтай — wildcard `*` ашиглахгүй.

### Орлуулах ёстой (нэг өдрийн ажил)
- [ ] **Flyway migration** — `ddl-auto: validate`-руу шилжих. Schema-г зөв rollback хийх боломжтой болгох.
- [ ] **JWT-ийг httpOnly cookie-руу** — XSS-аас сэргийлэх (одоо localStorage).
- [ ] **Rate limiting** — `/auth/login`, `/auth/register-salon` endpoint-уудад brute-force-аас хамгаалах. Spring Security + Bucket4j.
- [ ] **Email verification** — register-salon-ийн дараа имэйл баталгаажуулах link.
- [ ] **Password reset flow** — нууц үгээ мартсан хэрэглэгчдэд.

### Operational
- [ ] **DB backup** — Railway Postgres-ийн "Daily snapshots" plan ($5+/сар) идэвхжүүлэх.
- [ ] **Logging + alerting** — Sentry эсвэл Datadog/Grafana Cloud.
- [ ] **Health check endpoint** — `/actuator/health` нь Railway-ийн built-in health check-д ашиглагдаж байгаа эсэхийг баталгаажуулах.
- [ ] **Custom domain** — `app.maison.mn`, `admin.maison.mn`, `api.maison.mn` 3 SUBDOMAIN-ийг DNS дээр CNAME-аар Railway/Vercel-руу холбох.

### QPay (production-руу шилжих үед)
- [ ] **Жинхэнэ merchant credentials**-ийг Railway Variables-руу:
  - `QPAY_BASE_URL=https://merchant.qpay.mn/v2` (sandbox-аас prod-руу)
  - `QPAY_USERNAME`, `QPAY_PASSWORD`, `QPAY_INVOICE_CODE`
- [ ] **Webhook URL**-ыг QPay merchant portal дээр бүртгэх:
  `https://your-backend.up.railway.app/api/v1/public/qpay/callback`
- [ ] **Webhook signature verification** — payload spoofing-аас сэргийлэх (одоо trust-but-verify pattern).

---

## Алдаа гарах эрсдэлтэй газрууд

**1. Backend нь ачаалах үедээ "JWT_SECRET must be at least 32 characters" гэж унавал:**
- Railway Variables дээрх `JWT_SECRET`-ийн уртыг шалга. Шинэ random string үүсгэж дахин deploy.

**2. Frontend дээр CORS error харагдвал (Network tab дээр Access-Control-Allow-Origin):**
- `APP_ALLOWED_ORIGINS`-руу яг тэр Vercel домэйн (https://-тэйгээ) нэмсэн эсэхийг шалга. Олон домэйнийг таслалаар тусгаарла. Trailing slash байх ёсгүй.

**3. Захиалга үүсгэх үед "BOOKING_CONFLICT" эсвэл "OUTSIDE_WORKING_HOURS" гарвал:**
- Хэрэв `SPRING_PROFILES_ACTIVE=prod` бол DataSeeder ажиллаагүй учир салонд staff/staff_schedule байхгүй. Эхлээд /get-started-аар шинэ салон үүсгэ, дараа /staff-аар ажилтан + /services-аар үйлчилгээ нэмэх ёстой. Staff-д schedule одоохондоо CRUD-гүй учир `staff_schedules` хүснэгтэд гар оруулсан INSERT хэрэгтэй.

**4. Vercel build "Cannot find module 'next-intl'" гэж унавал:**
- `frontend/package.json`-ыг repo-руу commit хийсэн эсэхийг шалга — Vercel-ийн install step package.json-г уншина.

---

## Шинэ deploy хийх

Кодоо merge хийсэн `main` branch автоматаар Railway + Vercel хоёр дээр шинэчлэгдэнэ. Гар хийсэнтэй ажил байхгүй.

**Зөвхөн тодорхой commit-ийг redeploy хийх:**
- Railway: service → Deployments tab → 3-цэгтэй menu → "Redeploy".
- Vercel: project → Deployments tab → дээр гарсан commit → "Redeploy".

---

## Гарах мөнгө (заавал биш)

| Service | Free tier | Recommended |
|---------|-----------|-------------|
| Railway backend | $5 кредит / эхний сар | $5/сар Hobby (24/7 uptime) |
| Railway Postgres | shared instance, эхний сар үнэгүй | included in Hobby |
| Vercel (хоёр frontend) | unlimited deployments, 100GB transfer | free tier хангалттай |

**Нийт ~$5/сар** тестийн орчинд. QPay production credentials нэмэхэд илүү траффик татах боломжтой — тэр үед Railway hobby-аас pro-руу шилжих.
