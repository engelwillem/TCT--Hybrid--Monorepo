# 09 - Codex Handoff

Dokumen ini adalah sumber kebenaran untuk seluruh pekerjaan teknis yang dihandoff dari QA (Gemini) ke engineering executor (Codex).

## Deploy Truth Baseline
- Frontend Tencent production uses monorepo branch `main`.
- Backend Laravel does not auto-deploy and remains manual via cPanel deploy flow.
- Older assumptions about `frontend-prod` are obsolete for current operational use.

## Status Legend
- **Open** = handoff sudah dibuat, belum mulai dikerjakan
- **In Investigation** = Codex sedang analisis akar masalah
- **Fix In Progress** = implementasi sedang dikerjakan
- **Ready for QA Retest** = fix selesai dan menunggu validasi Gemini
- **Blocked** = tidak bisa lanjut karena dependency / ambiguity / environment issue
- **Closed** = sudah lolos retest QA dan dianggap selesai
- **Reopened** = sudah pernah di-fix tetapi gagal pada retest

---

## Handoff Index (Matrix Aware)

| Handoff ID | Category | Title | Area | Severity | Owner | Status | Created Date |
|---|---|---|---|---|---|---|---|
| CH-001A | **Frontend-only** | Signup route and Label UI correct | Auth / Onboarding | Blocker | Codex | **Reopened** | 2026-03-22 |
| CH-001B | **Mixed** | Register API and user creation | Auth / Backend | Blocker | Op | **Open** | 2026-03-22 |
| CH-002A | **Frontend-only** | Login Next proxy handler | Auth / API | Blocker | Codex | **Reopened** | 2026-03-22 |
| CH-002B | **Backend-only** | Laravel API V1 Auth Controller | Auth / Backend | Blocker | Op | **Open** | 2026-03-22 |
| CH-003 | **Frontend-only** | Bottom nav overlaps Verse action sheet | VerseHub / UI State | High | Codex | **Reopened** | 2026-03-22 |
| CH-004 | **Frontend-only** | **Source-of-Truth Sync (Tencent)** | Deployment | Blocker | Codex | **In Investigation** | 2026-03-22 |

---

# Handoff Detail

---

## Handoff ID: CH-001A (FE Layer)
- **Status:** **Reopened** (2026-03-22)
- **Scope:** /register route, Login Button label "Masuk", Signup UI visibility.
- **Problem:** Build stale di Tencent. Masalah murni frontend.

---

## Handoff ID: CH-002A (FE Proxy Layer)
- **Status:** **Reopened** (2026-03-22)
- **Scope:** Route Handler `api/auth/login`.
- **Problem:** Proxy tidak merespon/404 di Live (Tencent).

---

## Handoff ID: CH-001B / CH-002B (BE Layer)
- **Status:** **Open**
- **Scope:** Laravel `AuthController.php` & `api.php`.
- **Problem:** Menunggu manual pull di cPanel terminal.

---

## Engineering Alignment (Bug Separation Matrix Sync)

| Item | Category | Layer Target | Dependency | Butuh Frontend Sync | Butuh Backend Deploy Manual | Gemini FE Retest | Gemini BE Retest | Gemini E2E Retest | Next Owner |
|---|---|---|---|---|---|---|---|---|---|
| ITEM-001A | Frontend Fix | Next.js Route/UI (`/register`) | Tencent `main` runtime + live build sync | Yes | No | Yes (setelah FE sync) | No | No | Codex |
| ITEM-001B | Frontend Fix | Next.js conditional signup mode | Tencent `main` runtime + live build sync | Yes | No | Yes (setelah FE sync) | No | No | Codex |
| ITEM-001C | Mixed Chain Fix | Next.js register proxy + Laravel register API | FE live sync + BE manual deploy | Yes | Yes | Partial only | Partial only | Yes (setelah FE+BE clear) | Codex + Op/User |
| ITEM-002A | Frontend Fix | Login label/UI wording | Tencent `main` runtime + live build sync | Yes | No | Yes (setelah FE sync) | No | No | Codex |
| ITEM-002B | Frontend Fix | Next.js login proxy (`/api/auth/login`) | Tencent `main` runtime + live build sync | Yes | No | Yes (route/proxy presence) | No | No | Codex |
| ITEM-002C | Backend Fix | Laravel AuthController + `/api/v1/login` | Manual pull + deploy cPanel | No | Yes | No | Yes (setelah deploy BE) | No | Op/User |
| ITEM-003 | Frontend Fix | VerseHub overlay/nav suppression | Tencent `main` runtime + live build sync | Yes | No | Yes (setelah FE sync) | No | No | Codex |
| ITEM-006 | Frontend Fix | Tencent source-of-truth mapping on `main` | Tencent project mapping access | Yes | No | No (ini prerequisite) | No | No | Codex |
| ITEM-007 | Backend Fix | cPanel manual deploy dependency | cPanel operator execution | No | Yes | No | Yes (post-deploy API check) | No | Op/User |

