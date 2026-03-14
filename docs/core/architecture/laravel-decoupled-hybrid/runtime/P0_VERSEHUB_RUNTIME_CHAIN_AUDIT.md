# P0 VerseHub Runtime Chain Audit (Port 9002)

**Tanggal:** 2026-03-14  
**Status Audit:** **CRITICAL MISMATCH IDENTIFIED**

Audit ini memetakan jalur data dari UI Next.js (port 9002) melalui API Proxy ke Backend Laravel (port 8000) untuk mengidentifikasi penyebab kegagalan P0 pada fitur VerseHub.

---

## 1. Flow-by-Flow Chain Mapping

### Flow A: Open Verse Detail (Single Verse Share)
*   **Source URL**: `/versehub/id/yoh-3-16`
*   **Next Page**: `src/app/versehub/[lang]/[slug]/page.tsx`
*   **Next API Call**: `GET /api/versehub/id/yoh-3-16`
*   **Next Proxy**: `src/app/api/versehub/[lang]/[slug]/route.ts`
*   **Laravel Target**: `GET /versehub/id/yoh-3-16` (Handled by `VerseHubController@showLang` in `web.php`)
*   **Root Cause**: 
    - **Contract Mismatch**: Proxy logic di Next.js mengarahkan ke *web route* Laravel yang secara default bisa mengembalikan HTML/Inertia.
    - **Accept Header**: Jika header `Accept: application/json` tidak dipaksakan atau tidak merembes sampai ke backend, Laravel mungkin mengirimkan HTML.
*   **Status Aktual**: 200 OK (Verified via manual curl), namun seringkali melambat (Latency).

### Flow B: Chapter Picker Navigation (Library Mode)
*   **Action**: Klik kitab (misal: Markus) -> Klik pasal (misal: 1).
*   **Frontend Logic**: `VersehubReaderPage.tsx` -> `handlePickChapter`
*   **Next Redirect**: Menuju `/versehub/id/chapter/mrk.1`
*   **Next Match**: **FAIL (404 Not Found)**.
*   **Root Cause**:
    - **Routing Depth Mismatch**: Router Next.js di `src/app/versehub/[lang]/[slug]/page.tsx` hanya mendukung 2 dynamic segments (`id` dan `mrk.1`). 
    - Penambahan segmen `/chapter/` membuat path menjadi 3 segmen setelah `/versehub`, yang tidak terdaftar di App Router.
*   **Status Aktual**: **P0 Blocker**.

### Flow C: Bible Search & Suggestions
*   **Action**: Ketik di search bar.
*   **Frontend Call**: `GET /api/versehub/id/suggest?q=...`
*   **Next Proxy**: `src/app/api/versehub/[lang]/suggest/route.ts`
*   **Laravel Target**: `GET /api/v1/versehub/id/suggest` (Handled by `VerseHubLibraryController@suggest`)
*   **Root Cause**: Delay pada backend saat mengolah query teks besar atau indexing.
*   **Status Aktual**: STABLE but Latent.

---

## 2. Diagnosa Terkonsolidasi (Root Causes)

1.  **Routing Schema Inconsistency**: Frontend (port 9002) masih berasumsi ada path `/chapter/` di tengah URL, sementara router baru didesain flat: `/versehub/[lang]/[slug]`.
2.  **Backend Latency**: Logic `getGuidedInsights` di `VerseHubReaderController` memakan waktu 5-10 detik karena proses sinkron, menyebabkan UI terlihat "hang" atau *timeout* pada proxy (503).
3.  **Proxy Segment Confusion**: File `src/app/api/versehub/[lang]/[slug]/route.ts` mencoba mendeteksi tipe request berdasarkan jumlah "-" (segments.length), namun inkonsisten dengan separator "." yang dihasilkan oleh picker.

---

## 3. File yang Harus Disentuh

1.  **`src/features/versehub/pages/VersehubReaderPage.tsx`**: Perbaiki `handlePickChapter` untuk menggunakan format path yang benar.
2.  **`src/app/api/versehub/[lang]/[slug]/route.ts`**: Perbaiki deteksi segmen agar lebih robust (mendukung `.` dan `-`).
3.  **`backend-api/app/Http/Controllers/VerseHubReaderController.php`**: Optimasi atau caching pada logic mentor insights.

---

## 4. Urutan Fix (Safe & Sequential)

1.  **FIX 1 (Picker)**: Ubah `handlePickChapter` di `VersehubReaderPage.tsx` dari `/versehub/${lang}/chapter/${book}.${ch}` menjadi `/versehub/${lang}/${book}-${ch}`.
2.  **FIX 2 (Proxy Logic)**: Standarisasi regex pemisah segmen di `[slug]/route.ts` untuk selalu mendeteksi Chapter vs Verse dengan benar tanpa memedulikan separator awal.
3.  **FIX 3 (Backend Performance)**: Tambahkan cache layer pada `getGuidedInsights` agar chapter content tidak memicu 5-10s delay pada setiap reload.

---
*Laporan Audit Rantai Runtime Selesai.*
