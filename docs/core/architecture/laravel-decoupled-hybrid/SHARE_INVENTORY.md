# Share Inventory — TheChosenTalks (Audit 2026-04-09)

Dokumen ini berisi pemetaan teknis seluruh entry point sharing di dalam repositori `thechoosentalksnext`.

## 1. Quick Matrix

| Surface | Component | Current Strategy | URL Pattern | Dynamic OG Status | Privacy Risk |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Renungan (Today)** | `TodayShareActionBar` | WA, Copy Link | `/renungan` | Ready (`/api/og/today`) | Low |
| **VerseHub** | `useVersehubReaderActions` | Native Share, Clipboard | `/versehub/[lang]/share/[slug]` | Ready (`/api/og/versehub`) | Low |
| **Community** | `MemberPostCard` -> `ActionBar` | Native Share, Clipboard, WA | `/community/posts/[id]/share` | Ready (`/api/og/community/[id]`) | High (Private Archive) |

---

## 2. Detailed Technical Audit per Surface

### A. Community Share (The Most Complex)
*   **Entry Point**: `src/features/community/pages/CommunityPage.tsx` (handleShare).
*   **Share Page**: `src/app/community/posts/[postId]/share/page.tsx`.
*   **OG Route**: `src/app/api/og/community/[postId]/route.tsx`.
*   **Data Bridge**: `src/lib/share-content.ts` -> `fetchCommunitySharePost`.
*   **Logic**:
    *   Menggunakan `navigator.share` jika tersedia.
    *   Fallback ke Clipboard Copy.
    *   Secondary fallback ke WhatsApp Share URL.
*   **Gaps**:
    *   Pengecekan privasi (`isPrivateRenunganPost`) sudah ada di feed, tapi perlu dipastikan di level sharing (tidak boleh bisa di-share jika metadata `visibility: private_renungan_archive`).
    *   Avatar profil sering gagal load di mobile (teridentifikasi sebagai Issue B1).

### B. VerseHub Share
*   **Entry Point**: `src/features/versehub/hooks/use-versehub-reader-actions.ts` (handleShare).
*   **Infrastructure**: Menggunakan `getVerseShareUrl` dari `src/lib/share.ts`.
*   **OG Logic**: Masih berbasis metadata ayat statis dari API.
*   **Gaps**: Belum mendukung "Personalized Highlight Share" (snapshot dengan highlight kuning pilihan user).

### C. Today Ritual (Renungan)
*   **Entry Point**: `src/features/today-ritual/components/TodayShareActionBar.tsx`.
*   **Mechanism**: Sistem *Lazy Resolution*. Urutan logic: Klik -> Resolve Path via API -> Buka WA/Copy.
*   **Gaps**: Tidak menggunakan Native Share UI (navigator.share), hanya manual link. Ini mengurangi UX premium di mobile.

---

## 3. Library & Helper Status
*   **`src/lib/share.ts`**: Berisi builder URL dan utility clipboard. Cukup solid.
*   **`src/lib/share-content.ts`**: Engine inti untuk normalisasi data API menjadi payload share. Sangat modular.
*   **`src/features/og/share/generate-share-og-image`**: Engine perender image OG. Sudah siap pakai.

## 4. Known Risks & Inconsistencies
1.  **UI Inconsistency**: Beberapa surface menggunakan Native Share, yang lain menggunakan custom button (Today Ritual).
2.  **Snapshot Stale-ness**: Data share community diambil via fetch API regular. Jika post dihapus atau diubah di backend, share page mungkin *stale* atau *404* tanpa fallback design yang bagus.
3.  **Privacy Leaks**: Belum ada blokir eksplisit di level `navigator.share` untuk konten yang ditandai sebagai "Private Archive".

---
*Last Updated: 2026-04-09 by Antigravity AI*
