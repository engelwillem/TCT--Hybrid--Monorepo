# Backend Admin Login Recovery Audit

## 1. Ringkasan Masalah
Login admin Filament di `https://admin.thechoosentalks.org/admintalk/login` sempat render, tetapi runtime form tidak berjalan normal karena CSP backend terlalu ketat untuk stack Filament/Livewire/Alpine pada area admin.

## 2. Gejala Runtime
- Login page merender (`HTTP 200`), tetapi:
  - Header CSP aktif: `script-src 'self' 'unsafe-inline' https:` (tanpa `unsafe-eval`).
  - Markup runtime Filament/Livewire terdeteksi di halaman (`livewire`, `filamentSchema`).
- Error browser yang dilaporkan user konsisten dengan CSP violation pada evaluasi script runtime admin.
- Simulasi POST biasa ke `/admintalk/login` menghasilkan `405` (expected untuk flow Filament modern yang bergantung pada runtime JS/Livewire), sehingga jika runtime JS diblokir CSP, form tidak bisa diproses normal.

## 3. Akar Masalah
Kebijakan `Content-Security-Policy` di middleware global tidak mengizinkan `unsafe-eval` sama sekali, sementara runtime Filament admin (Livewire + Alpine expression engine) memerlukan evaluasi script pada sisi client.

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

## 6. Perbaikan yang Dilakukan
- Menambahkan policy bercabang berdasarkan path request:
  - Untuk `admintalk` / `admintalk/*`: `script-src` mengizinkan `unsafe-eval`.
  - Untuk route publik/non-admin: CSP tetap tanpa `unsafe-eval`.
- Scope perubahan dibatasi hanya pada area admin untuk menjaga security posture route publik.

## 7. Dampak Security
- Risiko `unsafe-eval` tidak dibuka global, hanya untuk panel admin Filament.
- Header keamanan lain tetap aktif (`X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `HSTS` production, dsb).
- Pendekatan ini menutup blocker runtime login admin dengan blast radius minimal.

## 8. Status Akhir
- **Code fix selesai** di source backend.
- **Blocker utama (CSP runtime admin)** telah ditangani secara scoped.
- Butuh deploy backend cPanel agar header production berubah dan login dapat diverifikasi ulang penuh di live.

## 9. Langkah Verifikasi
1. Deploy perubahan backend ke cPanel (branch `main`).
2. Cek header login:
   - `GET https://admin.thechoosentalks.org/admintalk/login`
   - pastikan CSP untuk route admin mengandung `'unsafe-eval'`.
3. Buka login page, pastikan tidak ada error CSP/Alpine/Filament yang memblokir runtime utama.
4. Login dengan kredensial admin valid, pastikan redirect sukses ke panel.
5. Re-check console dan network:
   - tidak ada CSP violation fatal terkait `unsafe-eval`.
   - request runtime Filament/Livewire berjalan normal.
