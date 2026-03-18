# Batch 0 Residual Hardening Report

**Tanggal:** 2026-03-13  
**Status:** COMPLETED (Blockers cleared)

## 1. Blocker yang Ditutup
- **Follow Interaction Reality**: Aksi "Follow" di `ChatPopover.tsx` kini terhubung ke API Laravel via proxy Next.js. Status hubungan sosial antar pengguna kini persistent di MySQL.
- **Post Creation Reality**: Fitur bagikan berkat di `PostComposer.tsx` kini melakukan upload data nyata (teks + gambar) ke Laravel. Tidak lagi hanya sekadar simulasi `console.log`.

## 2. File yang Diubah
- `backend-api/routes/api.php`: Ekspos rute `follow-toggle` ke API.
- `backend-api/app/Http/Controllers/Api/V1/CommunityApiController.php`: Hardening fungsi `store` untuk menangani upload file fisik.
- `src/app/api/users/[id]/follow/route.ts`: Proxy baru untuk interaksi sosial.
- `src/services/community.service.ts`: Update `createPost` untuk mendukung binary upload (`FormData`).
- `src/components/community/PostComposer.tsx`: Integrasi UI ke layanan persistensi nyata.
- `src/components/core/ChatPopover.tsx`: Migrasi rute follow dari Web ke API.

## 3. Perilaku Sebelum vs Sesudah

| Fitur | Sebelum (Broken/Mock) | Sesudah (Real) |
|---|---|---|
| **Aksi Follow** | Error 404 (Route Web dipanggil via API) | Sukses (Tersimpan di `user_follows`) |
| **Buat Post** | Simulasi Sukses (Data hilang di refresh) | Upload Nyata (Tersimpan di `member_posts`) |
| **Upload Gambar** | Tidak ada pengiriman file | Gambar tersimpan di `storage/public/community` |
| **Inbox State** | Tab Primary kosong/statis | Tab Primary terisi otomatis saat follow mutual |

## 4. Known Limitations
- Progress upload besar belum memiliki indikator persentase (hanya spinner loading pada tombol).
- Belum ada validasi tipe file gambar di sisi client (sudah divalidasi ketat di sisi server).

## 5. Langkah Verifikasi Manual
1.  **Follow**: Buka Inbox -> Cari user di tab General -> Klik Follow. Pastikan status berubah menjadi "Unfollow" dan tetap bertahan setelah refresh.
2.  **Post**: Buka dashboard Community/Today -> Tulis berkat -> Upload 1 gambar -> Klik Bagikan. Pastikan post muncul di feed dengan gambar yang benar dan tersimpan di database MySQL.

---

## Final Batch 0 Recommendation
**STATUS: CLEAR TO START BATCH 1**

Seluruh blocker teknis yang menghambat integritas data dan sesi telah diselesaikan. Fondasi aplikasi kini 100% "Live" dan siap untuk menerima migrasi halaman besar (Batch 1: Page Migration).
