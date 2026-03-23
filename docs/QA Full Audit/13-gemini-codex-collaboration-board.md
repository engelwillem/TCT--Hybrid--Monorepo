# Gemini-Codex Collaboration Board (13)

## Status Legend
- **Open:** Belum dikerjakan.
- **In Investigation:** Codex sedang mencari root cause.
- **Fix In Progress:** Implementasi perubahan kode.
- **Ready for QA Retest:** Fix diimplementasi di PROD, menunggu validasi Gemini.
- **Blocked:** Menunggu ketergantungan lain atau keputusan produk.
- **Reopened:** Gagal saat retest.
- **Closed:** Selesai divalidasi dan ditutup.

## Active Items Table (Post-Auth Stabilization)

| Item ID | Ref | Work Item | Category | Gate Status | Next Owner | Status | Next Valid Test Scope |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **ITEM-001A** | BUG-004 | /register route availability | **Frontend-only** | READY-FE-RETEST | Gemini | **Reopened** | No redirect (AppShell). Still stale. |
| **ITEM-001B** | BUG-004 | Signup UI mode (Fields vis) | **Frontend-only** | READY-FE-RETEST | Gemini | **Closed** | Sync sukses di kedua domain. |
| **ITEM-001C** | BUG-004 | Register user creation (API) | **Mixed** | BE-NOT-DEPLOYED | Op / User | **Open** | E2E signup (Ditunggu CSRF) |
| **ITEM-002A** | BUG-001 | Login Label correction ("Masuk") | **Frontend-only** | READY-FE-RETEST | Gemini | **Closed** | Label "Masuk" di kedua domain. |
| **ITEM-002B** | BUG-002 | Login Next proxy (302 Redirect Fix) | **Frontend-only** | READY-FE-RETEST | Gemini | **Closed** | API returns JSON (Verified live). |
| **ITEM-002C** | BUG-002 | Laravel API V1 Auth Controller | **Backend-dependent** | BE-NOT-DEPLOYED | Op / User | **In Progress** | Token issuance verification |
| **ITEM-003** | BUG-003 | VerseHub Bottom Nav Overlap | **Frontend-only** | READY-FE-RETEST | Gemini | **Reopened** | Bottom nav overlap on both. |
| **ITEM-006** | CH-004 | **Source-of-Truth Sync** | **Frontend-only** | READY-FE-RETEST | Gemini | **Closed** | WWW/EdgeOne are Equal (Fresh). |
| **ITEM-007** | - | Laravel manual deploy dependency | **Backend-dependent** | BE-NOT-DEPLOYED | Op / User | **In Progress** | Manual pull performed |
| **ITEM-008** | CH-005 | Landing page entry (Guest/Login flow) | **Frontend-only** | READY-FE-RETEST | Gemini | **Open** | Rename "Masuk" -> "Login" |
| **ITEM-009** | CH-005 | /today dynamic date & greeting | **Frontend-only** | READY-FE-RETEST | Gemini | **Open** | Add "Chosen People" |
| **ITEM-010** | CH-005 | /versehub/id noise cleanup | **Frontend-only** | READY-FE-RETEST | Gemini | **Open** | Clean noise items |
| **ITEM-011** | CH-005 | Action bar icons (Finger -> Love) | **Frontend-only** | READY-FE-RETEST | Gemini | **Open** | Global CSS/Component change |
| **ITEM-012** | BUG-005 | **Community image load/save failure** | **Mixed** | BLOCKED-INVESTIGATION | Codex | **Open** | Blocker: Investigasi storage |
| **ITEM-013** | CH-006 | Cleanup Archive/Fake Data | **Backend-dependent** | BE-NOT-DEPLOYED | Op / User | **Open** | Data real user only |
| **ITEM-014** | BUG-006 | **Too fast session logout fix** | **Mixed** | BLOCKED-INVESTIGATION | Codex | **Open** | Blocker: Session persistence |
| **ITEM-015** | BUG-007 | **2FA Profile server error (500)** | **Backend-dependent** | BE-NOT-DEPLOYED | Codex | **Open** | Blocker: Security settings |

---

## Closed This Sprint
- **ITEM-001A:** /register 404 (Redirected properly).
- **ITEM-001B:** Signup mode UI visibility.
- **ITEM-002A:** Login label ("Masuk").
- **ITEM-002B:** Auth 302 Redirect removal (Now JSON 419 Mismatch).
- **ITEM-006:** Tencent Edge source mapping synchronization.

---

## Wave 2 Items

