# 15 - Bug Separation Matrix

## Purpose
Dokumen ini digunakan untuk memetakan setiap temuan bug berdasarkan ketergantungan layer deployment (Frontend vs Backend). Hal ini krusial dalam arsitektur **Hybrid Deploy** (Next.js auto-deploy di Tencent vs Laravel manual-deploy di cPanel) agar ekspektasi QA, validasi engineering, dan keputusan rilis tetap akurat.

## Current Deploy Truth
- Frontend production branch = `main`
- Frontend deploys automatically from `main` in Tencent Edge
- Backend remains manual deploy from cPanel
- Any old `frontend-prod` release-branch assumption is obsolete for current operations

## Category Legend
- **Frontend-only:** Perbaikan murni pada kode Next.js (layout, routing client, label UI). Dapat dites segera setelah sinkronisasi build/branch Tencent Edge berhasil.
- **Backend-dependent:** Perbaikan murni pada API Laravel (controller logic, migration, config). Harus menunggu manual git pull dan deploy script di cPanel terminal.
- **Mixed:** Perubahan berantai (Chain) yang membutuhkan update di kedua layer agar fungsionalitas end-to-end berjalan benar.

## Gate Legend
- **FE-LIVE-NOT-SYNCED:** Source fix ada, prod build masih stale (Build Drift).
- **BE-NOT-DEPLOYED:** Kode backend sudah siap di repo, belum di-pull/deploy di cPanel.
- **READY-FE-RETEST:** Layer frontend siap divalidasi live.
- **READY-BE-RETEST:** Layer backend siap divalidasi (Direct API test).
- **READY-E2E-RETEST:** Kedua layer siap untuk alur kerja lengkap (Login/Signup success).
- **BLOCKED-INFRA/DEPLOY:** Terkendala akses panel atau kegagalan pipeline.

## Matrix Table

| Bug ID / Area | Category | Why This Category | Primary Owner | Test Dependency | When It Can Be Tested | Evidence Needed | Current Gate Status | Next Action |
|---|---|---|---|---|---|---|---|---|
| BUG-001 / Login Label | Frontend-only | Perubahan static text pada button di `login/page.tsx`. | Codex | Tencent `main` runtime sync | Post-FE sync | Label says "Masuk" | FE-LIVE-NOT-SYNCED | Verify Tencent is serving latest `main` |
| BUG-004a / /register 404 | Frontend-only | App Router page file handling di Next.js. | Codex | Tencent `main` runtime sync | Post-FE sync | Page 200 OK | FE-LIVE-NOT-SYNCED | Verify `/register` exists in live `main` build |
| BUG-004b / Signup UI mode | Frontend-only | Rendering kondisional berdasarkan query param `intent=signup`. | Codex | Tencent `main` runtime sync | Post-FE sync | Signup fields visible | FE-LIVE-NOT-SYNCED | Verify condition logic in live `main` build |
| BUG-003 / VerseHub Overlay | Frontend-only | State management modal dan mobile layout suppression. | Codex | Tencent `main` runtime sync | Post-FE sync | Bottom Nav Hidden on active sheet | FE-LIVE-NOT-SYNCED | Verify event listener cleanup in live |
| BUG-002 / Login API 404 | Mixed | Membutuhkan Route Handler Next (Proxy) + Route Laravel aktif. | Mixed | FE Sync & BE Manual | Post-Hybrid Sync | 200/401/422 status (not 404) | BLOCKED-INFRA/DEPLOY | Manual pull on cPanel + FE sync |
| BUG-004c / Register API | Mixed | Membutuhkan Proxy Register (Next) + AuthController (Laravel). | Mixed | FE Sync & BE Manual | Post-Hybrid Sync | User created in DB | BLOCKED-INFRA/DEPLOY | Manual pull on cPanel + FE sync |
| Session Persistence | Mixed | Ketergantungan pada cookie/token handling lintas layer. | Mixed | FE Sync & BE Manual | Post-Hybrid Auth working | Session stays on refresh | BE-NOT-DEPLOYED | End-to-end auth stabilization |
| Profile / Avatar Issue | Mixed | UI Upload (FE) + Store/Storage logic (BE). | Mixed | FE Sync & BE Manual | Post-Profile UI sync | Avatar shows on dashboard | BE-NOT-DEPLOYED | Investigate backend disk storage path |
| Guest/Protected Routes | Mixed | Middleware (FE) + Token Validation (BE). | Mixed | FE Sync & BE Manual | Post-Auth working | Redirect to login when guest | BE-NOT-DEPLOYED | Logic parity between FE and BE sessions |

---

## Recommended Item Split for Collaboration Board

### ITEM-001 (Parent: Auth Branding & UI)
- **ID:** ITEM-001A
- **Scope:** `/register` redirect logic.
- **Category:** Frontend-only
- **Owner:** Codex
- **Gate:** FE-LIVE-NOT-SYNCED
- **Ready for:** READY-FE-RETEST

