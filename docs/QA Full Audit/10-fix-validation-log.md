# 10 - Fix Validation Log

Dokumen ini mencatat semua hasil validasi QA terhadap fix yang dikerjakan Codex.

| Validation ID | Item ID | Title | Result | Status | Date | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| VAL-001 | ITEM-001A | /register route 404 fix | **Fail (Runtime)** | Reopened | 2026-03-23 | No redirect in both domains. Still stale. |
| VAL-002 | ITEM-002A | Login label "Masuk" replacement | **Pass (Live)** | Closed | 2026-03-23 | Label "Login" synced on both domains. |
| VAL-003 | ITEM-003 | VerseHub Bottom Nav Overlap | **Fail (Runtime)** | Reopened | 2026-03-23 | Overflow still visible on Both. |
| VAL-006 | ITEM-002B | Auth 302 Redirect Removal | **Pass (Live)** | Closed | 2026-03-23 | API returns 419 JSON instead of 302 HTML |
| VAL-007 | ITEM-001B | Signup UI Mode | **Pass (Live)** | Closed | 2026-03-23 | Heading "Mulai Akun" and fields rendered |
| VAL-008 | ITEM-008 | Landing Entry Flow / Copy | **Pass (Live)** | Closed | 2026-03-23 | "Login" label & Guest CTA verified. |
| VAL-009 | ITEM-009 | Today Dynamic Date/Greeting | **Pass (Live)** | Closed | 2026-03-23 | "Chosen People" subhead verified. |
| VAL-010 | ITEM-010 | VerseHub Copy Cleanup | **Pass (Live)** | Closed | 2026-03-23 | Noise text removed/refined. |
| VAL-011 | ITEM-011 | ActionBar Love Icons | **Pass (Live)** | Closed | 2026-03-23 | Finger icons replaced by Heart. |
| VAL-012 | ITEM-016 | Today Greeting 3-line | **Pass (Live)** | Closed | 2026-03-23 | Verified 2-line guest layout in production. |
| VAL-013 | ITEM-017 | Sidebar Guest Identity | **Pass (Live)** | Closed | 2026-03-23 | Verified G/Guest fallback in production. |
| VAL-014 | ITEM-015 | Profile 2FA backend deploy | **Pending (Deploy Completed)** | Awaiting Runtime Verification | 2026-03-23 | cPanel backend deploy executed successfully; Gemini must retest setup/confirm/disable/recovery live. |
| VAL-015 | ITEM-001C | Auth CSRF warming | **Pending (Patched in Source)** | Awaiting Frontend Deploy | 2026-03-23 | Next auth pages now warm Sanctum CSRF and send `X-XSRF-TOKEN`, but runtime verification must wait for FE deploy. |

---

## Validation ID: VAL-006 (Auth 302 Fix)
- **Status:** ✅ **PASS**
- **Evidence:** 
  - `POST https://api.thechoosentalks.org/api/v1/login`
  - Headers: `Accept: application/json`
  - Response: `419 Unprocessable Content` (JSON)
  - Detail: `{ "message": "CSRF token mismatch." }`
  - Conclusion: 302 HTML Redirect is successfully removed. Content parity between source and runtime confirmed.

## Validation ID: VAL-007 (Signup UI)
- **Status:** ✅ **PASS**
- **Evidence:**
  - URL: `/login?intent=signup`
  - UI Elements: Nama Lengkap, Email, Password, Konfirmasi Password, Button "Daftar".
  - Conclusion: Frontend contract sync successful.
