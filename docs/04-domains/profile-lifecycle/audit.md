# Audit: Profile Lifecycle

## Domain Overview
Domain profil menangani sinkronisasi sesi pengguna dari Firebase (`app-auth-token.ts`) ke identitas Backend (Laravel Sanctum), pengeditan nama, serta unggahan avatar.

## Temuan Inti
- Validasi unggahan avatar Laravel cukup ketat (ukuran dan dimensi).
- Bypass otentikasi e2e token dibutuhkan agar Playwright dapat meretas ke state auth tanpa harus login OTP Firebase.

## Target Parity
Mengesahkan penulisan nama dan penggantian foto profil dapat menembus API `/api/v1/auth/profile` dengan balasan *200 OK* dan sinkronisasi re-render di Client Next.js.
