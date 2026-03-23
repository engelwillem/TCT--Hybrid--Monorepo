# 3-Day Fix Roadmap

## Objective
Menstabilkan alur kerja utama (Auth/Onboarding) dan memperbaiki regresi UX kritikal (VerseHub) agar platform layak rilis dalam waktu 3 hari.

## Current Deploy Assumption
- Frontend production source = `main`
- Frontend deploy = Tencent auto-deploy from `main`
- Backend deploy = manual cPanel deploy
- Any old release-branch assumption outside `main` is obsolete for current execution

## Current Status
🛑 **NO-GO** (Critical Blockers in Auth & Registration).

## Critical Risks
- **User Acquisition Failure:** Pendaftaran (BUG-004) masih 404/Rusak.
- **Access Denial:** Login (BUG-002) masih 404 (Endpoint mismatch).
- **UX Confusion:** VerseHub (BUG-003) overlap navigation mengganggu usability "Focused Reading".

## Workstreams

### Workstream A - Auth & Onboarding Stabilization
**Goal:** Mengaktifkan pendaftaran dan masuk pengguna secara reliabel.
- Retest & Reconciliation of Login/Register Routes.
- Fix Proxy/API contract between Next.js and Laravel.

### Workstream B - Core UX / VerseHub Behavior
**Goal:** Memastikan pengalaman membaca (Reader) bersih dari gangguan UI.
- Hide Bottom Navigation when Verse Sheet is active.

### Workstream C - Session / Reliability Validation
**Goal:** Memastikan user tetap login lintas halaman.

### Workstream D - Regression & Release Readiness
**Goal:** Final sanity check dan laporan Go/No-Go final.

---

## Day 1
- **Goals:** Resolusi total Blocker Registrasi & Login.
- **Tasks:**
  1. Deep Reconnaissance of Auth Request Chain (Gemini).
  2. Implement Fix for Register Route & Login Contract (Codex).
  3. Validate Signup End-to-End (Gemini).
- **Owner:** Gemini (Audit/Validate), Codex (Implementation).
- **Exit Criteria:** Pendaftaran berhasil (User tersimpan di DB) & Login berhasil (Token tersimpan di Storage).

## Day 2
- **Goals:** Resolusi VerseHub UX & Session Persistence.
- **Tasks:**
  1. Fix Overlay Conflict in Reader (Codex).
  2. Test Session Persistence across /today, /versehub, /community (Gemini).
  3. Audit Profile Avatar (Gemini).
- **Owner:** Codex (UX Fix), Gemini (Session/UI Audit).
- **Exit Criteria:** Bottom Nav tersembunyi saat baca ayat. Sesi tidak hilang saat refresh.

## Day 3
- **Goals:** Regression hardening & Final Handover.
- **Tasks:**
  1. Sweep of Community & Protected Routes (Gemini).
  2. Final release readiness report (Gemini).
  3. Documentation cleanup (Gemini/Codex).
- **Owner:** Gemini.
- **Exit Criteria:** Seluruh Blocker (BUG-002, BUG-004) berstatus CLOSED.

---

## Dependency Map
- **CH-001 (Register)** -> Must be fixed before **Workstream C (Session)**.
- **CH-002 (Login)** -> Priority P0 for all user-facing tests.

## Operational Note
This roadmap remains useful as sequencing history, but release execution must follow the current hybrid deploy truth, not older branch-release assumptions.

## Definition of Done
- Root cause dijelaskan.
- Fix terimplementasi di production runtime.
- Retest QA lalui 100% kriteria.
- Status Handoff & Validation log sinkron.

## Release Decision Target
**End of Day 3 (2026-03-25).**
