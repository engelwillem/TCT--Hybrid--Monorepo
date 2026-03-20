# Active & Resolved Blockers

## 1. Frontend Monorepo Checks Failing (Fix Identification/VERIFYING)
**Status:** VERIFYING (Fix pending CI pass)  
**Type:** CI/Build Pipeline Blocker  
**Owner:** frontend/Codex + Verification Analyst

### Why it is still open
Akar masalah (`lucide-center` typo) telah dikonfirmasi dan diperbaiki. Kami saat ini menunggu hasil build otomatis dari GitHub Actions untuk memastikan tidak ada regresi tambahan sebelum secara resmi menutup blocker ini.

### Impact
Rilis update frontend terbaru, termasuk pengerjaan visual parity dan perbaikan UI/UX pada modul Community dan Profile, tidak bisa dilanjutkan secara otomatis ke production (Tencent Edge). (Patch Profile & VerseHub sudah siap "mengantre" di branch).

### Path to Resolution
Codex sedang melacak output `lint` dan `build` untuk memperbaiki *type errors*, *missing imports*, atau *syntax errors*. Setelah diperbaiki, verifikasi harus berurut: `lint` -> `typecheck` -> `build`.

---

## 2. GitHub Actions SSH/SCP Access Blocked (Firewall)
**Status:** BLOCKED  
**Type:** infrastructure / CI-CD blocker  
**Owner:** infrastructure/admin

### Why it is still open
Trigger deployment backend dari GitHub Actions runner (`backend-cpanel-deploy.yml`) secara konsisten gagal menjangkau server cPanel (TCP Timeout). Hal ini disebabkan oleh kebijakan firewall (CSF/LFD) di sisi hosting yang memblokir akses SSH masuk dari rentang IP dinamis GitHub runner.

### Impact
Otomatisasi rilis dari GitHub terganggu. Saat ini rilis harus dilakukan secara manual dari terminal cPanel atau melalui pemicu lokal lainnya.

### Official Workaround (The Daily Operation)
Gunakan terminal cPanel untuk eksekusi asinkron:
```bash
HEALTHCHECK_BASE_URL="https://api.thechoosentalks.org" bash /home/thechoosentalks/deploy/apps/thechoosentalks/deploy.sh
```

### Path to Resolution
- Whitelist rentang IP GitHub Actions (High Maintenance).
- Perkuat sistem Webhook HTTP (pemicu alternatif tanpa SSH).
- Instalasi Runner lokal di VPS (Self-hosted runner).

---

## 2. Frontend V1 redesign batch has not resumed yet
**Status:** DRIFT  
**Type:** product/UI execution backlog  
**Owner:** frontend/product

### Current state
Frontend shell/foundation reset sudah PASS, namun pembedahan visual pada pilar inti (Today, VerseHub, Community, Paths) dipause sementara untuk menstabilkan integrasi API dan infrastruktur backend. Saat ini fokus kembali ke perbaikan visual (VerseHub Desktop & Profile Readability).

## 3. Profile UI/UX (Readability & Avatar)
**Status:** PATCHED IN SOURCE (needs production validation)  
**Type:** UI/UX polish  
**Owner:** frontend

### Current state
Issue profile readability (kontras teks) dan avatar resolution (URL storage) telah diperbaiki di source code. Patch sudah diterapkan namun belum diverifikasi di production. Issue ini bukan lagi "sedang diaudit awal", tetapi menunggu validasi live.

---

## RESOLVED BLOCKERS (2026-03-19)
- [x] **Backend pull-deploy execution**: Berhasil dieksekusi manual di server. Layout release (`releases/`, `current`, `shared`) terbukti sehat.
- [x] **Apex HTTPS & Domain Parity**: `thechoosentalks.org` dan `www` keduanya merespons HTTPS dengan sertifikat valid.
- [x] **Webhook Strategy Alignment**: Keputusan teknis pemicu asinkron sudah diambil; implementasi webhook tidak lagi menghambat rilis harian (karena manual deploy sudah stabil).
- [x] **Admin Login Recovery (Filament Production)**: `https://admin.thechoosentalks.org/admintalk/login` sudah pulih; blocker `Route [register] not defined` dan blocker CSP runtime admin telah ditutup. Header live admin sudah memuat `script-src 'self' 'unsafe-inline' 'unsafe-eval' https:`.

## 3. Reality Resync: Functional Gaps (⚠️ PARTIAL)
**Status:** PARTIAL (Security & Today FIXED)

### Resolved Findings:
- ✅ **Security (Proxy Token Logging)**: **FIXED**.
- ✅ **Contract Error (Today)**: **FIXED**. Frontend logic removed phantom field dependency (Verified 2026-03-20).
- ❌ **Mock Drift (VerseHub)**: **MOCK**. Reflections & Journey pages are seluruhnya mock.
- ⚠️ **Logic Error (Profile)**: **DRIFT**. Journey CTA missing `useSearchParams` hook.

---

## 6. Profile Journey CTA (Link Broken)
**Status:** DRIFT
**Type:** Logic/Wiring Issue
**Owner:** Frontend

### Current State
`src/app/profile/page.tsx:661` performs `router.push('/profile?section=journey')`, but `ProfilePage` does not use `useSearchParams` hook to read and navigate to that section.

## 4. Tencent Edge Duplicate Deployment Trigger
**Status:** BLOCKED (Pending Console adjustment)  
**Type:** DevOps / Deployment hygiene  
**Owner:** DevOps/Admin

### Why it is still open
Satu commit memicu dua build paralel di dashboard Tencent Edge (Git-Connected vs Webhook). Ini menyebabkan pemborosan kuota build dan ketidakpastian versi rilis terakhir yang tampil di production.

### Path to Resolution
Nonaktifkan fitur "Automatic Deployment from branch" di pengaturan Build Project pada konsol Tencent Cloud. Biarkan rilis hanya dipicu oleh GitHub Actions (Webhook) setelah seluruh tes (lint/typecheck) LULUS.
