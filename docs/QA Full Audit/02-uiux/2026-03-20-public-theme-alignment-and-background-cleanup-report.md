# Public Theme Alignment & Background Cleanup Report (2026-03-20)

## Current Visual Problems
1. `/login` public belum sekelas admin login (hierarki lemah, form treatment kurang premium).
2. Tone warna antar halaman target belum konsisten (beberapa terlalu eksperimen).
3. Halaman tertentu masih memakai background tambahan/noise yang mengganggu fokus.

## Why Current Extra Backgrounds Hurt UX
- Pattern/noise menurunkan kejernihan visual pada konten utama.
- Terlalu banyak lapisan dekorasi membuat UI terasa ramai, bukan tenang.
- Kontras dan hierarchy jadi kalah oleh efek latar.

## Design Rules Adopted From Admin Login Reference
- Tone biru lembut + aksen cyan sebagai identitas TCT.
- Surface/card bersih dengan border lembut dan shadow halus.
- Kontras teks dipertegas (foreground stabil, muted terkontrol).
- Dekorasi dibatasi: tidak memakai grain/noise pattern pada halaman target.
- Form login dibuat lebih terstruktur, fokus, dan premium.

## Pages Changed
- `/` (`src/app/page.tsx`)
  - Hapus `bg-grain` noise layer.
  - Sederhanakan mood jadi gradient lembut, kurangi aksen multi-warna.
  - Card treatment tetap premium tapi lebih tenang.

- `/login` (`src/app/login/page.tsx`)
  - Komposisi ulang visual: panel login dark-premium + rail informasi desktop.
  - Input/form/button treatment diselaraskan ke kualitas admin login.
  - Error alert tetap jelas tanpa mengubah logic auth.

- `/versehub/id` (`src/features/versehub/pages/VersehubReaderPage.tsx`, mode landing)
  - Bersihkan treatment background pada search/suggestion/quick access jadi lebih clean.
  - Pertahankan dark hero sebagai anchor utama, kurangi dekorasi yang berisik.
  - Tingkatkan konsistensi tone surface.

- `/paths` (`src/app/paths/page.tsx`)
  - Turunkan efek gradient/glass berlebih pada block “mengapa paths” dan empty state.
  - Card jadi lebih clean, tetap premium, tanpa terlihat “eksperimen”.

## Shared Theme/Layout Changes
- `src/layouts/AppShell.tsx`
  - Auth surfaces (`/login`, `/forgot-password`, `/reset-password`) tidak lagi memunculkan sidebar/bottom nav.
  - Spacing main untuk auth disetel lebih tepat agar komposisi login fokus.

## Remaining Gaps Outside This Scope
- `/today`, `/profile`, `/community` tidak disentuh karena sudah jadi acuan “lebih layak”.
- Fine-tuning micro-interaction dan typographic rhythm lintas semua halaman masih bisa dilanjutkan pada iterasi berikutnya.

## Final Status Per Page
- `/`: `LIVE`
- `/login`: `LIVE`
- `/versehub/id`: `PARTIAL`
- `/paths`: `LIVE`
