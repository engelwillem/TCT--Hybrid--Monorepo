# Spiritual Journeys (Retention Loop)

## Tujuan
Mengubah sistem library kaku (Sabbath School) menjadi lintasan kurikulum ringan harian (Micro-Journeys) berbasis progression bar visual (Dopamine-driven Loop).

## Komponen Kunci
1. **Journey Discovery Page (`/paths`)**: Daftar *learning path* yang singkat, estetis, mencantumkan jumlah hari target.
2. **Timeline Interface (`/paths/[slug]`)**: Antarmuka hari-demi-hari (Vertical Stepper). Menampilkan hanya 1 hari terbuka, sisanya tergembok transparan.
3. **Daily Action (Selesai)**: Tombol pemantik State untuk mencatat kemajuan sesi pengguna.

## Penyimpanan State (MVP)
Memakai *client-side state* via `<AnimatePresence>` untuk UI dan `localStorage` (`tct_journey_[slug]`) untuk memori sesi sebelum disambungkan ke profil/database pengguna Laravel.
