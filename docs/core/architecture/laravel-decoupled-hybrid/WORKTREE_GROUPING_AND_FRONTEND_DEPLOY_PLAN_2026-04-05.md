# Worktree Grouping and Frontend Deploy Plan

Tanggal audit: 2026-04-05

Dokumen ini merangkum dua hal:

1. sisa worktree yang masih kotor dan cara memecahnya menjadi batch kerja yang aman
2. jalur deploy frontend production yang perlu dibuat lebih repo-driven agar parity tidak lagi bergantung pada pengecekan manual

## 1. Ringkasan Status Saat Ini

- Docker local parity untuk frontend dan backend sudah tervalidasi hidup.
- Backend cPanel production sudah punya jalur deploy release-based yang jelas.
- Frontend production publik masih hidup di platform edge terpisah.
- Repo saat ini belum punya workflow deploy frontend production yang eksplisit di kode.
- Repo juga belum punya workflow smoke check production frontend yang jalan otomatis dari GitHub Actions.

## 2. Kelompok Sisa Worktree

### Group A: Frontend product changes

File:

- [src/components/versehub/MentorPanel.tsx](/e:/thechoosentalksnext/src/components/versehub/MentorPanel.tsx)
- [src/features/versehub/pages/VersehubReaderPage.tsx](/e:/thechoosentalksnext/src/features/versehub/pages/VersehubReaderPage.tsx)

Karakter:

- perubahan UI/interaction nyata
- tidak terkait langsung dengan Docker parity
- layak diperlakukan sebagai commit fitur frontend terpisah

Risiko:

- behavior user-facing berubah
- butuh validasi UX dan build frontend

### Group B: Backend schema and parity-safe code changes

File:

- [backend-api/app/Http/Controllers/Api/V1/FirebaseAuthSyncController.php](/e:/thechoosentalksnext/backend-api/app/Http/Controllers/Api/V1/FirebaseAuthSyncController.php)
- [backend-api/database/migrations/2026_02_26_200530_create_bible_verses_fts5.php](/e:/thechoosentalksnext/backend-api/database/migrations/2026_02_26_200530_create_bible_verses_fts5.php)
- [backend-api/database/migrations/2026_03_01_235000_add_reply_to_comment_id_to_member_post_comments_table.php](/e:/thechoosentalksnext/backend-api/database/migrations/2026_03_01_235000_add_reply_to_comment_id_to_member_post_comments_table.php)

Karakter:

- sebagian hanya wording parity `MySQL` ke `MariaDB`
- migration `reply_to_comment_id` adalah perubahan struktur database yang nyata

Risiko:

- migration perlu review karena mengubah urutan add column, index, dan foreign key
- layak dipisah dari perubahan dokumentasi

### Group C: Env and README parity hygiene

File:

- [.gitignore](/e:/thechoosentalksnext/.gitignore)
- [README.md](/e:/thechoosentalksnext/README.md)
- [backend-api/.env.example](/e:/thechoosentalksnext/backend-api/.env.example)
- [backend-api/.gitignore](/e:/thechoosentalksnext/backend-api/.gitignore)
- [backend-api/README.md](/e:/thechoosentalksnext/backend-api/README.md)
- [docs/core/implementation/UI_UX_PARITY_GUIDE.md](/e:/thechoosentalksnext/docs/core/implementation/UI_UX_PARITY_GUIDE.md)

Karakter:

- perubahan kecil
- mayoritas adalah penyelarasan istilah MariaDB dan default env parity

Risiko:

- rendah jika dipisah sebagai commit hygiene
- tetap perlu sinkron dengan keputusan deploy production saat ini

### Group D: Documentation relocation and structure drift

Pola utama:

- banyak file `docs/core/...` yang tampak `deleted`
- file pengganti muncul sebagai `untracked` di `docs/CORE/...`

Hasil audit hash:

- mayoritas pasangan lama dan baru identik
- artinya ini terutama batch relokasi dokumen, bukan penghapusan substansi

Contoh pasangan yang identik:

- `docs/core/architecture/ARCHITECTURE DOC DRIFT AUDIT 2026-03-23.md`
- [docs/CORE/architecture/laravel-decoupled-hybrid/ARCHITECTURE DOC DRIFT AUDIT 2026-03-23.md](/e:/thechoosentalksnext/docs/CORE/architecture/laravel-decoupled-hybrid/ARCHITECTURE%20DOC%20DRIFT%20AUDIT%202026-03-23.md)
- `docs/core/architecture/MONOREPO HYBRID LOCAL-SERVER PARITY AUDIT.md`
- [docs/CORE/architecture/laravel-decoupled-hybrid/MONOREPO HYBRID LOCAL-SERVER PARITY AUDIT.md](/e:/thechoosentalksnext/docs/CORE/architecture/laravel-decoupled-hybrid/MONOREPO%20HYBRID%20LOCAL-SERVER%20PARITY%20AUDIT.md)
- `docs/core/architecture/parity_analysis.md`
- [docs/CORE/architecture/laravel-decoupled-hybrid/parity_analysis.md](/e:/thechoosentalksnext/docs/CORE/architecture/laravel-decoupled-hybrid/parity_analysis.md)

Dokumen yang bukan rename murni:

- `TECH STACK TCT MONOREPO`
- `PULL & DEPLOY GIT CPANEL`
- `CPANEL SERVER FULL MAIN BLUEPRINT MAP`

Risiko:

