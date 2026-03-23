# GitHub Workflow Tencent Hook Removal Report (2026-03-20)

## Issue Summary
Workflow frontend di GitHub Actions masih memiliki trigger deploy manual ke Tencent Edge via webhook secret `TENCENT_EDGE_DEPLOY_HOOK_URL`. Ini menciptakan dua risiko:
- deploy ganda (auto deploy Tencent + webhook dari GitHub)
- kegagalan workflow saat secret tidak tersedia

## Root Cause
Di `.github/workflows/frontend-monorepo-checks.yml` terdapat:
- job-level env yang mengikat `TENCENT_EDGE_DEPLOY_HOOK_URL`
- step `Trigger Tencent Edge deploy` yang memanggil `curl` ke deploy hook

Akibatnya workflow CI tidak lagi murni CI, tetapi bercampur fungsi CD.

## Workflows/Files Affected
### Diubah
- `.github/workflows/frontend-monorepo-checks.yml`
- `docs/09-handover/current-status.md`
- `docs/09-handover/next-actions.md`
- `docs/09-handover/open-blockers.md`

### Diaudit (tanpa perubahan)
- `.github/workflows/backend-monorepo-checks.yml`
- `.github/workflows/backend-cpanel-deploy.yml`
- `next.config.ts`
- `apphosting.yaml`
- `package.json`

## Exact Workflow Step Removed or Changed
### Removed
- `env.TENCENT_EDGE_DEPLOY_HOOK_URL: ${{ secrets.TENCENT_EDGE_DEPLOY_HOOK_URL }}`
- Step `Trigger Tencent Edge deploy` (conditional push to `main`, payload JSON, `curl` POST ke hook URL).

### Retained (CI-only)
- Checkout
- Setup Node
- `npm ci`
- `npm run typecheck`
- `npm run build`

## Why This Prevents Double Deploy
Dengan menghapus trigger webhook Tencent dari GitHub Actions frontend:
- GitHub Actions hanya menjalankan CI checks.
- Deployment frontend hanya berasal dari satu sumber: auto deploy Git integration Tencent Edge.
- Secret `TENCENT_EDGE_DEPLOY_HOOK_URL` tidak lagi menjadi dependency aktif pada workflow frontend.

## Verification Evidence
### 1) Keyword scan after patch
Pencarian pada `.github` + file config frontend (`next.config.ts`, `apphosting.yaml`, `package.json`):
- `TENCENT_EDGE_DEPLOY_HOOK_URL` -> tidak ditemukan
- `pages-api.edgeone.ai` -> tidak ditemukan
- `webhook` -> tidak ditemukan
- `curl` -> hanya ditemukan di workflow backend deploy (`.github/workflows/backend-cpanel-deploy.yml`) dan tidak terkait frontend Tencent hook

### 2) Workflow content check
`frontend-monorepo-checks.yml` tidak lagi berisi env secret Tencent deploy hook maupun step deploy webhook.

## Residual Risk
- Auto deploy Tencent Edge tetap bergantung pada konfigurasi Tencent Console (di luar repo).
- Jika ada dokumen historis lama yang masih menyebut secret ini, itu bersifat arsip dan bukan dependency aktif runtime workflow frontend.

## Final Status
`FIXED`
