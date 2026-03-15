# Scroll Card Layout Parity Report 📜

**Tanggal:** 2026-03-15  
**Context:** Laporan modifikasi re-alignment terhadap mekanisme _Scroll Transition_ untuk komponen "Sticky Feature Card" yang sebelumnya menggunakan implementasi eksperimental (blur & spring motion) yang menyimpang dari mekanika legacy.

---

## 1. File yang Diubah
Perubahan dieksekusi tepat pada instrumen _Framer Motion_ di dalam file utama:
- `src/app/page.tsx`

---

## 2. Properti Motion & Layout yang Diubah

Mekanisme transisi dikembalikan ke sifat _Sticky_ murni seperti kerangka `Legacy` dengan nilai yang terukur:

*   **Menghapus `useSpring`**: Menghilangkan interpolasi pegas fisikal berlebihan. Sekarang transisi murni terhubung lurus ke _natural scroll axis_, menghasilkan presisi gulir 1:1 tanpa efek pantulan inersia.
*   **Menghapus Filter Blur & Brightness**: Menanggalkan efek kedalaman fotografi (*Depth-of-field*) yang tidak ada pada baseline original.
*   **Linear Transform Range**: 
    *   `translateY`: Kartu masuk dengan offset `80px` dan bergeser naik secara linear sebesar `-15px` per lapis tumpukan.
    *   `scale`: Kartu menyusut datar dengan kelipatan `0.05` (1.0 -> 0.95 -> 0.90) saat berada di bawah tumpukan.
*   **Stack Spacing**: Menggunakan `transformOrigin: 'top center'` untuk memastikan bibir atas kartu tetap sejajar saat menumpuk.

---

## 3. Kesetaraan (*Parity*) yang Berhasil Disamakan
*   **Stack Spacing & Overlap Behavior**: Kartu menumpuk dengan gap statis di puncak layaknya antrean elemen pada legacy.
*   **Translate/Scale Linear**: Kartu menyusut secara proporsional tanpa perubahan pencahayaan atau fokus.
*   **Scroll Timing**: Durasi kemunculan kartu kini selaras dengan jarak pergeseran fisik scrollbar.

---

## 4. Perbedaan yang Dipertahankan (Next.js Theme)
Sesuai arahan, elemen visual berikut tetap mengikuti desain Next.js saat ini:
*   **Color & Theme**: Tetap menggunakan skema *Dark Theme* (`slate-950`) dan kartu *Glassmorphism*.
*   **Glow Effects**: Pendar radial pada kartu saat *hover* tetap dipertahankan sebagai identitas visual baru.
*   **Layout Card Content**: Struktur internal kartu (ikon, judul, deskripsi) tidak diubah.

---

## 5. Langkah Verifikasi Manual 🔍

1.  **Linearity Test**: Gulir perlahan di zona modules. Pastikan kartu bergerak sinkron dengan jari/mouse tanpa ada "lompatan" atau "pantulan" (No Spring).
2.  **Clear Stack Test**: Berhenti di tengah transisi. Pastikan kartu yang tertutup tetap tajam (No Blur) dan hanya bergeser naik sedikit ke atas tumpukan.
3.  **Z-Index Check**: Pastikan kartu yang baru datang selalu muncul di depan kartu sebelumnya tanpa *flicker*.

---
**Status Audit & Perbaikan Layout:** READY (Mechanical Parity Achieved) 🟢
