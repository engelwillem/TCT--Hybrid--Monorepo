# Master Reality Resync Report - 2026-03-20

## 1. Executive Summary
 Audit ini dilakukan untuk mensinkronisasi dokumentasi proyek dengan kenyataan di level *source code*. Ditemukan beberapa "Reality Drift" di mana dokumentasi mengklaim status **LIVE/FIXED** padahal fitur masih berupa **MOCK** atau memiliki **CONTRACT MISMATCH**.

## 2. Reality Matrix Table

| Surface | Frontend State | Backend State | Contract State | End-to-End State | Verdict |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth/Login** | LIVE | LIVE | CLEAN | REAL | ✅ PASS |
| **Profile Core** | LIVE | LIVE | PATCHED | REAL | ✅ PASS |
| **Today Dashboard**| LIVE | LIVE | **CLEAN (FIXED)** | REAL | ✅ PASS |
| **Community** | LIVE (with Fallback) | LIVE | CLEAN | PARTIAL | ⚠️ PARTIAL |
| **VerseHub Reader** | LIVE | LIVE | CLEAN | REAL | ✅ PASS |
| **Reflections** | **MOCK** | LIVE | **NOT WIRED** | MOCK | ❌ MOCK |
| **Spiritual Journey**| **MOCK** (Page) | PARTIAL (Summary) | **NOT WIRED** | MOCK | ❌ MOCK |
| **Proxy Gateway** | LIVE | N/A | **CLEAN (FIXED)** | REAL | ✅ PASS |

---

## 3. Critical Reality Drift

### A. Today Dashboard Contract Error (RESOLVED)
- **Status:** **FIXED**.
- **Remediation Report:** `docs/01-audits/today/2026-03-20-today-contract-remediation-report.md`.
- **Note:** Kontrak frontend diturunkan agar mengikuti backend nyata (`dailyVerse`, `rituals`, `highlights`, `spiritual_state`). Field phantom `pinnedLesson` dan `welcomeVerse` telah dihapus.

### B. Reflections & Journey Mocking
- **Temuan:** Fitur Reflections dan Journey sering diklaim "LIVE secara fungsional" di beberapa sync docs, padahal kenyataannya seluruhnya data statis.
- **Bukti File:**
  - `src/app/versehub/[lang]/reflections/page.tsx:28-30` (Hardcoded array + `setTimeout`).
  - `src/app/versehub/[lang]/my-spiritual-journey/page.tsx:180-183` (Hardcoded array + `setTimeout`).
- **Dokumen yang Salah:** `docs/02-uiux/versehub-final-status-sync.md`.
- **Status:** **MOCK**.

### C. Security Blocker: Proxy Token Logging (RESOLVED)
- **Status:** **FIXED**.
- **Remediation Report:** `docs/01-audits/security/2026-03-20-proxy-token-logging-remediation.md`.
- **Note:** Seluruh debug log sensitif di `proxy-laravel.ts` dan `laravel-api.ts` telah dibersihkan.

---

## 4. Active Blockers & Gaps by Severity

| Severity | Blocker Description | Evidence |
| :--- | :--- | :--- |
| **FIXED** | Authorization Token Logging in Proxy | `proxy-laravel.ts` |
| **FIXED** | Today API Missing `pinnedLesson` & `welcomeVerse` | `docs/01-audits/today/2026-03-20-today-contract-remediation-report.md` |
| **DRIFT** | Reflections Page wiring to backend | `reflections/page.tsx:28-30` |
| **DRIFT** | Profile Journey CTA (Broken SearchParams) | `src/app/profile/page.tsx:661` |
| **LOW** | Dead Code Cleanup (`GreetingHeader.tsx`, `mock.ts`) | `src/components/core/GreetingHeader.tsx` |

---

## 5. Docs Corrected in This Pass
- `docs/core/architecture/laravel-decoupled-hybrid/MASTER_PARITY_AUDIT.md` -> Demoted Today to PARTIAL.
- `docs/02-uiux/today-uiux-audit.md` -> Removed "DONE" claims for content population.
- `docs/02-uiux/versehub-final-status-sync.md` -> Corrected functionality status to PARTIAL.
- `docs/04-domains/today/audit.md` -> Added contract mismatch findings.
- `docs/04-domains/versehub/audit.md` -> Added mock status for reflections/journey.
- `docs/04-domains/profile-lifecycle/audit.md` -> Added Journey CTA broken link.

---

## 6. Development Constraints
- **DARE NOT Claim "LIVE" on Today for Legacy Parity:** Sangat berbahaya karena user tidak akan melihat lesson yang seharusnya dipinned meskipun sudah diatur di Admin (karena field dihapus dari kontrak).
- **DARE NOT Claim "LIVE" on Reflections:** Backend API ada tapi frontend sama sekali belum memanggilnya. Ini adalah *dead-end* fitur.

---

## 7. Next Highest-Leverage Fix
1. **WIRING `reflections/page.tsx`**: Ganti `setReflections([...])` statis dengan `fetch('/api/versehub/[lang]/reflections')`. Kabel backend sudah siap.
2. **Logic Fix (Profile)**: Tambahkan `useSearchParams` untuk aktivasi Journey CTA.

---
**Status Akhir Audit: PARTIAL**
*Alasan: Security Blocker dan Today Contract Mismatch telah ditutup (FIXED). Fokus beralih ke aktivasi fitur Reflections & Journey yang masih berupa MOCK.*
