# Production Approval Guardrail

Tanggal acuan: 2026-04-20

## Tujuan

Memastikan deploy production hanya terjadi setelah approval manusia dan commit lolos gate CI utama.

## Workflow

- `.github/workflows/production-deploy.yml`

## Guardrail layers

1. Manual trigger (`workflow_dispatch`) saja.
2. Wajib input confirm phrase tepat: `APPROVE_PRODUCTION_DEPLOY`.
3. Wajib input `source_sha` full 40-char.
4. Validasi `source_sha` harus berada di branch `main`.
5. Validasi `source_sha` harus punya run `DevSecOps E2E Gate` conclusion `success`.
6. Environment `production` untuk approval manusia (required reviewers di GitHub Environment).

## Deploy flow

1. Preflight guardrail checks.
2. Checkout commit SHA terverifikasi.
3. Jalankan `scripts/deploy-production.ps1`.
4. Wajib smoke production.
5. Jika fail dan auto rollback aktif -> `scripts/rollback-production.ps1`.

## Script terkait

- `scripts/deploy-production.ps1`
- `scripts/rollback-production.ps1`
- `scripts/smoke-production.ps1`

## Rekomendasi settings GitHub

- Set `production` environment required reviewers (minimal 1).
- Batasi siapa yang boleh dispatch workflow production.
- Aktifkan notification untuk run production.
