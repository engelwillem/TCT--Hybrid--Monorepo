# Current Deploy Truth

## Effective Source of Truth - 2026-03-22

- **Monorepo:** Yes. Frontend and backend live in one repository.
- **Frontend production branch:** `main`
- **Frontend deploy method:** Tencent Edge auto-deploys from the GitHub monorepo using `main`.
- **Frontend source path:** repo root (`/`)
- **Backend deploy method:** manual operator deploy from cPanel / server terminal
- **Backend release flow:** pull latest backend source, then run backend deploy script
- **Backend runtime rule:** backend code in git is not live until manual deploy is completed

## Deploy Split

### Frontend
- Source lives in root Next.js app.
- A new frontend commit on `main` is the release source for Tencent.
- If production still shows old UI, the problem is runtime sync, cache drift, or Tencent branch/source mismatch against `main`.

### Backend
- Source lives under `backend-api/`.
- Production backend does not auto-follow git changes.
- Operator must deploy backend manually from cPanel using the server deploy flow.

## Invalid Old Assumptions
- `frontend-prod` is **not** the active production branch baseline anymore.
- Frontend release should **not** be documented as deploying from `frontend-prod`.
- Backend should **not** be documented as auto-deploying together with frontend.
- Source patch completion should **not** be described as production completion.

## How To Read The Rest Of QA Full Audit
- Active operational docs must follow this file.
- Older documents that still assume `frontend-prod` as the active Tencent release branch should be treated as historical or obsolete unless explicitly revised.
