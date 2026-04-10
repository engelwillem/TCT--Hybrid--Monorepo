# Prioritized Roadmap: Personalized Share Platform

Peta jalan implementasi platform share terpadu untuk TheChosenTalks.

## Batch 1: Hardening & Parity (Sekarang - 2 Minggu)
**Objective**: Memperbaiki issue kritis dan merapikan pondasi yang ada.

*   **Pekerjaan Utama**:
    *   Handle Issue B1: Perbaikan loading avatar di mobile (Community).
    *   Normalisasi URL Share: Memastikan semua link share menggunakan protokol kanonik yang sama dari `lib/share.ts`.
    *   Harden `isPrivate` check: Mencegah sharing konten "Private Renungan" di level UI.
*   **Risk**: Low. Fokus pada bug fixes.
*   **Impact**: UX fundamental di Community menjadi stabil.

## Batch 2: Universal Integration (Minggu 3 - 5)
**Objective**: Migrasi seluruh fitur ke `SharePayload` universal.

*   **Pekerjaan Utama**:
    *   Refactor `TodayShareActionBar` untuk mendukung `navigator.share`.
    *   Penyatuan logic `fetchShareData` di `lib/share-content.ts` untuk semua domain.
    *   Implementasi `UniversalShareOverlay`: Satu komponen UI untuk handle Copy Link, WA, dan Native Share di satu tempat.
*   **Risk**: Medium. Melibatkan refactoring di banyak file.
*   **Impact**: Konsistensi UI/UX share di seluruh aplikasi.

## Batch 3: Personalized Snapshots (Minggu 6+)
**Objective**: Memberikan fitur share yang "WOW" dan personal.

*   **Pekerjaan Utama**:
    *   **VerseHighlight Snapshot**: Memberikan opsi share ayat dengan visual highlight (bukan sekadar link).
    *   **Ritual Summary Card**: Share ringkasan perenungan harian dalam bentuk card artistik.
    *   **Edge OG Enhancement**: Optimasi performa render OG image dengan caching yang lebih agresif.
*   **Risk**: High. Kompleksitas visual di level server-side rendering (Satori).
*   **Impact**: Virality & Brand Exposure (Brand Awareness TCT meningkat di sosmed).

---
*Roadmap updated 2026-04-09*
