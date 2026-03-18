# Auth & Session Reality Audit

**Tanggal Audit:** 2026-03-13  
**Status Parity:** IN PROGRESS (Technical plumbing exist, lifecycle hardening missing)

---

## 1. Current Auth Architecture: Hybrid Token Exchange
Aplikasi menggunakan pola **"Client-Side Gatekeeper, Server-Side Validator"**:
1.  **Firebase Auth (Gatekeeper)**: Menangani login sosial/email di browser. Menghasilkan *Firebase ID Token*.
2.  **Next.js Proxy (Bridge)**: Meneruskan ID Token ke Laravel.
3.  **Laravel Sanctum (Validator)**: Memverifikasi ID Token ke Google Identity API, melakukan sinkronisasi ke tabel `users` MySQL, dan menerbitkan *Sanctum Plain Text Token*.
4.  **App Token Storage**: Frontend menyimpan token Sanctum di `localStorage` (`tct_app_access_token`) untuk digunakan pada request API terproteksi.

---

## 2. Actual Runtime Flow

### A. Login & Sync Flow
1.  User login via Firebase SDK di Frontend.
2.  `FirebaseAuthSync.tsx` mendeteksi `onIdTokenChanged`.
3.  Frontend memanggil `POST /api/auth/firebase/sync` (Next Proxy).
4.  Proxy meneruskan ke `POST /api/v1/auth/firebase/sync` (Laravel).
5.  `FirebaseAuthSyncController.php` memvalidasi token, mencari/membuat user berdasarkan `firebase_uid`.
6.  Laravel me-return Sanctum token.
7.  Frontend menyimpannya via `app-auth-token.ts`.

### B. Logout Flow
1.  User memanggil `signOut(auth)` (Firebase).
2.  `FirebaseAuthSync.tsx` mendeteksi user null.
3.  Memanggil `clearAppAccessToken()` untuk menghapus token di `localStorage`.
4.  **GAP**: Tidak ada panggilan ke Laravel untuk melakukan *revocation* (penghapusan) token di database `personal_access_tokens`.

### C. Protected Route Access
1.  UI mengecek `useUser()` (Firebase State).
2.  Request data melalui `CommunityService` atau `proxyLaravel`.
3.  Proxy mengambil token dari `localStorage` dan menyisipkannya ke header `Authorization: Bearer ...`.
4.  Laravel memvalidasi via middleware `auth:sanctum`.

---

## 3. Source of Truth Mapping

| Entity | Primary Owner | Secondary Sync | Conflict Risk |
|---|---|---|---|
| **Auth State** | Firebase Auth | Laravel Sanctum | **High**: UI bisa terlihat login (Firebase OK) tapi API gagal (Sanctum Expired). |
| **User Profile** | Firebase (Display Name/Photo) | MySQL (Name/Avatar) | **Medium**: Update profil di Firebase tidak otomatis ter-update di MySQL hingga sync berikutnya. |
| **Session ID** | Firebase UID | Sanctum Token ID | **Low**: Keduanya terikat pada ID yang sama secara unik. |

---

## 4. Mock & Fake Integration Findings

1.  **Hardcoded Auth (`src/components/ActionBar.tsx`)**: Variable `isAuthenticated` dipaksa `true` secara manual untuk menampilkan fitur, mengabaikan status login asli.
2.  **Mock Profile Update (`src/app/profile/page.tsx`)**: Aksi ganti password dan 2FA masih bersifat simulasi UI, belum melakukan fetch ke endpoint API riil.
3.  **Silent Failures**: Jika sync gagal, aplikasi seringkali tetap membiarkan user berada di state "Login" di UI, namun setiap aksi (Like/Post) akan gagal tanpa pesan error yang akurat (hanya kembali ke landing).

---

## 5. Critical Gaps & Parity Risks

1.  **Session Drift (Kritis)**: Belum ada mekanisme penanganan jika token Sanctum di-delete admin atau expired, sementara Firebase session masih hidup.
2.  **Token Revocation**: Logout tidak menghapus record di tabel `personal_access_tokens`, menyebabkan penumpukan token sampah di MySQL.
3.  **Identity Lag**: Perubahan Avatar di Firebase tidak langsung terlihat di `MemberPostCard` karena feed mengambil data dari MySQL `avatar_path` yang hanya di-update saat proses sync token.
4.  **Middleware Mismatch**: Next.js Middleware belum secara aktif memvalidasi token Sanctum sebelum merender halaman terproteksi (baru sebatas pengecekan Firebase di level client).

---

## 6. Files Requiring Hardening (Batch 0)

### Frontend (Next.js)
- `src/components/FirebaseAuthSync.tsx`: Tambahkan penanganan error 401 eksplisit untuk trigger logout total.
- `src/services/app-auth-token.ts`: Tambahkan validasi integritas token.
- `src/lib/proxy-laravel.ts`: Pastikan error auth diteruskan ke handler global.
- `src/layouts/AppShell.tsx`: Sinkronisasi status loading auth agar tidak ada "layout flicker".

### Backend (Laravel)
- `app/Http/Controllers/Api/V1/FirebaseAuthSyncController.php`: Tambahkan sinkronisasi profile (avatar/name) yang lebih agresif.
- `routes/api.php`: Tambahkan rute `POST /auth/logout` untuk pembersihan token database.
- `app/Http/Middleware/Authenticate.php`: Sesuaikan response JSON untuk request API yang tidak terautentikasi agar Next.js bisa menangkapnya dengan mudah.

---
*Audit selesai. Siap untuk masuk ke fase eksekusi Hardening Auth Sync.*
