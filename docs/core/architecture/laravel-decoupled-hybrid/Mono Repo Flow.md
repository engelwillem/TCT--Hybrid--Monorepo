# Historical Notice: Mono Repo Flow

Dokumen ini dipertahankan sebagai jejak design lama.

Jangan gunakan dokumen ini sebagai source of truth operasional aktif karena isinya masih mengandung asumsi yang sudah obsolete, termasuk:
- `frontend-prod` sebagai branch frontend release aktif
- backend deploy ke cPanel via GitHub Actions + SSH

Baseline aktif sekarang:
- frontend production deploy dari `main`
- backend Laravel deploy manual via cPanel/script

Untuk baseline yang benar, baca:
- [../MONOREPO HYBRID LOCAL-SERVER PARITY AUDIT.md](../MONOREPO%20HYBRID%20LOCAL-SERVER%20PARITY%20AUDIT.md)
- [../ARCHITECTURE DOC DRIFT AUDIT 2026-03-23.md](../ARCHITECTURE%20DOC%20DRIFT%20AUDIT%202026-03-23.md)

---

# Mono Repo Flow

## Repository

- GitHub repository: `https://github.com/engelwillem/TCT--Hybrid--Monorepo.git`
- Model: one monorepo
- Root: Next.js frontend
- Backend: `backend-api/`

## Tujuan Operasional

- backend dan frontend tetap berada dalam satu repo
- backend-only commit tidak ikut memicu workflow frontend di GitHub Actions
- frontend release hanya bergerak saat branch frontend release dipromosikan
- backend deploy ke cPanel dilakukan via GitHub Actions + SSH
- Tencent Edge dan Firebase Studio tetap bisa membaca repo yang sama

## Struktur Branch

- `main`
  - source of truth monorepo
  - menerima semua perubahan frontend, backend, docs aktif, dan workflow
- `frontend-prod`
  - branch release frontend
  - dipantau Tencent Edge dan Firebase Studio bila pengaturan branch tersedia
  - hanya dipromosikan saat frontend siap tayang

Opsional bila nanti diperlukan:
- `staging`
  - branch integrasi sebelum `main`
- `hotfix/*`
  - branch perbaikan cepat

## Branch Policy Frontend dan Backend

### Backend

- backend-only change langsung masuk ke `main`
- perubahan backend ada di `backend-api/**`
- push ke `main` akan memicu workflow backend deploy ke cPanel
- backend-only change tidak perlu mempromosikan `frontend-prod`

### Frontend

- frontend change tetap dikembangkan dari repo yang sama
- source frontend ada di root seperti `src/**`, `public/**`, `.idx/**`, `package.json`, `next.config.ts`
- frontend change boleh masuk ke `main`
- frontend baru tayang ke Tencent Edge dan Firebase Studio saat `frontend-prod` dipromosikan dari `main`

## Aturan Kapan Push ke `main` dan Kapan Promote ke `frontend-prod`

Push ke `main` jika:
- perubahan hanya backend
- perubahan hanya docs aktif
- perubahan workflow backend
- perubahan frontend belum siap tayang
- perubahan campuran frontend dan backend masih tahap integrasi

Promote ke `frontend-prod` jika:
- perubahan frontend sudah lolos review
- perubahan frontend sudah lolos typecheck dan build
- perubahan frontend memang ingin tayang ke Tencent Edge dan Firebase Studio

Jangan promote ke `frontend-prod` jika:
- commit hanya backend
- commit hanya docs
- frontend belum siap tayang

## Alur Kerja Harian

### Backend-only

1. Commit ke `main`
2. GitHub Actions backend berjalan
3. Artifact backend dibangun dari `backend-api/`
4. Artifact di-upload ke cPanel
5. `deploy.sh` dijalankan di server
6. migrasi, healthcheck, dan rollback berjalan sesuai script
7. `frontend-prod` tidak disentuh

### Frontend-only

1. Commit ke `main`
2. GitHub Actions frontend check berjalan
3. Setelah siap tayang, promote `main` ke `frontend-prod`
4. Tencent Edge dan Firebase Studio mengambil update frontend dari `frontend-prod`

### Full-stack

1. Commit ke `main`
2. backend deploy otomatis dari workflow backend
3. frontend check berjalan
4. setelah frontend siap tayang, promote `frontend-prod`

## GitHub Actions Workflow yang Berlaku

### Backend

File:
- [backend-cpanel-deploy.yml](/e:/thechoosentalksnext/.github/workflows/backend-cpanel-deploy.yml)

Trigger:
- `backend-api/**`

Fungsi:
- install Composer dependencies
- install backend npm dependencies
- build asset backend
- build artifact backend
- upload artifact dan deploy scripts ke cPanel
- jalankan deploy remote via SSH

### Frontend

File:
- [frontend-monorepo-checks.yml](/e:/thechoosentalksnext/.github/workflows/frontend-monorepo-checks.yml)

Trigger:
- `.idx/**`
- `src/**`
- `public/**`
- root Next.js config files

Fungsi:
- install dependency frontend
- typecheck
- build frontend

