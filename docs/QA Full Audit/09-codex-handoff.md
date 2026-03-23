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
| CH-001A | **Frontend-only** | Signup route and Label UI correct | Auth / Onboarding | Blocker | Codex | **Closed** | 2026-03-22 |
| CH-001B | **Mixed** | Register API and user creation | Auth / Backend | Blocker | Op | **Open** | 2026-03-22 |
| CH-002A | **Frontend-only** | Login Next proxy handler | Auth / API | Blocker | Codex | **Closed** | 2026-03-22 |
| CH-002B | **Backend-only** | Laravel API V1 Auth Controller | Auth / Backend | Blocker | Op | **Open** | 2026-03-22 |
| CH-003 | **Frontend-only** | Bottom nav overlaps Verse action sheet | VerseHub / UI State | High | Codex | **Reopened** | 2026-03-22 |
| CH-004 | **Frontend-only** | **Source-of-Truth Sync (Tencent)** | Deployment | Blocker | Codex | **Closed** | 2026-03-22 |
| CH-005 | **Frontend-only** | Landing entry & Copy UI Polish | Homepage / Today | Medium | Gemini | **Open** | 2026-03-23 |
| CH-006 | **Backend-only** | Production Data Cleanup | Database | High | User/Op | **Open** | 2026-03-23 |
| BUG-005 | **Mixed** | **Community image load/save failure** | Community | Critical | Codex | **Open** | 2026-03-23 |
| BUG-006 | **Mixed** | **Fast Session Logout fix** | Auth / Session | Critical | Codex | **Open** | 2026-03-23 |
| BUG-007 | **Backend-only** | **2FA Profile server error (500)** | Profile / Security | Critical | Codex | **Open** | 2026-03-23 |
| BUG-008 | **Mixed** | Today Date / Greeting Mismatch | Today / UI State | High | Codex | **Ready for QA Retest** | 2026-03-23 |
| BUG-009 | **Mixed** | Sidebar Identity Mismatch | Sidebar / UI State | High | Codex | **Ready for QA Retest** | 2026-03-23 |

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

---

## Wave 2 Execution Matrix (2026-03-23)

| Item | Category | Layer Target | Current Finding | Status | Next Owner |
|---|---|---|---|---|---|
| ITEM-008 | Frontend-only | Landing page root + auth copy | Root `/` already serves landing page; copy adjusted to Indonesian-first with `Login` label and guest CTA | Ready for QA Retest | Gemini |
| ITEM-009 | Frontend-only | Today greeting + date UX | Greeting copy updated; date is now rendered dynamically client-side; password-login name hydration added via local auth user snapshot | Ready for QA Retest | Gemini |
| ITEM-010 | Frontend-only | VerseHub landing copy | Requested copy removals/replacements applied in active VerseHub reader landing surface | Ready for QA Retest | Gemini |
| ITEM-011 | Frontend-only | Community / shared action bars | Hand icons in action bars replaced with love icons on active components | Ready for QA Retest | Gemini |
| ITEM-012 | Mixed | Community image upload + serving | Frontend no longer masks failures with fake archive fallback; likely remaining risk is runtime storage/mirror/origin serving on Laravel side | In Investigation | Codex + Op |
| ITEM-013 | Mixed | Fake/dummy operational data cleanup | Community active fallback dummy feed removed; static featured fallback removed; broader fake-content audit still needed for non-community surfaces | Fix In Progress | Codex |
| ITEM-014 | Mixed | Auth session persistence / auto logout | Root cause likely auth token is cleared too aggressively on 401/403 and session model relies on brittle local bearer token state without resilience | In Investigation | Codex |
| ITEM-015 | Backend-dependent | Profile 2FA API flow | Strong root cause found: API 2FA setup used session-bound pending state on bearer-token API routes; migrated to cache-backed pending state | Fix In Progress | Op / User |

### ITEM-012 Investigation Notes
- Community image upload request path is correct in source:
  - frontend posts multipart form to `/api/community/posts`
  - Next proxy forwards binary body to Laravel
  - Laravel stores files on `public` disk and mirrors them into `public/storage` when needed
