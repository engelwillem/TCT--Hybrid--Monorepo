# VerseHub Desktop Layout Fix Revision

## 1. Ringkasan Masalah Revisi
Iterasi sebelumnya di desktop VerseHub menghapus dark hero card dan menggantinya dengan panel entry lain. Akibatnya komposisi desktop kehilangan anchor visual utama, dan muncul persepsi layout “bergeser” dari intent awal.

## 2. Apa yang Salah pada Iterasi Sebelumnya
1. Dark hero card (elemen utama landing) dihapus.
2. Di area konten atas kiri muncul card branding tambahan, sehingga berkompetisi dengan sidebar kiri dan menimbulkan kesan dua area navigasi.
3. Hierarchy visual menjadi kurang bersih untuk desktop.

## 3. Akar Persepsi Double Sidebar
Persepsi “double sidebar” muncul karena ada dua elemen berciri panel navigasi/branding secara bersamaan:
1. Sidebar kiri utama (yang memang valid).
2. Card branding tambahan di area konten atas kiri.

Kombinasi ini membuat mata user membaca keduanya sebagai dua kolom kontrol.

## 4. Perubahan yang Dikembalikan
1. Dark hero card dikembalikan sebagai section utama landing VerseHub.
2. Urutan hierarchy desktop dipertahankan:
   - Top row (header sticky)
   - Gerbang VerseHub
   - Search
   - Quick entry
   - Dark hero card

## 5. Perubahan yang Dihapus
1. Card branding duplikat di area konten atas kiri dihapus.
2. Area tersebut diganti menjadi heading ringan (tanpa panel/card) agar tetap memberi konteks tanpa menambah “blok navigasi” baru.

## 6. Status Akhir
1. Dark hero card: **sudah kembali**.
2. Card branding duplikat: **sudah dihapus**.
3. Sidebar kiri: **tidak diubah**.
4. Komposisi desktop: lebih bersih dan tidak lagi terasa “double sidebar”.

## 7. Langkah Verifikasi Visual
1. Buka VerseHub desktop (`/versehub/id`) pada lebar >= 1280px.
2. Pastikan sidebar kiri tetap utuh.
3. Pastikan di area konten atas kiri tidak ada panel branding tambahan.
4. Pastikan dark hero card tampil sebagai section utama di bawah quick entry.
5. Pastikan urutan visual top-to-bottom: top row -> gerbang -> search -> quick entry -> dark hero.