## Secrets yang Harus Dibuat di GitHub

Tambahkan di:
- GitHub repository `Settings`
- `Secrets and variables`
- `Actions`

Minimal secrets backend:
- `CPANEL_SSH_HOST`
- `CPANEL_SSH_PORT`
- `CPANEL_SSH_USER`
- `CPANEL_SSH_KEY`
- `CPANEL_DEPLOY_PATH`

Contoh nilai:
- `CPANEL_SSH_HOST`: hostname SSH cPanel
- `CPANEL_SSH_PORT`: `22`
- `CPANEL_SSH_USER`: username SSH cPanel
- `CPANEL_SSH_KEY`: isi private key OpenSSH
- `CPANEL_DEPLOY_PATH`: `/home/<user>/deploy/apps/thechoosentalks`

## `CPANEL_SSH_KEY` Harus Diisi Apa

Isi dengan:
- private key

Jangan isi dengan:
- public key
- file `.pub`

Format yang benar:

```text
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

## Cara Generate SSH Key

Di mesin lokal jalankan:

```bash
ssh-keygen -t ed25519 -C "github-actions-cpanel" -f ~/.ssh/tct_cpanel_actions
```

Hasilnya:
- private key: `~/.ssh/tct_cpanel_actions`
- public key: `~/.ssh/tct_cpanel_actions.pub`

Rekomendasi:
- gunakan key khusus untuk GitHub Actions
- jangan pakai key personal harian
- jika ingin sederhana, pakai tanpa passphrase untuk CI

## Cara Pasang Public Key ke cPanel

### Opsi 1: cPanel UI

1. login ke cPanel
2. buka `SSH Access`
3. buka `Manage SSH Keys`
4. import isi file public key `.pub`
5. authorize key

### Opsi 2: manual di server

Tambahkan isi public key ke:

```bash
~/.ssh/authorized_keys
```

Pastikan permission aman:

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

## Langkah Setting GitHub Actions ke cPanel

1. generate SSH key khusus CI
2. simpan private key ke secret `CPANEL_SSH_KEY`
3. pasang public key ke `authorized_keys` cPanel
4. isi secret host, port, user, dan deploy path
5. pastikan user SSH punya akses ke:
   - release path
   - shared `.env`
   - `public_html`

## Langkah Setting Tencent Edge

Tujuan:
- frontend hanya tayang dari branch frontend release

Konfigurasi yang disarankan:
1. buka project Tencent Edge
2. sambungkan ke repo `TCT--Hybrid--Monorepo`
3. pilih branch deploy: `frontend-prod`
4. build root tetap di root repo, bukan `backend-api/`
5. build command:
   - `npm ci`
   - `npm run build`
6. output mengikuti kebutuhan Tencent untuk Next.js
7. pastikan Tencent tidak memantau `main` jika branch selection tersedia

Jika Tencent tidak mendukung branch target yang berbeda:
- matikan auto-deploy per push bila memungkinkan
- gunakan manual promote/deploy saat `frontend-prod` berubah

## Langkah Setting Firebase Studio

Tujuan:
- Firebase Studio tetap memakai repo yang sama tanpa menganggap backend sebagai entrypoint

Konfigurasi:
1. pastikan workspace membaca root repo
2. `.idx/dev.nix` tetap di root
3. startup preview harus tetap:
   - `npm run dev`
4. bila Firebase Studio mendukung branch setting, arahkan ke `frontend-prod`
5. bila tidak mendukung branch setting, perlakukan Firebase Studio sebagai environment development yang membaca `main`, bukan sumber deploy produksi frontend

Catatan:
- Firebase Studio dapat membuka monorepo ini karena root tetap frontend-first
- `backend-api/` tidak ikut boot process frontend

## Deploy Policy yang Paling Praktis

Rekomendasi final:
- `main` untuk integrasi monorepo
- `frontend-prod` untuk frontend release
- backend deploy otomatis dari `main`
- frontend tayang dari `frontend-prod`

Manfaat:
- satu repo tetap terjaga
- backend dan frontend punya jalur operasional berbeda
- backend-only commit tidak perlu ikut merilis frontend

## Caveat Penting

- GitHub Actions path filter hanya memisahkan workflow CI
- Tencent Edge dan Firebase Studio tetap bisa auto-pull semua commit jika platform diset demikian
- jadi pemisahan deploy frontend yang benar-benar bersih membutuhkan:
  - branch deploy khusus
  - atau manual deploy policy di platform frontend

## Checklist Implementasi

1. rename repo sudah selesai ke `TCT--Hybrid--Monorepo`
2. push workflow GitHub Actions ke repo baru
3. buat secret backend di GitHub
4. generate SSH key khusus GitHub Actions
5. pasang public key ke cPanel
6. set Tencent Edge ke branch `frontend-prod`
7. set Firebase Studio sesuai mode:
   - `frontend-prod` jika didukung
   - `main` jika hanya untuk development workspace
8. gunakan `main` untuk backend deploy
9. gunakan promote ke `frontend-prod` untuk frontend release
