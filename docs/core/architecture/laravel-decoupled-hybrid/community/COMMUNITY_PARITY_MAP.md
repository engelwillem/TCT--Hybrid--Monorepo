# Community Domain Parity Map

**Status:** Ready for Batch 1 Execution  
**Source of Truth:** `/docs/archive/TCT-Laravel-Legacy/resources/js/Pages/Community/Index.tsx`  
**Target:** `src/features/community/pages/CommunityPage.tsx`

---

## 1. Core Flows & Pages

| Flow Name | Legacy Logic | Next.js Implementation | Status | Gap Key |
|---|---|---|---|---|
| **Active Feed** | Chronological + Featured | `CommunityPage.tsx` | **PARTIAL** | Infinite scroll vs fetch-all mismatch |
| **Post Creation** | Multipart Form (Text+Images) | `PostComposer.tsx` | **DONE** | Validated in Residual Hardening |
| **Post Interaction** | Pray (Like) & Bookmark | `MemberPostCard.tsx` | **DONE** | Sync with MySQL active |
| **Discussion** | Nested Comments Sheet | `CommentsSheet.tsx` | **PARTIAL** | Nested reply UI depth & guest name validation |
| **Archive** | Grouped by Date (Today/Yesterday) | `CommunityPage.tsx` | **PARTIAL** | Grouping logic parity (Client vs Server) |
| **Moderation** | Admin Actions (Hide/Extend) | `MemberPostCard.tsx` | **NOT STARTED** | Admin-only visibility gating |

---

## 2. Route & API Mapping

| Legacy Route | Next Route | API Proxy | Laravel Backend Endpoint |
|---|---|---|---|
| `GET /community` | `GET /community` | `/api/community/posts` | `GET /api/v1/community/posts` |
| `POST /community/posts` | `POST /api/community/posts` | N/A (Direct Proxy) | `POST /api/v1/community/posts` |
| `POST /.../pray` | `POST /api/.../pray` | N/A (Direct Proxy) | `POST /api/v1/community/posts/{id}/pray` |
| `POST /.../bookmark`| `POST /api/.../bookmark`| N/A (Direct Proxy) | `POST /api/v1/community/posts/{id}/bookmark` |
| `GET /.../comments` | `GET /api/.../comments` | N/A (Direct Proxy) | `GET /api/v1/community/posts/{id}/comments` |

---

## 3. Component Parity Audit

### A. Post Card (`MemberPostCard.tsx`)
- **Visual**: Spacing between author and text must match legacy 32px (currently 24px).
- **Interaction**: Haptic feedback on 'Pray' button needs to be stronger (18ms vibrate).
- **Data**: Must support `media_paths` array for carousels (parity with legacy `media_links`).

### B. Post Composer (`PostComposer.tsx`)
- **Visual**: Layout variants (Twitter style, Classy Quote) must be selectable.
- **Interaction**: Channel selection dropdown must fetch dynamic list from `/api/channels`.
- **Logic**: Image compression before upload to avoid cPanel timeout.

### C. Comments Sheet (`CommentsSheet.tsx`)
- **Visual**: Thread lines (vertical lines connecting replies) must be visible.
- **Interaction**: "Reply to [Author]" tag must appear above the input field when replying.
- **Auth**: Support guest commenting with `localStorage` name persistence (Legacy parity).

---

## 4. Residual Gaps (Community Specific)

1.  **Archive Grouping**: Next.js is currently grouping dates on the client side. This causes "Date Drift" if the user's local timezone differs from the server (Jakarta). **Tindakan**: Pindahkan grouping logic ke Laravel API.
2.  **Social Context**: Tab "Bookmarks" di Community harus menampilkan post yang di-save dari VerseHub (lintas domain).
3.  **Moderation UX**: Tombol "Hide" dan "Extend 24h" belum terpasang di Next.js. Ini krusial untuk operasional harian.
4.  **Share Preview**: SEO Meta tags untuk `community/posts/{id}/share` harus mengarah ke generator OG yang sama dengan VerseHub.

---

## 5. Batch 1 Execution Scope (Recommended)

Untuk mencapai `PARITY DONE` pada domain Community, Batch 1 akan mengeksekusi:

1.  **Pixel-Perfect Refinement**: Penyesuaian token warna `surface` dan `spacing` agar identik dengan legacy.
2.  **Moderation Bridge**: Mengaktifkan tombol admin pada `MemberPostCard`.
3.  **Nested Discussion**: Perbaikan alur reply di `CommentsSheet`.
4.  **Dynamic Metadata**: Implementasi `generateMetadata` untuk rute share postingan.

**Verdict: READY FOR BATCH 1 EXECUTION**
*Fondasi teknis dari Batch 0 sudah cukup untuk menopang seluruh detail visual dan fungsional di atas.*
