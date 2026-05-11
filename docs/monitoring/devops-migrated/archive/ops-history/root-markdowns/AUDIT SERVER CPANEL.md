# Prompt untuk Codex OpenAI — Audit, Hardening, dan Perbaikan Server cPanel Laravel

## Peran
Anda adalah **Senior DevOps Engineer + Senior Laravel Engineer + Security Reviewer** yang ahli pada:
- Laravel di **cPanel / LiteSpeed / shared hosting**
- deployment berbasis **release directory + symlink current**
- hardening aplikasi web production
- troubleshooting Laravel, Inertia, Vite, Filament, SQLite/MySQL
- penulisan script deploy yang aman, idempotent, dan mudah rollback

## Tujuan utama
Kerjakan **seluruh** saran, rekomendasi, dan solusi dari hasil audit berikut untuk aplikasi Laravel di server cPanel:

### Ringkasan audit yang harus Anda eksekusi
1. Aplikasi online dan merespons `HTTP 200`, tetapi **data inti belum siap**, khususnya data `BibleVerse` untuk `provider=ayt` dan `lang=id` masih `0`.
2. Deployment sudah memakai pola release directory, shared `.env`, shared `storage`, symlink `current`, cache artisan, migrate, cleanup old release. Ini bagus, tetapi belum production-grade penuh.
3. Saat deploy, `composer install` masih dijalankan di server production karena `vendor/autoload.php` tidak ada.
4. Belum ada **health check fungsional** pascadeploy yang memverifikasi fitur inti.
5. Belum ada **rollback otomatis** yang aman dan mudah dipakai.
6. Konfigurasi SQLite berjalan, tetapi `DB_DATABASE` belum eksplisit dan perlu dirapikan. Jika memungkinkan, beri jalur migrasi ke MySQL/MariaDB cPanel.
7. Security headers cukup baik, tetapi **CSP masih longgar** karena masih memakai `'unsafe-inline'` pada `script-src` dan `style-src`.
8. Harus dipastikan tidak ada informasi sensitif yang bocor ke HTML/client payload.
9. Permission file/folder perlu dirapikan sesuai best practice shared hosting.
10. Pipeline deploy perlu diperkuat agar hanya melakukan atomic switch jika validasi lolos.

## Data audit dan konteks teknis
Gunakan konteks berikut sebagai fakta dasar:

### Hasil deployment yang sudah terjadi
- release directory ada di:
  - `/home/thechoosentalks/deploy/apps/thechoosentalks/releases/<timestamp>`
- symlink aktif:
  - `/home/thechoosentalks/deploy/apps/thechoosentalks/current`
- public web root:
  - `/home/thechoosentalks/public_html`

### Pola deploy yang saat ini berjalan
- extract build ke release baru
- symlink shared `.env`
- symlink shared `storage`
- SQLite persistent diarahkan ke:
  - `/home/thechoosentalks/deploy/apps/thechoosentalks/shared/database/database.sqlite`
- menjalankan:
  - `php artisan optimize:clear`
  - `php artisan config:cache`
  - `php artisan route:cache`
  - `php artisan view:cache`
  - `php artisan migrate --force`
  - `php artisan optimize`
- lalu swap symlink `current`
- lalu populate `public_html`
- lalu inject proxy controller ke `public_html/index.php`

### Temuan data aplikasi
Perhatikan hasil verifikasi berikut:
- `users=0`
- `bible_ayt_id=0`
- `BibleVerse::where('provider','ayt')->where('lang','id')->count() = 0`
- command import:
  - `php artisan versehub:import-ayt --path=storage/app/ayt/ayt.csv --truncate`
  gagal karena file:
  - `storage/app/ayt/ayt.csv`
  belum ada

### Hasil endpoint
Endpoint berikut mengembalikan `HTTP/2 200`:
- `/`
- `/today`
- `/versehub/id`

### Header keamanan saat ini
- `x-content-type-options: nosniff`
- `x-frame-options: DENY`
- `referrer-policy: strict-origin-when-cross-origin`
- `permissions-policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()`
- `strict-transport-security: max-age=31536000; includeSubDomains; preload`

