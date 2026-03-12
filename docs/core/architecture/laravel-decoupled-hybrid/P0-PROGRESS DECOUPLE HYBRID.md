Selesai. Batch yang Anda minta sudah saya kerjakan dan dipush ke `frontend-prod`.

`dev` dan `build` sudah lolos:
- `npm run typecheck` ✅
- `npm run build` ✅
- `npx next dev -p 9011` berhasil start (terbukti port listening), lalu saya terminate proses test supaya bersih ✅

Perubahan utama:
- Study Paths sudah API-first end-to-end (Laravel `api/v1` + Next proxy + halaman Next tidak mock lagi):
  - [api.php](/e:/thechoosentalksnext/backend-api/routes/api.php)
  - [StudyPathController.php](/e:/thechoosentalksnext/backend-api/app/Http/Controllers/StudyPathController.php)
  - [study index page.tsx](/e:/thechoosentalksnext/src/app/versehub/[lang]/study/page.tsx)
  - [study detail page.tsx](/e:/thechoosentalksnext/src/app/versehub/[lang]/study/[slug]/page.tsx)
- Channels + Weekly + Sabbath School sudah API-first core flow:
  - [ChannelController.php](/e:/thechoosentalksnext/backend-api/app/Http/Controllers/ChannelController.php)
  - [WeeklyController.php](/e:/thechoosentalksnext/backend-api/app/Http/Controllers/WeeklyController.php)
  - [SabbathSchoolController.php](/e:/thechoosentalksnext/backend-api/app/Http/Controllers/SabbathSchoolController.php)
  - [ChannelMembershipController.php](/e:/thechoosentalksnext/backend-api/app/Http/Controllers/ChannelMembershipController.php)
  - [channels page.tsx](/e:/thechoosentalksnext/src/app/channels/page.tsx)
  - [weekly index page.tsx](/e:/thechoosentalksnext/src/app/channels/[slug]/page.tsx)
  - [weekly detail page.tsx](/e:/thechoosentalksnext/src/app/channels/[slug]/[date]/page.tsx)
  - [sabbath lesson page.tsx](/e:/thechoosentalksnext/src/app/channels/sabbath-school/[year]/[quarter]/lesson/[lessonNumber]/page.tsx)
  - [sabbath day page.tsx](/e:/thechoosentalksnext/src/app/channels/sabbath-school/[year]/[quarter]/lesson/[lessonNumber]/[dayKey]/page.tsx)
- Next API proxy routes baru sudah ditambahkan di:
  - [src/app/api/study-paths](/e:/thechoosentalksnext/src/app/api/study-paths)
  - [src/app/api/channels](/e:/thechoosentalksnext/src/app/api/channels)
  - [src/app/api/sabbath-school](/e:/thechoosentalksnext/src/app/api/sabbath-school)
- Audit matrix terupdate:
  - [0. AUDIT MATRIX.md](/e:/thechoosentalksnext/docs/core/architecture/laravel-decoupled-hybrid/0.%20AUDIT%20MATRIX.md)

Git:
- Commit sebelumnya (VerseHub/Inbox/Profile) sudah dipush.
- Commit batch ini: `618e875` (sudah push ke `origin/frontend-prod`).

Catatan: ada perubahan docs lama (`docs/core/architecture/laravel-hybrid/*` deleted + untracked mirror docs) yang saya sengaja tidak ikut commit agar tidak mengganggu scope integrasi API-first.

