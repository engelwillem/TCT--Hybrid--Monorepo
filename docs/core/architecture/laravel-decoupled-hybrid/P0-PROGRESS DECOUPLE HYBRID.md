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

Sudah saya set aturan minimum single-branch (`main`) dan saya push ke `origin/main` commit `f8a8fba`.

Yang sudah diimplementasikan:
- Frontend checks sekarang jalan di setiap push ke `main`, lalu auto-trigger Tencent Edge via deploy hook:
  - [frontend-monorepo-checks.yml](/e:/thechoosentalksnext/.github/workflows/frontend-monorepo-checks.yml)
- Backend checks terpisah untuk PR/push yang menyentuh backend:
  - [backend-monorepo-checks.yml](/e:/thechoosentalksnext/.github/workflows/backend-monorepo-checks.yml)
- PR checklist agar backend/frontend tidak drift:
  - [pull_request_template.md](/e:/thechoosentalksnext/.github/pull_request_template.md)
- SOP + policy resmi branch/CI:
  - [SOP.md](/e:/thechoosentalksnext/docs/core/architecture/laravel-decoupled-hybrid/SOP.md)
  - [BRANCH_CI_MINIMUM_POLICY.md](/e:/thechoosentalksnext/docs/core/architecture/laravel-decoupled-hybrid/BRANCH_CI_MINIMUM_POLICY.md)

Hidden bug yang ikut saya bereskan:
- Perbaikan syntax JSX di [profile page.tsx](/e:/thechoosentalksnext/src/app/profile/page.tsx) yang sebelumnya bikin `typecheck` gagal.

Validasi lokal setelah perubahan:
- `npm run typecheck` ✅
- `npm run build` ✅

Agar otomatis penuh di platform:
1. Set GitHub secret `TENCENT_EDGE_DEPLOY_HOOK_URL` (wajib, kalau kosong workflow akan gagal by design).
2. Aktifkan branch protection `main` dan jadikan required checks:
   - `Frontend Monorepo Checks / frontend-checks`
   - `Backend Monorepo Checks / backend-checks`
3. Biarkan backend deploy tetap via [backend-cpanel-deploy.yml](/e:/thechoosentalksnext/.github/workflows/backend-cpanel-deploy.yml) (khusus perubahan `backend-api/**`).

Batch parity `Today cards` sudah saya lanjutkan dan implementasikan ke baseline Laravel legacy untuk kartu inti berikut:

- [ReflectionPrompt.tsx](e:/thechoosentalksnext/src/app/today/components/cards/ReflectionPrompt.tsx)
- [QuoteCard.tsx](e:/thechoosentalksnext/src/app/today/components/cards/QuoteCard.tsx)
- [DailyPrayerCard.tsx](e:/thechoosentalksnext/src/app/today/components/cards/DailyPrayerCard.tsx)
- [CommunityCard.tsx](e:/thechoosentalksnext/src/app/today/components/cards/CommunityCard.tsx)
- [QuestionOfTheDay.tsx](e:/thechoosentalksnext/src/app/today/components/cards/QuestionOfTheDay.tsx)
- [TalkCard.tsx](e:/thechoosentalksnext/src/app/today/components/cards/TalkCard.tsx)
- [ReflectionCard.tsx](e:/thechoosentalksnext/src/app/today/components/cards/ReflectionCard.tsx)
- [PinnedLessonCard.tsx](e:/thechoosentalksnext/src/app/today/components/cards/PinnedLessonCard.tsx)

Paritas yang ditarik: radius/spacing/token warna, hierarchy teks, CTA style/order, serta interaksi utama (terutama `QuoteCard` termasuk komentar sheet + reaction/bookmark/share flow ala legacy).

Dokumentasi matrix juga saya update di [UI_UX_PARITY_GUIDE.md](e:/thechoosentalksnext/docs/core/architecture/laravel-decoupled-hybrid/UI_UX_PARITY_GUIDE.md) dengan log batch kartu Today ini (status `/today` tetap `IN PROGRESS`, tapi sudah naik signifikan menuju `PARITY DONE`).

Verifikasi teknis:
- `npm run typecheck` ✅ lolos
- `npm run build` ✅ lolos (perlu run di luar sandbox karena `spawn EPERM` di sandbox)
- Dev smoke test ✅ server bisa listen (`DEV_OK_9011`)
- `npm run lint` ⛔ belum bisa dipakai karena project belum punya konfigurasi ESLint (masih prompt interaktif `next lint`)

Jika kamu setuju, saya lanjut batch final `/today` untuk menutup gap sisa di level page composition/state agar status bisa saya naikkan ke `PARITY DONE`.
