# Today-Community Drift Audit

**Tanggal Audit:** 2026-03-13  
**Fokus:** Irisan data dan interaksi antara Dashboard `Today` dan Domain `Community`.  
**Status Parity Terkini:** Community (REAL), Today (PARTIAL).

---

## 1. Komponen & Page dengan Data Mock

Daftar elemen di dashboard `Today` yang masih menggunakan data palsu atau perilaku simulasi:

| Komponen | Status | Masalah |
|---|---|---|
| **Today Feed Highlights** | **PARTIAL** | Mengambil data dari `/api/today`, namun jika API gagal, menggunakan `fallbackFeed` (MOCK) yang tidak sinkron dengan database. |
| **QuoteCard.tsx** | **MOCK** | Menggunakan `localStorage` (`tct:quote:reactions:*`) untuk status Like/Bookmark. Tidak tersimpan di MySQL. |
| **QuestionOfTheDay.tsx** | **MOCK** | Fungsi `handleSubmit` hanya menggunakan `setTimeout` untuk mensimulasikan sukses tanpa mengirim data ke API. |
| **ReflectionPrompt.tsx** | **PARTIAL** | Menggunakan `router.post` ke rute yang benar, namun feedback jumlah respons (`responseCount`) masih bersifat statis/hardcoded. |

---

## 2. Source of Truth & Data Flow Gap

### A. Entitas Postingan (Feed)
- **Community Tab**: Mengambil `ApiPost` lengkap dari `/api/v1/community/posts`.
- **Today Tab**: Mengambil `TodayApiHighlight` dari `/api/v1/today`.
- **Gap**: Struktur pemetaan di `TodayPage.tsx` (`mapHighlightToFeedItem`) mengabaikan beberapa metadata penting seperti `can_moderate` dan rincian `media_paths` yang sudah didukung di tab Community.

### B. Interaksi User (Like/Save)
- **Community Tab**: Perubahan state langsung merefleksikan hasil kalkulasi server.
- **Today Tab**: `QuoteCard` masih bersifat "Single Player" (lokal). User merasa sudah menyimpan kutipan, namun data tersebut tidak akan muncul di "My Spiritual Journey" karena tidak masuk database.

---

## 3. Daftar Perbedaan Perilaku (Drift)

| Perilaku | Community (Target) | Today (Actual) |
|---|---|---|
| **Persistensi Like** | Database (MySQL) | LocalStorage (Browser) |
| **Feedback Berbagi** | Pengecekan Auth Nyata | `requireMember()` redirect ke Landing |
| **Refresh Data** | `router.refresh()` | Local state update saja |
| **Komentar** | `CommentsSheet` (Real) | `CommentsSheet` (Local Mock for Quote) |

---

## 4. Daftar File yang Harus Disentuh

### Components (Today Domain)
- `src/app/today/components/cards/QuoteCard.tsx`: Migrasi ke API-backed persistence.
- `src/app/today/components/cards/QuestionOfTheDay.tsx`: Hubungkan ke `CommunityService.createPost`.
- `src/app/today/components/cards/ReflectionPrompt.tsx`: Sinkronisasi angka `responseCount` dengan backend.

### Pages & Services
- `src/app/today/page.tsx`: Perbaikan `fallbackFeed` dan sinkronisasi struktur `FeedItem`.
- `backend-api/app/Http/Controllers/Api/V1/TodayApiController.php`: Pastikan rituals mengembalikan ID yang valid untuk interaksi.

---

## 5. Status Flow Dashboard Today

| Flow Name | Status | Catatan |
|---|---|---|
| **Member Post Highlights** | **REAL** | Sudah ditarik dari `/api/today` (Highlights section). |
| **Daily Prayer Action** | **MOCK** | `saidAmin` hanya state lokal di `DailyPrayerCard.tsx`. |
| **Quote of Day Interaction** | **MOCK** | Like/Bookmark bersifat lokal. |
| **Community Highlight Link** | **REAL** | Link mengarah ke `/community`. |

---

## 6. Scope Minimum Perbaikan (Un-mocking Today)

Untuk menjaga integritas data dan kepercayaan pengguna, batch perbaikan Today Dashboard harus mencakup:

1.  **Unified Feed Item**: Pastikan pemetaan post di `Today` identik dengan `Community` agar behavior `MemberPostCard` (Like/Save) konsisten di kedua halaman.
2.  **Ritual Persistence**: Ubah `QuoteCard` agar menggunakan API `pray` dan `bookmark` yang sama dengan postingan komunitas.
3.  **Active Question Submission**: Pastikan jawaban "Question of the Day" benar-benar terkirim sebagai postingan komunitas (type: `discussion_prompt`).

---
**Verdict:** 
Saat ini terjadi **"Double Reality"**. User bisa melihat data asli di Community, tapi berinteraksi dengan data palsu di Today. Ini harus segera ditutup sebelum Batch 1 (Page Migration) berlanjut ke area lain.