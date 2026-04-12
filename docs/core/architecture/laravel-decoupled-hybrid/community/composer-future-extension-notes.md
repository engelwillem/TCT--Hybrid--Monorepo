# Composer Future Extension Notes

**Vision**: Evolusi PostComposer menjadi pusat ekspresi spiritual yang kaya fitur.

---

## 1. Draft Persistence
- **Concept**: Menyimpan status penulisan secara lokal jika browser tertutup atau sesi terputus.
- **Implementation**: Gunakan `useEffect` di dalam `useComposerText` untuk mensinkronisasi state ke `localStorage` dengan kunci berbasis `currentUser.id`.
- **UI**: Tambahkan indikator "Draf disimpan" yang sangat halus di action bar.

## 2. Mentions & Tagging (@)
- **Concept**: Memungkinkan pengguna menyebut member lain dalam post.
- **Implementation**: Integrasikan `react-mentions` atau bangun `MentionPopvoer` berbasis Radix UI. Perlu endpoint `/api/users/search`.
- **Architecture**: Tambahkan `useComposerMentions.ts` untuk mengelola hasil pencarian dan seleksi user.

## 3. Link Previews (Auto-scraped Cards)
- **Concept**: Menampilkan kartu preview saat pengguna menempelkan link (YouTube, Blog, Berita).
- **Implementation**: Endpoint backend untuk scraping metadata (OG Tags).
- **Architecture**: Tambahkan `useComposerLinks.ts` yang mendengarkan perubahan pada `text` dan memicu scraping jika menemukan pola URL.

## 4. Contextual Verse Attachment
- **Concept**: Integrasi dengan VerseHub untuk melampirkan ayat Alkitab secara langsung ke dalam post.
- **Implementation**: Gunakan data yang sudah ada di `/renungan` atau `/versehub` untuk mempopulasi metadata post.

## 5. Analytics & Instrumentation
- **Events to Track**:
  - `composer_opened`
  - `media_attached_count`
  - `category_selected`
  - `submit_success`
  - `submit_error`
- **Architecture**: Masukkan hook pelacakan di dalam `useComposerSubmit`.

---

*Notes prepared by Antigravity Architecture Strategist*
