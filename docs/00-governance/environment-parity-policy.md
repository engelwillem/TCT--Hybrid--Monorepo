# Environment Parity Policy

## Purpose
Menjaga parity antara:
- local development
- backend server (cPanel)
- frontend server (Tencent Edge)
- database dan storage yang relevan

## Principle
Parity tidak diasumsikan. Parity harus diverifikasi.

## Non-Negotiable Areas
1. API contract parity
2. Environment variable parity
3. Database schema parity
4. Storage path / asset URL parity
5. Auth/session/cookie parity
6. Route and redirect parity
7. Build/runtime parity
8. CORS / CSRF / proxy parity

## Required Checks Before Release
1. Local vs production env diff tercatat
2. Schema migration parity tercatat
3. API endpoint contract parity diverifikasi
4. Critical read-path smoke tests PASS
5. Critical write-path smoke tests PASS
6. Auth, redirect, upload, and error states diverifikasi
7. CDN/asset URL behavior diverifikasi
8. Release blockers dicatat di handover docs

## Forbidden Assumptions
- Jangan menganggap local sama dengan production hanya karena fitur bekerja di local.
- Jangan menganggap cPanel dan Tencent Edge memakai runtime identik tanpa verifikasi.
- Jangan deploy jika ada mismatch environment yang belum dipetakan.