- Why it can still fail live:
  - cPanel runtime may still have storage mirror / public storage serving drift
  - stale frontend previously hid real failures behind archive fallback and static featured content
- Immediate safe action already done:
  - removed fallback dummy archive feed so runtime errors are visible instead of silently masked

### ITEM-013 Cleanup Notes
- Removed active fallback `MOCK_POSTS` usage from community feed.
- Removed static featured verse fallback (`Mazmur 23:1`) from community surface when no real data exists.
- Not removed yet:
  - Today ritual content fallback mock remains as resilience content, not user-generated community archive data.
  - Any legacy seed/demo rows already stored in MySQL still require operator-safe cleanup plan.

### ITEM-014 Session Notes
- Likely chain in current source:
  - app auth state trusts local bearer token or Firebase state
  - some service layers clear local token immediately on `401/403`
  - a transient auth/runtime failure can therefore feel like instant logout
- Safe fix should not be "just increase timeout".
- Next engineering target:
  - centralize auth invalidation
  - only clear token on confirmed invalid-auth responses
  - add a profile/introspection gate before hard logout

### ITEM-015 2FA Root Cause
- `POST /api/v1/profile/two-factor/setup` and `POST /api/v1/profile/two-factor/confirm` run on API routes with:
  - `EnsureFrontendRequestsAreStateful`
  - `Authenticate:sanctum`
  - no session middleware in the route chain
- Previous implementation stored pending setup in `$request->session()`.
- In bearer-token API flow, that is not a reliable state store and can break setup/confirm chaining.
- Fix applied in source:
  - pending 2FA setup now stored in cache per-user instead of session
  - confirm/disable paths now clear the cache-backed pending setup

---

## Wave 3 Technical Triage (2026-03-23)

### ITEM-008: Landing Page As Entry Point
- Category: Frontend-only
- Layer affected: `src/app/page.tsx`, auth gate copy surfaces
- Current source truth:
  - root `/` already renders landing page, not redirecting straight to protected content
  - CTA flow already gives explicit guest / daftar / login choice
  - source uses `Login` on root landing, and guest CTA routes to `/today`
- Safe fix status:
  - landing root behavior is already aligned in source
  - secondary auth gate copy updated to `Login`
- Risk:
  - frontend redeploy still required for live runtime parity

### ITEM-009: Today Copy + Dynamic Date
- Category: Frontend-only
- Layer affected: `src/features/today-ritual/components/TodayDailyRitualScreen.tsx`, `src/features/today-ritual/components/TodayHeader.tsx`
- Current source truth:
  - greeting is forced from live auth state, not blindly trusting backend copy
  - guest state now stays exactly 2 lines: `Selamat datang kembali,` then `Chosen People`
  - member state now stays exactly 3 lines: `Selamat datang kembali,` then real login name, then `Chosen People`
  - date label is rendered against live `Asia/Jakarta` time and the missing Next proxy path for `/api/today/session` is now restored in source
- Root cause confirmed:
  - frontend loader expected `/api/today/session`, but that Next route did not exist locally, so Today content could silently fall back
  - fallback content file still contained a hardcoded March 21 date string, which was a QA drift risk even when used only as resilience content
- Safe fix applied:
  - added `src/app/api/today/session/route.ts` to proxy the exact loader path to Laravel
  - replaced the hardcoded mock `dateLabel` with a Jakarta-time generated value
- Risk:
  - if Laravel payload itself is editorially stale, frontend still renders the live local date in the header, but content QA should still verify backend payload freshness separately

### BUG-009: Sidebar Identity Guest vs Member
- Category: Frontend-only state normalization
- Layer affected: `src/auth/use-auth-session.ts`, `src/layouts/DesktopSidebar.tsx`, `/today` header consumer
- Root cause confirmed:
  - Firebase anonymous sessions were being treated as `authenticated`, which blurred guest/member identity
  - sidebar fallback rendering was too permissive, so the wrong initial could survive instead of explicit guest identity
- Safe fix applied:
  - anonymous Firebase session now resolves to `guest` unless a real app token exists
  - authenticated identity prefers real name, then email local-part, before any generic fallback
  - sidebar now hard-locks guest rendering to `Guest` and `G`, and only uses avatar image for non-guest users
