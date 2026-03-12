# Mono Repo Laravel Hybrid

## Tujuan

Dokumen ini menetapkan desain implementasi formal untuk monorepo TheChosenTalks dengan prinsip:

- frontend Next.js tetap berjalan normal di Firebase Studio
- backend Laravel tetap berada dalam repo yang sama, tetapi tidak mengganggu workflow frontend
- deploy backend ke cPanel dilakukan melalui git pipeline SSH, bukan dari laptop lokal
- dokumentasi inti tetap versioned, sementara arsip berat dipisahkan dari surface git aktif

## Prinsip Arsitektur

Monorepo ini bersifat `frontend-first` di root.

- root repo adalah entrypoint frontend
- `backend-api/` adalah workspace backend mandiri
- Firebase Studio hanya perlu memahami root frontend
- pipeline backend hanya perlu memahami `backend-api/`
- `docs/core` dan `docs/reference` adalah dokumentasi aktif
- `docs/archive` dan `docs/quarantine` tidak menjadi bagian workflow harian

## Struktur Folder Target

```text
repo-root/
  .idx/
  docs/
    core/
    reference/
    archive/
    quarantine/
  public/
  scripts/
  src/

  backend-api/

  .env.example
  .gitignore
  apphosting.yaml
  components.json
  next.config.ts
  package.json
  package-lock.json
  postcss.config.mjs
  README.md
  tsconfig.json
```

## Boundary Teknis

### Frontend

Frontend berjalan dari root repo.

- `package.json` root hanya mengelola Next.js frontend
- `.idx/dev.nix` hanya mengarah ke workflow frontend
- frontend tidak menjalankan Composer, Artisan, atau script Laravel saat startup
- frontend tetap bisa render saat backend belum reachable
- komunikasi ke backend dilakukan melalui `LARAVEL_API_BASE_URL` dan route proxy `/api/*`

### Backend

Backend hidup sepenuhnya di `backend-api/`.

- memiliki `composer.json` sendiri
- memiliki `.env.example` sendiri
- memiliki script deploy, healthcheck, dan rollback sendiri
- dapat diuji dan dibangun tanpa bergantung ke proses startup frontend

## Workflow Operasional

### Workflow Frontend

Dijalankan dari root repo:

1. `npm install`
2. `npm run dev`

Syarat kompatibilitas Firebase Studio:

- root install tidak boleh menyentuh `backend-api/`
- root dev server tidak boleh bergantung pada Laravel aktif
- `.idx` tetap berada di root repo
- fallback UI tetap aman jika backend down

### Workflow Backend

Dijalankan dari `backend-api/`:

1. `composer install`
2. `php artisan migrate --force`
3. `php artisan config:cache`
4. `php artisan route:cache` bila diperlukan
5. `php artisan optimize:clear` saat rollback atau recovery

## Kebijakan Git

### Harus Masuk Git

- `.idx/`
- `src/`
- `public/`
- `scripts/`
- `backend-api/` kecuali dependency dan runtime-generated files
- `docs/core/`
- `docs/reference/`

### Tidak Masuk Git

- `node_modules/`
- `.next/`
- `.playwright-mcp/`
- `backend-api/vendor/`
- `backend-api/.env`
- `backend-api/storage/logs/*`
- `docs/archive/**`
- `docs/quarantine/**`
- `docs/STRUKTUR DOCS.md` bila tetap lokal-only

## Desain Pipeline

### Pipeline Frontend

Trigger:

- perubahan `src/**`
- perubahan `public/**`
- perubahan `.idx/**`
- perubahan config frontend di root

Langkah:

1. install dependencies Node
2. jalankan `npm run typecheck`
3. jalankan build frontend
4. deploy ke platform frontend yang digunakan

### Pipeline Backend

Trigger:

- perubahan `backend-api/**`

Langkah:

1. setup PHP dan Composer
2. install dependency backend
3. siapkan artifact release backend
4. upload artifact via SSH ke cPanel
5. jalankan `deploy.sh`
6. jalankan migrate
7. jalankan healthcheck
8. lakukan rollback jika diperlukan

## Secrets dan Keamanan

Secrets tidak boleh disimpan di repo.

Minimal secrets backend pipeline:

