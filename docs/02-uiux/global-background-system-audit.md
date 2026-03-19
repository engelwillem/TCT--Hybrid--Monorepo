# Global Background System Audit

## 1. Ringkasan Masalah
Beberapa halaman user-facing masih memakai latar putih polos sehingga terasa datar, kering, dan tidak konsisten dengan nuansa premium lembut yang sudah terlihat pada referensi visual login admin.

## 2. Surface yang Terdampak
- Today
- Community
- Paths
- VerseHub
- Profile
- Halaman user-facing lain yang dirender melalui `AppShell`

## 3. Arah Visual yang Dipilih
- Base biru sangat muda (`#eaf1f9`).
- Gradient vertikal lembut dengan radial glow tipis.
- Tekstur micro-dot halus agar tidak flat, tetapi tetap ringan.
- Tidak memakai kontras gelap/keras agar tetap tenang dan bersih.

## 4. Sistem Background Global yang Diterapkan
Pendekatan global dipasang pada wrapper `AppShell` agar semua halaman user-facing otomatis konsisten tanpa ubah konten per halaman.

Detail teknis:
- Menambahkan kelas global `tct-global-background` pada root shell.
- Menambahkan layer gradient + radial highlight pada background utama.
- Menambahkan pseudo-layer `::before` untuk dot texture tipis.
- Menjaga child content tetap di atas layer background (`z-index`) agar card/surface tetap terbaca jelas.

## 5. File yang Diubah
- `src/layouts/AppShell.tsx`
- `src/app/globals.css`

## 6. Dampak ke Readability
- Kartu putih/off-white tetap terbaca karena background dijaga terang dan low-contrast.
- Tidak ada overlay gelap, sehingga teks utama tetap memiliki kontras yang aman.
- Struktur visual terasa lebih hidup tanpa mengganggu hierarchy konten.

## 7. Status Akhir
`DONE` - Sistem background global baru sudah aktif di seluruh halaman user-facing yang melewati `AppShell`, dengan gaya lembut, premium, dan konsisten.

## 8. Langkah QA Berikutnya
- Validasi visual desktop + mobile pada: `/today`, `/community`, `/paths`, `/versehub`, `/profile`.
- Cek card readability pada state normal, loading, dan empty-state.
- Cek tidak ada clipping/artefak pada perangkat low DPI.
- Cek performa scroll tetap ringan (tidak ada jank signifikan).
