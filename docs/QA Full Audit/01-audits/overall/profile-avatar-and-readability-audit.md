# Profile Avatar And Readability Audit

## 1. Ringkasan Masalah
Halaman `/profile` memiliki dua bug aktif yang terlihat di live:
- teks judul/section card terlihat pudar seperti state nonaktif.
- avatar profil tetap fallback huruf walau backend sudah memiliki URL gambar.

## 2. Gejala Nyata di Live
- Header accordion (mis. "Gateway Operasional", "Your Spiritual Journey", "Informasi Personal") tampak low-contrast dan sulit dibaca.
- Request avatar di console mengarah ke URL yang salah domain (`/storage/avatars/...` terbaca sebagai domain frontend) sehingga `404`.
- Avatar di kartu profil jatuh ke fallback inisial karena URL gagal dimuat.

## 3. Akar Masalah Avatar
1. Resolver avatar lama melakukan preflight `HEAD` dari browser ke URL avatar.
2. Untuk URL relatif (`/storage/...`), resolver lama mengembalikan URL relatif apa adanya.
3. URL relatif tersebut lalu dieksekusi dari origin frontend (`www.thechoosentalks.org`), bukan origin API/storage, sehingga `404`.
4. Setelah request gagal, UI menjalankan `onError` dan selalu fallback ke huruf.

## 4. Akar Masalah Readability / Contrast
1. Komponen card profil memakai gaya dark-glass lama:
   - `bg-white/[0.02]`
   - `text-white`
   - ring putih tipis
2. Setelah sistem background global bergeser ke tone terang, kombinasi itu menghasilkan kontras rendah pada text header card.
3. Beberapa label form juga terlalu tipis (`text-brand/50`) sehingga makin terlihat ghost.

## 5. File yang Diperiksa
- `src/app/profile/page.tsx`
- `src/components/core/DarkCard.tsx`
- `src/components/core/AccordionCard.tsx`
- `src/layouts/MobileAppLayout.tsx`
- `src/app/api/profile/route.ts`
- `src/lib/proxy-laravel.ts`
- `src/lib/laravel-api.ts`

## 6. File yang Diubah
- `src/app/profile/page.tsx`
- `src/components/core/DarkCard.tsx`
- `src/components/core/AccordionCard.tsx`

## 7. Perbaikan yang Dilakukan
### Avatar fix
- Menghapus validasi `HEAD` untuk avatar URL (penyebab false-negative + gagal lintas origin).
- Menambahkan normalisasi URL avatar:
  - URL absolut dipakai langsung.
  - URL relatif (`/storage/...`) dipaksa ke origin API (`NEXT_PUBLIC_LARAVEL_API_BASE_URL` / `NEXT_PUBLIC_API_BASE_URL`, fallback `https://api.thechoosentalks.org`).
  - Data URI tetap didukung.
- Menambahkan fallback awal dari `authUser.photoURL` agar avatar tetap muncul ketika token API belum tersedia.

### Readability fix
- Mengubah style `DarkCard` dari dark-glass ke surface terang:
  - dari `text-white` + `bg-white/[0.02]` ke `text-foreground` + `bg-surface`.
- Mengubah style `AccordionCard` ke token surface terang dengan teks foreground yang jelas.
- Menaikkan kontras label form dari `text-brand/50` ke `text-foreground/70`.
- Menyesuaikan panel gateway internal agar tidak lagi memakai latar hampir transparan.

## 8. Verifikasi Teknis
- `npm run typecheck` ✅ lulus.
- `npm run build` ⚠️ gagal karena environment permission error (`spawn EPERM`), bukan error type/syntax dari patch profil.

## 9. Verifikasi Visual yang Diharapkan
- Judul accordion dan label form pada `/profile` tampil kontras normal, tidak ghost.
- Jika backend mengirim `avatar_url` valid (termasuk path relatif `/storage/...`), avatar akan tampil sebagai foto.
- Fallback huruf hanya muncul saat URL benar-benar tidak valid atau image gagal load.

## 10. Status Akhir
`PATCHED IN SOURCE (needs production validation)`  
Patch source sudah meng-address dua akar bug utama (kontras + avatar URL resolution). Langkah berikutnya wajib cek live browser untuk memastikan data/avatar production memang tersedia dan URL storage benar-benar bisa diakses publik.

## 11. Langkah Verifikasi Live
1. Buka `/profile` pada akun yang memiliki avatar.
2. Pastikan judul card/section terbaca jelas tanpa low-contrast.
3. Inspect Network:
   - pastikan request avatar menuju origin API/storage yang benar (bukan origin frontend jika path relatif).
   - pastikan status image `200`.
4. Jika avatar tetap fallback:
   - cek payload `/api/profile` apakah `avatar_url` kosong/null.
   - jika kosong/null, blocker ada di data upstream backend (bukan renderer frontend).
