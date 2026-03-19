# Global Background Design Direction

## 1. Ringkasan Masalah
Halaman modul utama saat ini (Today, Community, Paths, VerseHub, Profile) masih didominasi oleh warna latar belakang putih polos (`bg-background` yang merujuk pada `hsl(210 20% 98%)`). Meskipun bersih, hal ini memberikan kesan visual yang kurang kedalaman (*flat*) dan kurang memancarkan aura *premium* yang diinginkan pengguna. Di sisi lain, halaman login admin menunjukkan arah visual yang lebih disukai: nuansa biru muda yang menenangkan, gradasi halus, dan tekstur yang memberikan dimensi.

## 2. Arah Visual yang Diinginkan
- **Atmosphere:** Tenang, sacred, modern, dan bernapas (*airy*).
- **Core Inspiration:** Admin Login Surface (Soft Blue Base + Subtle Gradients).
- **Goal:** Transformasi dari "Website Informatif" menjadi "Spiritual Space" yang imersif.

## 3. Sistem Background yang Disarankan
Codex disarankan untuk mengimplementasikan utilitas `.tct-global-background` (yang sudah terdefinisi di `globals.css`) secara lebih konsisten atau merujuk pada token berikut:

### A. Base Palette & Gradients
- **Primary Base:** `#eaf1f9` (Biru pucat kristal).
- **Gradient 1 (Top Left Accent):** `radial-gradient(120% 95% at 8% 4%, rgb(243 248 255 / 0.92) 0%, transparent 68%)`. Memberikan kesan cahaya yang masuk dari sudut.
- **Gradient 2 (Bottom Fill):** `linear-gradient(180deg, #edf4fb 0%, #e7eff8 42%, #e5edf7 100%)`. Memberikan kedalaman vertikal.

### B. Texture & Pattern (Light & Subtle)
- **Subtle Points/Stars:** Penambahan elemen `::before` pada body/wrapper utama menggunakan `radial-gradient` kecil berukuran 1.6px - 2px dengan opasitas rendah (15-20%). Ini meniru tekstur kertas premium atau efek "partikel cahaya" yang halus.
- **Grain:** Gunakan utilitas `.bg-grain` dengan opasitas sangat rendah (`0.02 - 0.03`) untuk menghilangkan kesan digital yang terlalu tajam.

## 4. Guardrails Readability
Agar latar belakang baru tidak merusak fungsionalitas, implementasi harus mengikuti batas-batas berikut:
- **Card Contrast:** Seluruh kartu konten (Cards) HARUS tetap menggunakan background solid (`bg-surface` atau `bg-card`) dengan *box-shadow* yang cukup (`shadow-soft` atau `shadow-card`). Jangan gunakan transparansi berlebih pada kartu yang berisi teks panjang.
- **Text Safety:** Warna teks utama tetap `foreground` (Hitam/Navy Gelap). Jangan menggunakan teks putih di atas background biru muda ini.
- **Floating Effect:** Latar belakang biru muda akan bekerja maksimal jika kartu-kartu di atasnya terlihat "mengambang" (*floating*). Gunakan `ring-1 ring-black/[0.03]` pada kartu untuk mendefinisikan batas tepi secara halus.

## 5. Surface yang Harus Konsisten
Sistem background ini harus diterapkan pada pembungkus utama (*Main Layout/App Layout*) sehingga konsisten saat user berpindah antar modul:
1. **Today Page:** Latar belakang dasar untuk *Daily Verse*.
2. **Community Feed:** Ruang di sela-sela postingan member.
3. **Paths Exploration:** Memberikan kesan eksplorasi di ruang terbuka.
4. **VerseHub Reader:** Memberikan ketenangan saat membaca (khusus untuk mode *Light*).
5. **Profile Page:** Menghilangkan kesan "Ghostly" dengan memberikan kontras warna dasar pada background.

## 6. Risiko Jika Salah Implementasi
- **Vibration:** Jika biru yang dipilih terlalu jenuh (*saturated*), mata pengguna akan cepat lelah.
- **Flatness:** Jika hanya menggunakan satu warna solid tanpa gradasi/tekstur, tujuan "premium feel" tidak akan tercapai.
- **Busy UI:** Terlalu banyak pola bintang/titik akan mendistraksi fokus pengguna dari firman Tuhan.

## 7. Final Design Direction
Implementasikan `.tct-global-background` pada level `body` atau pembungkus utama aplikasi. Gunakan isolasi z-index agar elemen tekstur berada di belakang konten. Pastikan transisi antar halaman tetap halus dengan bantuan `framer-motion` untuk menjaga kontinuitas warna latar belakang.

---
**Status Audit:** ✅ **DESIGN DIRECTION APPROVED**
*Pedoman ini siap digunakan oleh Codex untuk memoles estetika global web user-facing.*
