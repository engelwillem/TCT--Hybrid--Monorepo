# Legacy vs Hybrid Parity Matrix 🗺️

**Audit Date:** 2026-03-15  
**Scope:** Final Codebase Routes & API Analysis (Non-theoretical)

## 1. Auth & Profile
*   **Legacy Route:** Native Laravel Auth (login, register), `/profile` (Edit Profile, Change PW, 2FA)
*   **Hybrid Route:** `/today` (Login Modal injected), Profile is NOT ported to Next.js yet (no `src/app/profile`).
*   **API Endpoints:** `/api/v1/auth/firebase/sync`, `/api/v1/auth/logout`, `/api/v1/profile`
*   **Mock/Fallback:** Hybrid relies on Legacy Laravel for authentication pages heavily (redirects/admin).
*   **Gap Parity:** HUGE. Next.js doesn't have its own robust Auth/Profile pages yet, instead relying on API sync and legacy Laravel forms.
*   **Priority:** **P0**

## 2. Today
*   **Legacy Route:** `/today` (redirects to `NEXT_PUBLIC_APP_URL/today` if guest)
*   **Hybrid Route:** `src/app/today`
*   **API Endpoints:** `/api/v1/today`
*   **Mock/Fallback:** Next.js fully handles Today feed.
*   **Gap Parity:** 1:1 Parity Achieved.
*   **Priority:** **DONE**

## 3. Community
*   **Legacy Route:** `/community` (redirects to `NEXT_PUBLIC_APP_URL/community` if guest)
*   **Hybrid Route:** `src/app/community`
*   **API Endpoints:** `/api/v1/community/posts`, `POST /api/v1/community/posts`
*   **Mock/Fallback:** None, fully API driven.
*   **Gap Parity:** 1:1 Parity Achieved.
*   **Priority:** **DONE**

## 4. Inbox & DM
*   **Legacy Route:** `/inbox`
*   **Hybrid Route:** `src/app/inbox`
*   **API Endpoints:** `/api/v1/inbox`, `/api/v1/inbox/messages`, `/api/v1/inbox/{user}/messages`
*   **Mock/Fallback:** Next.js UI is present but heavily reliant on proper Sanctum cookie negotiation.
*   **Gap Parity:** Medium. The UI exists in `src/app/inbox` but real-time connection/robustness is unverified.
*   **Priority:** **P1**

## 5. Channels / Weekly / Sabbath School
*   **Legacy Route:** `/channels`, `/channels/sabbath-school/{year}`
*   **Hybrid Route:** `src/app/channels`
*   **API Endpoints:** `/api/v1/channels`, `/api/v1/sabbath-school`
*   **Mock/Fallback:** Next.js UI is present.
*   **Gap Parity:** Medium/High. Legacy backend still has specific `admin` routes for Sabbath School management (`/channels/sabbath-school/.../admin`).
*   **Priority:** **P2**

## 6. VerseHub & Study Paths
*   **Legacy Route:** `/versehub/{lang}`, `/versehub/{lang}/study`
*   **Hybrid Route:** `src/app/versehub`
*   **API Endpoints:** `/api/v1/versehub/...`, `/api/v1/study-paths/...`
*   **Mock/Fallback:** Next.js handles Mentor and Bible reading completely via `src/app/versehub`.
*   **Gap Parity:** Low. VerseHub is robustly migrated. Study Paths UI exists and consumes API.
*   **Priority:** **DONE**

---

### 🚨 Rekomendasi Kritik (Top Priority)
**Auth & Profile (P0)** adalah celah terbesar dan paling membahayakan arsitektur "Decoupled". Saat ini login dan registrasi masih dikontrol kuat oleh Middleware dan Session monolith Laravel, menjadikannya single-point-of-failure untuk UX Hybrid. Pindahkan *Onboarding*, *Login*, dan *Profile Management* seluruhnya ke Next.js (`src/app/auth` dan `src/app/profile`) lalu hubungkan via API Sanctum secara stateless.