| Item ID | Ref | Work Item | Category | Gate Status | Next Owner | Status | Next Valid Test Scope |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **ITEM-008** | PROD-ENTRY | Landing page as root entry point | **Frontend-only** | READY-FE-RETEST | Gemini | **Ready for QA Retest** | `/` stays landing, guest CTA visible, `Login` label visible |
| **ITEM-009** | PROD-TODAY | Today greeting, dynamic date, and user-name greeting | **Frontend-only** | READY-FE-RETEST | Gemini | **Ready for QA Retest** | `/today` shows dynamic current date, `Chosen People`, and name after password login |
| **ITEM-010** | PROD-VH-COPY | VerseHub copy cleanup | **Frontend-only** | READY-FE-RETEST | Gemini | **Ready for QA Retest** | `/versehub/id` copy matches requested removals/replacements |
| **ITEM-011** | PROD-ACTIONBAR | Action bar love icon replacement | **Frontend-only** | READY-FE-RETEST | Gemini | **Ready for QA Retest** | Community/today shared action bars show love icon instead of hand |
| **ITEM-012** | PROD-COMM-IMG | Community image save/load failure | **Mixed** | INVESTIGATE-RUNTIME | Codex + Op | **In Investigation** | Post image from real account and verify save + render from Laravel storage |
| **ITEM-013** | PROD-DATA | Remove fake/dummy operational data | **Mixed** | PARTIAL-FIX | Codex | **Fix In Progress** | Community no longer falls back to dummy archive posts or static featured verse |
| **ITEM-014** | PROD-SESSION | Auto logout / session persistence | **Mixed** | ROOT-CAUSE-ANALYSIS | Codex | **In Investigation** | Confirm whether transient 401/403 still wipes auth state too aggressively |
| **ITEM-015** | PROD-2FA | Profile 2FA server error | **Backend-dependent** | BE-REDEPLOY-REQUIRED | Op / User | **Fix In Progress** | Deploy backend, then run setup/confirm flow on `/profile` |

### Notes
- ITEM-012 and ITEM-014 affect release confidence the most because they touch real user trust and ongoing session continuity.
- ITEM-015 has a source-level fix ready, but it is not retestable on production until backend cPanel deploy is executed.

---

## Wave 3 Source Audit Sync (2026-03-23)

| Item ID | Ref | Work Item | Category | Gate Status | Next Owner | Status | Next Valid Test Scope |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **ITEM-008** | PROD-ENTRY | Landing page root entry + `Login` copy | **Frontend-only** | READY-FE-REDEPLOY | Gemini | **Ready for QA Retest** | `/` remains landing, guest/daftar/login visible, secondary auth gate shows `Login` |
| **ITEM-009** | PROD-TODAY | Today dynamic date, greeting, `Chosen People` | **Frontend-only** | READY-FE-REDEPLOY | Gemini | **Ready for QA Retest** | `/today` renders current Jakarta date, greeting with real name when available, and `Chosen People` below |
| **ITEM-010** | PROD-VH-COPY | VerseHub copy cleanup | **Frontend-only** | READY-FE-REDEPLOY | Gemini | **Ready for QA Retest** | `/versehub/id` has no `Gerbang VerseHub` / `Perpustakaan Firman`, shows `Akses Cepat` and `Reading Journey` copy |
| **ITEM-011** | PROD-ACTIONBAR | Action bar love icon normalization | **Frontend-only** | READY-FE-REDEPLOY | Gemini | **Ready for QA Retest** | Active Next action bars show love icon, no finger icon on active action bar surface |
| **ITEM-012** | PROD-COMM-IMG | Community image save/load failure | **Mixed** | PROD-RUNTIME-VERIFY | Codex + Op | **In Investigation** | Login with real user, upload via `Ruang Berbagi`, confirm DB row saved and image URL resolves from production storage |
| **ITEM-013** | PROD-DATA | Remove fake/dummy operational data | **Mixed** | SAFE-CLEANUP-PLAN-REQUIRED | Codex + Op | **Blocked** | Audit live DB rows for system/demo accounts before purge; do not blind-delete seed-related records |
| **ITEM-014** | PROD-SESSION | Auto logout / auth persistence | **Mixed** | PARTIAL-FIX-IN-SOURCE | Codex | **Fix In Progress** | Recheck whether transient 403 no longer wipes local auth; then validate broader password/Firebase token lifecycle |
| **ITEM-015** | PROD-2FA | Profile 2FA runtime error | **Mixed** | BE-REDEPLOY-REQUIRED | Op / User | **Fix In Progress** | Deploy Laravel source, then retest setup, confirm, disable, and regenerate recovery codes on `/profile` |

### Wave 3 Notes
- ITEM-012, ITEM-014, and ITEM-015 are the highest release-confidence risks.
- ITEM-014 now has a partial frontend hardening fix in source: `403` no longer hard-clears auth state in the audited flows.
- ITEM-015 now has two source-level fixes: backend cache-backed pending setup and frontend recovery-code flow correction.
