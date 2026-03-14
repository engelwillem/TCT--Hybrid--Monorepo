# P1 Community Runtime Fix Report

**Tanggal:** 2026-03-15  
**Status:** **RESOLVED**

Laporan ini mendokumentasikan perbaikan pada domain Community (port 9002) untuk mengatasi masalah sinkronisasi data interaksi dan visibilitas feed.

---

## 1. Masalah & Akar Masalah (Root Causes)

| Defect | Akar Masalah | Solusi |
| :--- | :--- | :--- |
| **Gagal Pray/Bookmark (Leak)** | **Contract Mismatch**: Frontend mencari field `interactions.is_prayed`, sedangkan Backend mengirim `isLiked` secara flat. | Sinkronisasi `mapping logic` di `CommunityService.ts` agar sesuai dengan JSON Laravel. |
| **Feed 503 / Kosong** | **Strict Expiry**: Scope `active()` di Laravel membatasi post hanya < 24 jam. | Relaksasi scope `active()` menjadi 7 hari di model `MemberPost.php`. |
| **Interaksi Tidak Instan** | UI menunggu respons server sebelum berubah. | Implementasi **Optimistic UI Update** dengan mekanisme **Rollback** jika gagal. |
| **Error Handling Buruk** | Tidak ada indikasi jika backend offline atau sesi habis (401). | Penambahan state `fetchError` dan UI **Retry Button** serta pesan error yang jujur. |

---

## 2. File yang Diubah

### Backend (`backend-api`)
1.  **`app/Models/MemberPost.php`**
    - Perubahan scope `active()` dari 24 jam menjadi 7 hari.
2.  **`app/Http/Controllers/Api/V1/CommunityApiController.php`**
    - Perubahan `expires_at` pada saat `store` postingan baru menjadi 7 hari.

### Frontend (`thechoosentalksnext`)
1.  **`src/services/community.service.ts`**
    - Rekonstruksi `ApiPost` interface & `mapApiPost` agar 100% kompatibel dengan JSON Laravel (Flat structure).
    - Penanganan `null` ke `undefined` untuk mematuhi kriteria TypeScript.
2.  **`src/features/community/pages/CommunityPage.tsx`**
    - Implementasi `useCallback` untuk `fetchData`.
    - Penambahan logic Optimistic Update (Likes & Bookmarks).
    - Penambahan UI Error/Retry State.
    - Fix linting errors pada `slugifyRef`.

---

## 3. Perubahan Perilaku (Before vs After)

| Fitur | Sebelum (Broken) | Sesudah (Fixed) |
| :--- | :--- | :--- |
| **Klik Pray/Doakan** | Icon berubah sejenak lalu kembali kosong (mismatch). | Icon berubah instan dan bertahan setelah refresh. |
| **Pemuatan Feed** | Sering kosong jika tidak ada post baru hari ini. | Menampilkan post dari 7 hari terakhir. |
| **Koneksi Terputus** | Loading terus menerus tanpa akhir. | Muncul kartu merah: "Gagal Memperbarui Feed" + tombol **Coba Lagi**. |
| **Session Expired** | Error di console saja. | Muncul pesan: "Silakan Masuk Kembali" (401). |

---

## 4. Langkah Verifikasi Manual (Port 9002)

1.  Buka `http://localhost:9002/community`.
2.  Pastikan feed memuat data (Meskipun data lama, minimal dari 7 hari terakhir).
3.  Klik icon **Pray (Doakan)** pada salah satu postingan.
    - *Ekspektasi*: Angka bertambah instan. Refresh halaman, status tetap terisi.
4.  Coba matikan `php artisan serve`, lalu klik **Coba Lagi**.
    - *Ekspektasi*: Muncul pesan "Server Unavailable" atau "Failed to load feed".
5.  Nyalakan kembali `php artisan serve`, klik **Coba Lagi**.
    - *Ekspektasi*: Feed termuat kembali dengan normal.

---

## 5. Known Limitations
- Optimistic UI saat ini belum menyertakan animasi transisi yang halus pada angka (hanya nilai teks yang berubah instan).
- Perpanjangan masa aktif post (7 hari) adalah solusi sementara hingga volume postingan organik meningkat.

---
*Fix P1 Community Runtime Selesai.*