### Alignment Notes
- **Frontend Fix:** ITEM-001A, ITEM-001B, ITEM-002A, ITEM-002B, ITEM-003, ITEM-006.
- **Backend Fix:** ITEM-002C, ITEM-007.
- **Mixed Chain Fix:** ITEM-001C.
- **Rule:** E2E retest hanya valid ketika FE sync selesai **dan** BE manual deploy selesai.

---

## ITEM-006 Focus Investigation (Tencent Runtime Stale on `main`)

[ITEM-006 INVESTIGATION]
- Confirmed frontend production branch: `main` (current baseline)
- Confirmed frontend source path: repo root (`/`)
- What is already proven from codebase:
  - frontend app is built from root Next.js project, not `backend-api`
  - `package.json` build command is `next build`
  - `next.config.ts` is still using `output: 'standalone'`
  - `next.config.ts` still allows build to pass with `ignoreBuildErrors` and `ignoreDuringBuilds`
  - source contains the expected auth/signup/VerseHub fixes, so missing runtime behavior is not explained by absent code alone
- What is NOT provable without Tencent panel:
  - whether Tencent project is attached to the correct repository entry
  - whether Tencent project root is really `/`
  - whether the latest build for `main` actually completed and was promoted to active runtime
  - whether CDN/edge cache is still serving an older artifact despite newer source
- Most likely causes now:
  - Tencent project mapping is correct but active runtime artifact is stale
  - Tencent build completed from `main` but older cached artifact is still being served
  - Tencent project settings are still valid in theory but active deployment did not refresh to latest successful build
  - build passes while hiding issues because `ignoreBuildErrors` / `ignoreDuringBuilds` allow a non-strict artifact path
- Highest-probability cause:
  - active Tencent runtime artifact has not refreshed to the latest `main` source, with cache/runtime staleness more likely than code-path mismatch inside the repo

[TENCENT PANEL CHECKLIST]
- Check 1: Confirm repository = `engelwillem/TCT--Hybrid--Monorepo`, branch = `main`, root directory = `/`
- Check 2: Open latest Tencent deployment entry for `main` and compare its commit SHA to current GitHub `main`
- Check 3: Confirm the newest successful deployment is marked active/current, not just completed historically
- Check 4: Purge edge/CDN cache for `/*` after confirming the active deployment SHA
- Why each check matters:
  - Check 1 proves Tencent is building the correct app source
  - Check 2 proves Tencent has actually seen the intended commit
  - Check 3 proves the correct build artifact is the one being served
  - Check 4 removes the most likely remaining stale-artifact layer after source/build are aligned

[OPERATOR ACTIONS]
- Action 1: In Tencent panel, confirm repo/branch/root = monorepo / `main` / `/`
- Action 2: Trigger a fresh redeploy from the latest `main` commit SHA
- Action 3: Purge cache for `/*` immediately after that deployment is marked active
- Expected visible change after each:
  - Action 1: removes mapping ambiguity
  - Action 2: creates a new deployment artifact tied to current `main`
  - Action 3: forces public runtime to stop serving old login/register/VerseHub bundles if cache is the last blocker

[MINIMUM RECHECK GATE]
- What must visibly change before Gemini retests:
  - `/register` stops returning 404
  - login button no longer shows `Buka Blokir`
  - `/login?intent=signup` visibly renders signup mode
  - VerseHub overlay behavior visibly changes from the stale version
- Why these are the fastest truth indicators:
  - they are obvious frontend-visible markers that do not require backend deploy to prove Tencent runtime has actually switched to the newer artifact
