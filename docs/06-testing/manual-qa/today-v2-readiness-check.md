# Today V2 Readiness Check (Minimum Workflow Guardrail)

Tujuan dokumen ini: memastikan `today-v2:lint` benar-benar dipakai dalam workflow harian tim, bukan hanya tersedia sebagai command manual.

## Required Before Merge/Deploy
1. Jalankan backend readiness cepat:
   - `npm run today-v2:ready`
2. Yang dicek oleh command ini:
   - `php artisan today-v2:lint`
   - `php artisan test tests/Feature/TodayV2SessionApiTest.php tests/Feature/TodayV2LintCommandTest.php`

Jika ada error lint atau test gagal, anggap payload/backend belum siap merge/deploy.

## Optional Deeper Check (Saat Menyentuh Integrasi Frontend)
1. Jalankan:
   - `npm run today-v2:ready:full`
2. Tambahan check:
   - frontend `typecheck`
   - Playwright smoke `tests/today-v2.smoke.spec.ts`

## CI Integration
- Workflow backend (`.github/workflows/backend-monorepo-checks.yml`) sekarang menjalankan:
  - `composer today-v2:ready`
- Artinya PR backend yang menyentuh `/today-v2` tidak bisa lolos tanpa lint + minimal tests.

## Daily Usage Shortcut
- Verifikasi konten tanggal spesifik:
  - `cd backend-api && php artisan today-v2:lint --date=YYYY-MM-DD`
- Verifikasi fallback default:
  - `cd backend-api && php artisan today-v2:lint --date=2099-12-31`
