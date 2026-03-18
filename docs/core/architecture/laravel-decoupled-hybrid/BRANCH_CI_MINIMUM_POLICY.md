# Branch + CI Minimum Policy (Single Main Branch)

Dokumen ini menetapkan aturan minimum agar Laravel backend (cPanel) dan Next.js frontend (Tencent Edge) tetap sinkron tanpa branch permanen terpisah.

## 1) Branch Strategy

- Gunakan satu branch release: `main`.
- Gunakan branch feature jangka pendek, merge via Pull Request ke `main`.
- Hapus branch release lama (`frontend-prod`) setelah merge final selesai.

## 2) Required Status Checks (Branch Protection `main`)

Di GitHub `Settings > Branches > Branch protection rules`, aktifkan:

- `Require a pull request before merging`
- `Require status checks to pass before merging`
- `Require branches to be up to date before merging`
- `Do not allow bypassing the above settings`

Set required checks:

- `Frontend Monorepo Checks / frontend-checks`
- `Backend Monorepo Checks / backend-checks`

## 3) CI/CD Separation Rules

- Frontend checks berjalan dari workflow:
  - `.github/workflows/frontend-monorepo-checks.yml`
- Backend checks berjalan dari workflow:
  - `.github/workflows/backend-monorepo-checks.yml`
- Backend deploy cPanel berjalan dari workflow:
  - `.github/workflows/backend-cpanel-deploy.yml`

Deploy tetap terpisah walau branch tunggal:

- Backend deploy hanya saat ada perubahan `backend-api/**`.
- Frontend deploy trigger Tencent Edge dari push ke `main` (setelah check frontend lulus).

## 4) Secrets Wajib

### GitHub Actions (backend cPanel)

- `CPANEL_SSH_HOST`
- `CPANEL_SSH_PORT`
- `CPANEL_SSH_USER`
- `CPANEL_SSH_KEY`
- `CPANEL_DEPLOY_PATH`

### GitHub Actions (frontend Tencent Edge)

- `TENCENT_EDGE_DEPLOY_HOOK_URL`
  - Isi dengan deploy hook URL dari Tencent Edge project production.

Tanpa secret ini, step trigger deploy frontend akan gagal by design.

## 5) Operational Gate

Merge ke `main` hanya boleh saat:

- Frontend checks hijau
- Backend checks hijau
- Tidak ada conflict rebase/merge

Setelah merge:

- Backend auto deploy ke cPanel jika ada perubahan backend.
- Frontend auto trigger deploy Tencent Edge untuk commit terbaru di `main`.
