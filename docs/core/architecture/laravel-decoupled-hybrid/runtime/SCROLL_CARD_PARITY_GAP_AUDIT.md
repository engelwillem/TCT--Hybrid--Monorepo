# Scroll Card Parity Gap Audit 📊

**Date:** 2026-03-15  
**Context:** Audit visual dan teknikal terhadap animasi transisi scroll ("Sticky Card Interactive") di halaman utama (Landing Page) Next.js port 9002 dibandingkan dengan baseline *Legacy* monolith Vue/CSS.

---

## 1. Lokasi Komponen / Card yang Aktif di Next.js
Komponen kartu (Feature Cards) berada di halaman utama **Home / Landing Page** (`/`). Secara spesifik dideklarasikan dalam komponen:
- `FeatureCard` (UI Card pembungkus konten interaktif).
- `StickyStackScene` (Engine penggerak posisi dan opasitas berbasis scroll).

## 2. File Pengontrol Efek Scroll
File yang bertanggung jawab mengorkestrasi efek scroll ini secara utuh berada pada satu lokasi:
- `src/app/page.tsx`

## 3. Teknologi yang Digunakan
Implementasi saat ini di Next.js murni bertumpu pada gabungan teknologi berikut:
- **`framer-motion`**: **YA** (Menggunakan `useScroll`, `useTransform`, dan `useMotionValueEvent` secara ekstensif).
- **CSS `sticky`**: **YA** (Menggunakan class `sticky top-0 h-[100dvh]` sebagai pembungkus container/stage utama agar tertahan di layar).
- **Intersection Observer**: **TIDAK** (Digantikan secara tidak langsung oleh abstraksi scroll binding Framer Motion `offset: ["start start", "end end"]`).
- **`requestAnimationFrame`**: **TIDAK** (Dikelola murni oleh engine Framer Motion di _under-the-hood_).
- **Manual Scroll Listener**: **TIDAK** (Semua reaktivitas dikoordinasikan secara deklaratif melalui `useScroll`).

---

## 4. Analisis Gap Terhadap Baseline Legacy

Dibandingkan dengan perilaku transisi mulus dan dinamis dari *legacy baseline* (yang terasa ringan dan fluid), implementasi Next.js ini masih memiliki beberapa _gap_ kesenjangan (Parity Gap):

1. **Timing & Offset:** 
   - *Legacy:* Offset scroll transisi masuk/keluar diukur berdasarkan overlapping alami antar kartu dan tinggi viewport, memberikan jeda baca yang proporsional.
   - *Next.js:* Di-*hardcode* menggunakan logika Matrix/Array 2D statis (`[0.00, 0.05, 0.20, 0.35]`, dst) tanpa mempedulikan tinggi layar *user* (mobile vs ultrawide). Hasilnya, durasi kartu tampil sering terasa terburu-buru (overlap di tengah) ketika di-scroll.
2. **Scale:**
   - *Next.js:* Kartu pertama muncul dari dimensi `0.96` merayap ke `1` dan memudar kembali di `0.98`. Transisinya terasa cukup statis dibandingkan _elastic bump_ (pegas) pada Legacy.
3. **Opacity:**
   - *Next.js:* Memudar dari `0` ke `1` secara linear absolut.
4. **Blur:**
   - *Legacy:* Kartu yang berada di lapisan belakang biasanya mendapatkan efek `filter: blur(...)` sebagai simulasi _Depth-of-field_ fotografi.
   - *Next.js:* **Hilang totally**. Kartu di belakang hanya diredupkan skalanya (0.98), tanpa adanya distorsi `backdrop-filter` atau *blur* saat bertumpuk.
5. **Stacking Depth (Z-Index):**
   - *Next.js:* Z-Index di-set menumpuk secara berurutan (`10 + index`), yang artinya kartu indeks ke-3 langsung menimpali nomor 2. Ini tidak selalu buruk, tetapi efek *tumpukan kartu tergeser ke atas* terlihat kaku jika kartunya tidak pergi/menghilang penuh dari layar (`y: -20` saat exit).
6. **Sticky Behavior & Smoothness:**
   - *Next.js:* Implementasi terasa "berat/kasar" (jittery) pada *mouse wheel* karena tidak adanya pelembut atau inersia tambahan (seperti `useSpring` Framer Motion).

---

## 5. Daftar File yang Harus Disentuh
- `src/app/page.tsx` (Perlu dibongkar blok `StickyStackScene`-nya).

## 6. Akar Masalah Utama
Ketergantungan terhadap *Hardcoded Mapping Range* di dalam `useTransform` (`ranges = [[0.00, 0.05, 0.20, 0.35], ...]`). Angka saklek ini gagal beradaptasi terhadap perubahan tinggi scroll (`280vh` di container utama). Hal ini memaksa setiap *Frame* dari kartu untuk "dipaksa" sinkron dengan persentase semu tanpa memperhitungkan transisi interpolasi progres fisik elemen (tumpang tindih di layar).

## 7. Rekomendasi Implementasi Minimal (Smallest Parity Patch)
Untuk mencapai visual setara dengan arsitektur asal **TANPA** redesain atau instalasi komponen animasi baru, rekomendasinya adalah:
1. **Tambahkan `useSpring`:** Bungkus nilai yang di-_return_ oleh `useTransform(scrollYProgress, ...)` ke dalam `useSpring(..., { stiffness: 400, damping: 40 })` untuk menginjeksi inersia natif dan menghilangkan *jittering*.
2. **Dynamic Range Calculation:** Daripada menggunakan hardcoded multi-array, manfaatkan indeks kartu (`i`) dipadukan dengan perhitungan total item matematis yang lentur untuk menghasilkan *scroll range bounds*.
3. **Blur & Brightness Stacking:** Tambahkan interpolasi ke tiga pada `useTransform` untuk mengatur nilai *blur/brightness* filter (`style={{ filter: `blur(${blurVal}px) brightness(${brightVal})` }}`). Ini akan mereplika sensasi efek 3D _Stacking Depth_.
