# Today V2 Readiness Check (Minimum Workflow Guardrail)

Tujuan dokumen ini: memastikan `today:lint` benar-benar dipakai dalam workflow harian tim, bukan hanya tersedia sebagai command manual.

## Required Before Merge/Deploy
1. Jalankan backend readiness cepat:
   - `npm run today:ready`
2. Yang dicek oleh command ini:
   - `php artisan today:lint`
   - `php artisan test tests/Feature/TodaySessionApiTest.php tests/Feature/TodayLintCommandTest.php`

Jika ada error lint atau test gagal, anggap payload/backend belum siap merge/deploy.

## Optional Deeper Check (Saat Menyentuh Integrasi Frontend)
1. Jalankan:
   - `npm run today:ready:full`
2. Tambahan check:
   - frontend `typecheck`
   - Playwright smoke `tests/today.smoke.spec.ts`

## CI Integration
- Workflow backend (`.github/workflows/backend-monorepo-checks.yml`) sekarang menjalankan:
  - `composer today:ready`
- Artinya PR backend yang menyentuh `/today` tidak bisa lolos tanpa lint + minimal tests.

## Daily Usage Shortcut
- Verifikasi konten tanggal spesifik:
  - `cd backend-api && php artisan today:lint --date=YYYY-MM-DD`
- Verifikasi fallback default:
  - `cd backend-api && php artisan today:lint --date=2099-12-31`

