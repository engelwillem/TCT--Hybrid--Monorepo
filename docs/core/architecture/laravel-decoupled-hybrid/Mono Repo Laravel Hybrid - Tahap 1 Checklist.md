# Mono Repo Laravel Hybrid - Tahap 1 Checklist

## Tujuan Tahap 1

Menetapkan boundary repo agar:

- root tetap `frontend-first`
- Firebase Studio bisa menjalankan Next.js dari root tanpa terpengaruh backend
- `backend-api/` tetap berada di repo sebagai workspace backend mandiri
- dokumentasi aktif, arsip, dan quarantine memiliki batas yang tegas

## Definition of Done

Tahap 1 dianggap selesai jika semua kondisi berikut terpenuhi:

- root repo hanya memuat file dan folder yang memang dibutuhkan untuk website dan workflow monorepo
- `.idx/` tetap tersedia dan valid untuk Firebase Studio
- root `package.json` tidak memanggil Laravel atau Composer
- `backend-api/` tetap mandiri dan tidak tersentuh oleh startup frontend
- `docs/core` dan `docs/reference` tetap versioned
- `docs/archive` dan `docs/quarantine` keluar dari git aktif
- `git status` tidak lagi dipenuhi artifact lokal yang tidak relevan

## Checklist Eksekusi

### 1. Boundary Root Repo

- [ ] Verifikasi root repo hanya menyisakan path inti:
  - `.idx/`
  - `src/`
  - `public/`
  - `scripts/`
  - `docs/`
  - `backend-api/`
  - file config frontend root
- [ ] Verifikasi tidak ada folder Laravel orphan di root selain `backend-api/`
- [ ] Verifikasi tidak ada artifact build, dump sensitif, atau bundle release di root
- [ ] Verifikasi `components.json` yang tersisa memang masih menjadi config tooling frontend

### 2. Validasi Firebase Studio

- [ ] Verifikasi `.idx/dev.nix` menjalankan frontend dari root
- [ ] Verifikasi `.idx/integrations.json` tetap tersedia
- [ ] Verifikasi root `package.json` hanya berisi script frontend
- [ ] Verifikasi `npm install` dari root tidak memanggil `backend-api/`
- [ ] Verifikasi `npm run dev` dari root tidak bergantung pada Laravel aktif

### 3. Boundary Frontend vs Backend

- [ ] Verifikasi `backend-api/` memiliki:
  - `composer.json`
  - `.env.example`
  - script deploy sendiri
  - script healthcheck sendiri
- [ ] Verifikasi frontend mengakses backend hanya via `LARAVEL_API_BASE_URL` atau proxy `/api/*`
- [ ] Verifikasi frontend tetap punya fallback aman bila backend unreachable
- [ ] Verifikasi tidak ada import lintas boundary dari root frontend ke file runtime Laravel

### 4. Dokumentasi

- [ ] Verifikasi dokumen aktif berada di `docs/core/`
- [ ] Verifikasi snapshot referensi teknis berada di `docs/reference/`
- [ ] Verifikasi arsip historis berada di `docs/archive/`
- [ ] Verifikasi dump sensitif dan editor state berada di `docs/quarantine/`
- [ ] Verifikasi `docs/STRUKTUR DOCS.md` tetap lokal-only bila memang tidak ingin masuk git

### 5. Aturan Git

- [ ] Verifikasi `.gitignore` meng-ignore:
  - `docs/archive/**`
  - `docs/quarantine/**`
  - `backend-api/vendor/`
  - `.next/`
  - `.playwright-mcp/`
  - env lokal
  - log dan artifact
- [ ] Verifikasi `.gitignore` tidak meng-ignore:
  - `.idx/`
  - `docs/core/`
  - `docs/reference/`
  - `backend-api/` source files
- [ ] Verifikasi tidak ada file sensitif yang masih tracked

### 6. Verifikasi Repo Secara Lokal

- [ ] Jalankan `npm run typecheck` dari root
- [ ] Jalankan `npm run dev` dari root
- [ ] Verifikasi halaman utama frontend bisa terbuka tanpa backend aktif
- [ ] Verifikasi `backend-api/` masih bisa dijalankan terpisah dari root
- [ ] Verifikasi `git status` mudah dibaca dan hanya menampilkan perubahan source yang relevan

## Urutan Eksekusi yang Disarankan

1. Rapikan isi root repo
2. Validasi `.idx` untuk Firebase Studio
3. Validasi boundary frontend dan backend
4. Finalisasi struktur docs
5. Finalisasi `.gitignore`
6. Jalankan verifikasi root frontend
7. Jalankan verifikasi backend workspace

## Output yang Harus Tercapai

Setelah Tahap 1 selesai, kondisi repo harus seperti ini:

- frontend bisa dipull ke Firebase Studio dan langsung dijalankan dari root
- backend tetap ada di repo tetapi tidak mengganggu workflow frontend
- root repo bersih dari file non-esensial
- dokumentasi rapi dan terpisah menurut fungsi
- repo siap masuk ke Tahap 2: finalisasi aturan git dan ignore untuk monorepo
