# Mentor Data Hardening Report

**Tanggal:** 2026-03-13  
**Status:** IMPLEMENTED (Batch 0 complete)

## 1. Flow Mentor yang Dihardening
- **Mentor Insights**: Pengambilan data pertanyaan refleksi, hubungan tema, dan konteks historis.
- **Denominational Context**: Fitur baru di API (restorasi parity) untuk menampilkan pandangan berbagai tradisi gereja.
- **Ask the Bible**: Jalur tanya jawab bebas yang kini menggunakan otorisasi *Bearer Token* Sanctum yang stabil.

## 2. File yang Diubah
- `backend-api/app/Http/Controllers/VerseHubController.php`: Menambahkan data `denominational_context` ke response JSON `mentorInsights`.
- `src/components/versehub/MentorPanel.tsx`: 
    - Integrasi data teologi ke dalam UI.
    - Penghapusan ketergantungan pada meta tag CSRF.
    - Standardisasi header `Authorization` untuk request `POST /ask`.

## 3. Contract Sebelum vs Sesudah

| Property | Sebelum | Sesudah |
|---|---|---|
| **Data Source** | Partial Mock / Static | 100% Laravel API |
| **Denominational Data** | Missing | `denominational_context` (summary + traditions) |
| **Auth Type** | CSRF Meta Tag | Sanctum Bearer Token |
| **Relationships** | UI-Only Mock | Persistent MySQL Data |

## 4. Mock/Fallback yang Dihapus
- **Hardcoded Insights**: Menghapus baris pertanyaan refleksi statis di komponen React.
- **CSRF Dependency**: Menghapus pemanggilan `document.querySelector('meta[name="csrf-token"]')` yang sering menyebabkan error di SSR.

## 5. Known Limitations
- Data denominasi saat ini baru tersedia untuk ayat-ayat kunci (Yoh 6:53, Rom 9:18) di level template driver. Ayat lain akan menampilkan pesan fallback "Tradisi Umum".
- Navigasi melalui `related_refs` di dalam panel mentor akan memicu full-page reload ke ayat baru untuk menjaga konsistensi state reader.

## 6. Langkah Verifikasi Manual
1. Buka VerseHub Reader (misalnya: `/versehub/id/yoh-3-16`).
2. Klik ikon **✦ Scripture Guide** pada menu aksi ayat.
3. Buka tab **Konteks**: Pastikan informasi "Konteks Historis" muncul dari backend.
4. Buka tab **Kaitan**: Pastikan tema terkait (seperti "Kasih", "Keselamatan") muncul dari database MySQL.
5. (Opsional) Buka ayat Yoh 6:53: Pastikan section **Perspektif Tradisi** muncul dengan rincian pandangan Katolik, Lutheran, dll.
6. Coba fitur **Tanya**: Masukkan pertanyaan, pastikan jawaban muncul dan tidak ada error 419 (CSRF mismatch).

---
**STATUS: PASS** (Mentor Data kini nyata, berpusat pada teks Alkitab, dan memiliki kedalaman teologis sesuai legacy).