# Scroll Card Parity Implementation Report 🛠️

**Date:** 2026-03-15  
**Context:** Eksekusi perbaikan transisi komponen "Sticky Card Interactive" (*Scroll Motion Parity*) antara implementasi baru di Next.js dengan *baseline behavior* yang mulus di Legacy monolith. Tujuan utama adalah mengembalikan _fluiditas_ Native Spring dan efek pergeseran (Depth) antar tumpukan kartu.

---

## 1. File yang Diubah
Perubahan dieksekusi murni pada level komponen Next.js tanpa menyentuk desain struktur CSS eksternal:
- `src/app/page.tsx`

---

## 2. Nilai & Logika Motion (Sebelum vs Sesudah)

**Sebelumnya (Kaku & Statis):**
- Menggunakan `useTransform` biasa pada `scrollYProgress` mentah.
- Array statis (_hardcoded_) sebagai pemicu perpindahan: `[0.00, 0.05, 0.20, 0.35]`. Ini mengakibatkan overlap kaku antar kartu karena tidak responsif terhadap besaran viewport.
- Hanya memodifikasi nilai `scale` dari `0.96` ke `1` ke `0.98`, dan memotong `opacity`.

**Sesudah (Elastis, Flokulatif, & Relatif):**
- Menerapkan **`useSpring`** (`stiffness: 400, damping: 40, mass: 1`) untuk mengalasi `scrollYProgress` dengan peredam kelembaman/inersia fisikal alami.
- Menggunakan sistem **Dynamic Range Index Math**, di mana transisi diukur dari `cardProgress (0 hingga 3)` dikurangi dengan Index Kartu (Jarak Relatif). 
- Menambahkan **5 Layer Milestone Animasi**: Memasuki Ruang, Aktif (Baris Depan), Tergeser 1 Baris, 2 Baris, dan seterusnya.
- Diimplementasikan juga `transformOrigin: 'top center'` agar ketika kartu didorong mundur, fisiknya seolah-olah ditumpuk rapat ke bibir atas kartu depan.

---

## 3. Gap yang Berhasil Ditutup (Achieved Parity) ✅
1. **Timing & Easing:** Animasi sekarang memampatkan inersia guliran mouse (wheel inertia). Tidak terasa kaku lagi melainkan membal (*bouncing friction* 40).
2. **Blur & Brightness Stacking:** Menggunakan `useMotionTemplate` untuk menyuntikkan `filter: blur() brightness()`. Kartu yang tergeser ke lapis kedua langsung meredup ke 80% opacity, mengecil 0.95, dan memburam 4px, persis replikasi kedalaman fotografi di legacy/iOS stack.
3. **Offset/Y Transform:** Perpindahan masuk masuk dari bawah (`y: 40`), diam secara proporsional, dan naik menindih beriringan (`y: -20, -40, -60`).

---

## 4. Known Limitations ⚠️
- Penerapan kalkulasi progresif 5 mileston ini, dikombinasikan dengan iterasi `backdrop-filter: blur`, mungkin menimbulkan *dropped frame* di *device Android low-end* saat rendering GPU-nya berupaya keras menggambar tumpukan filter Alpha secara simultan. Meski begitu, nilai *hardware acceleration* `willChange` telah ditanam untuk melonggarkan leher botol ini (namun tetap perlu diobservasi khusus di *mobile* lawas).

---

## 5. Langkah Verifikasi Manual 🔍

Silakan uji perilaku ini di perangkat Desktop (Safari/Chrome):
1. **Uji Geser Cepat:** Lakukan scrolling brutal ke bawah dan ke atas. Anda harus melihat tumpukan kartu menyerap pegas interaksi tersebut dan menekan balik layaknya setumpuk file fisik *(Smoothness check)*.
2. **Uji Frame Pembatas:** Gulir ke tengah transisi antara kartu 1 dan 2. Kartu 1 (berwarna Violet) yang berada diremukkan di lapis belakang harusnya tampak lebih redup dan samar (blur/brightness check), sementara kartu 2 di depan mempertahankan kecerahannya.
3. **Uji Navigasi Menu Kiri:** Pastikan titik pemandu garis di sebelah kiri teks `Ecosystem Modules` aktif selaras saat masing-masing kartu berada pada puncaknya.
