# Scroll Card Layout Parity Report 📜

**Tanggal:** 2026-03-15  
**Context:** Laporan modifikasi re-alignment (P0) terhadap mekanisme _Scroll Transition_ untuk komponen "Sticky Feature Card" yang tadinya melenceng menjadi implementasi eksperimental (blur & spring motion). Ruang lingkup saat ini difokuskan ketat pada _Style_ mekanik pergerakan dan Stacking (Layout Layout), dengan **mengabaikan sepenuhnya** perbedaan kosmetik (_Dark Theme_ vs _Light Theme_).

---

## 1. File yang Diubah
Perubahan dieksekusi tepat pada instrumen _Framer Motion_ di dalam file utama:
- `src/app/page.tsx`

---

## 2. Properti Motion & Layout yang Diubah

Saya telah menanggalkan selubung gaya kompleks dan mengembalikannya ke sifat _Sticky_ murni seperti kerangka `Legacy` (*Clean Stacks*):

*   **Menghapus `useSpring`:** Intervensi gaya pegas fisikal (elastis) dieliminasi serentak. Sekarang transisi murni terhubung lurus ke _natural scroll axis_ _mouse/touch_, menghasilkan presisi gulir 1:1 tanpa efek *bouncing*/pantulan inersia berlebih.
*   **Menghapus Reinterpretasi `blur()` dan `brightness()`:** Menghapus sepenuhnya elemen manipulasi filter CSS (Depth-of-field eksperimental).
*   **Meluruskan Kalkulasi Range Transform (`scale` & `y`):** Dirombak dari lompatan besar menjadi pergeseran santun linear. 
    * Masuk layar dari `y: 80px`.
    * Menyusut datar (`scale: 0.95`, `0.90`) ketika tertimpa, dan hanya naik sedikit secara linear (`y: -15`, `-30`).

---

## 3. Kesetaraan (*Parity*) yang Berhasil Disamakan
*   **Stack Spacing & Overlap Behavior:** Kartu menumpuk konstan dengan gap statis (-15px) di puncak layaknya antrean HTML Native.
*   **Translate/Scale Linear:** Kartu mengecil tanpa modifikasi cahaya atau pendar ketika berada di bawah tumpukan (*Depth Rendering Statis* layaknya baseline original CSS Monolith).
*   **Scroll Timing:** Lini masa _easing_ kembali murni linier menyesuaikan dengan jarak pergeseran kursor mouse langsung. Tidak ada _delay/jittery_ akibat penghitungan pegas.

---

## 4. Perbedaan Konstruksi yang Sengaja Dipertahankan (Sesuai Next.js)
Sesuai arahan pembatasan lingkup, segala pembaruan visual yang direkayasa murni mengikuti sistem desain *Next.js 15 Tailwind*:
*   **Color & Theme Baseline:** Ekosistem tetap mempertahankan kanvas *Dark Theme* (`slate-950`), sementara original monolith berbasis *Light Mode*.
*   **Backdrop Filter & Glow Cards:** Kartu memancarkan _radial-gradient glow_ ketika _hover_ dengan tekstur _Glassmorphism_ transparan, sama sekali bukan kanvas putih datar `bg-white` seperti _legacy_.
*   **Copy/Icons:** Tidak ada teks, ikon `lucide-react`, atau tautan struktural yang diubah dari inisialisasi awal. Tujuannya adalah tidak meredesain antarmuka, hanya mengatur tulang _layout/pergerakan_.

---

## 5. Langkah Verifikasi Manual 🔍

(Uji silang mekanisme pergerakan ini lewat Local Server Port: `http://localhost:9002`)

1. **Native Scroll Feel Test:** Gulir perlahan turun dan naik melintasi zona Modul. Animasi perpindahan tumpukan kartu tidak boleh lagi terassa "kenyal/melompat". Ia harus seret dan berhenti tepat ketika jari Anda berhenti (_Linear Tracking_ sempurna).
2. **Clear Depth Test:** Perhatikan kartu Violet (Channels) saat tertimpa oleh kartu Biru (Bible). Kartu Violet harus terlihat solid mengecil (`scale: 0.95`) tanpa sama sekali ditimpa efek redup atau blur lensa kamera. 
3. **Z-Index Inspection (DevTools):** Jika Anda meng-inspeksi elemennya, setiap `motion.div` akan mengubah atribut `y` dan `scale`, dan nilai `filter` (seperti blur/brightness) dipastikan **hilang**.

---
**Status Audit & Perbaikan Keselarasan (Style Mechanical Parity):** DONE 🟢
