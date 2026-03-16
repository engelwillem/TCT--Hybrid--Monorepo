# Implementation Log: Spiritual Journeys

## Actions Taken
- Membuat halaman pusat `/paths/page.tsx` untuk menampilkan daftar kartu kurikulum.
- Membuat halaman operasional `/paths/[slug]/page.tsx`. Mengonversi data linear hari-ke-hari (*linear curriculum*) menjadi timeline vertikal interaktif yang tersembunyi bergradasi.
- **2026-03-17**: Menghancurkan memori isolatif (*Local Storage*) dan mock arrays, mengalihkan pengambilan daftar komprehensif ke `GET /api/v1/study-paths` dan menyimpan kemajuan riil ke `POST /api/v1/study-paths/.../complete` pada Laravel backend.

## Risks/Decisions
- Sinkronisasi progres secara reaktif telah dipaskan menimpa UI Timeline secara instan pasca call `completeStep`, menyamaratakan pengalaman web terlepas dari tipe peramban.
