# PROMPT Gemini untuk aturan dokumentasi
Mulai sekarang, setiap aktivitas wajib terdokumentasi rapi di folder `docs/` dan harus mengikuti struktur dokumentasi repo yang sudah ditetapkan. Jangan membuat file docs secara acak.

Aturan dokumentasi:
1. Semua audit domain disimpan di `docs/04-domains/<domain>/audit.md`
2. Semua parity matrix domain disimpan di `docs/04-domains/<domain>/parity-matrix.md`
3. Semua patch log domain disimpan di `docs/04-domains/<domain>/change-log.md`
4. Semua verifikasi domain disimpan di `docs/04-domains/<domain>/verification.md`
5. Semua keputusan akhir domain disimpan di `docs/04-domains/<domain>/stop-gate.md`
6. Semua hasil arsitektur produk/teknis disimpan di `docs/03-architecture/...`
7. Semua hasil feature baru experience layer disimpan di `docs/05-features/<feature>/...`
8. Semua hasil testing dan E2E disimpan di `docs/06-testing/...`
9. Semua keputusan besar harus dibuat sebagai ADR di `docs/07-decisions/`
10. Setiap selesai satu langkah kerja, update juga:
   - `docs/08-changelog/daily/<tanggal>.md`
   - `docs/09-handover/current-status.md`
   - `docs/09-handover/next-actions.md`
   - `docs/09-handover/open-blockers.md`

Aturan file:
- pakai kebab-case
- jangan pakai nama file acak seperti `notes2`, `final-final`, `temp`
- isi docs harus ringkas, faktual, dan berbasis file kode nyata

Output kerja harus tetap:
TEMUAN -> PATCH PLAN -> PATCH -> VERIFIKASI -> STATUS

Tetapi selain output itu, kamu wajib membuat/update file docs yang relevan sebelum menyatakan step selesai.


# PROMPT Gemini untuk git panel
Mulai sekarang, kelola Git panel dengan disiplin tinggi.

Aturan git:
1. Sebelum patch, cek changed files dan pastikan tidak ada file liar di luar scope.
2. Setelah patch, review diff dan pastikan hanya file relevan yang berubah.
3. Pisahkan perubahan code dan docs secara logis bila perlu.
4. Jangan biarkan log, cache, artifact build, atau file eksperimen ikut masuk commit.
5. Gunakan branch naming:
   - feat/<scope>
   - fix/<scope>
   - docs/<scope>
   - refactor/<scope>
   - test/<scope>
6. Gunakan commit message format:
   - type(scope): summary
   Contoh:
   - fix(profile): restore laravel validation parity
   - docs(inbox): update parity matrix and stop gate
7. Setelah commit, pastikan working tree bersih.
8. Sebelum push ke GitHub, pastikan:
   - docs terkait sudah ter-update
   - diff sudah sesuai scope
   - tidak ada file tak relevan
   - status domain/feature tercatat di handover docs
9. Jika ada file yang mencurigakan atau perubahan di luar scope, hentikan dulu dan tandai BLOCKED, jangan commit sembrono.


# 1. Aturan keras: root harus clean
Aturan permanen repo:
1. Root repository harus tetap bersih.
2. Dilarang membuat file report, log, notes, dump, hasil audit, hasil verifikasi, atau dokumen apa pun di root.
3. Semua dokumentasi wajib ditulis hanya di folder `docs/`.
4. Semua artefak test sementara harus masuk ke folder tooling resmi atau dihapus setelah verifikasi.
5. Jika sebuah output tidak jelas harus disimpan di mana, jangan taruh di root. Pilih path yang sudah ditetapkan di `docs/`, atau tandai BLOCKED jika tidak ada kategori yang valid.
6. Jangan membuat nama file acak seperti:
   - `output.txt`
   - `notes2.md`
   - `final-final.md`
   - `write_out.txt`
   - `debug.js`
7. Jika menemukan file liar di root atau luar scope, laporkan dan rapikan sebelum lanjut kerja.

