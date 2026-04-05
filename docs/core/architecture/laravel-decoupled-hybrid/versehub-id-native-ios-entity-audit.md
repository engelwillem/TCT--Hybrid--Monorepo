# VerseHub ID Native iOS Entity Audit & Refactor Report

## 1. Masalah Awal (Initial Issues)
- **Overlay Chaos**: State overlay menggunakan boolean terpisah (`isExploreOpen`, `isPickerOpen`, `isMentorOpen`) yang memungkinkan kondisi race condition atau beberapa overlay terbuka bersamaan.
- **Layout Instability**: Layout menggunakan positioning absolute yang tidak stabil, menyebabkan konten ayat tertabrak oleh UI bottom actions pada layar pendek (iPhone SE).
- **Metadata Terisolasi**: Payload ke Mentor Engine hanya mengirimkan teks ayat tanpa konteks mood, intent, atau metadata pendukung lainnya.
- **Hardware Acceleration Missing**: Animasi mesh gradient dan elemen visual berat membebani CPU, menyebabkan frame drop pada perangkat mobile.
- **Ambience Desync**: Mood key di-hardcode ("hopeful"/"daily") dan tidak sinkron dengan pilihan user atau nuansa visual halaman.

## 2. Akar Penyebab (Root Causes)
- Arsitektur state yang masih bersifat prosedural dan tidak terpusat.
- Tidak adanya constraint geometry flexbox pada container utama.
- Desain bridge frontend-backend yang terlalu minimalis.

## 3. Keputusan Arsitektur (Architectural Decisions)
- **Singleton Overlay Pattern**: Menggunakan tipe union `OverlayType` untuk memastikan eksklusivitas visual.
- **Flex-Column Viewport Layout**: Mengganti absolute positioning dengan Flexbox `min-h-screen` dan `flex-col` untuk stabilitas layout.
- **Metadata-Rich Payload**: Mengintegrasikan `activeMood` dan `context` ke dalam setiap request mentor.
- **GPU-First Rendering**: Menerapkan `transform-gpu` dan `will-change` pada layer visual kritis.
- **Mood SSOT**: Menjadikan `activeMood` sebagai sumber kebenaran tunggal untuk audio dan visual.

## 4. File yang Diubah (Modified Files)
- `src/features/versehub/pages/VersehubReaderPage.tsx`: Refaktor total layout, state management, dan sinkronisasi mood.
- `src/components/versehub/MentorPanel.tsx`: Update API bridge untuk mendukung metadata penuh.

## 5. Before vs After
### Overlay State
- **Before**: `const [exploreOpen, setExploreOpen] = useState(false); ...`
- **After**: `const [overlay, setOverlay] = useState<OverlayType>(null);` (Singleton)

### Layout Logic
- **Before**: `pb-28` fixed + absolute positioning.
- **After**: `flex flex-col` + `padding-bottom: calc(280px + env(safe-area-inset-bottom))` pada container teks.

### Mentor Payload
- **Before**: `{ question: q }`
- **After**: `{ question: q, context: 'versehub_reader', mood: activeMood, verse_id: ..., intent: 'deep_study' }`

## 6. Acceptance Criteria Status
- [x] Overlay Singleton Logic (Lolos)
- [x] Zero-Scroll / Geometry Constraint (Lolos)
- [x] Mentor Payload Metadata (Lolos)
- [x] Mood Synchronization (Lolos)
- [x] Performance & GPU Acceleration (Lolos)

## 7. Risiko Regresi (Regression Risks)
- Pastikan Safe Area Inset terbaca dengan benar di browser Android/Chrome (menggunakan env fallback).
- Transisi audio crossfade mungkin terinterupsi jika overlay berganti terlalu cepat (sudah dimitigasi dengan Singleton state).

## 8. Langkah Validasi Manual (Validation Steps)
1. Buka VerseHub di viewport mobile (375px width).
2. Buka "Explore" -> Pastikan tombol audio/picker tertutup otomatis.
3. Scroll ke bawah ayat -> Pastikan tidak ada overlap dengan CTA bawah.
4. Klik "Tanya Mentor" -> Tanya sesuatu -> Cek Network Tab -> Pastikan payload memuat `mood` dan `context`.
5. Ganti mood -> Pastikan ambience audio sinkron.
