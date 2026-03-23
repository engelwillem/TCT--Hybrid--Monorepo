# Sanctum Hardening Post-Deploy Verify

Dokumen ini adalah command pack operator untuk verifikasi pasca-hardening Sanctum di cPanel.

Gunakan dokumen ini setelah:
1. source backend sudah dipush ke `main`
2. operator sudah menjalankan `deploy.sh` di cPanel

Tujuan:
- memastikan release backend baru benar-benar aktif
- memastikan migration status tidak tertinggal
- memastikan `sanctum.stateful` runtime tidak lagi rapuh
- menangkap hidden bug lebih awal sebelum bug auth/session menyebar ke surface lain

---

## 1. Quick Context

Hardening yang diverifikasi:
- fallback `sanctum.stateful` sekarang tidak hanya localhost
- fallback juga mencakup:
  - `thechoosentalks.org`
  - `www.thechoosentalks.org`
  - `api.thechoosentalks.org`

Risiko yang sedang diawasi:
- env production `SANCTUM_STATEFUL_DOMAINS` kosong
- auth user bisa jatuh ke guest karena cookie/session boundary tidak konsisten
- migration tertinggal walau deploy sukses

---

## 2. Command Pack Utama

### A. Masuk ke release aktif dan cek release

```bash
set -euo pipefail
APP_DIR="/home/thechoosentalks/deploy/apps/thechoosentalks"
cd "$APP_DIR"
echo "CURRENT_SYMLINK=$(readlink -f current)"
cd "$(readlink -f current)"
pwd
```

Expected:
- path mengarah ke release timestamp terbaru

### B. Cek route kritis

```bash
php artisan route:list --path=api | grep -E "api/today/session|api/v1/login|api/v1/register|api/v1/profile|api/v1/community/posts|api/v1/versehub/.*/books|api/v1/versehub/.*/chapter" || true
```

Expected:
- route penting tetap muncul

### C. Cek migration status

```bash
php artisan migrate:status --no-ansi
```

Expected:
- migration terbaru tetap `Ran`
- tidak ada migration baru yang masih `Pending`

Fast tail-only variant:

```bash
php artisan migrate:status --no-ansi | tail -n 12
```

### D. Dump `sanctum.stateful`

```bash
php artisan tinker --execute='echo implode(",", config("sanctum.stateful")).PHP_EOL;'
```

Expected minimum:
- output berisi:
  - `thechoosentalks.org`
  - `www.thechoosentalks.org`
  - `api.thechoosentalks.org`

Jika env kosong tetapi fallback source sudah benar, ketiga domain ini tetap harus muncul.

Observed live output on `2026-03-23`:

```text
SANCTUM_STATEFUL=thechoosentalks.org,www.thechoosentalks.org
```

Interpretasi:
- verifikasi live pasca-deploy berhasil
- auth config backend tidak lagi unknown
- tetapi env production masih belum memasukkan `api.thechoosentalks.org`
- ini bukan blocker langsung, namun tetap drift yang layak dibersihkan

### E. Dump config auth/session inti

```bash
php artisan tinker --execute='echo "APP_URL=".config("app.url").PHP_EOL; echo "SESSION_DRIVER=".config("session.driver").PHP_EOL; echo "SESSION_DOMAIN=".config("session.domain").PHP_EOL; echo "SESSION_SECURE_COOKIE=".(config("session.secure")?"true":"false").PHP_EOL; echo "SESSION_SAME_SITE=".config("session.same_site").PHP_EOL;'
```

Expected:
- `APP_URL=https://api.thechoosentalks.org`
- `SESSION_DRIVER=file`
- `SESSION_DOMAIN=.thechoosentalks.org`
- `SESSION_SECURE_COOKIE=true`
- `SESSION_SAME_SITE=lax`

### F. Smoke HTTP dasar