# 2. Struktur docs final yang harus dipakai
docs/
  00-governance/
    repo-rules.md
    documentation-rules.md
    git-workflow.md
    environment-parity-policy.md
    migration-master-index.md

  01-audits/
    overall/
      2026-03-16-overall-audit.md
      2026-03-16-experience-architecture-audit.md
    domains/
      profile-lifecycle-audit.md
      inbox-dm-audit.md
      community-audit.md
      today-audit.md
      versehub-audit.md

  02-roadmap/
    migration-roadmap.md
    experience-rearchitecture-roadmap.md
    mvp-build-sequence.md
    release-readiness-roadmap.md

  03-architecture/
    product/
      spiritual-relevance-engine.md
      navigation-ia.md
      content-architecture.md
    technical/
      laravel-next-hybrid-architecture.md
      api-contract-candidates.md
      deployment-topology.md
      sync-strategy.md
    data/
      content-model.md
      metadata-strategy.md
      migration-schema-map.md

  04-domains/
    profile-lifecycle/
      audit.md
      parity-matrix.md
      change-log.md
      verification.md
      stop-gate.md
    inbox-dm/
      audit.md
      parity-matrix.md
      change-log.md
      verification.md
      stop-gate.md
    community/
      audit.md
      parity-matrix.md
      change-log.md
      verification.md
      stop-gate.md
    today/
      audit.md
      parity-matrix.md
      change-log.md
      verification.md
      stop-gate.md
    versehub/
      audit.md
      parity-matrix.md
      change-log.md
      verification.md
      stop-gate.md

  05-features/
    relevance-homepage/
      brief.md
      implementation-log.md
      verification.md
    hook-card-system/
      brief.md
      implementation-log.md
      verification.md
    reflection-template/
      brief.md
      implementation-log.md
      verification.md
    spiritual-journeys/
      brief.md
      implementation-log.md
      verification.md

  06-testing/
    e2e/
      inventory.md
      env-checklist.md
      smoke-matrix.md
      read-path-results.md
      write-path-results.md
      blocker-log.md
    parity/
      local-vs-production-checklist.md
      api-contract-diff-log.md
      database-schema-diff-log.md
      env-diff-log.md
    manual-qa/
      qa-checklist.md
      release-signoff.md

  07-decisions/
    adr-001-hybrid-ui-entrypoints.md
    adr-002-profile-route-redirect.md
    adr-003-inbox-route-redirect.md
    adr-004-community-comment-parity.md
    adr-005-experience-layer-rearchitecture.md
    adr-006-local-production-parity-policy.md

  08-changelog/
    daily/
      2026-03-16.md
      2026-03-17.md
    release-notes/
      pre-release.md

  09-handover/
    current-status.md
    next-actions.md
    open-blockers.md
    release-readiness.md


# 3. Versi isi awal file-file governance
Berikut isi awal yang ketat. Ini bisa langsung Anda kirim ke Gemini untuk dibuat/diisi.
# docs/00-governance/repo-rules.md

# Repo Rules
## Purpose
Repository ini dikelola untuk migrasi parity dan re-architecture experience pada hybrid monorepo Laravel + Next.js.

## Non-Negotiable Rules
1. Root repository harus tetap bersih.
2. Dilarang membuat report, log, dump, atau notes di root.
3. Semua dokumentasi wajib disimpan di `docs/`.
4. Semua perubahan harus mengikuti scope aktif. Jangan patch lintas domain tanpa keputusan eksplisit.
5. Jangan melakukan rewrite total jika targetnya bisa dicapai dengan patch sempit.
6. Source of truth untuk parity adalah kode legacy yang berjalan, bukan asumsi atau docs yang sudah usang.
7. Jangan menyatakan PASS jika masih ada mismatch nyata.
8. Gunakan status:
   - PASS
   - BLOCKED
   - CLOSED
9. Semua perubahan harus bisa ditelusuri melalui:
   - domain docs
   - changelog
   - handover
   - git history

## Root Cleanliness Policy
Tidak boleh ada file seperti:
- `*.txt` report
- `output.*`
- `dump.*`
- `notes.*`
- `debug.*`
- file eksperimen sementara

## Allowed Permanent Top-Level Directories
Hanya direktori yang memang bagian produk/tooling/proyek yang boleh ada di root. Dokumentasi wajib di `docs/`.

## Completion Rule
Sebuah step dianggap selesai hanya jika:
1. kode terpatch
2. verifikasi dilakukan
3. docs terkait diperbarui
4. git scope bersih

# docs/00-governance/documentation-rules.md
# Documentation Rules

## Purpose
Dokumentasi harus menjadi sistem operasi proyek, bukan arsip acak.

## Global Rules
1. Semua dokumen wajib berada di bawah `docs/`.
2. Nama file dan folder wajib `kebab-case`.
3. Dilarang membuat nama file acak seperti:
   - `final-final.md`
   - `notes2.md`
   - `temp.md`
   - `output.txt`
4. Isi dokumen harus faktual, ringkas, dan berbasis file kode nyata.
5. Jangan menulis narasi pemasaran atau spekulasi di dokumen teknis.
6. Setiap step kerja wajib meng-update dokumen yang relevan sebelum dinyatakan selesai.

## Domain Documentation Requirements
Setiap domain wajib memiliki:
- `audit.md`
- `parity-matrix.md`
- `change-log.md`
- `verification.md`
- `stop-gate.md`

