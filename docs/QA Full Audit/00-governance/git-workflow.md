# Git Workflow

## Current Hybrid Release Reality
- **Frontend:** source lives in the monorepo root and is deployed by Tencent Edge from the configured Git branch.
- **Backend:** source lives in `backend-api/` but production runtime is updated manually from cPanel via `deploy.sh`.
- **Rule:** a commit in Git does not automatically mean both layers are live.

## Branch Reality Notes
- `main` is the active engineering source-of-truth branch in this repo.
- `main` is also the active frontend production branch baseline for Tencent in the current monorepo model.
- Any older mention of `frontend-prod` should be treated as obsolete historical context unless explicitly archived.
- Backend production deploys pull from the backend release script configuration, which currently targets `main`.

## Branch Naming
Gunakan pola:
- `feat/<scope>`
- `fix/<scope>`
- `docs/<scope>`
- `refactor/<scope>`
- `test/<scope>`

Contoh:
- `fix/profile-lifecycle-parity`
- `feat/relevance-homepage`
- `docs/community-audit-sync`
- `test/main-apps-smoke`

## Commit Format
Gunakan format:
`type(scope): summary`

Contoh:
- `fix(inbox): restore thread detail error parity`
- `docs(governance): establish repository rules`
- `test(e2e): add smoke matrix for main apps`

## Allowed Commit Types
- `feat`
- `fix`
- `docs`
- `refactor`
- `test`
- `chore`

## Working Tree Rules
1. Sebelum patch, cek changed files.
2. Jangan commit file di luar scope.
3. Jangan commit log, dump, cache, build artifact, atau file eksperimen.
4. Review diff sebelum commit.
5. Pastikan docs relevan ikut ter-update.
6. Setelah commit, working tree harus bersih.

## Scope Discipline
Satu commit harus merepresentasikan satu unit kerja yang masuk akal. Jangan campur banyak domain tanpa alasan jelas.

## Hybrid Deployment Discipline
1. Frontend release validation requires both:
   - correct branch alignment in GitHub/Tencent
   - production runtime confirmation after auto-deploy
2. Backend release validation requires:
   - manual cPanel deploy execution
   - route/runtime verification after deploy
3. Never describe a feature as "live" only because the source branch contains the fix.

## Storage Hygiene Policy
1. **GitHub Actions Retention:** Atur pelestarian Artifact via setelan retensi Repositori menjadi maksimal 7 hari untuk menghemat biaya *Storage*.
2. **Local Workflow Cleanup:** Selalu sematkan perintah pembersihan `rm -f <big-file.tar.gz>` pada kondisi penutup klausa CI/CD (`if: always()`) seperti di `backend-cpanel-deploy.yml`.
3. **No Blind Wipe:** Jangan menggunakan aksi otomatis penghapusan massal peladen maupun cabang *Branch* secara membabi buta tanpa pelaporan atau tanpa persetujuan manual; laporan dokumentatif adalah cara tunggal mendeteksi *legacy*.
