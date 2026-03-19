# Open Blockers

## 1. GitHub Actions SSH/SCP Access Blocked (Firewall)
**Status:** OPEN  
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
**Status:** OPEN BACKLOG  
**Type:** product/UI execution backlog  
**Owner:** frontend/product

### Current state
Frontend shell/foundation reset sudah PASS, namun pembedahan visual pada pilar inti (Today, VerseHub, Community, Paths) dipause sementara untuk menstabilkan integrasi API dan infrastruktur backend.

---

## RESOLVED BLOCKERS (2026-03-19)
- [x] **Backend pull-deploy execution**: Berhasil dieksekusi manual di server. Layout release (`releases/`, `current`, `shared`) terbukti sehat.
- [x] **Apex HTTPS & Domain Parity**: `thechoosentalks.org` dan `www` keduanya merespons HTTPS dengan sertifikat valid.
- [x] **Webhook Strategy Alignment**: Keputusan teknis pemicu asinkron sudah diambil; implementasi webhook tidak lagi menghambat rilis harian (karena manual deploy sudah stabil).
- [x] **Admin Login Recovery (Filament Production)**: `https://admin.thechoosentalks.org/admintalk/login` sudah pulih; blocker `Route [register] not defined` dan blocker CSP runtime admin telah ditutup. Header live admin sudah memuat `script-src 'self' 'unsafe-inline' 'unsafe-eval' https:`.
