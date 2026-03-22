# Active & Resolved Blockers

## ACTIVE BLOCKER (2026-03-22 - Today Frontend Runtime Verification)
- [ ] **`/today` runtime production verification after frontend source patch**: **PENDING**
  - **Type:** integration verification blocker
  - **Owner:** frontend
  - **Why open:** backend endpoint sudah verified, tetapi patch source frontend belum terverifikasi pada runtime production Tencent Edge.
  - **Impact:** risiko `/today` masih fallback/mock di live jika deploy frontend belum membawa patch terbaru.
  - **Evidence ringkas:** local git masih dirty (patch belum commit/deploy saat audit ini ditulis).

## RESOLVED BLOCKERS (2026-03-20 - Build Stability)
- [x] **Frontend Monorepo Checks (Source + CI)**: **FIXED**. Akar masalah Google Fonts dependency (`next/font/google`) telah diputus. Verifikasi CI (GitHub Actions Run 23339123819) PASS (0:59s).
- [x] **Production Build Rerun**: **FIXED**. Build sukses di environment CI. Status deployment asinkron (CD) saat ini terhambat secret.
- [x] **Tencent Edge Hook Dependency in Frontend Workflow**: **FIXED**. Referensi `TENCENT_EDGE_DEPLOY_HOOK_URL` dan trigger webhook deploy manual sudah dihapus dari workflow frontend.

---

## 1. GitHub Actions SSH/SCP Access Blocked (Firewall)
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

## RESOLVED BLOCKERS (2026-03-20 - Reality Sync)
- [x] **Today API Contract Mismatch**: **FIXED**. (`pinnedLesson` & `welcomeVerse` removed).
- [x] **VerseHub Mocking (Reflections/Journey)**: **FIXED**. Real data integrated in `reflections/page.tsx` and `my-spiritual-journey/page.tsx`.
- [x] **Profile Journey CTA (Link Broken)**: **FIXED**. Deep-link implemented to Spiritual Journey page.
- [x] **Security (Proxy Token Logging)**: **FIXED**. Sensitive logs removed.

---

## 3. Reality Resync: Functional Gaps (✅ PASS)
**Status:** PASS (Domain Readiness)

### Resolved Findings:
- ✅ **Security (Proxy Token Logging)**: **FIXED**.
- ✅ **Contract Error (Today)**: **FIXED**.
- ✅ **VerseHub Data Integration**: **FIXED**. Reflections & Journey list now live.
- ✅ **Profile Journey CTA**: **FIXED**. Deep-link to journey dashboard enabled.
- ⚠️ **Reflection Detail**: **PARTIAL**. Ready but resolving from list collection.

## 4. Tencent Edge Duplicate Deployment Trigger
**Status:** FIXED  
**Type:** DevOps / Deployment hygiene  
**Owner:** DevOps/Admin

### Final state
Sumber duplikasi deploy dari GitHub Actions sudah dihapus dengan menonaktifkan trigger webhook Tencent pada workflow frontend. Dengan demikian, frontend deploy mengikuti satu jalur: auto deploy Git integration milik Tencent Edge.

### Verification focus
Pastikan deployment berikutnya hanya memunculkan satu trigger deploy aktif per commit pada dashboard Tencent Edge.