- `CPANEL_SSH_HOST`
- `CPANEL_SSH_PORT`
- `CPANEL_SSH_USER`
- `CPANEL_SSH_KEY`
- `CPANEL_DEPLOY_PATH`

Prinsip keamanan:

- private key hanya di CI secret
- env produksi backend hanya di server atau secret manager
- artifact backend dibangun dari CI, bukan dari mesin lokal

## Tahap Implementasi

### Tahap 1: Boundary Repo

Tujuan:

- root tetap frontend-first
- backend ikut repo tanpa mengganggu Firebase Studio

Checklist:

1. pastikan root `package.json` hanya untuk frontend
2. pastikan `.idx` hanya menunjuk ke frontend
3. pastikan tidak ada script root yang memanggil Laravel
4. pastikan `backend-api/.env.example` mandiri
5. pastikan `docs/archive` dan `docs/quarantine` keluar dari git aktif

### Tahap 2: Aturan Git dan Ignore

Tujuan:

- repo tetap ringan
- source penting tetap versioned

Checklist:

1. finalisasi `.gitignore` monorepo
2. verifikasi `git status` hanya menampilkan source yang relevan
3. pastikan tidak ada dump sensitif atau build artifact yang tracked

### Tahap 3: Kompatibilitas Firebase Studio

Tujuan:

- frontend tetap bisa berjalan walau backend berada dalam repo yang sama

Checklist:

1. verifikasi `npm install` dari root cukup
2. verifikasi `npm run dev` dari root tidak menyentuh backend
3. verifikasi fallback `/api/*` aman bila backend down
4. verifikasi `.idx/dev.nix` tetap valid untuk frontend

### Tahap 4: Hardening Backend Workspace

Tujuan:

- backend siap dideploy mandiri dari CI

Checklist:

1. rapikan `backend-api/.env.example`
2. pastikan `deploy.sh`, `healthcheck.sh`, dan `rollback.sh` konsisten
3. pastikan migrasi dan autentikasi backend lengkap
4. pastikan backend dapat diuji dari `backend-api/` saja

### Tahap 5: Backend CI/CD via SSH

Tujuan:

- deploy backend sepenuhnya dari git pipeline

Checklist:

1. siapkan secrets CI
2. siapkan workflow build artifact backend
3. siapkan workflow SSH upload ke cPanel
4. siapkan migrate + healthcheck
5. siapkan rollback minimal

### Tahap 6: Frontend CI/CD

Tujuan:

- frontend dan backend memiliki jalur deploy terpisah

Checklist:

1. jalankan typecheck otomatis
2. jalankan build frontend otomatis
3. deploy frontend ke target hosting

### Tahap 7: Verifikasi End-to-End

Tujuan:

- memastikan monorepo benar-benar layak dipakai harian

Checklist:

1. clone repo baru
2. buka di Firebase Studio
3. jalankan frontend dari root
4. verifikasi frontend tetap hidup tanpa Laravel aktif
5. jalankan backend dari `backend-api/`
6. uji proxy `/api/today` dan `/api/community/posts`
7. uji pipeline backend ke cPanel
8. uji rollback minimal satu kali

## Risiko Utama

- ukuran monorepo membesar jika dependency generated ikut tracked
- workflow frontend bisa rusak jika script root menyentuh backend
- pipeline backend bisa gagal jika boundary artifact tidak konsisten
- dokumentasi bisa kembali berat jika arsip tidak tetap di-ignore

## Keputusan Teknis

Monorepo ini direkomendasikan dengan keputusan berikut:

- tetap satu repo
- root tetap frontend-first
- `backend-api/` tetap menjadi backend-only workspace
- deploy backend menggunakan git pipeline SSH
- Firebase Studio hanya menjalankan frontend root
- dokumentasi dibagi menjadi `core/reference` dan `archive/quarantine`

## Definisi Selesai

Implementasi monorepo ini dianggap selesai jika:

- Firebase Studio dapat menjalankan frontend dari root tanpa error karena backend
- `backend-api/` tetap versioned dan dapat dideploy dari CI ke cPanel
- tidak ada lagi deploy backend yang bergantung pada laptop lokal
- dokumentasi aktif tetap ringan dan jelas, sementara arsip berat tidak membebani git aktif
