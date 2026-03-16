# Aturan Kedisiplinan Kontrol Versi (Git Workflow & Hygiene)

Pekerjaan pada repositori monorepo ini harus mematuhi alur *Git Workflow* untuk menghindari kerusakan (*breakage*) antara servis PHP (backend) dengan Node.js (frontend).

## Pra-Prasyarat Git & Patch
1. Cek perubahan: `git status -s` setiap sebelum melempar patch atau komit.
2. Identifikasi file liar (Abaikan Log, Cache, Test Artifacts e.g., `playwright-report`, `.env`, `.phpunit.cache`). Gunakan file `.gitignore`.
3. Klasifikasikan jenis modifikasi (*Code / Docs / Configs*).

## Konvensi Percabangan (Branching)
Nama percabangan (*branch*) dikelompokkan dalam kategori:
- `feat/<scope>`: Feature baru
- `fix/<scope>`: Bugfix atau Patch
- `docs/<scope>`: Pembenahan Dokumentasi
- `refactor/<scope>`: Refactor kode tanpa perubahan *behavior*
- `test/<scope>`: Suites QA, E2E play, dsb.

## Aturan Format Commit
Pola Komit wajib memakai format generik *Conventional Commits*:
`type(scope): singkat namun berbobot`
Contoh: 
- `fix(profile): restore laravel validation parity`
- `feat(today): inject active_state chips for contextual feed`
- `docs(inbox): update parity matrix`

## The Rule of Publish (Push GitHub)
Sebelum proses `git push`, pastikan hal berikut tersentuh dan terverifikasi:
- Matrix Dokumentasi (*09-handover / 04-domains*) tervalidasi `UPDATED`.
- *Diff* per berkas tak membiarkan barisan *console.log* terabaikan kecuali diminta.
- Bila ada kerumitan *(file liar meledak di luar scope)*, HENTIKAN PEKERJAAN dan nyatakan blokada (*STATUS: BLOCKED*).
