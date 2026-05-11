# PROMPT
```
Anda adalah AI senior DevOps + Laravel engineer. Tugas: buat implementasi CI/CD end-to-end untuk project Laravel 12 + Inertia React + TypeScript + Tailwind + Filament, target shared hosting cPanel (CloudLinux) via SSH.

PRINSIP UTAMA (WAJIB):
1) NON-DESTRUKTIF: jangan menghapus file/folder existing di server maupun repo. Jika perlu “bersih-bersih”, lakukan dengan cara aman (buat folder baru), jangan `rm -rf` terhadap path produksi. Jangan overwrite .env produksi.
2) ATOMIC DEPLOY: gunakan strategi release folder + symlink `current` agar hanya deploy yang sukses menjadi live. Jika deploy gagal, website harus tetap memakai versi sebelumnya tanpa downtime.
3) ASK OWNER WHEN BLOCKED: jika ada keterbatasan hosting (tidak ada symlink, tidak ada akses SSH, composer tidak tersedia, permission storage, dsb), jangan nebak. Buat pertanyaan jelas ke owner + alternatif solusi.
4) PROFESIONAL: tambahkan logging yang jelas, error handling, rollback otomatis (cukup dengan tidak mengubah symlink), validasi environment, dan dokumentasi singkat.
5) TIDAK MENYIMPAN SECRET DI REPO: secrets harus via GitHub Secrets dan file `.env` di server (shared).
6) KOMPATIBEL CPANEL: web root biasanya `public_html`. Usahakan code berada di luar public_html. Arahkan `public_html` ke `current/public` via symlink atau pendekatan aman lain tanpa menghapus isi.

KONDISI & STACK:
- Backend: Laravel 12 (PHP 8.2+)
- Frontend: Inertia.js + React 18 + TypeScript + Vite
- Admin: Filament
- Hosting: cPanel CloudLinux, PHP Selector tersedia, akses SSH mungkin tersedia.
- Repo: GitHub, branch produksi: `main`.

TARGET HASIL (DELIVERABLES):
A) Tambahkan file CI GitHub Actions:
   - `.github/workflows/deploy.yml`
   - pipeline: build (frontend), test (opsional), deploy (ssh).
   - jika server tidak punya Node, build asset di CI, lalu kirim artifact ke server.
B) Tambahkan script deploy aman di repo:
   - `scripts/deploy_cpanel.sh` (dipanggil di server via ssh)
   - script harus:
     1) membuat release folder baru `~/apps/<appname>/releases/<timestamp>_<sha>/`
     2) menaruh code di release folder (pull via git atau upload dari CI)
     3) symlink shared `.env` + `storage` shared (tanpa menghapus storage lama)
     4) `composer install --no-dev --optimize-autoloader` (gunakan `--no-interaction`)
     5) `php artisan migrate --force` (hanya jika DB siap; jika gagal jangan switch symlink)
     6) `php artisan config:cache`, `route:cache`, `view:cache`
     7) `php artisan storage:link` (idempotent)
     8) health check ringan (misalnya `php artisan --version` dan cek file `public/index.php`)
     9) jika semua sukses: atomik switch symlink `current` ke release baru
     10) simpan log deploy ke `~/apps/<appname>/shared/logs/deploy.log`
   - script harus idempotent dan fail-fast. Jika error: exit non-zero dan jangan ubah symlink `current`.
C) Tambahkan dokumentasi:
   - `DEPLOYMENT.md` berisi:
     - struktur folder server yang diharapkan
     - cara set GitHub Secrets
     - cara setup SSH key
     - cara set `.env` di server
     - cara set web root cPanel ke `current/public` (symlink atau alternative)
     - cara rollback (cukup repoint symlink ke release sebelumnya)
D) Jangan menghapus apapun. Jika butuh “retensi release lama”, jangan hapus otomatis. Cukup rekomendasikan prosedur manual.

DETAIL DEPLOY TEKNIS (HARUS DIPIKIRKAN):
1) PERMISSION:
   - `storage/` dan `bootstrap/cache` writable. Pastikan script set permission aman (contoh: `chmod -R ug+rw` dan set group jika perlu), tetapi jangan lakukan chmod agresif ke seluruh home.
2) ENV:
   - `.env` harus berada di shared path, disymlink ke release.
   - `APP_KEY` tidak dibuat ulang saat deploy.
3) FRONTEND ASSETS:
   - jika server tidak punya Node build:
     - build `npm ci` + `npm run build` di GitHub Actions
     - kirim `public/build` hasil build ke server di release yang baru
     - pastikan `.gitignore` tidak menghambat strategi ini; gunakan artifact upload.
4) DB MIGRATION:
   - jalankan migration sebelum switch symlink.
   - jika migration gagal: stop deploy, jangan switch.
   - jangan destructive (tidak drop table).
5) HEALTH CHECK:
   - minimal: cek `php -v`, `composer -V`, dan `php artisan about` (jika aman).
6) SECURITY:
   - secrets: `CPANEL_HOST`, `CPANEL_PORT`, `CPANEL_USER`, `CPANEL_SSH_KEY` (private key), optional `KNOWN_HOSTS`.
   - jangan print secret di logs.

OUTPUT YANG DIHARAPKAN DARI ANDA (AI):
1) Buat/ubah file-file berikut dengan isi lengkap:
   - `.github/workflows/deploy.yml`
   - `scripts/deploy_cpanel.sh`
   - `DEPLOYMENT.md`
2) Jelaskan cara pakai singkat:
   - set GitHub Secrets apa saja
   - command yang dijalankan workflow
   - struktur folder server
3) Jika menemukan hambatan yang tidak bisa dipastikan (mis. apakah hosting mendukung symlink dari public_html), AJUKAN PERTANYAAN ke owner dalam format checklist, mis:
   - Apakah SSH tersedia?
   - Apakah symlink diperbolehkan di public_html?
   - Apakah composer tersedia di server?
   - Apakah ada batasan exec function?
   - Apakah Node tersedia? Jika tidak, set build di CI.

BATASAN:
- Jangan membuat langkah yang menghapus folder produksi.
- Jangan menyuruh user manual “hapus dulu semua”.
- Jangan menulis instruksi yang berpotensi downtime.
- Jangan gunakan tool vendor berbayar.

Mulai dengan menghasilkan file `.github/workflows/deploy.yml`, lalu `scripts/deploy_cpanel.sh`, lalu `DEPLOYMENT.md`.
```