### CSP saat ini
```http
content-security-policy: default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https:; script-src 'self' 'unsafe-inline' https:; font-src 'self' data: https:; connect-src 'self' https:; frame-ancestors 'none'; base-uri 'self';
```

## Instruksi kerja
Lakukan pekerjaan secara **menyeluruh**, bukan hanya memberi saran. Saya ingin Anda:
1. **Menganalisis** konfigurasi dan pola deploy saat ini.
2. **Menghasilkan perubahan konkret** pada file, script, dan konfigurasi yang diperlukan.
3. **Membuat versi deploy script yang lebih aman**.
4. **Membuat rollback script**.
5. **Menambahkan health check** sebelum dan sesudah release diaktifkan.
6. **Menambahkan validasi data inti** agar deploy gagal jika data penting kosong.
7. **Memperbaiki konfigurasi database SQLite** agar eksplisit dan konsisten.
8. **Membuat opsi/panduan migrasi ke MySQL/MariaDB cPanel** bila saya ingin upgrade dari SQLite.
9. **Mengeraskan CSP dan hardening header** semaksimal mungkin tanpa merusak aplikasi.
10. **Memastikan tidak ada kebocoran secret/config** ke payload HTML/client.
11. **Merapikan permission** file dan folder sesuai best practice shared hosting.
12. **Menghindari `composer install` di production** dengan pendekatan build artifact yang lebih benar.
13. **Menyusun langkah implementasi, patch, dan checklist verifikasi**.

## Output yang wajib Anda berikan
Berikan output dalam struktur berikut, lengkap dan siap pakai.

### 1. Executive summary
Ringkas masalah utama, risiko, dan arah solusi.

### 2. Root cause analysis
Jelaskan akar masalah untuk setiap temuan audit.

### 3. Rencana perbaikan prioritas
Kelompokkan ke:
- Prioritas 1: harus segera
- Prioritas 2: sangat disarankan
- Prioritas 3: hardening lanjutan

### 4. Patch dan file yang harus diubah
Saya ingin hasil yang sangat operasional. Untuk setiap perubahan:
- sebutkan **nama file**
- jelaskan **tujuan file**
- tampilkan **isi final** atau **diff patch**
- jelaskan **cara menerapkannya**

File yang minimal harus Anda buat/revisi:
- `deploy.sh`
- `rollback.sh`
- `healthcheck.sh`
- contoh `public_html/index.php` proxy yang aman
- contoh `.env` untuk SQLite eksplisit
- contoh `.env` untuk MySQL/MariaDB cPanel
- contoh hardening `.htaccess` bila relevan di LiteSpeed/cPanel
- checklist verifikasi pascadeploy
- bila perlu, contoh workflow CI/build artifact

### 5. Deploy script baru
Buat script deploy baru yang:
- `set -euo pipefail`
- aman untuk cPanel shared hosting
- idempotent
- punya logging yang jelas
- melakukan preflight checks
- menolak deploy jika syarat minimum tidak terpenuhi
- hanya swap symlink `current` jika semua validasi lolos
- melakukan cleanup release lama
- mendukung rollback manual cepat

Script harus mencakup:
- validasi file artifact
- extract release
- link shared file/folder
- penyiapan database SQLite bila dipakai
- composer strategy yang benar
- cache artisan
- migrate
- health checks
- validasi data bisnis minimum
- atomic switch
- post-deploy verification

### 6. Rollback script baru
Buat script rollback yang:
- otomatis memilih release sebelumnya
- aman bila release sebelumnya tidak ada
- memperbarui `current`
- memastikan `public_html/index.php` tetap menunjuk release yang benar
- memverifikasi hasil rollback

### 7. Health check script
Buat script health check yang minimal memverifikasi:
- homepage `200`
- route penting `200`
- storage writable
- artisan boot normal
- query data penting tidak nol
- jika perlu, JSON endpoint atau marker page

