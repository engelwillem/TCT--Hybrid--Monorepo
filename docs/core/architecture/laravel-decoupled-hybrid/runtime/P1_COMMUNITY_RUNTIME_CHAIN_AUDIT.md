# P1 Community Runtime Chain Audit (Port 9002)

**Tanggal:** 2026-03-14  
**Status Audit:** **CRITICAL CONTRACT MISMATCH IDENTIFIED**

Laporan ini merinci jalur data runtime Community untuk mengidentifikasi penyebab kegagalan fitur "Pray/Bookmark" dan masalah "Offline Feed" pada port 9002.

---

## 1. Chain Mapping (Jalur Data)

### Flow A: Load Community Feed
*   **Komponen Frontend**: `src/features/community/pages/CommunityPage.tsx`
*   **Service/Hook**: `CommunityService.listPosts()`
*   **Next Proxy Route**: `src/app/api/community/posts/route.ts`
*   **Laravel Controller**: `Api\V1\CommunityApiController@index`
*   **Expected DB Effect**: Read from `member_posts` table with `active()` scope.
*   **Status Aktual**: **FAIL/EMPTY**. Postingan menghilang setelah 24 jam karena scope `active()`.

### Flow B: Pray Interaction (Reaction)
*   **Komponen Frontend**: `MemberPostCard.tsx` -> `onPray()` props.
*   **Service**: `CommunityService.toggleLike(postId)`
*   **Next Proxy Route**: `POST /api/community/posts/[postId]/pray/route.ts`
*   **Laravel Controller**: `Api\V1\CommunityApiController@togglePray`
*   **Expected DB Effect**: Upsert (Toggle) record in `member_post_reactions` (user_id, post_id, type='pray').
*   **Status Aktual**: **FAILED VISUAL PERSISTENCE**. Database terupdate, tetapi UI tidak sinkron karena mapping response gagal.

### Flow C: Bookmark Interaction
*   **Komponen Frontend**: `MemberPostCard.tsx` -> `onBookmark()` props.
*   **Service**: `CommunityService.toggleBookmark(postId)`
*   **Next Proxy Route**: `POST /api/community/posts/[postId]/bookmark/route.ts`
*   **Laravel Controller**: `Api\V1\CommunityApiController@toggleBookmark`
*   **Expected DB Effect**: Insert/Delete record in `member_post_bookmarks`.
*   **Status Aktual**: **FAILED VISUAL PERSISTENCE**.

---

## 2. Identifikasi Akar Masalah (Root Causes)

1.  **Mismatch Response Contract (Penyebab Utama Utama)**:
    *   **Masalah**: `CommunityService.ts` (Frontend) mencoba memetakan data dari property `interactions` dan `stats`.
    *   **Fakta Backend**: Laravel mengirimkan data interaksi secara *flat* di level root objek (misal: `isLiked`, `isBookmarked`).
    *   **Akibat**: Fungsi `mapApiPost` menghasilkan objek dengan nilai `false/0` secara default karena property yang dicari (`interactions`) tidak ada di JSON, sehingga UI selalu me-reset state meskipun request sukses.

2.  **Auth Token Propagation**:
    *   `CommunityService` memanggil `getAppAccessToken()`. Jika token kedaluwarsa, proxy akan mengembalikan 503 (Unreachable) atau 401.

3.  **Feed Longevity Logic**:
    *   Scope `active()` pada Laravel memaksa post kadaluwarsa dalam 24 jam. Ini terlalu agresif untuk komunitas yang belum sangat padat, menyebabkan impresi "Web Offline".

---

## 3. File yang Harus Disentuh

1.  **`src/services/community.service.ts`**: Update interface `ApiPost` dan fungsi `mapApiPost` agar sesuai dengan `serializePost` di Laravel.
2.  **`backend-api/app/Models/MemberPost.php`**: Relaksasi scope `active()` (misal: diperpanjang ke 7 hari atau tanpa limit waktu untuk sementara).
3.  **`backend-api/app/Http/Controllers/Api/V1/CommunityApiController.php`**: Pastikan field `isLiked` dan `counts` konsisten.

---

## 4. Urutan Fix Minimum

1.  **FIX 1 (Contract Mapping)**: Perbaiki JSON mapping di `community.service.ts`. Ini adalah perbaikan prioritas tertinggi agar interaksi "nyata".
2.  **FIX 2 (Feed Scope)**: Ubah scope `active()` di model Laravel agar data lama tetap muncul saat tidak ada post baru.
3.  **FIX 3 (Error UI)**: Tambahkan feedback visual jika aksi "Pray/Bookmark" gagal karena masalah jaringan (bukan sekadar diam).

---
*Laporan Audit Rantai Runtime Community Selesai.*