## Feature Documentation Requirements
Setiap feature baru wajib memiliki:
- `brief.md`
- `implementation-log.md`
- `verification.md`

## Handover Requirements
Setiap selesai step kerja, wajib update:
- `docs/08-changelog/daily/<date>.md`
- `docs/09-handover/current-status.md`
- `docs/09-handover/next-actions.md`
- `docs/09-handover/open-blockers.md`

## Decision Records
Setiap keputusan arsitektur penting wajib ditulis sebagai ADR di `docs/07-decisions/`.


# docs/00-governance/documentation-rules.md
# Documentation Rules

## Purpose
Dokumentasi harus menjadi sistem operasi proyek, bukan arsip acak.

## Global Rules
1. Semua dokumen wajib berada di bawah `docs/`.
2. Nama file dan folder wajib `kebab-case`.
3. Dilarang membuat nama file acak seperti:
   - `final-final.md`
   - `notes2.md`
   - `temp.md`
   - `output.txt`
4. Isi dokumen harus faktual, ringkas, dan berbasis file kode nyata.
5. Jangan menulis narasi pemasaran atau spekulasi di dokumen teknis.
6. Setiap step kerja wajib meng-update dokumen yang relevan sebelum dinyatakan selesai.

## Domain Documentation Requirements
Setiap domain wajib memiliki:
- `audit.md`
- `parity-matrix.md`
- `change-log.md`
- `verification.md`
- `stop-gate.md`

## Feature Documentation Requirements
Setiap feature baru wajib memiliki:
- `brief.md`
- `implementation-log.md`
- `verification.md`

## Handover Requirements
Setiap selesai step kerja, wajib update:
- `docs/08-changelog/daily/<date>.md`
- `docs/09-handover/current-status.md`
- `docs/09-handover/next-actions.md`
- `docs/09-handover/open-blockers.md`

## Decision Records
Setiap keputusan arsitektur penting wajib ditulis sebagai ADR di `docs/07-decisions/`.

# docs/00-governance/documentation-rules.md
# Git Workflow

## Branch Naming
Gunakan pola:
- `feat/<scope>`
- `fix/<scope>`
- `docs/<scope>`
- `refactor/<scope>`
- `test/<scope>`

Contoh:
- `fix/profile-lifecycle-parity`
- `feat/relevance-homepage`
- `docs/community-audit-sync`
- `test/main-apps-smoke`

## Commit Format
Gunakan format:
`type(scope): summary`

Contoh:
- `fix(inbox): restore thread detail error parity`
- `docs(governance): establish repository rules`
- `test(e2e): add smoke matrix for main apps`

## Allowed Commit Types
- `feat`
- `fix`
- `docs`
- `refactor`
- `test`
- `chore`

## Working Tree Rules
1. Sebelum patch, cek changed files.
2. Jangan commit file di luar scope.
3. Jangan commit log, dump, cache, build artifact, atau file eksperimen.
4. Review diff sebelum commit.
5. Pastikan docs relevan ikut ter-update.
6. Setelah commit, working tree harus bersih.

## Scope Discipline
Satu commit harus merepresentasikan satu unit kerja yang masuk akal. Jangan campur banyak domain tanpa alasan jelas.


# docs/00-governance/environment-parity-policy.md
# Environment Parity Policy

## Purpose
Menjaga parity perilaku antara:
- local development
- backend server (cPanel)
- frontend server (Tencent Edge)
- database dan storage yang relevan

## Principle
Parity tidak diasumsikan. Parity harus diverifikasi.

## Non-Negotiable Areas
1. API contract parity
2. Environment variable parity
3. Database schema parity
4. Storage path / asset URL parity
5. Auth/session/cookie parity
6. Route and redirect parity
7. Build/runtime parity
8. CORS / CSRF / proxy parity

## Required Checks Before Release
1. Local vs production env diff tercatat
2. Schema migration parity tercatat
3. API endpoint contract parity diverifikasi
4. Critical read-path smoke tests PASS
5. Critical write-path smoke tests PASS
6. Auth, redirect, upload, and error states diverifikasi
7. CDN/asset URL behavior diverifikasi
8. Release blockers dicatat di handover docs

## Forbidden Assumptions
- Jangan menganggap local sama dengan production hanya karena fitur bekerja di local.
- Jangan menganggap cPanel dan Tencent Edge memakai runtime identik tanpa verifikasi.
- Jangan deploy jika ada mismatch environment yang belum dipetakan.

# docs/00-governance/migration-master-index.md
# Migration Master Index

## Goal
Migrasi dari Laravel legacy monolith ke Laravel + Next.js decouple hybrid monorepo dengan parity setinggi mungkin dan experience layer baru yang lebih relevan.

