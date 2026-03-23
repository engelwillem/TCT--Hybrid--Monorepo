# 10 - Fix Validation Log

Dokumen ini mencatat semua hasil validasi QA terhadap fix yang dikerjakan Codex.

| Validation ID | Item ID | Title | Result | Status | Date | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| VAL-001 | ITEM-001A | /register route 404 fix | **Fail (Runtime)** | Reopened | 2026-03-23 | No redirect in both domains. Still stale. |
| VAL-002 | ITEM-002A | Login label "Masuk" replacement | **Pass (Live)** | Closed | 2026-03-23 | Label synced on both domains. |
| VAL-003 | ITEM-003 | VerseHub Bottom Nav Overlap | **Fail (Runtime)** | Reopened | 2026-03-23 | Overflow still visible on Both. |
| VAL-006 | ITEM-002B | Auth 302 Redirect Removal | **Pass (Live)** | Closed | 2026-03-23 | API returns 419 JSON instead of 302 HTML |
| VAL-007 | ITEM-001B | Signup UI Mode | **Pass (Live)** | Closed | 2026-03-23 | Heading "Mulai Akun" and fields rendered |

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
