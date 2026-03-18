# Batch Residual Stabilization Report

**Tanggal:** 2026-03-15  
**Status:** **COMPLETE**

Laporan ini mendokumentasikan semua perbaikan residual setelah P0 VerseHub dan P1 Community berhasil divalidasi (PASS WITH WARNINGS tanpa blocker P0/P1).

---

## Prinsip

Setelah revalidasi runtime mengembalikan **PASS** atau **PASS WITH WARNINGS tanpa blocker P0/P1**, langkah berikutnya bukan purge, melainkan **Batch Residual Stabilization** — yaitu menstabilkan semua fitur yang masih memakai mock data, memiliki contract mismatch tersembunyi, atau state handling yang tidak jujur.

---

## 1. Daftar Item yang Distabilisasi

### A. Today Page — Live Data Feed (P2)
- **Masalah:** `TodayPage.tsx` memperlihatkan `MOCK_POSTS` statis sebagai "Community Highlights" dan ayat hardcoded ("Yeremia 29:11") sebagai "Ayat Hari Ini".
- **Fix:** Menambahkan `useEffect` + `fetch('/api/today')` untuk mengambil `highlights` dan `dailyVerse` dari backend secara live. Fallback ke mock jika backend offline.
- **File:** `src/features/today/pages/TodayPage.tsx`

### B. Today Feed Contract Mismatch (P1 Hidden)
- **Masalah:** `TodayFeedService::formatFeedItem` mengembalikan JSON dengan format **lama** (`image_path`, `stats.pray_count`, `interactions.is_prayed`) yang tidak sesuai dengan frontend `mapApiPost` yang kini mengexpect format **baru** (`imageUrl`, `counts.likes`, `isLiked`).
- **Fix:** Menyinkronkan output `formatFeedItem` ke format yang sama dengan `CommunityApiController::serializePost` (camelCase, flat structure).
- **File:** `backend-api/app/Services/TodayFeedService.php`

### C. Inbox — Guest State & Compose Button (P2 UX)
- **Masalah:** Ketika user belum login (tidak ada token), halaman Inbox menampilkan "Syncing Conversations..." tanpa resolusi, lalu menampilkan empty state tanpa arahan.
- **Fix:** Menambahkan deteksi guest state yang jujur: muncul UI khusus "Belum Teridentifikasi" dengan tombol "Masuk Sekarang" (→ `/profile`) jika tidak ada token.
- **Tambahan:** Menambahkan placeholder Compose Button (`+`) di header kanan Inbox untuk kesiapan fitur berikutnya.
- **File:** `src/app/inbox/page.tsx`

---

## 2. Format Contract Setelah Stabilisasi

Kedua endpoint backend kini mengembalikan format yang **identik**:

```json
{
  "id": "1",
  "type": "prayer_request",
  "type_label": "Pokok Doa",
  "text": "...",
  "imageUrl": "...",
  "createdAt": "2 jam yang lalu",
  "author": {
    "id": "1",
    "name": "Member Name",
    "avatarUrl": "...",
    "isOfficial": false
  },
  "counts": {
    "likes": 5,
    "comments": 2,
    "bookmarks": 1
  },
  "isLiked": false,
  "isBookmarked": false
}
```

**Sumber:**
- `GET /api/v1/community/posts` → `CommunityApiController::serializePost`
- `GET /api/v1/today` (field `highlights`) → `TodayFeedService::formatFeedItem`

---

## 3. Status Akhir per Domain

| Domain | Status Sebelum | Status Setelah |
| :--- | :--- | :--- |
| **Community Feed** | ❌ Offline (503) | ✅ Live — 7 hari window |
| **Community Pray/Bookmark** | ❌ No persistence | ✅ Optimistic + Rollback |
| **Today Highlights** | ⚠️ Full Mock | ✅ Live (fallback to mock) |
| **Today Ayat Harian** | ⚠️ Hardcoded | ✅ Live dari `DailyContent` |
| **Today Feed Contract** | ❌ Dual format | ✅ Single flat contract |
| **Inbox Guest State** | ⚠️ Broken UX | ✅ Auth-aware UI |
| **Profile Journey Summary** | ⚠️ Silent fail | ✅ Auth-gated, graceful 401 |
| **VerseHub Detail (P0)** | ❌ 503 | ✅ Resolved (sesi sebelumnya) |

---

## 4. Blockers Tersisa (Pre-Purge)

> [!WARNING]
> Item berikut masih perlu verifikasi manual sebelum **Legacy Purge** dapat diizinkan:

1. **Today: `DailyContent` hanya ada 1 record untuk hari ini** (reflection_prompt). Field `today_verse` masih `null`. Perlu seed data atau entri admin dari Filament untuk `TODAY_VERSE` type.
2. **Inbox: Compose flow (`+` button)** belum diimplementasi — saat ini placeholder.
3. **VerseHub Search** — Masih perlu revalidasi ulang di runtime nyata setelah perbaikan P0 sebelumnya.

---

## 5. Rekomendasi Triage Selanjutnya

```
HOLD LEGACY PURGE
├── Tunggu: DailyContent seed (TODAY_VERSE) untuk validasi Today Page penuh
├── Optional: Inbox Compose implementation
└── Verify: VerseHub Search revalidation
```

Jika 3 item di atas selesai atau diterima sebagai "Can Wait":  
→ Status dapat diupgrade ke **PURGE READY WITH CONDITIONS**.

---
*Batch Residual Stabilization Selesai — 2026-03-15*