## Active Tracks
1. Legacy-to-hybrid parity migration
2. Experience architecture re-architecture
3. E2E and release-readiness hardening
4. Local-to-production parity discipline

## Domain Status
- Profile lifecycle: CLOSED
- Inbox / DM: CLOSED
- Community: ACTIVE
- Today: ACTIVE
- VerseHub: PENDING

## Feature Status
- Relevance homepage: ACTIVE
- Hook card system: ACTIVE
- Reflection template: ACTIVE
- Spiritual journeys: ACTIVE

## Core Rules
- Patch sempit
- Verifikasi keras
- Docs wajib update
- Root harus clean
- Git harus bersih

# 4. Versi isi awal file handover
# docs/09-handover/current-status.md

# Current Status

## Project State
Hybrid monorepo sedang berjalan dalam dua track:
1. parity migration domain lama
2. experience layer baru berbasis relevance, reflection, journeys, dan community response

## Closed Domains
- Profile lifecycle
- Inbox / DM

## Active Domains
- Community
- Today
- VerseHub

## Active Experience Features
- Relevance homepage
- Hook card system
- Reflection template
- Spiritual journeys

## Current Priority
1. selesaikan Community parity blocker yang masih nyata
2. rapikan experience architecture dengan kontrak backend yang benar
3. siapkan E2E main apps dengan environment deterministik
4. jaga local vs production parity

## Non-Negotiable Constraints
- root repo harus clean
- docs hanya di `docs/`
- jangan membuat file acak
- jangan lanjut step baru tanpa status jelas


# docs/09-handover/next-actions.md
# Next Actions

## Immediate
1. selesaikan blocker Community yang masih aktif
2. audit dan kunci experience architecture baru
3. siapkan local-to-production parity checklist
4. siapkan E2E inventory untuk main apps

## After Immediate
1. lock technical architecture untuk relevance engine
2. hubungkan journeys ke backend nyata
3. verifikasi Today dan VerseHub sebagai bagian dari experience layer baru
4. siapkan release-readiness report

## Execution Rule
Jangan buka step berikutnya sebelum step sekarang berstatus PASS atau BLOCKED.


# docs/09-handover/open-blockers.md
# Open Blockers

## Active Blockers
- Community parity belum sepenuhnya CLOSED
- Experience layer baru belum seluruhnya memakai backend contract final
- E2E main apps belum sepenuhnya dijalankan dengan environment deterministik
- Local vs production parity policy belum seluruhnya diverifikasi di deployment nyata

## Notes
Setiap blocker harus memiliki:
- root cause
- file terkait
- dampak
- langkah verifikasi
- status PASS/BLOCKED/CLOSED


# docs/09-handover/release-readiness.md
# Release Readiness

## Readiness Gates
1. Domain parity utama sudah CLOSED atau punya risk yang diterima
2. Experience layer baru punya kontrak backend yang jelas
3. Local vs production env diff terdokumentasi
4. E2E read-path PASS
5. E2E write-path PASS
6. No critical auth, redirect, upload, or API mismatch
7. Working tree dan git history rapi

## Current Status
NOT READY

## Reason
Masih ada domain dan environment parity yang belum selesai diverifikasi penuh.


# Prompt Gemini untuk parity local/server
Mulai sekarang, setiap pekerjaan harus mempertimbangkan parity antara local dan server produksi.

Environment target:
- local development
- backend production di cPanel
- frontend production di Tencent Edge

Aturan:
1. Jangan anggap fitur selesai hanya karena berjalan di local.
2. Untuk setiap flow penting, petakan:
   - env vars yang memengaruhi flow
   - API contract yang dipakai
   - auth/session/cookie behavior
   - storage/asset URL behavior
   - database schema dependency
3. Semua temuan parity wajib dicatat hanya di `docs/06-testing/parity/` dan `docs/09-handover/`.
4. Jika ada asumsi environment yang belum terverifikasi, nyatakan sebagai risiko atau blocker.
5. Jangan membuat file laporan di root.
6. Sebelum menyatakan PASS pada flow kritis, cek:
   - local behavior
   - expected production behavior
   - kemungkinan mismatch di cPanel atau Tencent Edge
7. Jika ada potensi drift local vs production, buat/update:
   - `docs/06-testing/parity/local-vs-production-checklist.md`
   - `docs/06-testing/parity/api-contract-diff-log.md`
   - `docs/06-testing/parity/database-schema-diff-log.md`
   - `docs/06-testing/parity/env-diff-log.md`
8. Jika belum bisa memverifikasi server langsung, jangan klaim production parity final. Tandai dengan jelas sebagai NEEDS SERVER VALIDATION atau BLOCKED.















