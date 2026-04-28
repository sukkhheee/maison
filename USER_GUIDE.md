# Maison — Хэрэглэгчийн заавар

## Системийн URL-ууд

| Зориулалт | URL |
|-----------|-----|
| 🌐 **Захиалгын сайт** (зочдод харагдах) | `https://maison-pyrf.vercel.app` |
| 🛠 **Админ удирдлага** | `https://maison-admin-nine.vercel.app` |
| ⚙ **API сервер** (фоновоор ажилладаг) | `https://maison-s8vn.onrender.com` |

---

## Хэсэг 1 — Эхэлж тохируулах (Admin)

### 1.1. Салоноо бүртгүүлэх

1. **`https://maison-admin-nine.vercel.app/get-started`**-руу очно.
2. **Form бөглөнө:**
   - **Салоны нэр**: тухайн салоны хэрэглэгчдэд харагдах нэр (ж.нь "Maison Salon")
   - **URL slug**: URL-д ашиглагдах товчлол (зөвхөн жижиг үсэг + зураас, e.g. `maison`)
   - **Бүтэн нэр**: Таны нэр (Admin)
   - **Утас**: 9900-XXXX
   - **Имэйл**: нэвтрэх имэйл — энэ нь login-ы username
   - **Нууц үг**: 8+ тэмдэгт
3. **"Салон үүсгэх"** дарна → автоматаар нэвтэрч **Дашборд**-руу шилжинэ.

> ⚠ **Анхааруулга**: slug нэг л удаа бүртгэгдэх боломжтой. Үрэх боломжгүй (одоохондоо). Сайн бод.

### 1.2. Үйлчилгээ нэмэх

Захиалга үүсгэхийн өмнө **дор хаяж нэг үйлчилгээ** бүртгэгдсэн байх ёстой.

1. Зүүн талын цэснээс **"Үйлчилгээ"**-руу очно.
2. **"Шинэ үйлчилгээ"** товч дарна.
3. Form бөглөнө:
   - **Нэр**: e.g. "Signature Cut & Style"
   - **Тайлбар** (заавал биш): үйлчилгээний дэлгэрэнгүй
   - **Үнэ**: ₮-аар (e.g. 95000)
   - **Үргэлжлэх хугацаа**: минут (e.g. 60)
   - **Идэвхтэй**: ON (default)
4. **"Үүсгэх"** → жагсаалтад нэмэгдэнэ.

> 💡 **Зөвлөмж**: 3-6 үйлчилгээ нэмэх нь зочдод сонголт өгөхөд хэмжээтэй.

### 1.3. Ажилчин (мастер) бүртгэх

1. Зүүн цэс → **"Ажилчид"** → **"Шинэ ажилтан"**.
2. Form:
   - **Харагдах нэр**: үйлчлүүлэгч сонгохдоо энэ нэрийг харна
   - **Албан тушаал**: e.g. "Senior Stylist", "Color Specialist"
   - **Танилцуулга** (заавал биш)
   - **Аватар URL** (заавал биш): зураг байх ёсгүй гэвэл avatar нь авто үсэг бүхий дугуй харуулна
   - **Имэйл**: ажилтны өөрийн (login дэвж) — мэдэхгүй бол `nickname@maison.local` гэх мэт placeholder
   - **Утас**: 9900-XXXX
3. **"Үүсгэх"** → grid-д шинэ карт.

> ⚠ **Чухал**: одоохондоо **ажилтны ажлын цаг (StaffSchedule)** UI байхгүй — backend default ажиллаж байгаа учир захиалга авна. Ажлын цаг тохируулах CRUD нь дараагийн iteration-д орох ажил.

### 1.4. Салоны мэдээллийг сайжруулах (заавал биш)

1. Зүүн цэс → **"Тохиргоо"**.
2. Засах боломжтой:
   - Салоны нэр
   - Холбоо барих имэйл, утас
   - Хаяг
   - Цагийн бүс (default: Asia/Ulaanbaatar)
3. **"Хадгалах"** → sidebar дээрх салоны нэр шинэчлэгдэнэ.

---

## Хэсэг 2 — Захиалга хүлээн авах (зочин талаас)

### 2.1. Үйлчлүүлэгчийн алхам

