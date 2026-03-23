# Audit: Profile Lifecycle

## Domain Overview
Domain profil menangani sinkronisasi sesi pengguna dari Firebase (`app-auth-token.ts`) ke identitas Backend (Laravel Sanctum), pengeditan nama, serta unggahan avatar.

## Temuan Reality Drift (2026-03-20)
- **Journey CTA Link Broken**: `src/app/profile/page.tsx:661` mengarah ke `?section=journey`, namun `ProfilePage` tidak membaca param `section` (`useSearchParams` tidak dipakai).
- **Status 2FA**: UI sudah tersedia namun perlu validasi sync dengan session Laravel pasca-OTP.

## Target Parity (Revised)
- Implementasi `useSearchParams` untuk navigasi internal section di Profile.
- Sinkronisasi status avatar secara real-time pasca unggahan (re-fetch profil).
