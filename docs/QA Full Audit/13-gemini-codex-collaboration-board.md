# Gemini-Codex Collaboration Board (13)

## Current Deploy Truth
- Frontend auto-deploys via Tencent Edge when pushed to `main`.
- Backend requires manual git pull and `bash deploy.sh` at cPanel.
- **Workflow:** Local Readiness (Codex) -> Commit/Push (`main`) -> Manual Pull (cPanel) -> QA Retest (Gemini).

## Status Legend
- **Open:** Belum dikerjakan.
- **In Investigation:** Codex sedang mencari root cause.
- **Fix In Progress:** Implementasi perubahan kode.
- **Ready for QA Retest:** Fix diimplementasi di PROD, menunggu validasi Gemini.
- **Blocked:** Menunggu ketergantungan lain atau keputusan produk.
- **Reopened:** Gagal saat retest.
- **Closed:** Selesai divalidasi dan ditutup.

## Active Items Table (Workflow Sync Final)

| Item ID | Ref | Work Item | Category | Gate Status | Next Owner | Status | Next Valid Test Scope |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **ITEM-001A** | BUG-004 | /register route availability | **Frontend-only** | LOCAL-READINESS-PENDING | Codex | **Reopened** | Route existence (Prod) |
| **ITEM-001B** | BUG-004 | Signup UI mode (Fields vis) | **Frontend-only** | LOCAL-READINESS-PENDING | Codex | **Reopened** | Conditional signup UI |
| **ITEM-001C** | BUG-004 | Register user creation (API) | **Mixed** | BE-NOT-DEPLOYED | Op / User | **Open** | End-to-end signup flow |
| **ITEM-002A** | BUG-001 | Login Label correction ("Masuk") | **Frontend-only** | LOCAL-READINESS-PENDING | Codex | **Reopened** | Visual label check (Prod) |
| **ITEM-002B** | BUG-002 | Login Next proxy (`/api/auth/login`) | **Frontend-only** | LOCAL-READINESS-PENDING | Codex | **Reopened** | Request path check (Live) |
| **ITEM-002C** | BUG-002 | Laravel API V1 Auth Controller | **Backend-dependent** | BE-NOT-DEPLOYED | Op / User | **Open** | API endpoint status check |
| **ITEM-003** | BUG-003 | VerseHub Bottom Nav Overlap | **Frontend-only** | LOCAL-READINESS-PENDING | Codex | **Reopened** | Overlay suppression behavior |
| **ITEM-006** | CH-004 | **Source-of-Truth Sync** | **Frontend-only** | BLOCKED-INFRA | Codex | 🛑 **BLOCKED** | Local build manifest check |

---

## Ready for Codex (Local Monorepo Readiness)
- **Goal:** Complete all fixes in monorepo root locally. 
- **Definition of Done:** Local build succeeds and includes `/register`, label "Masuk", and signup logic.
- **Action:** Once Local Readiness is declared, handoff for Commit/Push.

---

## Ready for User / Operator (Deployment Queue)
- **Action:** After Codex pushes to `main`, performing manual git pull and `bash deploy.sh` at cPanel terminal.
- **Action:** Purge CDN cache for `/*` at Tencent Edge.

---

## Ready for Gemini Retest (QA Queue)
- **NONE.** Retest ditunda hingga deployment sinkronisasi FE/BE dinyatakan selesai oleh operator.

---

## Closed This Sprint
- (None).
