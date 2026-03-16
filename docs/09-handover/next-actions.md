# Tindakan Eksekusi Selanjutnya

## The Smart Community Composer (Backend & Handoff Integration)
Ini adalah **Prioritas 1** (High Leverage).
- **Tugas Puncak:** Memodifikasi `CommunityComposer.tsx` agar ia menangkap `url search parameter` yang dilempar dari komponen `HookCard` di berbagai domain (`?intent=verse_reflection&ref=mzm-23-4`).
- **Skema Aksi:** Composer langsung otomatis *expand*, *tag* berubah sesuai parameter (mis. "Minta Doa" / "Renungkan Ayat"), serta kartu bayangan (`<DailyVerseHeroCard>` mini) dirender di dalam *textarea* composer.
- **Backend (API) Verifikasi:** Mengaliri `metadata` JSON ini via `app-laravel.ts` ke controller `/api/v1/community/posts` (Payload test pada DB lokal laravel `MemberPosts`).

## Egress Points Persebaran di Domain Verse (Integrasi Penuh)
- **VerseHub Reader Page:** Menaruh komponen `<JourneyActionButtons>` (Atau wujud murni `<HookCard>`) di ekor artikel/pembacaan bab ayat.
- **Today API Sync:** Menyambungkan `StateChips` di Homepage ke Controller `TodayApiController` (saat me-*fetch* data), atau tetap mempertahankan filter komputasional Klien saja hingga *analytics* membludak.
