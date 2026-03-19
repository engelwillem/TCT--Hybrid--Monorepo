# Production Surface Audit - 2026-03-19

## Scope
- Sumber audit: screenshot runtime production yang dikirim user.
- Area: `Today`, `VerseHub`, `Community`, `Profile`, `Login/Auth`.
- Tujuan: identifikasi akar masalah nyata (bukan pass asumsi), lalu eksekusi perbaikan prioritas.

## Evidence-Based Findings (Severity Ordered)

### P0 - VerseHub entry 404 dari navigasi aktif
- Gejala: klik `VerseHub` dari sidebar membuka `/versehub` dan muncul 404.
- Bukti kode:
  - `src/lib/navigation.ts` masih mengarah ke `/versehub`.
  - `src/layouts/DesktopSidebar.tsx` route fallback `versehub: '/versehub'`.
  - Route utama app adalah `/versehub/[lang]`.
- Root cause: IA aktif menggunakan root route yang belum punya handler eksplisit.
- Dampak: alur utama user putus dari nav global.
- Status fix: **DONE (Batch 2026-03-19)**.

### P0 - OG image Community rusak / kosong
- Gejala: kartu ayat Community menampilkan alt text OG, gambar tidak termuat.
- Bukti kode:
  - Komponen memakai `src="/versehub/id/<ref>/og.png"` langsung.
  - Endpoint proxy OG standar tersedia di `/api/versehub/og/[slug]`.
- Root cause: sumber gambar tidak lewat endpoint OG proxy aktif + tanpa fallback render.
- Dampak: share card dan visual hero tampak broken.
- Status fix: **DONE (Batch 2026-03-19)**.

### P0 - Login gagal parse JSON (`Unexpected token '<'`)
- Gejala: login menampilkan error koneksi; console menunjukkan payload HTML (`<!DOCTYPE ...`) saat `res.json()`.
- Bukti kode:
  - `src/app/login/page.tsx` langsung `await res.json()` tanpa guard content-type.
  - Proxy meneruskan body upstream apa adanya.
- Root cause: frontend mengasumsikan semua error backend berbentuk JSON.
- Dampak: user melihat false error "tidak terhubung" padahal failure bisa berasal dari backend HTML/error page.
- Status fix: **DONE (Batch 2026-03-19)**.

### P0 - Drift auth flow (session vs bearer token) memicu profile tetap Guest
- Gejala: setelah login, profile tetap `Guest User` / guest session.
- Bukti kode:
  - Profile membaca data lewat bearer token (`tct_app_access_token`).
  - Login API sebelumnya mengembalikan session-based redirect, bukan token.
- Root cause: kontrak login belum selaras dengan arsitektur API bearer saat ini.
- Dampak: kredensial valid pun tidak menghidupkan state authenticated di surface app.
- Status fix: **DONE (Batch 2026-03-19)**.

### P1 - Client-side exception pada detail VerseHub
- Gejala: `/versehub/id/<slug>` menampilkan "Application error: client-side exception".
- Bukti kode:
  - Page dynamic VerseHub menggunakan pola `use(params)` dengan tipe `Promise`.
- Root cause: implementasi params dinamis rentan mismatch runtime.
- Dampak: halaman detail ayat/chapter crash intermiten.
- Status fix: **DONE (Batch 2026-03-19)**.

## Executed Fixes (Real Changes)
- [x] Ubah nav VerseHub ke canonical aktif (`/versehub/id`).
- [x] Tambah route root `/versehub` -> redirect ke `/versehub/id`.
- [x] Ganti OG source Community ke endpoint proxy `/api/versehub/og/<slug>.png`.
- [x] Tambah fallback image jika OG gagal termuat.
- [x] Harden parser login: cek content-type sebelum parse JSON.
- [x] Simpan bearer token ke local storage setelah login sukses.
- [x] Ubah logout profile agar revoke token ke backend sebelum clear local token.
- [x] Refactor login backend menjadi token-based response (`data.token`) agar selaras dengan frontend API auth.
- [x] Stabilkan params handling pada page VerseHub dynamic.

## Verification (Local)
- [x] `php -l backend-api/app/Http/Controllers/Api/V1/AuthController.php`
- [x] `npm run -s typecheck`

## Remaining Validation Needed (Production Server)
- [ ] Verifikasi akun admin target benar-benar ada di database production (`users`) dan hash password sinkron.
- [ ] Deploy backend + frontend terbaru ke environment production.
- [ ] Re-test screenshot paths: `/login`, `/profile`, `/versehub`, `/versehub/id/<slug>`, `/community`.
