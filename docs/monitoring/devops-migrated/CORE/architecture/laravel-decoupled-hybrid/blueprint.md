# Architecture Blueprint (Active)

Last updated: 2026-04-17

Dokumen ini adalah sumber acuan arsitektur aktif untuk TheChosenTalks.
Gunakan dokumen ini sebagai referensi utama, lalu gunakan dokumen audit lain sebagai histori pendukung.

## 1) Current System

- Frontend: Next.js 15 App Router (React 19 + TypeScript)
- Backend: Laravel 12 API (`backend-api/`)
- Database: MariaDB
- Realtime/auth: Firebase + app session backend
- Deployment model: decoupled frontend dan backend

## 2) Runtime Boundaries

### Browser -> Frontend
- User mengakses frontend domain publik.
- Browser tidak menjadi jalur utama call langsung ke Laravel untuk flow aplikasi inti.

### Frontend -> Backend
- Frontend memakai route handler Next `/api/*`.
- Next melakukan proxy server-to-server ke Laravel.

Referensi implementasi:
- [proxy-laravel.ts](/e:/thechoosentalksnext/src/lib/proxy-laravel.ts)
- [laravel-api.ts](/e:/thechoosentalksnext/src/lib/laravel-api.ts)

## 3) Local vs Production Parity (Mandatory)

### Local Docker
- Frontend: `http://localhost:9002`
- Backend: `http://localhost:8000`
- Internal proxy target: `http://backend:8000`

### Production
- Frontend: `https://www.thechoosentalks.org`
- Backend API: `https://api.thechoosentalks.org`

### Parity rules yang wajib sama
- topology decoupled (frontend terpisah backend)
- proxy boundary Next -> Laravel
- database engine MariaDB
- auth/session behavior

### Dev-only deviations yang diperbolehkan
- `APP_ENV=local`
- `APP_DEBUG=true`
- localhost-specific CORS/SANCTUM

## 4) Share Prepare Hardening Baseline

Untuk endpoint `share-assets/prepare`, baseline wajib:
- auth guard (`401` untuk unauthenticated)
- rate limiting (`429` untuk burst abuse)
- timeout upstream Laravel default `8000ms`
- polling client anti race (abort-aware + dedupe + backoff)

Referensi:
- [share-prepare-guard.ts](/e:/thechoosentalksnext/src/lib/share-prepare-guard.ts)
- [share-assets.ts](/e:/thechoosentalksnext/src/lib/share-assets.ts)
- [laravel-api.ts](/e:/thechoosentalksnext/src/lib/laravel-api.ts)

## 5) Operational Verification

Sebelum release:
1. `docker compose ps` -> service healthy.
2. `npm run build` -> sukses.
3. `npm run smoke:share-assets` -> PASS.
4. Pastikan checklist + monitoring aktif:
   - [share-assets-release-checklist.md](/e:/thechoosentalksnext/docs/release/share-assets-release-checklist.md)
   - [share-assets-dashboard.md](/e:/thechoosentalksnext/docs/monitoring/share-assets-dashboard.md)
   - [share-assets-alert-rules.md](/e:/thechoosentalksnext/docs/monitoring/share-assets-alert-rules.md)

## 6) Reading Order (Recommended)

1. Dokumen ini (`blueprint.md`)
2. [USING DOCKER.md](/e:/thechoosentalksnext/docs/core/architecture/laravel-decoupled-hybrid/USING%20DOCKER.md)
3. [MONOREPO HYBRID LOCAL-SERVER PARITY AUDIT.md](/e:/thechoosentalksnext/docs/core/architecture/laravel-decoupled-hybrid/MONOREPO%20HYBRID%20LOCAL-SERVER%20PARITY%20AUDIT.md)
4. File audit/report lain hanya saat butuh konteks historis
