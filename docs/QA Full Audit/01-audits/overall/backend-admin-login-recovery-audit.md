# Backend Admin Login Recovery Audit

## 1. Ringkasan Masalah
Login admin Filament di `https://admin.thechoosentalks.org/admintalk/login` sempat gagal normal karena dua blocker utama:
1. `Route [register] not defined` pada `login-links.blade.php`.
2. CSP terlalu ketat untuk runtime Filament/Livewire/Alpine (admin area belum mengizinkan `unsafe-eval`).

## 2. Gejala Runtime
- Login page merender (`HTTP 200`), tetapi:
  - Header CSP aktif: `script-src 'self' 'unsafe-inline' https:` (tanpa `unsafe-eval`).
  - Markup runtime Filament/Livewire terdeteksi di halaman (`livewire`, `filamentSchema`).
- Error browser yang dilaporkan user konsisten dengan CSP violation pada evaluasi script runtime admin.
- Sebelumnya juga muncul error route register pada link auth tambahan saat halaman login dipanggil.

## 3. Akar Masalah
1. Blade link auth memanggil route register yang tidak tersedia.
2. Kebijakan `Content-Security-Policy` global tidak mengizinkan `unsafe-eval`, sementara runtime Filament admin (Livewire + Alpine expression engine) membutuhkannya.

## 4. File yang Diperiksa
- `backend-api/app/Http/Middleware/SecurityHeaders.php`
- `backend-api/bootstrap/app.php`
- `backend-api/app/Providers/Filament/AdminPanelProvider.php`
- `backend-api/app/Filament/Auth/Pages/Login.php`
- `backend-api/resources/views/filament/auth/login-links.blade.php`
- `backend-api/routes/web.php`
- `backend-api/routes/api.php`

## 5. File yang Diubah
- `backend-api/app/Http/Middleware/SecurityHeaders.php`
- `backend-api/resources/views/filament/auth/login-links.blade.php`

## 6. Perbaikan yang Dilakukan
- Menambahkan guard route register pada `login-links.blade.php` sehingga tidak memanggil route yang tidak tersedia.
- Menambahkan policy bercabang berdasarkan path request:
  - Untuk `admintalk` / `admintalk/*`: `script-src` mengizinkan `unsafe-eval`.
  - Untuk route publik/non-admin: CSP tetap tanpa `unsafe-eval`.
- Scope perubahan dibatasi hanya pada area admin untuk menjaga security posture route publik.

## 7. Dampak Security
- Risiko `unsafe-eval` tidak dibuka global, hanya untuk panel admin Filament.
- Header keamanan lain tetap aktif (`X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `HSTS` production, dsb).
- Pendekatan ini menutup blocker runtime login admin dengan blast radius minimal.

## 8. Status Akhir
- **SUCCESS (Production Recovered).**
- Login admin Filament production di `https://admin.thechoosentalks.org/admintalk/login` sudah kembali berfungsi normal.
- Header CSP live untuk area admin sudah mengandung:
  - `script-src 'self' 'unsafe-inline' 'unsafe-eval' https:`
- Dua blocker utama dinyatakan **closed**:
  - Route register blocker
  - CSP runtime blocker

## 9. Langkah Verifikasi
1. Buka `GET https://admin.thechoosentalks.org/admintalk/login`.
2. Verifikasi CSP admin memuat `'unsafe-eval'`.
3. Login dengan kredensial admin valid.
4. Pastikan redirect dan akses panel admin berjalan normal.
5. Re-check console dan network:
   - tidak ada CSP violation fatal terkait `unsafe-eval`.
   - request runtime Filament/Livewire berjalan normal.