```bash
curl -i https://api.thechoosentalks.org/api/today/session
curl -i -X POST https://api.thechoosentalks.org/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid@example.com","password":"invalid-password"}' || true
curl -i -X POST https://api.thechoosentalks.org/api/v1/register \
  -H "Content-Type: application/json" \
  -d '{"name":"","email":"invalid","password":"short","password_confirmation":"short"}' || true
```

Expected:
- `/api/today/session` merespons normal
- login/register tidak timeout
- invalid payload menghasilkan respons aplikasi, bukan server hang

---

## 3. Hidden Bug Watchlist

Saat menjalankan verifikasi di atas, perhatikan hal ini:

### A. Migration anomaly
Gejala:
- migration terakhir tidak `Ran`
- batch terbaru tidak muncul

Makna:
- release baru hidup, tetapi schema bisa tertinggal

### B. Sanctum stateful anomaly
Gejala:
- output `sanctum.stateful` hanya localhost
- domain production utama tidak muncul

Makna:
- auth cookie/stateful SPA flow masih rapuh
- user login bisa tetap jatuh ke guest di beberapa surface

### C. Session boundary anomaly
Gejala:
- `SESSION_DOMAIN` bukan `.thechoosentalks.org`
- `SESSION_SECURE_COOKIE` bukan `true`

Makna:
- session lintas subdomain bisa gagal

### D. Route anomaly
Gejala:
- `api/v1/profile` atau auth route tidak muncul

Makna:
- release tidak sinkron atau route cache bermasalah

### E. HTTP anomaly
Gejala:
- timeout
- `500`
- `419` yang tidak konsisten

Makna:
- auth/csrf/cookie/config drift masih aktif

---

## 4. Command Pack Jika Ingin Audit Lebih Dalam

### A. Lihat table list dari koneksi DB aktif

```bash
php artisan tinker --execute='print_r(\Illuminate\Support\Facades\Schema::getTableListing());'
```

### B. Lihat database name aktif

```bash
php artisan tinker --execute='echo DB::selectOne("select database() as db")->db.PHP_EOL;'
```

### C. Cek release baru yang benar-benar aktif

```bash
cd /home/thechoosentalks/deploy/apps/thechoosentalks
readlink -f current
ls -1 releases | tail -n 5
```

---

## 5. Troubleshooting Cepat

### Jika `tinker` gagal karena quoting
Pakai mode file inline:

```bash
php <<'PHP'
<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
echo implode(',', config('sanctum.stateful')).PHP_EOL;
PHP
```

### Jika SSH timeout setelah deploy
Itu bisa terjadi pada host ini secara intermiten.

Langkah:
1. ulangi command kecil, bukan satu block besar
2. mulai dari:
   - `readlink -f current`
   - `php artisan migrate:status --no-ansi | tail -n 12`
   - `php artisan tinker --execute='echo implode(",", config("sanctum.stateful")).PHP_EOL;'`

### Jika `sanctum.stateful` masih tidak memuat domain production
Periksa:
- file `.env` shared live
- cache config Laravel
- apakah release baru benar-benar aktif

Lalu jalankan:

```bash
php artisan optimize:clear
php artisan config:cache
php artisan tinker --execute='echo implode(",", config("sanctum.stateful")).PHP_EOL;'
```

---

## 6. Operator Verdict Template

Setelah verifikasi, catat hasil dengan format singkat ini:

```text
Release aktif:
Migration status:
Sanctum stateful:
Session domain:
Secure cookie:
Critical route check:
HTTP smoke:
Risk found:
Next action:
```

---

## 7. Minimum PASS Criteria

Hardening ini dianggap minimal PASS jika:
- release baru aktif
- migration terbaru tetap `Ran`
- `sanctum.stateful` memuat domain production utama
- `SESSION_DOMAIN=.thechoosentalks.org`
- `SESSION_SECURE_COOKIE=true`
- route auth/profile/today tetap ada
- login/register tidak timeout

Jika satu saja gagal, jangan anggap hardening selesai penuh.
