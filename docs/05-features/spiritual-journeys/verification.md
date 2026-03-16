# Verification: Spiritual Journeys

## Checklist
1. Buka `/paths`. Pastikan daftar kurikulum diambil dari `GET /api/public/study-paths`. Hardcoded variables seperti `JOURNEYS` telah dimusnahkan.
2. Buka salah satu path (mis. `/paths/mengelola-kecewa`). Pastikan rincian esay didatangkan utuh dari `GET /api/public/study-paths/{lang}/{slug}` beserta jumlah *progress step* asli.
3. Klik tombol `Selesai Hari Ini`. Validasi panggilan `POST` merespon parameter *progress* mutakhir dan antarmuka hari itu memantulkan ceklis hijau terselesaikan tanpa perlu me-*refresh*.
4. *Refresh Browser* pada URL yang sama, dan pastikan gembok tidak terkunci alias sinkron dari Backend (Local Storage tak lagi campur tangan).

## Status Akhir
- Status: **PASS**
- Rekomendasi: MVP Layer `Journey` telah memecahkan teka-teki Local State/Mock Data Trap. Fungsionalitas _retention loop_ terpasang kencang.
