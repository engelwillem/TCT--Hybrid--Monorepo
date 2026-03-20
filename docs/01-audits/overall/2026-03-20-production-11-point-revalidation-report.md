# Production Revalidation Report (11-Point Follow-up) — 2026-03-20

## Scope
Revalidasi live setelah push commit `4befdeb` untuk memastikan perbaikan production berjalan dan memetakan issue yang masih tersisa dari 11 keluhan user.

## Deploy + CI status
- GitHub Actions `Frontend Monorepo Checks` run `23352396998`: success.
- Commit sudah ter-push ke `main` dan rollout live terdeteksi (metadata/asset berubah sesuai patch).

## Endpoint/route live checks
- `https://www.thechoosentalks.org/` -> `200`
- `https://www.thechoosentalks.org/today` -> `200`
- `https://www.thechoosentalks.org/community` -> `200`
- `https://www.thechoosentalks.org/paths` -> `200`
- `https://www.thechoosentalks.org/versehub/id` -> `200`
- `https://www.thechoosentalks.org/profile` -> `200`
- `https://www.thechoosentalks.org/api/today` -> `200`
- `https://www.thechoosentalks.org/api/community/posts` -> `200`
- `https://www.thechoosentalks.org/api/versehub/id/books` -> `200`
- `https://www.thechoosentalks.org/api/versehub/id/chapter/mzm-23` -> `200`
- `https://www.thechoosentalks.org/api/versehub/id/chapter/mzm-23-1` -> `200`
- `https://www.thechoosentalks.org/favicon.png` -> `200`

## 11-point issue revalidation
1. Browser tab logo salah (harus T-mark): `LIVE`  
   Evidence: live `/favicon.png` sudah T-mark.

2. Font brand tidak parity dengan Laravel legacy: `LIVE`  
   Evidence: live CSS mengandung stack `Inter, system-ui, -apple-system`.

3. Background tambahan/noise mengganggu: `LIVE` (global shell), `PARTIAL` (per-page visual QA lanjutan)  
   Evidence: rule pattern global `.tct-global-background::before` sudah hilang di live CSS.

4. `/versehub/id` delay/error sinkronisasi backend: `LIVE`  
   Evidence: books endpoint `200`, chapter endpoint normalized (`mzm-23-1`) `200`.

5. `/paths` memburuk layout/font/background: `DRIFT`  
   Evidence: butuh visual QA manual (HTTP health normal, UX complaint masih ada).

6. `/community` OG text casing salah: `LIVE`  
   Evidence: `og:title` dan `og:image:alt` kini `The Chosen Talks - The Chosen People`.

7. `/community` feed unavailable: `LIVE`  
   Evidence: `/api/community/posts` `200` dengan payload `posts/archivePosts`.

8. `/profile` avatar tidak tampil: `PARTIAL`  
   Evidence: API profile mengembalikan `avatar_url=/storage/avatars/...jpg`, namun file avatar tersebut `404` di origin API dan origin web; fallback frontend bekerja, tetapi source image upstream belum tersedia.

9. Console error `Failed to fetch posts: 503`: `LIVE`  
   Evidence: endpoint komunitas kini `200` pada recheck pasca deploy.

10. Mobile bottom nav sulit dijangkau: `PARTIAL`  
   Evidence: offset nav sudah diturunkan di source, perlu validasi real-device (360/390/430) untuk keputusan final.

11. Halaman `/` tidak bisa diakses: `LIVE`  
   Evidence: root route sekarang `200` pada live check.

## Root causes confirmed from revalidation
- Mass 503 sebelumnya: terkait proxy/base URL runtime drift, sekarang pulih pada endpoint inti.
- Avatar profile: bukan murni renderer saat ini; ada gap asset availability (`/storage/avatars/...` 404) yang membuat fallback tetap aktif.
- Sisa regressi utama yang belum closed: kualitas visual Paths dan ergonomi mobile nav (butuh QA visual/device).

## Files related to this revalidation cycle
- `src/lib/laravel-api.ts`
- `src/app/api/versehub/[lang]/chapter/[slug]/route.ts`
- `src/features/versehub/pages/VersehubReaderPage.tsx`
- `src/app/layout.tsx`
- `src/app/globals.css`
- `src/layouts/AppShell.tsx`
- `src/app/profile/page.tsx`
- `docs/09-handover/next-actions.md`

## Final status summary
- `LIVE`: 8 poin
- `PARTIAL`: 2 poin
- `DRIFT`: 1 poin

Overall production recovery status: `PARTIAL` (mayoritas blocker runtime pulih, tersisa avatar upstream asset issue + UX debt spesifik).
