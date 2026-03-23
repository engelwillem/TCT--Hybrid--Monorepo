# VerseHub UX Direction & Strategy

## 1. Ringkasan Surface
**VerseHub** adalah pusat interaksi Firman di TCT Hybrid. Surface utamanya berada di `src/features/versehub/pages/VersehubReaderPage.tsx`. Modul ini bukan sekadar alat baca Alkitab statis, melainkan sebuah "Ekosistem Firman" yang mencakup:
- **Reader:** Pengalaman membaca yang tenang.
- **Mentor:** Interaksi AI untuk pendalaman ayat.
- **Actions:** Favorit, Bookmark, Highlight, dan Catatan.
- **Social Bridge:** Berbagi refleksi langsung ke modul Community.

## 2. Masalah Persepsi User
Berdasarkan audit teknis pada source code, ditemukan potensi hambatan psikologis bagi pengguna:
- **"Just Another Bible App":** Interface awal (landing) berisiko terlihat seperti mesin pencari Alkitab generik jika aspirasinya tidak kuat.
- **Cognitive Load:** Terlalu banyak fitur (Mentor, Highlight, Share, Note) yang mungkin membingungkan pengguna baru jika tidak diperkenalkan secara bertahap.
- **Disconnected Experience:** User mungkin merasa VerseHub adalah fitur terpisah, bukan bagian dari rutinitas harian yang terintegrasi dengan modul *Today*.
- **Search Anxiety:** Kotak pencarian kosong seringkali membuat user bingung harus mulai dari mana jika tidak ada inspirasi awal.

## 3. UX Direction
Membangun VerseHub sebagai "Ruang Teduh Digital" yang cerdas.
- **Tone:** Sakral, Modern, Reflektif, dan Memberdayakan.
- **Experience Flow:** Sambutan Hangat -> Inspirasi Instan (Discover) -> Interaksi Mendalam (Mentor/Reflect) -> Jejak Pertumbuhan (Actions).
- **Design Intent:** Mengutamakan tipografi yang nyaman (Serif untuk ayat), *whitespace* yang luas, dan animasi transisi yang lembut.

## 4. Recommended Messaging Hierarchy
1. **The Invitation (Hero):** Mengajak user untuk masuk ke dalam Firman dengan sapaan pribadi.
2. **The Guidance (Discover):** Memberikan titik mulai bagi user yang bingung (misal: "Ayat untuk Kecemasan", "Janji Tuhan Hari Ini").
3. **The Deep Dive (Interaction):** Menonjolkan peran Mentor sebagai pembeda utama VerseHub.
4. **The Personal Trace (Journey):** Mengingatkan user bahwa setiap interaksi adalah bagian dari "Perjalanan Spiritual" mereka.

## 5. Microcopy Options

### A. Headline Utama (Landing)
- **Opsi 1 (Premium):** "Ruang Teduh untuk Jiwa Anda."
- **Opsi 2 (Spiritual):** "Mendengar Suara Firman di Tengah Kebisingan."
- **Opsi 3 (Actional):** "Satu Ayat, Satu Langkah Transformasi."

### B. Subheadline / Supporting Text
- **Opsi 1:** "Temukan kedalaman Alkitab melalui pembacaan yang tenang dan panduan Mentor rohani yang cerdas."
- **Opsi 2:** "Jelajahi kebenaran abadi dengan cara baru. Simpan, pelajari, dan bagikan terang yang Anda terima."

### C. Search Guidance / Prompt Text
- **Opsi 1:** "Cari kitab, atau ketik hal yang mengganjal di hati Anda..."
- **Opsi 2:** "Tanya Alkitab tentang: Kedamaian, Masa Depan, atau Kekuatan..."

### D. Primary & Secondary CTA
- **Primary:** "Mulai Membaca" atau "Tanya Mentor Alkitab"
- **Secondary:** "Lihat Riwayat Bacaan" atau "Koleksi Favorit"

## 6. Recommended CTA Strategy
- **Contextual CTAs:** Jangan hanya gunakan "Search". Gunakan kartu-kartu kecil bertema perasaan (Mood-based discovery) seperti *"Gelisah"*, *"Bersyukur"*, *"Butuh Hikmat"*. Ini membantu user yang tidak tahu harus mencari bab/ayat apa.
- **Gentle Nudges:** Di akhir pasal, gunakan CTA *"Tulis Refleksi"* untuk menghubungkan kemajuan pribadi pengguna ke modul Community.

## 7. Recommended Section Structure
1. **Personalized Hero:** Sapaan berdasarkan waktu (Pagi/Siang/Malam) + Headline Aspiratif.
2. **Search & Assistant Entry:** Search bar yang didampingi oleh *Quick Ask* (Wand icon) untuk akses cepat ke AI Mentor.
3. **Discovery Chips (New):** Daftar kategori perasaan atau tema populer untuk memicu penjelajahan instan.
4. **Last Session / History:** Card minimalis yang mengingatkan user di mana mereka terakhir membaca.
5. **Verse of the Day Bridge:** Menampilkan ayat hari ini dengan visual yang sama seperti di modul *Today* untuk konsistensi.

## 8. Consistency Notes with Today, Community, and Paths
- **Card Aesthetics:** Tetap gunakan radius `rounded-[40px]` untuk *Discover Blocks* guna menjaga kesan aplikasi modern.
- **Active States:** Gunakan skema *Black-on-White* untuk elemen interaktif yang terpilih, selaras dengan modul Community yang baru dipoles.
- **Font Serif:** Pastikan teks ayat menggunakan font Serif berkualitas untuk membedakannya dengan UI fungsional lainnya.

## 9. Recommendation for Next Iteration
1. **Interactive Mentoring:** Mendesain antar muka Mentor yang lebih percakapan (*chat-like*) daripada sekadar panel informasi.
2. **Spiritual Heatmap:** Rencana visualisasi bab-bab yang sering dibaca user untuk menunjukkan fokus pertumbuhan mereka.
3. **Smart Integration:** Saat user menandai sebuah ayat, berikan opsi instan untuk menjadikannya "Fokus Hari Ini" di modul *Today*.

---
**Status Audit UX:** ✅ **DIRECTION SET**
Dokumen ini menjadi kompas bagi Codex untuk melakukan perbaikan visual dan struktur teknis di VerseHub tanpa kehilangan esensi pengalaman yang sakral dan modern.
