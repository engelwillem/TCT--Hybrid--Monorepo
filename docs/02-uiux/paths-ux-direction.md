# Paths Module UX Direction & Strategy

## 1. Ringkasan Surface
Modul **Paths** (`src/app/paths/page.tsx`) adalah pilar "Pertumbuhan Terarah" di The Chosen Talks. Berbeda dengan *Today* yang bersifat harian atau *Community* yang bersifat sosial, Paths dirancang sebagai kurikulum spiritual—rangkaian langkah demi langkah (milestones) untuk mendalami tema Alkitab tertentu. Saat ini, karena data production seringkali kosong (`paths: []`), surface ini berisiko terlihat seperti "fitur mati" jika tidak dikelola secara UX.

## 2. Masalah Persepsi User
Identifikasi risiko psikologis pengguna saat membuka halaman Paths yang kosong:
- **"Under Construction" Feel:** Pesan "kembali lagi nanti" membuat aplikasi terasa belum selesai dan tidak profesional.
- **Dead End:** Tidak ada instruksi atau alternatif tindakan (CTA), sehingga user hanya bisa menutup halaman.
- **Lack of Purpose:** User tidak mendapat gambaran *apa itu Paths* sebenarnya jika mereka tidak melihat contoh konten.

## 3. UX Direction
Tujuan utama adalah mengubah "Halaman Kosong" menjadi "Ruang Antisipasi".
- **Tone:** Kontemplatif, Harapan, Pertumbuhan, dan Eksklusif.
- **Experience Flow:** Sambut user dengan aspirasi -> Jelaskan nilai manfaat Paths -> Berikan sinyal bahwa tim sedang bekerja (Human connection) -> Alihkan ke aktivitas produktif lain (Bridge).
- **Design Intent:** Gunakan visual yang menyiratkan "Jalan dalam Hutan" atau "Benih yang Tumbuh"—mendukung tema spiritual tanpa terasa kuno.

## 4. Recommended Messaging Hierarchy
1. **Aspiration (Header):** Fokus pada manfaat pertumbuhan.
2. **The "Why" (Value Prop):** Menjelaskan mengapa Paths berbeda dari sekadar membaca ayat acak.
3. **The "Wait" (Graceful Empty State):** Mengubah kekosongan menjadi penantian yang berharga.
4. **The "Bridge" (Alternative CTA):** Mengarahkan kembali ke VerseHub atau Community agar sesi user tidak berakhir sia-sia.

## 5. Microcopy Options

### A. Headline Utama (Hero)
- **Opsi 1 (Premium):** "Langkah Kecil, Pertumbuhan Besar."
- **Opsi 2 (Spiritual):** "Berjalan Lebih Dalam Bersama Firman."
- **Opsi 3 (Direct):** "Satu Hari, Satu Langkah Menuju Kedewasaan Iman."

### B. Subheadline / Supporting Text
- **Opsi 1:** "Pilih satu jalan bertema, selesaikan secara bertahap, dan lihatlah bagaimana pemahaman Anda bertransformasi."
- **Opsi 2:** "Rangkaian perjalanan spiritual terarah yang dirancang untuk membantu Anda bertumbuh secara sistematis setiap hari."

### C. Empty State Text (Saat data kosong)
- **Opsi 1 (Anticipatory):** "Kami Sedang Merangkai Langkah Anda. Tim mentor kami tengah mempersiapkan rangkaian perjalanan baru yang mendalam. Nantikan segera."
- **Opsi 2 (Inviting):** "Hening Sejenak. Sesuatu yang indah sedang dipersiapkan untuk menemani pertumbuhan iman Anda. Jalan spiritual baru akan segera hadir."

### D. Primary & Secondary CTA
- **Primary (Alternative):** "Jelajahi VerseHub Dulu" atau "Cari Inspirasi di Komunitas"
- **Secondary (Interest):** "Beritahu saya saat jalan baru tersedia"

## 6. Recommended Section Structure
Jika data kosong, tetap pertahankan struktur berikut untuk menjaga *visual weight*:

1. **Hero Intro:** Headline dan subheadline tetap muncul di atas (tidak ikut hilang saat data kosong).
2. **Current Journey (Status):** Jika user sedang menjalankan sebuah path, tampilkan di bagian paling atas dengan progres bar yang elegan.
3. **Main Content Area:**
   - **Jika Ada Data:** Grid 2 kolom berisi kartu Paths dengan visual *card rounded-[40px]*.
   - **Jika Kosong:** Gunakan **Empty State Card** yang besar dan estetik (bukan sekadar teks kecil di tengah layar).
4. **"Coming Soon" Preview:** (Opsional) Tampilkan 1 kartu "misterius" atau *preview* tema yang akan datang untuk membangun antusiasme.
5. **The Bridge Section:** Tombol navigasi ke VerseHub atau Community sebagai akhir dari halaman.

## 7. Consistency Notes with Today & Community
- **Visuals:** Gunakan `rounded-[40px]` untuk *feature cards* besar.
- **Typography:** Gunakan *Serif* untuk elemen kutipan atau pesan puitis di dalam empty state.
- **Interactions:** Gunakan `framer-motion` untuk *fade-in-up* yang lambat (800ms) untuk memberikan kesan tenang dan sakral.
- **Colors:** Pertahankan aksen `brand` hanya pada elemen penanda progres atau ikon utama.

## 8. Recommendation for Next Iteration
1. **Interactive Expectation:** Tambahkan survei singkat di empty state: "Tema apa yang ingin Anda pelajari?" (Misal: Kedamaian, Pernikahan, Kedisiplinan). Ini membuat user merasa ikut membangun modul Paths.
2. **Skeleton Mastery:** Pastikan skeleton loading meniru bentuk kartu Grid 2-kolom agar tidak ada lonjakan visual saat data pertama kali muncul di layar lambat.
3. **Progress Visualization:** Ubah angka "10% Complete" menjadi visual lingkaran atau garis progres tipis yang menyatu dengan *Card Border* untuk kesan lebih premium.

---
**Status Audit UX:** ✅ **DIRECTION SET**
Dokumen ini berfungsi sebagai panduan bagi Codex untuk melakukan implementasi teknis UI/UX tanpa bertabrakan dengan strategi konten global.
