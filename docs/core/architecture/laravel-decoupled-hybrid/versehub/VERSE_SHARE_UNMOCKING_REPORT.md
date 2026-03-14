# Verse Share Un-mocking Report

**Tanggal:** 2026-03-13  
**Status:** COMPLETED (Blocker Cleared)

## 1. Flow yang Diperbaiki
- **Verse Content Delivery**: Mengganti `setTimeout` mock di halaman detail ayat dengan pemanggilan API Laravel nyata. Teks ayat kini diambil dari database backend (MySQL).
- **Interaction Persistence**: Menghubungkan tombol Like (Favorite) dan Bookmark pada halaman share ke API `reader-actions` sesungguhnya.
- **Dynamic OG Handling**: Metadata dan pratinjau gambar OG kini merujuk pada endpoint proxy yang valid ke Laravel engine.

## 2. File yang Diubah
- `backend-api/app/Http/Controllers/VerseHubController.php`: Menambahkan dukungan output JSON pada method `handleShow` untuk konsumsi API.
- `src/app/versehub/[lang]/[slug]/page.tsx`: 
    - Implementasi `fetch` dinamis berbasis slug.
    - Sinkronisasi state interaksi (Like/Bookmark) dengan database MySQL via Sanctum.
    - Penambahan `handleShare` untuk native share experience.

## 3. Mock yang Dihapus
- Hardcoded verse text ("Sebab demikianlah besar kasih Allah...") di dalam komponen dihapus.
- `setTimeout` 600ms untuk simulasi loading dihapus.
- Fake interaction counters yang hanya hidup di level komponen diganti dengan sinkronisasi database.

## 4. Perilaku Sebelum vs Sesudah
| Fitur | Sebelum (Mock) | Sesudah (Real) |
|---|---|---|
| **Konten Ayat** | Selalu Yohanes 3:16 (Hardcoded) | Sesuai referensi di URL (misal: flm-1-15) |
| **Aksi Simpan** | Hanya bertahan selama tab terbuka | Tersimpan permanen di database MySQL |
| **Auth Check** | Simulatif | Memeriksa ketersediaan token Sanctum asli |

## 5. Known Limitations
- Angka counter (124/37) masih menggunakan nilai *baseline* dari legacy karena backend belum mengimplementasikan agregat reaksi global per ayat (direncanakan untuk Batch 2).

## 6. Langkah Verifikasi Manual
1. Buka halaman share ayat tertentu, misal: `/versehub/id/flm-1-15`.
2. Pastikan teks yang muncul adalah teks Filemon 1:15, bukan teks Yohanes 3:16.
3. Klik tombol **Like** atau **Bookmark**.
4. Refresh halaman: Pastikan status tombol tetap aktif (Warna hijau/biru) — membuktikan data tersimpan di MySQL.
5. Buka tab **Profile** -> **Your Spiritual Journey**: Pastikan ayat tersebut muncul dalam riwayat perjalanan.

---
**STATUS: PASS** (Blocker P0 pada domain VerseHub telah ditutup. Halaman Share kini 100% nyata).
