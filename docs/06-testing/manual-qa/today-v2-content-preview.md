# Today V2 Content Preview (By Date)

Tujuan: memberi cara cepat untuk content/editor preview konten tanggal tertentu di frontend `/today-v2` tanpa ubah env global.

## Quick Steps
1. Pastikan file konten tanggal target tersedia:
   - `backend-api/content/today-v2/YYYY-MM-DD.php`
2. Jalankan backend + frontend lokal.
3. Buka:
   - `/today-v2?previewDate=YYYY-MM-DD`
   - Contoh: `http://localhost:9002/today-v2?previewDate=2026-03-21`

## Safety Rules
- Preview query aktif default hanya di local/testing.
- Production tetap pakai perilaku normal kecuali env backend mengaktifkan:
  - `TODAY_V2_ALLOW_PREVIEW_QUERY=true`
- Payload contract tetap `today-v2.session.v1` (tidak berubah).

## Verify the Preview Target
Gunakan header response backend:
- `X-Today-V2-Preview-Date`: tanggal preview yang dipakai
- `X-Today-V2-Preview-Fallback`: `0` jika file tanggal ditemukan, `1` jika fallback ke default

## Combine with Readiness
Setelah preview terasa benar, jalankan:
- `npm run today-v2:ready`
