# Frontend-Backend Reality Matrix Audit

## Executive Summary

**Status:** Mixed Reality - Core flows are real, but significant contract gaps and frontend mock data remain for newer modules.

**Key Findings:**
- ✅ Auth/Login: Real end-to-end integration (`src/app/login/page.tsx`, `backend-api/routes/api.php:26`).
- ✅ Profile: Real backend with patched source for avatar resolution (`src/app/profile/page.tsx:182`).
- ⚠️ Today: REAL + FALLBACK + CONTRACT GAP. Frontend expects fields not provided by backend (`src/app/today/page.tsx:140-142` vs `backend-api/app/Http/Controllers/Api/V1/TodayApiController.php:24-30`).
- ✅ VerseHub Core: Real end-to-end with populated data (`src/app/versehub/[lang]/chapter/[ref]/page.tsx`).
- ⚠️ Reflections: BACKEND READY + FRONTEND MOCK. Backend routes exist (`backend-api/routes/api.php:84-86`), but frontend is still template-based (`src/app/versehub/[lang]/reflections/page.tsx:28-30`).
- ⚠️ My Spiritual Journey: SUMMARY REAL + PAGE MOCK. Summary API is used in Profile (`src/app/profile/page.tsx:225`), but the dedicated page remains mock (`src/app/versehub/[lang]/my-spiritual-journey/page.tsx:180-183`).

## Reality Matrix

| Domain/Feature | Route Frontend | Proxy Next API | Endpoint Laravel Target | Auth Model | Status Data Source | End-to-End Status | Bukti File |
|---|---|---|---|---|---|---|---|
| **auth/login** | `/login` | `/api/auth/login` | `POST /api/v1/login` | Firebase + Laravel | REAL | DONE | `src/app/login/page.tsx`, `backend-api/routes/api.php:26` |
| **profile** | `/profile` | `/api/profile` | `GET /api/v1/profile` | Firebase + Laravel | REAL | PATCHED IN SOURCE | `src/app/profile/page.tsx:182`, `backend-api/app/Http/Controllers/ProfileController.php` |
| **today** | `/today` | `/api/today` | `GET /api/v1/today` | Firebase + Laravel | REAL+FALLBACK | PARTIAL | `src/app/today/page.tsx:140-142`, `backend-api/app/Http/Controllers/Api/V1/TodayApiController.php:24-30` |
| **community** | `/community` | `/api/community/posts` | `GET /api/v1/community/posts` | Firebase + Laravel | REAL+FALLBACK | PARTIAL | `src/features/community/pages/CommunityPage.tsx`, `backend-api/app/Http/Controllers/Api/V1/CommunityApiController.php` |
| **versehub core** | `/versehub/[lang]/chapter/[ref]` | `/api/versehub/[lang]/chapter/[ref]` | `GET /api/v1/versehub/{lang}/chapter/{ref}` | Firebase + Laravel | REAL | DONE | `src/app/versehub/[lang]/chapter/[ref]/page.tsx` |
| **study paths** | `/versehub/[lang]/study-paths/[slug]` | `/api/study-paths/[lang]/[slug]` | `GET /api/v1/study-paths/{lang}/{slug}` | Firebase + Laravel | REAL | DONE TECHNICALLY | `src/app/versehub/[lang]/study-paths/[slug]/page.tsx` |
| **reflections** | `/reflections/[slug]` | `/api/versehub/[lang]/reflections` | `GET /api/v1/versehub/{lang}/reflections` | Firebase + Laravel | MOCK | NOT END-TO-END | `src/app/api/versehub/[lang]/reflections/route.ts:8-16`, `src/app/versehub/[lang]/reflections/page.tsx:28-30` |
| **spiritual journey** | `/versehub/[lang]/my-spiritual-journey` | `/api/versehub/[lang]/actions/summary` | `GET /api/v1/versehub/{lang}/actions/summary` | Firebase + Laravel | SUMMARY REAL + PAGE MOCK | NOT END-TO-END | `src/app/api/versehub/[lang]/actions/summary/route.ts:12`, `src/app/versehub/[lang]/my-spiritual-journey/page.tsx:180-183` |

## Detailed Gap Analysis

### 1. Today Contract Mismatch
- **Frontend Expectation:** `src/app/today/page.tsx:140-142` checks for `pinnedLesson` and `welcomeVerse` in the API payload.
- **Backend Reality:** `backend-api/app/Http/Controllers/Api/V1/TodayApiController.php:24-30` does NOT send these fields, only `dailyVerse`, `rituals`, `highlights`, and `spiritual_state`.
- **Impact:** Frontend always defaults to fallbacks for these sections even if data exists in DB.

### 2. Reflections & Journey (Backend Ready, Frontend Mock)
- **Reflections:** Backend routes and controller are ready (`backend-api/routes/api.php:84-86`), but frontend uses hardcoded state in `src/app/versehub/[lang]/reflections/page.tsx:28-30` and `DUMMY_REFLECTION` in `src/app/reflections/[slug]/page.tsx:22`.
- **Journey:** Summary API is operational (`src/app/api/versehub/[lang]/actions/summary/route.ts:12`) and used in Profile, but the dedicated Journey page is still 100% mock (`src/app/versehub/[lang]/my-spiritual-journey/page.tsx:180-183`).

### 3. Journey CTA Not End-to-End
- **Issue:** `src/app/profile/page.tsx:661` redirects to `/profile?section=journey`, however, the `ProfilePage` component does not implement logic to read `useSearchParams` and navigate to the relevant section.
- **Evidence:** Missing `useSearchParams` hook and section-handling logic in `src/app/profile/page.tsx`.

### 4. Security Blocker: Proxy Token Logging
- **Risk:** `src/lib/proxy-laravel.ts:30` contains `console.log("PROXY_DEBUG_TOKEN:", JSON.stringify(authorization));`.
- **Impact:** Sensitive `Authorization/Bearer` tokens are logged to the server environment logs, creating a high security risk.

## Dead / Unreferenced Code
- **GreetingHeader:** `src/components/core/GreetingHeader.tsx` is unreferenced. The application uses `src/app/today/components/sections/GreetingHeader.tsx` instead.
- **Community Mocks:** `src/features/community/mock.ts` is never imported at runtime; all fetches go through `CommunityService` or direct API calls.

## Conclusion
The integration has moved beyond initial "connectivity" into a phase of **Contract Synchronization**. While core flows (Auth, Profile, VerseHub) are stable, the system suffers from specific data mismatches in the Today module and a lag in frontend implementation for the Reflections and Journey modules.