# Implementation Log: Spiritual Journeys

## Actions Taken
- Membuat halaman pusat `/paths/page.tsx` untuk menampilkan daftar kartu kurikulum.
- Membuat halaman operasional `/paths/[slug]/page.tsx`. Mengonversi data linear hari-ke-hari (*linear curriculum*) menjadi timeline vertikal interaktif yang tersembunyi bergradasi.
- Variabel statis lokal (*Local Storage*) `tct_journey_[slug]` memicu transisi kelulusan (menyelesaikan Hari 1 membuka esay Hari 2 besoknya).

## Risks/Decisions
- Logika state (Client Memory) berisiko terhapus bila user berpindah perangkat. Wajib ditarik ke Endpoint *Sync Database* di *Post-Immediate Roadmaps*.
