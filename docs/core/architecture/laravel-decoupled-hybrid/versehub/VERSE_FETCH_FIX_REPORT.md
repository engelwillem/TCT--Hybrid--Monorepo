# VerseHub Fetch Fix Report

## Akar Masalah
Terjadi mismatch antara endpoint yang dipanggil oleh proxy Next.js dengan endpoint yang tersedia di backend Laravel untuk detail ayat.
1. **Endpoint Mismatch**: `src/app/api/versehub/[lang]/[slug]/route.ts` memproksi request ke `/api/v1/versehub/...`. Namun, di Laravel, route untuk detail ayat (yang bersifat share-friendly) didefinisikan di `web.php` pada path `/versehub/{lang}/{ref}` tanpa prefix `/api/v1`.
2. **Missing Error Handling**: Di sisi frontend, jika fetch gagal (misal karena 404 path salah), state `loading` tidak pernah dihentikan dan tidak ada state `error`, sehingga user hanya melihat spinner terus-menerus.

## File yang Diubah
- `src/app/api/versehub/[lang]/[slug]/route.ts`: Perbaikan target path proksi.
- `src/app/versehub/[lang]/[slug]/page.tsx`: Penambahan error handling dan state UI.

## Perubahan yang Dilakukan
1. **Proxy Adjustment**: Menghapus prefix `/api/v1` khusus untuk request detail ayat agar tepat sasaran ke route Laravel yang mendukung response JSON (`VerseHubController@showLang`).
2. **Error State Implementation**: 
   - Menambahkan state `error` (null, 'verse_not_found', atau 'fetch_error').
   - Menangani response status 404 secara spesifik untuk membedakan antara "Ayat Tidak Ditemukan" dengan "Gagal Koneksi".
   - Menambahkan UI state untuk error dan not-found agar tidak stuck di loading spinner.

## Perilaku Sebelum vs Sesudah
- **Sebelum**:
  - Request ke backend mengembalikan 404 karena path `/api/v1/versehub/...` tidak ada.
  - Halaman stuck di loading spinner selamanya.
  - Tidak ada informasi jika slug salah/tidak valid.
- **Sesudah**:
  - Request berhasil mengambil data nyata karena path proksi sudah benar.
  - Jika slug valid (misal: `yoh-3-16`), konten ayat dan gambar OG tampil sempurna.
  - Jika slug tidak valid (misal: `xyz-123`), tampil pesan "Ayat tidak ditemukan" yang ramah pengguna dengan tombol kembali.

## Manual Verification Steps
1. Buka URL spesifik ayat yang valid, misal: `/versehub/id/yoh-3-16`.
2. Pastikan spinner hilang dan data ayat (Yohanes 3:16) muncul beserta gambarnya.
3. Buka URL dengan slug asal, misal: `/versehub/id/asdf-99-99`.
4. Pastikan muncul layar "Ayat tidak ditemukan" (bukan spinner abadi).
5. Putuskan koneksi internet (atau simulasi backend down) dan buka page.
6. Pastikan muncul layar "Terjadi kesalahan" dengan tombol "Coba Lagi".
