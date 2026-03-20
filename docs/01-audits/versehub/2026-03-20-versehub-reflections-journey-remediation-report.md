# VerseHub Reflections + Journey Remediation Report (2026-03-20)

## Issue Summary
Surface VerseHub Reflections dan My Spiritual Journey masih memakai mock/stub frontend sehingga tidak sinkron dengan backend Laravel yang sudah tersedia.

## Initial Mock Surfaces
- `src/app/versehub/[lang]/reflections/page.tsx`
  - memakai `setTimeout` + array statis reflection.
- `src/app/versehub/[lang]/my-spiritual-journey/page.tsx`
  - memakai `setTimeout` + activity/stats statis.
- `src/app/reflections/[slug]/page.tsx`
  - memakai konten detail dummy/statis.

## Backend Endpoints Actually Available
- `GET /api/v1/versehub/{lang}/reflections` (auth:sanctum)
  - source: `VerseHubReflectionController@index`
  - response: `data.items[]` + `data.meta`.
- `POST /api/v1/versehub/{lang}/reflections` (auth:sanctum)
  - source: `VerseHubReflectionController@store`.
- `GET /api/v1/versehub/{lang}/actions/summary` (guest-safe)
  - source: `VersehubActionController@summary`
  - response: `favorites[]`, `bookmarks[]`, `notes[]`, `counts`.

Gap backend:
- Tidak ada endpoint detail khusus reflection by slug/id (`GET /api/v1/versehub/{lang}/reflections/{id|slug}` belum tersedia).

## Remediation Applied
1. Reflections List (`/versehub/[lang]/reflections`)
   - mock data dihapus.
   - sekarang fetch ke endpoint nyata: `/api/versehub/${lang}/reflections`.
   - state jujur ditambahkan:
     - loading
     - auth required (jika token tidak ada / 401/403)
     - empty
     - error.
   - detail CTA diarahkan ke `/reflections/{id}?lang={lang}`.

2. My Spiritual Journey (`/versehub/[lang]/my-spiritual-journey`)
   - mock activity/stats dihapus.
   - sekarang fetch ke endpoint nyata: `/api/versehub/${lang}/actions/summary?limit=200&sort=recent`.
   - data `favorites/bookmarks/notes` dimap ke timeline activity nyata.
   - stats dihitung dari data nyata:
     - `total_saved` dari `counts`
     - `this_week` dari timestamp item
     - `streak` dari hari unik berurutan.
   - state jujur:
     - loading
     - empty
     - error.

3. Reflection Detail (`/reflections/[slug]`)
   - dummy article dihapus.
   - karena endpoint detail belum ada, page mengambil daftar reflection nyata (`/api/versehub/${lang}/reflections`) lalu resolve item dari:
     - `id === slug` atau
     - `verse_ref === slug`.
   - bila tidak ketemu, tampilkan state PARTIAL jujur bahwa endpoint detail by slug belum tersedia.

## Surfaces Still Blocked And Why
- Reflection Detail: **PARTIAL**
  - alasan: backend belum menyediakan endpoint detail dedicated per slug/id.
  - implementasi saat ini memakai fallback aman dari list endpoint.

## Verification Evidence
- Audit route backend:
  - `backend-api/routes/api.php` memuat route reflections list/store dan actions summary.
- Audit controller:
  - `VerseHubReflectionController@index/store` tersedia.
  - `VersehubActionController@summary` tersedia.
- Mock removal check:
  - pencarian `setTimeout|DUMMY|dummy|Mock|simulate` pada 3 file target tidak menemukan kecocokan.
- Type safety:
  - `npm run typecheck` lulus.

## Final Status Per Surface
- Reflections list: **LIVE** (auth-gated by backend contract).
- Reflection detail: **PARTIAL** (karena endpoint detail belum ada, resolve dari list).
- My Spiritual Journey: **LIVE** (data nyata dari actions summary).

## Overall VerseHub Status
`PARTIAL`  
Mayoritas mock pada reflections list + journey sudah dihapus dan diganti data nyata. Sisa partial hanya pada reflection detail endpoint dedicated.
