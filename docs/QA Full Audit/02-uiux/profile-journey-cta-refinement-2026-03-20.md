# Profile -> Journey CTA Refinement Report - 2026-03-20

## 1. UX Diagnosis & Friction Points

### A. Current UX Problem
- **Dead-end Navigation:** Klik pada accordion "Your Spiritual Journey" memicu navigasi ke `profile?section=journey`, namun halaman Profile tidak menangani state tersebut, sehingga user merasa klik tidak berfungsi.
- **Ambiguous Destination:** Copy "Growth Monitoring" kurang memberikan arah yang jelas ke mana user akan pergi dan apa yang akan mereka dapatkan.
- **Inconsistent Indicator:** Angka badge (notifikasi) hanya berupa teks tanpa konteks visual yang mendukung narasi "pencapaian/growth".

### B. User Confusion Points
- User bingung mengapa halaman hanya refresh saat menekan tombol "Growth Monitoring".
- User tidak tahu bahwa ada halaman dashboard journey yang lebih lengkap di VerseHub.

## 2. Changes Made (Patch Summary)

### A. src/app/profile/page.tsx
- **Corrected Destination:** Mengganti `router.push('/profile?section=journey')` menjadi deep-link langsung ke `/versehub/id/my-spiritual-journey`.
- **Emotional Copywriting:** Memperbarui deskripsi sub-header menjadi "Lihat seluruh jejak, hafalan, & catatan batin Anda" untuk resonansi emosional.
- **Visual Badge Polish:** Menambahkan ikon `Sparkles` pada badge jumlah aktivitas untuk memperkuat nuansa "milestone".
- **Bridge Guidance:** Menambahkan teks pendukung (helper text) di bawah CTA utama untuk menjelaskan manfaat halaman tujuan.

## 3. Before & After UX Flow

| Event | Before | After |
| :--- | :--- | :--- |
| **CTA Destination** | `/profile?section=journey` (N/A) | `/versehub/id/my-spiritual-journey` |
| **User Action** | Click -> No UI change | Click -> Navigate to Premium Journey Dashboard |
| **Visual Feedback** | Raw number badge in red | Sparkles icon + Subtle pill background |
| **Copy Tone** | Functional/Minimal | Warm/Goal-oriented |

## 4. Remaining Technical Dependency

- **Language Mapping:** Saat ini link diarahkan ke `/id/` secara default. Dibutuhkan deteksi bahasa preferensi jika TCT mendukung multibahasa di masa depan.
- **Section Persistence:** Jika di kemudian hari "Journey" ingin ditampilkan in-page pada Profile, dibutuhkan refactoring komponen agar `?section=journey` merender partial view. Untuk saat ini, deep-link adalah solusi UX terbaik sesuai realitas page yang ada.

## 5. Final UX Status

| Surface / Flow | Status | Catatan |
| :--- | :---: | :--- |
| **Profile -> Journey Wiring** | **FIXED** | Alur navigasi sudah tersambung dan fungsional. |
| **Information Harmony** | **LIVE** | Copy dan visual sudah selaras dengan brand tone TCT. |
| **Section Deep-link** | **LIVE** | Landing page tujuan sudah premium dan intentional. |

**Status Akhir: PASS**
