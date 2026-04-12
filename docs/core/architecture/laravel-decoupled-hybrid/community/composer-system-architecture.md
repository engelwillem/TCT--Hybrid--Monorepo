# Composer System Architecture: /community

**Role**: Senior Systems & Product Architect
**Status**: Production Handoff
**Scope**: Community PostComposer System

---

## 1. Objective
Membangun sistem Composer yang modular, terukur (scalable), dan stabil secara asinkron untuk mendukung ekspresi komunitas yang berkualitas premium. Arsitektur ini menggantikan pendekatan monolitik dengan pemisahan domain yang jelas.

## 2. Current Architecture Problems
- **Monolithic State**: Logika teks, media, dan cropping bercampur dalam satu komponen besar (>900 baris).
- **Fragile Transitions**: Transisi antara state "expanded" dan "modal crop" seringkali tidak sinkron.
- **Cognitive Load**: Sulit untuk menambahkan fitur baru (seperti draf atau mentions) karena keterikatan state yang sangat ketat.
- **Layout Instability**: Pemrosesan media sering menyebabkan pergeseran tata letak yang tidak terduga.

## 3. Target Composer System
Sistem akan dibagi menjadi **Orchestrator** (Komponen UI Utama) dan **Domain Hooks** (Logika Bisnis).

### Domain Breakdown
1. **Lifecycle Domain**: Mengatur pembukaan/penutupan, fokus, dan pembersihan state.
2. **Text Domain**: Mengatur input teks, validasi panjang karakter, dan auto-resize input.
3. **Type/Category Domain**: Mengatur seleksi jenis post (Quotes, Testimony, dll).
4. **Media Domain**: Mengatur queue gambar, pemilihan cover, dan preview URL.
5. **Crop Domain**: Mengatur integrasi dengan Dialog Editor untuk transformasi gambar.
6. **Submit Domain**: Mengatur komunikasi API, guard double-submit, dan error handling.

---

## 4. Lifecycle & State Model

### Primary States
- `IDLE`: Kondisi tertutup (collapsed). Hanya menampilkan prompt singkat.
- `EXPANDED`: Kondisi penulisan aktif. Semua kontrol (chips, action bar) terlihat.
- `PROCESSING`: Kondisi saat gambar sedang di-*crop* atau diproses.
- `SUBMITTING`: Kondisi saat mengirim data ke Laravel API.
- `SUCCESS/RESET`: Pembersihan total setelah berhasil post.

### State Transitions
- `IDLE` -> `EXPANDED` (Trigger: Focus / Text Input)
- `EXPANDED` -> `PROCESSING` (Trigger: Media Added / Edit Position)
- `EXPANDED` -> `SUBMITTING` (Trigger: Click Post / Submit)
- `SUBMITTING` -> `IDLE` (Trigger: Success Callback)

---

## 5. Module & File Recommendations

### Core Components
- `PostComposer.tsx`: Orchestrator utama yang menggabungkan semua domain hooks.
- `ComposerView.tsx`: Presentational component yang menangani layout Shell, Input, Chips, dan Action Bar.

### Domain Hooks (`src/features/community/hooks/`)
- `useComposerLifecycle.ts`: `isExpanded`, `onExpand`, `onReset`.
- `useComposerText.ts`: `text`, `setText`, `textValidation`.
- `useComposerMedia.ts`: `images`, `previewUrls`, `addImage`, `removeImage`.
- `useComposerSubmit.ts`: `isSubmitting`, `error`, `executeSubmit`.

---

## 6. Async Safety & Performance
- **Double Submit Prevention**: Tombol post dinonaktifkan secara otomatis saat `isSubmitting` bernilai true.
- **Memory Leak Protection**: Preview URL (Blob) harus dibersihkan melalui `URL.revokeObjectURL` di dalam `useEffect` pembersihan atau saat reset.
- **Debounced Resize**: Auto-resize pada textarea menggunakan `requestAnimationFrame` untuk menghindari *layout thrashing*.

## 7. Null/Fallback Identity Handling
- Sistem harus menerima `currentUser` sebagai opsional.
- Jika `currentUser` tidak ada (belum login), sistem tetap mengizinkan penulisan lokal (draft di memori) tetapi akan memicu `AuthExecutionGate` saat tombol "Bagikan" diklik.

---

## 8. Implementation Roadmap

### Phase 1: Implement Now
- Restrukturisasi folder `hooks/` untuk domain-domain di atas.
- Implementasi UI "Native" (Avatar, Chips, Action Bar) dalam orchestrator.
- Sinkronisasi `currentUser` dari `useAuthSession`.

### Phase 2: Defer
- Fitur Simpan Draf otomatis.
- Implementasi `@mentions` menggunakan library pihak ketiga.
- Preview link otomatis (Rich Metadata).

---

*Documented by Antigravity Frontend Architecture Strategist*
