# Auth & Session Hardening Report

**Tanggal:** 2026-03-13  
**Status:** IMPLEMENTED (Batch 0 complete)

## 1. File yang Diubah
- `backend-api/app/Http/Controllers/Api/V1/FirebaseAuthSyncController.php`: Menambahkan logika `logout` (revocation token).
- `backend-api/routes/api.php`: Menambahkan rute `POST /auth/logout`.
- `src/app/api/auth/logout/route.ts`: Membuat proxy logout Next.js.
- `src/components/FirebaseAuthSync.tsx`: Hardening lifecycle token exchange dan auto-logout saat 401.
- `src/components/ActionBar.tsx`: Menghapus mock `isAuthenticated = true`.

## 2. Mock yang Dihapus/Dinonaktifkan
- **Hardcoded Auth State**: Variable `isAuthenticated` di `ActionBar.tsx` tidak lagi dipaksa `true`. Status kini mengikuti keberadaan token Sanctum yang nyata.
- **Dangling Local Sessions**: Logout kini menghapus token di MySQL (`personal_access_tokens`), bukan hanya di `localStorage`.

## 3. Flow Baru (Hardened)
1. **Login**: Firebase Auth -> Sync to Laravel -> Sanctum Token stored in LocalStorage.
2. **Action**: UI mengecek `getAppAccessToken()`. Jika tidak ada, user dilempar ke Landing.
3. **Expiry**: Jika API return `401`, client-side secara otomatis memanggil `signOut(auth)` dan membersihkan token lokal untuk mencegah *Session Drift*.
4. **Logout**: User klik logout -> Firebase `signOut` -> `FirebaseAuthSync` mendeteksi -> Call `/api/auth/logout` -> Laravel revokes token -> LocalStorage cleared.

## 4. Known Limitations
- Perubahan Nama/Avatar di Firebase masih membutuhkan waktu sync (maksimal saat login berikutnya) untuk masuk ke database MySQL.
- Session gating baru dilakukan di tingkat komponen UI, belum di level Next.js Middleware (direncanakan untuk Batch 1).

## 5. Langkah Verifikasi Manual
1. Login via Google/Email di Frontend.
2. Cek database MySQL: tabel `personal_access_tokens` harus memiliki 1 record baru untuk user terkait.
3. Klik tombol *Like* di Community: Aksi harus berhasil tanpa redirect.
4. Hapus secara manual record token di database MySQL.
5. Coba klik *Like* lagi di Frontend: Aplikasi harus mendeteksi `401` dan otomatis me-logout user ke halaman Landing.
6. Klik Logout dari menu profil: Record token di MySQL harus terhapus otomatis.