- **ID:** ITEM-002A
- **Scope:** Login button label "Masuk".
- **Category:** Frontend-only
- **Owner:** Codex
- **Gate:** FE-LIVE-NOT-SYNCED
- **Ready for:** READY-FE-RETEST

- **ID:** ITEM-003
- **Scope:** VerseHub bottom nav overlap.
- **Category:** Frontend-only
- **Owner:** Codex
- **Gate:** FE-LIVE-NOT-SYNCED
- **Ready for:** READY-FE-RETEST

- **ID:** ITEM-008
- **Scope:** Landing page "Login" and flow.
- **Category:** Frontend-only
- **Owner:** Codex
- **Gate:** FE-LIVE-NOT-SYNCED
- **Ready for:** READY-FE-RETEST

- **ID:** ITEM-009
- **Scope:** /today date & greeting.
- **Category:** Frontend-only
- **Owner:** Codex
- **Gate:** FE-LIVE-NOT-SYNCED
- **Ready for:** READY-FE-RETEST

- **ID:** ITEM-010
- **Scope:** /versehub copy cleanup.
- **Category:** Frontend-only
- **Owner:** Codex
- **Gate:** FE-LIVE-NOT-SYNCED
- **Ready for:** READY-FE-RETEST

- **ID:** ITEM-011
- **Scope:** ActionBar Icon love change.
- **Category:** Frontend-only
- **Owner:** Codex
- **Gate:** FE-LIVE-NOT-SYNCED
- **Ready for:** READY-FE-RETEST

### ITEM-004 (Parent: Onboarding / Signup)
- **ID:** ITEM-004A
- **Parent:** CH-001 / BUG-004
- **Scope:** /register Route availability
- **Category:** Frontend-only
- **Owner:** Codex
- **Gate:** FE-LIVE-NOT-SYNCED
- **Ready for:** READY-FE-RETEST

- **ID:** ITEM-004B
- **Parent:** CH-001 / BUG-004
- **Scope:** Conditional Signup form rendering
- **Category:** Frontend-only
- **Owner:** Codex
- **Gate:** FE-LIVE-NOT-SYNCED
- **Ready for:** READY-FE-RETEST

- **ID:** ITEM-004C
- **Parent:** CH-001 / BUG-004
- **Scope:** End-to-end user creation (Register Submit)
- **Category:** Mixed
- **Owner:** Codex / Op
- **Gate:** BLOCKED-INFRA/DEPLOY
- **Ready for:** READY-E2E-RETEST

### ITEM-002 (Parent: Auth Contract Reconciliation)
- **ID:** ITEM-001C
- **Scope:** Register user creation (Frontend logic + Backend DB).
- **Category:** Mixed
- **Owner:** Codex / Op
- **Gate:** BLOCKED-INFRA/DEPLOY
- **Ready for:** READY-E2E-RETEST

- **ID:** ITEM-002B
- **Scope:** Login session/CSRF (Next.js proxy + Sanctum).
- **Category:** Mixed
- **Owner:** Codex / Op
- **Gate:** BE-NOT-DEPLOYED
- **Ready for:** READY-E2E-RETEST

- **ID:** ITEM-012
- **Scope:** Community image load/save.
- **Category:** Mixed
- **Owner:** Codex / Op
- **Gate:** BE-NOT-DEPLOYED
- **Ready for:** READY-E2E-RETEST

- **ID:** ITEM-014
- **Scope:** Session expiry/Logout speed.
- **Category:** Mixed
- **Owner:** Codex / Op
- **Gate:** BE-NOT-DEPLOYED
- **Ready for:** READY-E2E-RETEST

- **ID:** ITEM-002A
- **Parent:** CH-002 / BUG-002
- **Scope:** Login Next.js Proxy Handler (`/api/auth/login`)
- **Category:** Frontend-only
- **Owner:** Codex
- **Gate:** FE-LIVE-NOT-SYNCED
- **Ready for:** READY-FE-RETEST

- **ID:** ITEM-002B
- **Parent:** CH-002 / BUG-002
- **Scope:** Laravel Auth Controller (API V1 login)
- **Category:** Backend-dependent
- **Owner:** Op / User
- **Gate:** BE-NOT-DEPLOYED
- **Ready for:** READY-BE-RETEST

---

## Testing Rules
1. **Frontend-only** boleh dites tanpa menunggu backend deploy (Fokus pada visibilitas rute dan label).
2. **Backend-dependent** tidak boleh disimpulkan final sebelum backend manual deploy selesai di cPanel.
3. **Mixed** harus dites 2 fase:
   - **Fase 1:** Verifikasi kehadiran endpoint/UI di frontend live.
   - **Fase 2:** Verifikasi fungsionalitas fungsional (data flow) setelah backend dideploy.
4. Gemini wajib menandai gate status tiap item di `10-fix-validation-log.md`.
5. Codex wajib mencantumkan kategori (FE, BE, atau Mixed) pada setiap klaim perbaikan (Fixed Note).
6. **PROHIBITION:** Jangan melanjutkan audit area baru (Day 2) hingga minimal item **Frontend-only (Auth UI)** dan **Mixed (Auth API)** berada pada status READY-E2E-RETEST.
