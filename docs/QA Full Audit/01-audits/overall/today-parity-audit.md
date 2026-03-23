# Today Parity Audit

## 1. Ringkasan Masalah
Endpoint production Today dapat mengembalikan data minimal:
- `dailyVerse: null`
- `rituals: []`
- `highlights: []`
- `spiritual_state: "fresh"`

Pada kondisi ini, frontend harus tetap terasa intentional (bukan terlihat rusak/kosong).

## 2. Bukti Respons Backend
Endpoint:
- `https://api.thechoosentalks.org/api/v1/today?lang=id`

Respons nyata yang dijadikan dasar audit:
```json
{"data":{"dailyVerse":null,"rituals":[],"highlights":[],"spiritual_state":"fresh"}}
```

## 3. Audit Backend Today
### File yang diaudit
- `backend-api/app/Http/Controllers/Api/V1/TodayApiController.php`
- `backend-api/app/Services/TodayFeedService.php`
- `backend-api/app/Models/MemberPost.php` (scope `active()`)

### Temuan backend
1. Contract Today valid dan konsisten:
   - `dailyVerse` dari `rituals.today_verse` (bisa `null`).
   - `rituals` dari hasil koleksi daily content (saat kosong dapat terserialisasi menjadi `[]`).
   - `highlights` dari feed aktif (`MemberPost::active()`), bisa kosong.
2. Tidak ditemukan bug backend fatal pada kontrak; kondisi minimal ini merupakan state data production yang sah.

## 4. Audit Frontend Today
### File yang diaudit
- `src/app/today/page.tsx` (surface aktif route `/today`)
- `src/services/today.service.ts`
- `src/app/today/components/feed/FeedList.tsx`
- `src/components/versehub/DailyVerseHeroCard.tsx`
- `src/features/today/pages/TodayPage.tsx` (terdeteksi sebagai varian lama/non-route aktif)

### Temuan frontend
1. Route aktif menggunakan `src/app/today/page.tsx`.
2. Frontend sudah memiliki fallback verse (`fallbackDailyVerse`) dan empty feed card (`FeedList`).
3. Weakness parity/UX yang ditemukan:
   - `rituals` dari backend dapat berupa `[]`, sementara frontend semantically memperlakukan sebagai object.
   - Saat semua data minimal, halaman masih berjalan tetapi belum memberi penjelasan eksplisit yang intentional bahwa konten harian sedang dipersiapkan.

## 5. Akar Mismatch / UX Weakness
Weakness utama ada di frontend resilience/UX, bukan di contract backend:
1. Shape tolerance kurang eksplisit untuk `rituals` kosong (`[]`).
2. State data minimal belum memiliki messaging khusus, sehingga pengalaman terasa datar meski tidak crash.

## 6. Perbaikan yang Dilakukan (jika ada)
Patch minimal pada `src/app/today/page.tsx`:
1. Menambahkan normalizer `normalizeRituals()` agar frontend tahan terhadap `rituals: []` dan menormalkan ke object kosong.
2. Menambahkan `hasMinimalTodayData` untuk mendeteksi kondisi:
   - `dailyVerse` null
   - `rituals` kosong
   - `highlights` kosong
3. Menambahkan card “Mode Tenang” (intentional empty-state UX) dengan tone spiritual dan CTA jelas ke:
   - `/versehub/id`
   - `/community`

Tidak ada perubahan backend.

## 7. Status Akhir
- Frontend Today tetap stabil pada data production minimal.
- Empty-state kini lebih intentional, tidak misleading, dan tetap menjaga spiritual tone.
- Contract backend tetap dipertahankan (no breaking change).

## 8. Rekomendasi Langkah Berikutnya
1. Content ops: isi `today_verse`, ritual harian, dan highlights agar state minimal tidak berkepanjangan.
2. Tambahkan smoke test frontend untuk skenario minimal:
   - `dailyVerse=null`, `rituals=[]`, `highlights=[]`.
3. Opsional jangka menengah: standardisasi backend agar `rituals` kosong selalu object (`{}`) untuk konsistensi semantik.