1. Зочин **`https://maison-pyrf.vercel.app`**-руу ороход luxury landing page харагдана.
2. **"Цаг захиалах"** товч → wizard эхэлнэ:
   - **Алхам 1**: Үйлчилгээ сонгох (1+ үйлчилгээ)
   - **Алхам 2**: Мастер + огноо + цаг сонгох
   - **Алхам 3**: Нэр + утас + (заавал биш) имэйл бөглөж "Баталгаажуулах"
3. **QPay dialog** нээгдэнэ:
   - QR код харагдана
   - Банкны логотой товчнуудаас сонгож апп-аар дамжуулан төлбөр хийнэ
   - **Demo mode-д** (одоо тохируулагдсан) ~10 секундын дараа автомат "PAID" болж confirmation screen гарна
4. Захиалгын дугаар (#NN) харагдана → Admin-д шинэ booking шууд харагдана.

### 2.2. QPay live mode-руу шилжүүлэх (production)

QPay merchant credential авсны дараа Render → Environment-д:
```
QPAY_USERNAME=<your username>
QPAY_PASSWORD=<your password>
QPAY_INVOICE_CODE=<your invoice template code>
QPAY_BASE_URL=https://merchant.qpay.mn/v2
```

Save хийсний дараа auto restart → жинхэнэ QPay invoice үүсэх болно. Webhook URL-ыг QPay merchant portal дээр бүртгэх:
```
https://maison-s8vn.onrender.com/api/v1/public/qpay/callback
```

---

## Хэсэг 3 — Өдөр тутмын ажиллагаа (Admin)

### 3.1. Өнөөдрийн дүр зураг — **Дашборд**

`https://maison-admin-nine.vercel.app/` нэвтэрсний дараа:

- **4 KPI карт**:
  1. Өнөөдрийн орлого
  2. Өнөөдрийн захиалгын тоо
  3. Шинэ үйлчлүүлэгчийн тоо
  4. Хүлээгдэж буй төлбөр (захиалга байгаа боловч төлөгдөөгүй)
- **7 хоногийн орлогын chart** — даваагаас няям хүртлэх trend
- **Сүүлийн захиалгууд** — өнөөдрийн 5 захиалга

### 3.2. **Master Calendar** — өнөөдрийн хуваарь нэг харцаар

Зүүн цэс → **"Календарь"**:

- **Багана** = ажилтан тус бүр
- **Мөр** = 30 минут тутамд (09:00-аас 21:00)
- **Карт** = захиалга (өнгөөр master тус бүрд тусдаа)
- **Улаан зураас** = одоогийн цаг (зөвхөн өнөөдөр)
- ←/→ товчоор өдөр сэлгэх

**Карт дотор:**
- Үйлчлүүлэгчийн нэр
- Үйлчилгээ
- Үнэ
- ✓ PAID эсвэл ⚠ UNPAID badge
- Status (баталгаажсан / хүлээгдэж буй / цуцлагдсан)

### 3.3. **Захиалгын жагсаалт** — бүх historic захиалга

Зүүн цэс → **"Захиалгууд"**:

- **Status filter chips** — Бүгд / Хүлээгдэж буй / Баталгаажсан / Дууссан / Цуцлагдсан
- **Хайлт** — нэр, үйлчилгээ, ID-аар
- **Pagination** — 8 мөр / page
- Сүүлийн **14 хоногийн** захиалгуудаас харагдана
- Action menu (3 цэг) — Дэлгэрэнгүй / Засах / Цуцлах (одоохондоо placeholder; mutation API дараа орох)

### 3.4. Шинэ үйлчилгээ / ажилтан нэмэх

- **/services** → "Шинэ үйлчилгээ" → form → үүсгэх
- **/staff** → "Шинэ ажилтан" → form → үүсгэх
- **Pencil icon** → засах
- **Trash icon** → "Идэвхгүй болгох" (soft delete — захиалгын түүх хадгалагдана)

### 3.5. Хэлний сонголт (зөвхөн зочны сайт)

`https://maison-pyrf.vercel.app` дээрх Navbar дотор **🇲🇳 Монгол / 🇬🇧 English** dropdown. Англи хэл сонгосон зочин `/en/...` URL-аар үргэлжилдэг — гадаадын зочдод share хийхэд тохиромжтой.

---

## Хэсэг 4 — Шинэ ажилтан / салоны admin шилжүүлэх

### 4.1. Гарах

Sidebar-ын доод хэсэг → User card дээрх **logout icon (↗)** → /login-руу redirect.

### 4.2. Дахин нэвтрэх

`/login` → имэйл + нууц үг.

### 4.3. Олон админ нэмэх / staff-аас ажилтан болгох

⚠ **Одоохондоо UI байхгүй** — staff-ы login account нь ажилтан үүсгэх үед автоматаар үүсдэг боловч password-аа шинэчлэх UI байхгүй. Дараагийн iteration-д "Forgot password" + "Invite admin" feature нэмэх ажил.

Түр workaround: staff аккаунт login-руу нэвтрэх шаардлагатай бол Neon dashboard-аас SQL ажиллуулж password hash-ыг update хийх хэрэгтэй.

---

## Хэсэг 5 — Анхаарах зүйлс (free tier хязгаарлалт)

### 5.1. **Cold start** — эхний request удаан

- Render free tier нь 15 минут idle бол sleep хийгддэг.
- Дараагийн нэг request **30-60 сек хүлээх** магадлалтай.
- Зочны эхний browser open үед "Loading..." удаан хүлээж байж болзошгүй.

**Шийдэл (production):**
- Render Starter $7/сар → 24/7 uptime
- Эсвэл [UptimeRobot](https://uptimerobot.com)-ийн free monitor-аар backend-аа 5 мин тутамд ping хийлгэж сэрүүн байлгах

### 5.2. **Database** — Neon free tier

- 3GB хязгаар (хичнээн ч захиалгад хангалттай)
- Idle бол suspend хийгдэнэ — 5 секундийн дотор сэрнэ
- Тестэд ok, production traffic-д хямд upgrade

### 5.3. **JWT token** — 1 хоногийн насжилттай

- Login хийсний дараа 24 цагийн дараа автомат гарна
- Богино password reset механизм одоохондоо байхгүй — гар хуруугаараа `JWT_TTL_MINUTES` env var-аар тохируулж болно

---

## Хэсэг 6 — Алдаа гарвал

### "Сервертэй холбогдож чадсангүй" (frontend дээр)

1. **DevTools (F12) → Network tab** → улаан request-ыг товш
2. Status шалгах:
   - **CORS error** → Render-ийн `APP_ALLOWED_ORIGINS` Vercel домэйнтэй sync эсэхийг шалга
   - **(failed)** → backend cold start-аас унтаж байж болзошгүй, 30 сек хүлээгээд дахиж туршина уу
   - **502/503** → Render service унасан, Render dashboard log-аас шалгана

### "BOOKING_CONFLICT" (захиалга хийхэд)

- Сонгосон цагтай давхцаж буй өөр захиалга бий → өөр цаг сонгоно.
- Эсвэл өмнөх ялын тестийн өгөгдөл байж болзошгүй — admin /bookings дээр устгах.

### "OUTSIDE_WORKING_HOURS"

- Тэр мастерын ажлын цагт оруулсан цаг багтахгүй байна.
- Default ажлын цаг 09:00–20:00 (Tue-Sun, Monday off). UI хараахан байхгүй учир database-аас INSERT хийн өөрчилнө.

### Login-аас 401 буцаж байгаа

- Имэйл/нууц үг буруу
- Эсвэл бүртгэх үед ашигласан имэйл + slug combo-той зөв тохирч байгаа эсэхийг шалга
- Database (Neon) console дээр `SELECT email, role FROM users` ажиллуулж бүртгэлээ хайх

---

## Хэсэг 7 — Хаашаа цааш хөгжүүлэх

Одоогийн системийн нөхцөл байдал:

| Үнэлгээ | Зүйл |
|---------|------|
| ✅ Бэлэн | Salon onboarding, services CRUD, staff CRUD, settings, calendar, bookings list, dashboard, public booking widget, QPay mock, JWT auth, rate limiting, Flyway migrations |
| ⏳ Дутуу | Staff schedule UI, booking detail / edit modal, password reset, email verification, refund flow |
| 🔮 Ирээдүй | Multi-language admin, staff role permissions, customer accounts (зочин нэвтрэх), reviews, marketing automation |

---

## Хурдан commands

```bash
# Backend log хайх
# Render dashboard → Logs tab

# Database-руу холбох (Neon)
# Neon dashboard → SQL Editor

# Бүх захиалгыг Postgres-аас харах
SELECT b.id, u.full_name, s.display_name AS staff, b.start_time, b.status, b.payment_status, b.total_price
FROM bookings b
JOIN users u ON u.id = b.client_id
JOIN staff s ON s.id = b.staff_id
ORDER BY b.start_time DESC LIMIT 50;
```
