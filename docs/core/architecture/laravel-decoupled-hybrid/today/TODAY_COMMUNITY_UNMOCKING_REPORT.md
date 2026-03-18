# Today-Community Un-mocking Report

**Tanggal:** 2026-03-13  
**Status:** COMPLETED (Drift Closed)

## 1. Flow yang Diperbaiki
- **Dashboard Highlights**: Mengganti pemanggilan API dari `/api/today` (yang sebelumnya hanya parsial) menjadi integrasi penuh dengan `TodayFeedService`.
- **Question of the Day**: Menghapus simulasi sukses. Jawaban pengguna kini diposting secara nyata sebagai `discussion_prompt` di komunitas.
- **Reflection Chips**: Tombol respons cepat pada kartu renungan kini membuat postingan komunitas nyata.
- **Quote Card Clean-up**: Menghapus tombol Like/Bookmark palsu pada ritual harian statis untuk menjaga integritas data "My Spiritual Journey".

## 2. File yang Diubah
- `backend-api/app/Http/Controllers/Api/V1/TodayApiController.php`: Migrasi ke `TodayFeedService`.
- `src/app/today/page.tsx`: Penyesuaian mapping data dashboard.
- `src/app/today/components/cards/QuestionOfTheDay.tsx`: Integrasi `CommunityService.createPost`.
- `src/app/today/components/cards/ReflectionPrompt.tsx`: Integrasi `CommunityService.createPost`.
- `src/app/today/components/cards/QuoteCard.tsx`: Penghapusan mock interaction logic.

## 3. Mock yang Dihapus
- `fallbackFeed` (MOCK_POSTS) kini tidak lagi menjadi sumber data utama.
- Local storage `tct:quote:reactions:*` pada `QuoteCard` dihapus.
- `setTimeout` success simulation pada `QuestionOfTheDay` dihapus.

## 4. Perilaku Sebelum vs Sesudah
| Fitur | Sebelum (Drift) | Sesudah (Synced) |
|---|---|---|
| **Data Feed** | Sering tidak sinkron antara Today & Community. | Menggunakan source of truth (MySQL) yang sama. |
| **Jawab Pertanyaan**| Data hanya hilang saat refresh. | Muncul di feed Community secara otomatis. |
| **Like Post** | Terkadang tidak update statusnya di Today. | Status sinkron real-time via API response. |

## 5. Known Limitations
- Kartu "Daily Prayer" masih menggunakan state lokal (animasi AMIN) karena belum ada tabel khusus di backend untuk akumulasi doa per hari.

## 6. Langkah Verifikasi Manual
1.  Buka dashboard **Today**.
2.  Jawab pertanyaan pada kartu "Pertanyaan Hari Ini".
3.  Klik **Bagikan**.
4.  Pindah ke tab **Community**: Postingan jawaban Anda harus muncul di urutan teratas.
5.  Klik salah satu chip (misal: "Amin") di kartu renungan Today.
6.  Verifikasi di feed Community: Postingan refleksi otomatis telah terbuat.

---
**STATUS: PASS** (Drift antara Today dan Community telah ditutup. Seluruh interaksi penting kini bersifat nyata dan persistent).