- Retest focus:
  - guest sidebar must show `G` and `Guest`
  - member sidebar must show the real avatar when present, otherwise the correct initial from the real user identity

### ITEM-010: VerseHub Copy Cleanup
- Category: Frontend-only
- Layer affected: `src/features/versehub/pages/VersehubReaderPage.tsx`
- Current source truth:
  - `Gerbang VerseHub` no longer exists in active reader landing source
  - `Akses Cepat Reader` already replaced with `Akses Cepat`
  - book picker helper text already reads `Pilih Kitab untuk memulai Reading Journey.`
  - `Perpustakaan Firman` no longer appears in the active Next source
- Status:
  - source already aligned; requires runtime retest only

### ITEM-011: Action Bar Icon
- Category: Frontend-only
- Layer affected: `src/components/ActionBar.tsx`, `src/features/community/components/ActionBar.tsx`
- Current source truth:
  - active action bars already use `Heart`, not `Hand`
  - cleanup pass removed leftover hand-icon import from active community composer source
- Residual note:
  - legacy Laravel/Inertia source still contains hand icon references, but those are not the active Next runtime surface

### ITEM-012: Community Image Save/Load Failure
- Category: Mixed
- Layer affected: Next proxy, frontend media normalization, Laravel storage/public serving
- Likely files/modules:
  - `src/services/community.service.ts`
  - `src/lib/proxy-laravel.ts`
  - `backend-api/app/Http/Controllers/Api/V1/CommunityApiController.php`
  - shared hosting `public/storage` runtime on cPanel
- Root-cause hypothesis:
  - upload path in source is valid and binary-safe
  - Laravel stores uploaded images on `public` disk, then mirrors to `public/storage` for shared hosting
  - live failure is most likely runtime storage/public serving drift, not missing upload code in Next
- Safe fix done now:
  - no frontend fake fallback was added to mask upload failures
- Still blocked by:
  - production runtime verification after real upload on deployed Laravel

### ITEM-013: Remove Fake / Dummy Operational Data
- Category: Mixed
- Layer affected: backend seeders, DB contents, any cached frontend feed state
- Current source truth:
  - active community page already uses Laravel API, not `src/features/community/mock.ts`
  - risky fake/demo seeders still exist in backend (`DemoCommunitySeeder`, `InitialContentSeeder`)
  - those seeders are not proof that fake rows are currently displayed, but they remain an operational risk
- Safe strategy:
  - do not hard-delete blindly from source or database
  - identify posts created by system/demo users and move them out of active feed scope first
  - only then purge rows in production DB with a reversible export/snapshot

### ITEM-014: Session / Auto Logout
- Category: Mixed
- Layer affected: frontend local token lifecycle, Firebase sync, Sanctum token issuance
- Likely files/modules:
  - `src/services/app-auth-token.ts`
  - `src/services/community.service.ts`
  - `src/app/inbox/page.tsx`
  - `src/components/FirebaseAuthSync.tsx`
  - `backend-api/app/Http/Controllers/Api/V1/AuthController.php`
  - `backend-api/app/Http/Controllers/Api/V1/FirebaseAuthSyncController.php`
- Root cause found:
  - frontend was clearing local auth state too aggressively on `401/403`
  - backend also revokes prior `next-web` tokens every time login/Firebase sync issues a new one
  - that combination makes transient auth drift feel like premature logout
- Safe fix done now:
  - source now treats only `401` as confirmed invalid session in community/inbox flows
- Not fixed yet:
  - broader token lifecycle strategy between password auth and Firebase sync still needs consolidation

### ITEM-015: Profile 2FA Error
- Category: Mixed
- Layer affected: Laravel 2FA setup/confirm lifecycle plus Next profile UI
- Root cause found:
  - backend setup/confirm previously relied on session state in bearer-token API flow
  - profile UI also routed `Buat Ulang Recovery Codes` into disable-state UI instead of recovery-code regeneration flow
- Safe fix status:
  - backend source already moved pending setup to cache-backed state
  - frontend source now has a dedicated recovery-code regeneration flow
- Still required:
  - backend manual deploy via cPanel before production retest
