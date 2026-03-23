# Script Pull & Deploy Git cPanel

Dokumen ini adalah kumpulan script siap pakai untuk operator backend cPanel.

Gunakan dokumen ini saat Anda:
- sudah paham struktur server dasar
- ingin langsung mengeksekusi deploy
- butuh command copy-paste yang ringkas

Kalau Anda belum paham topologi servernya, baca dulu:
- [02 QUICK START 5 MENIT CPANEL OPERATOR.md](e:/thechoosentalksnext/docs/CORE/implementation/02%20QUICK%20START%205%20MENIT%20CPANEL%20OPERATOR.md)
- [05 GUIDE BOOK FULL END-TO-END CPANEL MAPPING.md](e:/thechoosentalksnext/docs/CORE/implementation/05%20GUIDE%20BOOK%20FULL%20END-TO-END%20CPANEL%20MAPPING.md)
- [06 CPANEL SERVER FULL MAIN BLUEPRINT MAP.md](e:/thechoosentalksnext/docs/CORE/implementation/06%20CPANEL%20SERVER%20FULL%20MAIN%20BLUEPRINT%20MAP.md)

## 1. Baseline Runtime

- deploy root:
  - `/home/thechoosentalks/deploy/apps/thechoosentalks`
- backend source branch:
  - `main`
- backend runtime:
  - Laravel release aktif via symlink `current`
- backend deploy:
  - manual dari cPanel / SSH

## 2. Precheck Ringan

```bash
cd /home/thechoosentalks/deploy/apps/thechoosentalks || exit 1

echo "=== WHO ==="
whoami
pwd

echo "=== CURRENT RELEASE ==="
readlink -f current || true

echo "=== SCRIPT SYNTAX ==="
bash -n deploy.sh
bash -n rollback.sh
bash -n healthcheck.sh
```

## 3. Deploy Backend Final

```bash
set -euo pipefail

APP_DIR="/home/thechoosentalks/deploy/apps/thechoosentalks"
API_ORIGIN="https://api.thechoosentalks.org"

cd "$APP_DIR"

echo "=== PRECHECK ==="
pwd
bash -n deploy.sh
bash -n rollback.sh
readlink -f current || true

echo "=== RUN BACKEND DEPLOY ==="
HEALTHCHECK_BASE_URL="$API_ORIGIN" bash deploy.sh

echo "=== ACTIVE RELEASE ==="
readlink -f current
cd "$(readlink -f current)"

echo "=== ROUTE VERIFY ==="
php artisan route:list | grep -E "api/today/session|api/v1/login|api/v1/register|api/v1/profile" || true

echo "=== ENDPOINT VERIFY ==="
curl -i "$API_ORIGIN/api/today/session"
curl -i -X POST "$API_ORIGIN/api/v1/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid@example.com","password":"invalid-password"}' || true
curl -i -X POST "$API_ORIGIN/api/v1/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"","email":"invalid","password":"short","password_confirmation":"short"}' || true
```

## 4. Deploy dengan Verifikasi Commit

Gunakan ini kalau Anda ingin memastikan HEAD GitHub dan release aktif terlihat sebelum dan sesudah deploy.

```bash
set -euo pipefail

cd /home/thechoosentalks/deploy/apps/thechoosentalks || exit 1

echo "=== BEFORE ==="
readlink -f current
git ls-remote git@github.com:engelwillem/TCT--Hybrid--Monorepo.git HEAD

echo "=== RUN DEPLOY ==="
bash deploy.sh || { echo "DEPLOY FAILED"; exit 1; }

echo "=== AFTER ==="
readlink -f current

cd "$(readlink -f current)" || exit 1

echo "=== VERIFY CORE ROUTES ==="
php artisan route:list | grep -E "today/session|api/v1/login|api/v1/register|api/v1/profile" || true
curl -I https://api.thechoosentalks.org/api/today/session
```

## 5. Rollback Minimal

Kalau deploy gagal atau runtime baru bermasalah:

```bash
set -euo pipefail

cd /home/thechoosentalks/deploy/apps/thechoosentalks || exit 1

echo "=== ROLLBACK ==="
bash rollback.sh

echo "=== ACTIVE RELEASE AFTER ROLLBACK ==="
readlink -f current

cd "$(readlink -f current)" || exit 1

echo "=== VERIFY ROUTES ==="
php artisan route:list | grep -E "api/today/session|api/v1/login|api/v1/register|api/v1/profile" || true
```

## 6. Log dan Healthcheck Cepat

```bash
cd /home/thechoosentalks/deploy/apps/thechoosentalks || exit 1

echo "=== LAST DEPLOY LOG ==="
tail -n 120 deploy_pull.log

echo "=== HEALTHCHECK SCRIPT ==="
sed -n '1,220p' healthcheck.sh
```

## 7. Route dan Runtime Check Cepat

```bash
cd /home/thechoosentalks/deploy/apps/thechoosentalks/current || exit 1

php artisan about
php artisan route:list --path=api/v1/profile -vvv
php artisan route:list --path=storage -vvv
```

## 8. Media Check Cepat

```bash
find /home/thechoosentalks/deploy/apps/thechoosentalks/shared/storage/app/public/avatars -maxdepth 1 -type f | sed -n '1,20p'
find /home/thechoosentalks/deploy/apps/thechoosentalks/shared/storage/app/public/community/posts -maxdepth 1 -type f | sed -n '1,20p'
```

## 9. Catatan Operator

- frontend live berubah setelah push ke `main`
- backend live berubah hanya setelah deploy manual
- jangan pakai dokumen ini untuk audit forensik mendalam
- pakai dokumen ini untuk eksekusi cepat dan aman