### 8. Validasi data bisnis
Buat mekanisme validasi agar deploy gagal jika:
- tabel penting tidak ada
- jumlah `BibleVerse` provider `ayt` lang `id` masih kosong atau di bawah threshold
- kondisi database kritikal lain belum siap

Sertakan command `php artisan tinker --execute=...` atau command artisan khusus jika lebih baik.

### 9. Strategi data import AYT
Berikan solusi lengkap untuk masalah:
- `storage/app/ayt/ayt.csv` belum ada
- import gagal
- data `BibleVerse` kosong

Saya ingin:
- langkah upload file
- command import
- verifikasi pascaimport
- saran otomatisasi agar deploy tidak lolos bila data belum siap
- jika perlu, sarankan command/feature baru untuk pengecekan readiness dataset

### 10. Database strategy
Bagi menjadi dua:
#### Opsi A — tetap SQLite
- konfigurasi `.env` final
- path database final
- permission yang benar
- risiko dan mitigasi

#### Opsi B — pindah ke MySQL/MariaDB cPanel
- variabel `.env`
- langkah pembuatan database/user di cPanel
- migrasi data dasar
- tradeoff versus SQLite
- kapan saya harus pindah

### 11. Security hardening
Berikan perubahan konkret untuk:
- CSP yang lebih ketat
- header keamanan tambahan bila perlu
- pembatasan akses file sensitif
- memastikan `.env`, logs, dan file internal tidak bisa diakses publik
- audit payload HTML agar tidak membeberkan rahasia

Jika CSP ketat berisiko merusak app, berikan:
- versi aman bertahap
- cara uji
- fallback plan

### 12. Permission model
Jelaskan permission final yang disarankan untuk:
- file normal
- directory normal
- `storage`
- `bootstrap/cache`
- database SQLite
- shared files

Jangan gunakan rekomendasi sembrono seperti `777` kecuali benar-benar terpaksa dan jelaskan risikonya.

### 13. Composer / build artifact strategy
Saya ingin menghapus praktik `composer install` di production.
Buat strategi yang lebih benar:
- build di lokal/CI
- include `vendor`
- include asset build
- artifact final yang siap extract
- langkah deploy di server yang menjadi lebih ringan

Jika perlu, buat contoh:
- workflow CI
- daftar file yang masuk artifact
- daftar file yang tidak perlu ikut

### 14. Checklist verifikasi akhir
Buat checklist lengkap sesudah implementasi, termasuk:
- perintah shell
- verifikasi endpoint
- verifikasi symlink
- verifikasi migration
- verifikasi data inti
- verifikasi permission
- verifikasi security headers
- verifikasi rollback

## Gaya kerja yang saya inginkan
- Fokus praktis dan langsung bisa diterapkan
- Jangan berhenti di teori
- Utamakan solusi yang cocok untuk **cPanel shared hosting**
- Hindari asumsi akses root
- Jika ada lebih dari satu pendekatan, pilih yang paling realistis untuk lingkungan ini
- Bila ada risiko kompatibilitas, jelaskan dan beri fallback yang aman

## Aturan penting
- Jangan menghapus pola release + symlink karena itu sudah benar
- Jangan mengandalkan systemd, supervisor, atau akses root
- Jangan menyarankan tooling yang tidak realistis untuk cPanel shared hosting
- Semua patch harus mempertimbangkan bahwa aplikasi berjalan di **LiteSpeed/cPanel**
- Semua script shell harus aman, jelas, dan mudah dipelihara
- Jika ada bagian yang belum pasti, buat asumsi yang paling aman lalu tandai asumsi tersebut

## Hasil akhir yang saya harapkan
Saya ingin menerima paket jawaban yang membuat saya bisa:
1. mengganti script deploy lama dengan versi yang lebih baik,
2. menambahkan rollback dan health check,
3. memperbaiki kesiapan data AYT,
4. mengeraskan keamanan,
5. menyiapkan jalan migrasi dari SQLite ke MySQL,
6. dan menjalankan deploy production dengan risiko lebih rendah.

Buat jawaban Anda lengkap, detail, dan siap copy-paste.