- tinggi kalau dicampur dengan commit fitur
- sebaiknya diproses sebagai commit relokasi dokumen tersendiri

## 3. Urutan Commit yang Disarankan

1. `docs:` relocation batch `docs/core` ke `docs/CORE` yang identik
2. `docs:` revisi dokumen parity/deploy yang memang berubah isi
3. `chore:` env/readme parity hygiene
4. `fix:` backend migration/schema parity
5. `feat:` frontend Versehub changes

Urutan ini menjaga commit tetap mudah direview dan memudahkan rollback.

## 4. Fakta Deploy Production Saat Ini

### Backend

Verified:

- backend production berjalan dari release-based deploy
- source fetch dilakukan dari monorepo `main`
- deploy script hanya menarik `backend-api`
- traffic dialihkan dengan symlink `current`

Evidence:

- [backend-api/deploy.sh](/e:/thechoosentalksnext/backend-api/deploy.sh)
- deploy script di server `/home/thechoosentalks/deploy/apps/thechoosentalks/deploy.sh`

### Frontend

Verified:

- frontend production publik hidup di `https://www.thechoosentalks.org`
- header publik menunjukkan platform edge, bukan host cPanel backend
- repo punya CI frontend build/check
- repo belum punya workflow deploy frontend production yang eksplisit

Evidence:

- [README.md](/e:/thechoosentalksnext/README.md)
- [apphosting.yaml](/e:/thechoosentalksnext/apphosting.yaml)
- [docs/CORE/implementation/edgeone-dashboard-checklist.md](/e:/thechoosentalksnext/docs/CORE/implementation/edgeone-dashboard-checklist.md)
- [.github/workflows/frontend-monorepo-checks.yml](/e:/thechoosentalksnext/.github/workflows/frontend-monorepo-checks.yml)

## 5. Gap Parity yang Masih Tersisa

### Gap 1: Backend deploy sudah repo-driven, frontend deploy belum

Backend:

- jelas source branch
- jelas script deploy
- jelas release switch

Frontend:

- build parity ada
- smoke parity publik sebelumnya manual
- trigger deploy platform edge belum tercermin sebagai workflow repo

### Gap 2: Smoke production frontend belum otomatis

Repo sudah punya:

- [scripts/smoke-production.ps1](/e:/thechoosentalksnext/scripts/smoke-production.ps1)

Tetapi sebelum audit ini:

- belum ada workflow GitHub Actions yang menjalankan script tersebut otomatis

### Gap 3: Dokumen deploy lama masih bercampur dengan asumsi branch lama

Contoh:

- [docs/CORE/architecture/laravel-decoupled-hybrid/PLATFORM CONFIG CHECKLIST.md](/e:/thechoosentalksnext/docs/CORE/architecture/laravel-decoupled-hybrid/PLATFORM%20CONFIG%20CHECKLIST.md)

Dokumen itu masih menyimpan jejak model `frontend-prod`, sehingga perlu dibaca sebagai arsip historis, bukan baseline operasional final.

## 6. Baseline Jalur Deploy Frontend yang Disarankan

Jalur minimal yang realistis dengan kondisi repo saat ini:

1. `main` tetap menjadi source of truth tunggal untuk frontend dan backend
2. GitHub Actions frontend wajib menjaga gate `npm ci`, `npm run typecheck`, `npm run build`
3. setelah deploy frontend di platform edge, smoke check production publik harus dijalankan dari repo
4. hasil smoke check harus tersimpan sebagai artifact
5. bila smoke gagal, parity dianggap belum selesai walau build hijau

## 7. Implementasi Minimum yang Sudah Layak Dipakai

Repo perlu memiliki dua lapis untuk frontend:

- build validation
- production smoke validation

Build validation sudah ada:

- [.github/workflows/frontend-monorepo-checks.yml](/e:/thechoosentalksnext/.github/workflows/frontend-monorepo-checks.yml)

Production smoke validation ditambahkan dalam audit ini:

- [.github/workflows/frontend-production-smoke.yml](/e:/thechoosentalksnext/.github/workflows/frontend-production-smoke.yml)

## 8. Next Step yang Masih Perlu Agar Benar-Benar Setara dengan Backend

### Short term

- rapikan batch relokasi dokumen menjadi commit sendiri
- pisahkan commit backend schema dari commit frontend Versehub
- gunakan workflow smoke production setelah deploy frontend

### Medium term

- putuskan satu jalur deploy frontend yang repo-managed:
  - EdgeOne API/CLI jika tersedia
  - atau Firebase App Hosting bila memang ini target sebenarnya
- tulis satu runbook final yang menyebut:
  - source branch
  - siapa yang men-trigger deploy
  - bagaimana smoke dijalankan
  - apa kriteria rollback

### Long term

- satukan release evidence backend dan frontend dalam satu release checklist
- tambahkan perbandingan hash/commit release agar operator tahu frontend dan backend mana yang sedang live

## 9. Kesimpulan Operasional

Masalah parity sekarang bukan lagi absennya smoke test lokal Docker.

Masalah utamanya adalah:

- worktree bercampur antara fitur, env hygiene, dan relokasi dokumen
- frontend production masih belum memiliki jejak deploy yang cukup eksplisit di repo

Karena itu, pembersihan yang aman adalah memecah worktree berdasarkan kelompok di atas, lalu memakai workflow smoke production sebagai jembatan parity sampai jalur deploy frontend platform edge benar-benar repo-driven.
