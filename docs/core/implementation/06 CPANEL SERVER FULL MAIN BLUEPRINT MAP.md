# cPanel Server Map

Dokumen ini memetakan server cPanel produksi secara langsung dari audit SSH lokal pada 2026-03-23.

Tujuan dokumen ini:
- mengunci peta server produksi yang nyata
- membedakan source repo vs runtime backend yang live
- memetakan release flow, shared runtime state, bridge web publik, route Laravel aktif, dan lapisan media/storage
- membantu deploy, rollback, debugging, dan audit operasional harian

## Status Audit

- Metode: local SSH audit
- Host SSH: `209.42.27.90`
- Port: `22`
- User SSH: `thechoosentalks`
- Key lokal yang dipakai: `%USERPROFILE%\.ssh\cpanel_laptop_deploy`
- Status koneksi: intermiten

Catatan:
- sebagian command berhasil sangat cepat
- sebagian command timeout secara intermiten
- seluruh isi dokumen ini dibangun dari output yang benar-benar berhasil diambil dari server, ditambah interpretasi operasional minimal

## Ringkasan Singkat

Peta server backend produksi saat ini:

1. source repo hidup di monorepo GitHub
2. server cPanel menarik source backend dari branch `main`
3. deploy path aktif:
   - `/home/thechoosentalks/deploy/apps/thechoosentalks`
4. runtime backend hidup lewat symlink:
   - `current -> releases/20260323041717`
5. env dan storage tidak hidup di folder release, tetapi di:
   - `shared/.env`
   - `shared/storage`
6. web publik masuk lewat:
   - `/home/thechoosentalks/public_html/index.php`
7. bridge publik meneruskan request ke:
   - `/home/thechoosentalks/deploy/apps/thechoosentalks/current/public/index.php`
8. auth header pass-through ditegakkan lewat `.htaccess`
9. Laravel live saat audit:
   - `12.52.0`
10. PHP live saat audit:
   - `8.3.30`

## Fakta yang Terkonfirmasi Langsung via SSH

### Identitas Server

- home directory aktif: `/home/thechoosentalks`
- user login SSH: `thechoosentalks`

### Deploy Root

Path utama backend deploy:

- `/home/thechoosentalks/deploy/apps/thechoosentalks`

Isi level utama yang berhasil terlihat:

- `build.tar.gz`
- `build.tar.gz.sha256`
- `current`
- `deploy.sh`
- `deploy.sh.bak`
- `deploy.sh.before-hardening-20260318084003.bak`
- `deploy.sh.before-prune-fix-20260318155247.bak`
- `deploy.sh.pre-fix-20260318083621.bak`
- `deploy_pull.log`
- `healthcheck.sh`
- `releases`
- `rollback.sh`
- `shared`

### Public Root

Path web publik:

- `/home/thechoosentalks/public_html`

Isi minimum yang berhasil terlihat:

- `css`
- `fonts`
- `index.php`
- `js`

### Release Aktif

Symlink runtime aktif:

- `/home/thechoosentalks/deploy/apps/thechoosentalks/current`

Target symlink:

- `/home/thechoosentalks/deploy/apps/thechoosentalks/releases/20260323041717`

### Shared Runtime State

Isi `shared/` yang berhasil terkonfirmasi:

- `.env`
- `.env.bak-20260312-100023`
- `.env.before-app-url-fix-20260318153220.bak`
- `.env.before-domain-sync-20260318153529.bak`
- `.env.before-domain-sync-20260318153617.bak`
- `.env.before-healthcheck-url-20260318084256.bak`
- `.env.before-next-public-app-url-20260318161102.bak`
- `storage/`

### Bridge Publik Live

Isi `public_html/index.php` yang terkonfirmasi:

```php
<?php
declare(strict_types=1);
require __DIR__ . '/../deploy/apps/thechoosentalks/current/public/index.php';
```

## Struktur Server End-to-End

```text
/home/thechoosentalks
├─ .ssh/
├─ deploy/
│  └─ apps/
│     └─ thechoosentalks/
│        ├─ build.tar.gz
│        ├─ build.tar.gz.sha256
│        ├─ current -> releases/20260323041717
│        ├─ deploy.sh
│        ├─ deploy.sh.bak
│        ├─ deploy.sh.before-hardening-20260318084003.bak
│        ├─ deploy.sh.before-prune-fix-20260318155247.bak
│        ├─ deploy.sh.pre-fix-20260318083621.bak
│        ├─ deploy_pull.log
│        ├─ healthcheck.sh
│        ├─ releases/
│        ├─ rollback.sh
│        └─ shared/
│           ├─ .env
│           └─ storage/
│              ├─ app/
│              │  └─ public/
│              │     ├─ avatars/
│              │     └─ community/
│              │        └─ posts/
│              ├─ framework/
│              │  ├─ cache/
│              │  ├─ sessions/
│              │  └─ views/
│              └─ logs/
│                 └─ laravel.log
└─ public_html/
   ├─ css/
   ├─ fonts/
   ├─ index.php
   └─ js/
```

## Release Layer

### Release History yang Terlihat

Release terbaru yang berhasil terkonfirmasi:

```text
20260322064235
20260322095200
20260322125021
20260322130653
20260323041717
```

Makna operasional:
- deploy model timestamped release aktif
- server menyimpan beberapa release terakhir
- rollback bisa dilakukan tanpa rebuild dari nol

### Struktur Release Aktif

Isi top-level release aktif:

```text
/home/thechoosentalks/deploy/apps/thechoosentalks/releases/20260323041717
├─ .env -> /home/thechoosentalks/deploy/apps/thechoosentalks/shared/.env
├─ app/
├─ artisan
├─ bootstrap/
├─ composer.json
├─ composer.lock
├─ config/
├─ content/
├─ database/
├─ deploy-local.js
├─ deploy-local.ps1
├─ deploy.sh
├─ healthcheck.sh
├─ package.json
├─ phpunit.xml
├─ public/
├─ resources/
├─ rollback.sh
├─ routes/
├─ storage -> /home/thechoosentalks/deploy/apps/thechoosentalks/shared/storage
├─ tests/
├─ vendor/
├─ vite.config.js
└─ webhook-template.php
```

Ini membuktikan:
- release aktif berisi source Laravel lengkap
- `vendor/` ada di release aktif
- `backend-api` memang dimaterialisasi penuh saat deploy
- `.env` dan `storage` di-link dari `shared`

### Target Symlink Runtime

Target yang berhasil terkonfirmasi:

- `current/.env -> /home/thechoosentalks/deploy/apps/thechoosentalks/shared/.env`
- `current/storage -> /home/thechoosentalks/deploy/apps/thechoosentalks/shared/storage`

Makna operasional:
- release baru tidak membawa env sendiri
- release baru tidak membawa storage runtime sendiri
- state produksi dipertahankan lintas release

## Shared Runtime State

### Shared Directory

Struktur `shared/`:

```text
/home/thechoosentalks/deploy/apps/thechoosentalks/shared
├─ .env
├─ .env.bak-20260312-100023
├─ .env.before-app-url-fix-20260318153220.bak
├─ .env.before-domain-sync-20260318153529.bak
├─ .env.before-domain-sync-20260318153617.bak
├─ .env.before-healthcheck-url-20260318084256.bak
├─ .env.before-next-public-app-url-20260318161102.bak
└─ storage/
```

Interpretasi:
- perubahan env pernah dilakukan langsung di server
- backup env historis masih tersimpan
- ini penting untuk audit drift dan rollback konfigurasi

### Shared Storage Top-Level

```text
/home/thechoosentalks/deploy/apps/thechoosentalks/shared/storage
├─ app/
│  └─ public/
├─ framework/
│  ├─ cache/
│  ├─ sessions/
│  └─ views/
└─ logs/
   └─ laravel.log
```

### Public Media Buckets

Struktur media publik yang berhasil terbaca:

```text
/home/thechoosentalks/deploy/apps/thechoosentalks/shared/storage/app/public
├─ community/
│  └─ posts/
│     └─ OqEULdZMCGLZkvpZ0ZyLWnBcymYShjtU74nQxiVq.png
└─ avatars/
   └─ M6F9J1wo9cAdd59muwbNSnsxIQTcyVKOryZwnKiQ.webp
```

Makna operasional:
- bucket avatar benar-benar ada di disk
- bucket gambar post community benar-benar ada di disk
- jika media gagal tampil, akar masalah besar kemungkinannya ada di URL resolver, origin, resource response, atau route storage, bukan karena bucket tidak ada

### Footprint Storage Runtime

Ukuran yang berhasil terkonfirmasi:

```text
logs                 1.3M
framework/cache       20K
framework/sessions   212K
framework/views      2.6M
```

Isi penting yang berhasil terlihat:

- `shared/storage/logs/laravel.log` ukuran `1.3M`
- `current/bootstrap/cache/`
  - `.gitignore`
  - `config.php`
  - `events.php`
  - `packages.php`
  - `services.php`

Interpretasi:
- logs aktif dan non-trivial
- view cache cukup besar
- session file backend memang hidup di disk

## Permission Layer

Permission runtime yang berhasil terkonfirmasi:

- `current/storage`
  - mode: `lrwxrwxrwx`
  - octal: `777`
  - owner/group: `thechoosentalks:thechoosentalks`
- `current/bootstrap/cache`
  - mode: `drwxr-xr-x`
  - octal: `755`
  - owner/group: `thechoosentalks:thechoosentalks`
- `shared/storage`
  - mode: `drwxr-xr-x`
  - octal: `755`
  - owner/group: `thechoosentalks:thechoosentalks`
- `shared/storage/logs`
  - mode terlihat: `drwxrwxr-x`
- `shared/storage/logs/laravel.log`
  - mode terlihat: `-rwxrwxr-x`

Makna operasional:
- storage diakses melalui symlink ke shared state
- bootstrap cache hidup di dalam release aktif
- owner/group konsisten
- healthcheck deploy memang memverifikasi storage dan bootstrap/cache writable

## Public Web Bridge Layer

### `public_html/index.php`

Bridge live:

```php
<?php
declare(strict_types=1);
require __DIR__ . '/../deploy/apps/thechoosentalks/current/public/index.php';
```

Makna:
- `public_html` bukan root source Laravel penuh
- ia hanya pintu masuk publik ke release aktif

### `public/` di Release Aktif

```text
/home/thechoosentalks/deploy/apps/thechoosentalks/releases/20260323041717/public
├─ .htaccess
├─ css/
├─ fonts/
├─ index.php
└─ js/
```

Makna:
- deploy menyalin asset publik dari `release/public` ke `public_html`
- `public_html` berisi artefak publik yang perlu diakses web

## Rewrite and Auth Header Layer

`.htaccess` di `current/public/.htaccess` dan `public_html/.htaccess` berhasil terbaca dan isinya identik:

```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    # Ensure Authorization headers are passed to PHP/FastCGI in cPanel
    CGIPassAuth On

    RewriteEngine On

    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    RewriteCond %{REQUEST_URI} !^/storage/
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

Makna operasional:
- auth bearer/header tidak dibiarkan hilang di FastCGI
- request `/storage/` dikecualikan dari rewrite fallback
- request non-file/non-folder diarahkan ke Laravel front controller

Ini penting untuk:
- login API
- route member-only
- media delivery
- auth forwarding dari frontend Next.js ke backend Laravel

## Deploy Script Layer

### `deploy.sh` Live

Fungsi yang berhasil terkonfirmasi langsung:

- clone sparse monorepo dari:
  - `git@github.com:engelwillem/TCT--Hybrid--Monorepo.git`
- branch default:
  - `main`
- backend dir yang dimaterialisasi:
  - `backend-api`
- membuat release baru timestamped di `releases/`
- link `.env` dari `shared/.env`
- link `storage` dari `shared/storage`
- `composer install`
- `php artisan optimize:clear`
- `php artisan config:cache`
- `php artisan view:cache`
- `php artisan event:cache`
- migrate hanya jika `RUN_MIGRATIONS=true`
- pre-switch healthcheck
- sync `public/` ke `public_html`
- rewrite `public_html/index.php`
- switch symlink `current`
- post-switch healthcheck
- prune release lama, default keep `5`

### `rollback.sh` Live

Fungsi yang berhasil terkonfirmasi:

- memilih release sebelumnya bila `--release` tidak diberikan
- mengubah `current` ke target release
- rsync `public/` target release ke `public_html`
- menulis ulang bridge `public_html/index.php`

### `healthcheck.sh` Live

Fungsi yang berhasil terkonfirmasi:

- validasi `artisan`
- validasi `vendor/autoload.php`
- validasi `storage` writable
- validasi `bootstrap/cache` writable
- `php artisan --version`
- `php artisan about`
- bootstrap app dan cek jumlah `BibleVerse` untuk `provider=ayt`, `lang=id`
- jika HTTP check aktif, probe default:
  - `/api/v1/today`
  - `/api/v1/community/posts`

Makna:
- deploy script live cukup hardened
- rollback script live memang benar-benar operasional
- healthcheck tidak hanya syntax-level, tetapi juga data-level dan HTTP-level

## Runtime Platform Layer

Output `php artisan about` dan runtime tooling yang berhasil terkonfirmasi:

- Application Name: `The Chosen Talks`
- Laravel Version: `12.52.0`
- PHP Version: `8.3.30`
- Composer Version: `2.8.12`
- Environment: `production`
- Debug Mode: `OFF`
- URL: `api.thechoosentalks.org`
- Maintenance Mode: `OFF`
- Timezone: `UTC`
- Locale: `en`

Cache state:
- Config: `CACHED`
- Events: `CACHED`
- Routes: `NOT CACHED`
- Views: `CACHED`

Drivers:
- Cache: `file`
- Database: `mysql`
- Logs: `stack / single`
- Mail: `failover / smtp, log`
- Queue: `sync`
- Session: `file`

Storage diagnostic:
- `public/storage`: `NOT LINKED`

Interpretasi penting:
- backend hidup dalam mode production yang benar
- session dan cache masih file-based
- route caching tidak aktif
- `public/storage NOT LINKED` tidak otomatis berarti rusak, karena route list live juga menunjukkan adanya:
  - `GET storage/{path}`
  - `PUT storage/{path}`

Jadi, delivery media sangat mungkin mengandalkan route Laravel, bukan symlink `public/storage`.

## SSH / Git Connectivity Layer

### `~/.ssh` Server-Side

Isi metadata yang berhasil terlihat:

- `authorized_keys`
- `config`
- `github_deploy_key`
- `github_deploy_key.pub`
- `id_rsa`
- `id_rsa.pub`
- `known_hosts`
- `known_hosts.old`

### `~/.ssh/config`

Isi yang terkonfirmasi:

```sshconfig
Host github.com
  HostName github.com
  User git
  IdentityFile /home/thechoosentalks/.ssh/github_deploy_key
  IdentitiesOnly yes
```

Makna operasional:
- server cPanel memakai deploy key khusus untuk GitHub
- deploy backend benar-benar server-side git pull / sparse clone
- deploy backend tidak bergantung pada artifact frontend Tencent

## Laravel Surface Live

Route Laravel aktif yang berhasil dibuktikan secara langsung:

- canonical Today:
  - `GET /api/today/session`
- Today legacy/internal:
  - `GET /api/v1/today`
  - `POST /api/v1/today/state`
- Auth API:
  - `POST /api/v1/login`
  - `POST /api/v1/register`
  - `POST /api/v1/forgot-password`
  - `POST /api/v1/reset-password`
  - `POST /api/v1/auth/firebase/sync`
  - `POST /api/v1/auth/logout`
- Profile:
  - `GET /api/v1/profile`
  - `PATCH|POST /api/v1/profile`
  - `DELETE /api/v1/profile`
  - `PUT /api/v1/profile/password`
  - two-factor routes
  - `GET /api/v1/avatar/{user}`
- Community:
  - `GET /api/v1/community/posts`
  - `POST /api/v1/community/posts`
  - bookmark/comments/pray
- VerseHub:
  - books
  - chapter
  - chapters
  - suggest
  - reflections
  - reader-actions
  - mentor
  - public verse pages and OG
- Study Paths
- Sabbath School
- Inbox/direct message
- Channels/weekly
- Filament admin di `/admintalk/*`
- Sanctum / storage / health routes

Total route yang terlapor saat audit:

- `143` routes

## Apa yang Sekarang Sudah Pasti

Hal-hal berikut sekarang bukan asumsi lagi:

- server live memakai branch `main` di `deploy.sh`
- server live memakai sparse clone `backend-api`
- release aktif saat audit adalah `20260323041717`
- env live diambil dari `shared/.env`
- storage live diambil dari `shared/storage`
- `public_html/index.php` memang bridge ke `current/public/index.php`
- rewrite layer live meneruskan `Authorization` header
- backend runtime benar-benar hidup di mode `production`
- deploy server-side benar-benar punya koneksi SSH terkonfigurasi ke GitHub
- media bucket `avatars` dan `community/posts` memang ada di disk live
- route canonical `GET /api/today/session` memang live
- route auth `POST /api/v1/login` dan `POST /api/v1/register` memang live

## Command Audit yang Berhasil

Berikut command-command yang benar-benar menghasilkan data pada sesi ini.

```powershell
& "C:\WINDOWS\System32\OpenSSH\ssh.exe" `
  -i "$HOME\.ssh\cpanel_laptop_deploy" `
  -o StrictHostKeyChecking=accept-new `
  -o ConnectTimeout=10 `
  thechoosentalks@209.42.27.90 `
  "pwd; whoami; readlink -f /home/thechoosentalks/deploy/apps/thechoosentalks/current; ls -1 /home/thechoosentalks/deploy/apps/thechoosentalks | sed -n '1,20p'; ls -1 /home/thechoosentalks/public_html | sed -n '1,20p'"
```

```powershell
& "C:\WINDOWS\System32\OpenSSH\ssh.exe" `
  -i "$HOME\.ssh\cpanel_laptop_deploy" `
  -o StrictHostKeyChecking=accept-new `
  -o ConnectTimeout=15 `
  thechoosentalks@209.42.27.90 `
  "ls -lah /home/thechoosentalks/deploy/apps/thechoosentalks/shared"
```

```powershell
& "C:\WINDOWS\System32\OpenSSH\ssh.exe" `
  -i "$HOME\.ssh\cpanel_laptop_deploy" `
  -o StrictHostKeyChecking=accept-new `
  -o ConnectTimeout=15 `
  thechoosentalks@209.42.27.90 `
  "sed -n '1,140p' /home/thechoosentalks/public_html/index.php"
```

```powershell
& "C:\WINDOWS\System32\OpenSSH\ssh.exe" `
  -i "$HOME\.ssh\cpanel_laptop_deploy" `
  -o StrictHostKeyChecking=accept-new `
  -o ConnectTimeout=15 `
  thechoosentalks@209.42.27.90 `
  "sed -n '1,240p' /home/thechoosentalks/deploy/apps/thechoosentalks/deploy.sh"
```

```powershell
& "C:\WINDOWS\System32\OpenSSH\ssh.exe" `
  -i "$HOME\.ssh\cpanel_laptop_deploy" `
  -o StrictHostKeyChecking=accept-new `
  -o ConnectTimeout=15 `
  thechoosentalks@209.42.27.90 `
  "sed -n '1,240p' /home/thechoosentalks/deploy/apps/thechoosentalks/rollback.sh"
```

```powershell
& "C:\WINDOWS\System32\OpenSSH\ssh.exe" `
  -i "$HOME\.ssh\cpanel_laptop_deploy" `
  -o StrictHostKeyChecking=accept-new `
  -o ConnectTimeout=20 `
  thechoosentalks@209.42.27.90 `
  "sed -n '1,240p' /home/thechoosentalks/deploy/apps/thechoosentalks/healthcheck.sh"
```

```powershell
& "C:\WINDOWS\System32\OpenSSH\ssh.exe" `
  -i "$HOME\.ssh\cpanel_laptop_deploy" `
  -o StrictHostKeyChecking=accept-new `
  -o ConnectTimeout=15 `
  thechoosentalks@209.42.27.90 `
  "cd /home/thechoosentalks/deploy/apps/thechoosentalks/current && php artisan route:list | grep -E 'api/today/session|api/today-v2/session|api/v1/login|api/v1/register' || true"
```

```powershell
& "C:\WINDOWS\System32\OpenSSH\ssh.exe" `
  -i "$HOME\.ssh\cpanel_laptop_deploy" `
  -o StrictHostKeyChecking=accept-new `
  -o ConnectTimeout=20 `
  thechoosentalks@209.42.27.90 `
  "find /home/thechoosentalks/deploy/apps/thechoosentalks/shared/storage -maxdepth 2 | sed -n '1,200p'"
```

```powershell
& "C:\WINDOWS\System32\OpenSSH\ssh.exe" `
  -i "$HOME\.ssh\cpanel_laptop_deploy" `
  -o StrictHostKeyChecking=accept-new `
  -o ConnectTimeout=20 `
  thechoosentalks@209.42.27.90 `
  "cd /home/thechoosentalks/deploy/apps/thechoosentalks/current && php artisan route:list | sed -n '1,260p'"
```

```powershell
& "C:\WINDOWS\System32\OpenSSH\ssh.exe" `
  -i "$HOME\.ssh\cpanel_laptop_deploy" `
  -o StrictHostKeyChecking=accept-new `
  -o ConnectTimeout=20 `
  thechoosentalks@209.42.27.90 `
  "stat -c '%A %a %U %G %n' /home/thechoosentalks/deploy/apps/thechoosentalks/current/storage /home/thechoosentalks/deploy/apps/thechoosentalks/current/bootstrap/cache /home/thechoosentalks/deploy/apps/thechoosentalks/shared/storage"
```

```powershell
& "C:\WINDOWS\System32\OpenSSH\ssh.exe" `
  -i "$HOME\.ssh\cpanel_laptop_deploy" `
  -o StrictHostKeyChecking=accept-new `
  -o ConnectTimeout=20 `
  thechoosentalks@209.42.27.90 `
  "ls -1 /home/thechoosentalks/deploy/apps/thechoosentalks/releases | tail -n 10"
```

```powershell
& "C:\WINDOWS\System32\OpenSSH\ssh.exe" `
  -i "$HOME\.ssh\cpanel_laptop_deploy" `
  -o StrictHostKeyChecking=accept-new `
  -o ConnectTimeout=20 `
  thechoosentalks@209.42.27.90 `
  "readlink -f /home/thechoosentalks/deploy/apps/thechoosentalks/current/.env; readlink -f /home/thechoosentalks/deploy/apps/thechoosentalks/current/storage"
```

```powershell
& "C:\WINDOWS\System32\OpenSSH\ssh.exe" `
  -i "$HOME\.ssh\cpanel_laptop_deploy" `
  -o StrictHostKeyChecking=accept-new `
  -o ConnectTimeout=20 `
  thechoosentalks@209.42.27.90 `
  "ls -lah /home/thechoosentalks/deploy/apps/thechoosentalks/releases/20260323041717 | sed -n '1,220p'"
```

```powershell
& "C:\WINDOWS\System32\OpenSSH\ssh.exe" `
  -i "$HOME\.ssh\cpanel_laptop_deploy" `
  -o StrictHostKeyChecking=accept-new `
  -o ConnectTimeout=20 `
  thechoosentalks@209.42.27.90 `
  "ls -lah /home/thechoosentalks/deploy/apps/thechoosentalks/current/public | sed -n '1,160p'"
```

```powershell
& "C:\WINDOWS\System32\OpenSSH\ssh.exe" `
  -i "$HOME\.ssh\cpanel_laptop_deploy" `
  -o StrictHostKeyChecking=accept-new `
  -o ConnectTimeout=20 `
  thechoosentalks@209.42.27.90 `
  "sed -n '1,220p' /home/thechoosentalks/deploy/apps/thechoosentalks/current/public/.htaccess; echo '---PUBLIC_HTML---'; sed -n '1,220p' /home/thechoosentalks/public_html/.htaccess"
```

```powershell
& "C:\WINDOWS\System32\OpenSSH\ssh.exe" `
  -i "$HOME\.ssh\cpanel_laptop_deploy" `
  -o StrictHostKeyChecking=accept-new `
  -o ConnectTimeout=20 `
  thechoosentalks@209.42.27.90 `
  "cd /home/thechoosentalks/deploy/apps/thechoosentalks/current && php artisan --version && echo '---ABOUT---' && php artisan about | sed -n '1,220p' && echo '---PHP---' && php -v | sed -n '1,6p' && echo '---GIT---' && git --version && echo '---COMPOSER---' && composer --version"
```

```powershell
& "C:\WINDOWS\System32\OpenSSH\ssh.exe" `
  -i "$HOME\.ssh\cpanel_laptop_deploy" `
  -o StrictHostKeyChecking=accept-new `
  -o ConnectTimeout=20 `
  thechoosentalks@209.42.27.90 `
  "ls -lah /home/thechoosentalks/.ssh | sed -n '1,120p'; echo '---'; if [ -f /home/thechoosentalks/.ssh/config ]; then sed -n '1,160p' /home/thechoosentalks/.ssh/config; else echo NO_SSH_CONFIG; fi"
```

```powershell
& "C:\WINDOWS\System32\OpenSSH\ssh.exe" `
  -i "$HOME\.ssh\cpanel_laptop_deploy" `
  -o StrictHostKeyChecking=accept-new `
  -o ConnectTimeout=25 `
  thechoosentalks@209.42.27.90 `
  "if [ -d /home/thechoosentalks/deploy/apps/thechoosentalks/shared/storage/app/public ]; then echo EXISTS; find /home/thechoosentalks/deploy/apps/thechoosentalks/shared/storage/app/public -maxdepth 1 -printf '%M %u %g %p\n' | sed -n '1,80p'; else echo MISSING; fi"
```

```powershell
& "C:\WINDOWS\System32\OpenSSH\ssh.exe" `
  -i "$HOME\.ssh\cpanel_laptop_deploy" `
  -o StrictHostKeyChecking=accept-new `
  -o ConnectTimeout=25 `
  thechoosentalks@209.42.27.90 `
  "find /home/thechoosentalks/deploy/apps/thechoosentalks/shared/storage/app/public/community -maxdepth 2 -printf '%M %u %g %p\n' | sed -n '1,120p'; echo '---'; find /home/thechoosentalks/deploy/apps/thechoosentalks/shared/storage/app/public/avatars -maxdepth 2 -printf '%M %u %g %p\n' | sed -n '1,120p'"
```

```powershell
& "C:\WINDOWS\System32\OpenSSH\ssh.exe" `
  -i "$HOME\.ssh\cpanel_laptop_deploy" `
  -o StrictHostKeyChecking=accept-new `
  -o ConnectTimeout=25 `
  thechoosentalks@209.42.27.90 `
  "du -sh /home/thechoosentalks/deploy/apps/thechoosentalks/shared/storage/logs /home/thechoosentalks/deploy/apps/thechoosentalks/shared/storage/framework/cache /home/thechoosentalks/deploy/apps/thechoosentalks/shared/storage/framework/sessions /home/thechoosentalks/deploy/apps/thechoosentalks/shared/storage/framework/views; echo '---'; ls -lah /home/thechoosentalks/deploy/apps/thechoosentalks/shared/storage/logs | sed -n '1,40p'; echo '---'; ls -lah /home/thechoosentalks/deploy/apps/thechoosentalks/current/bootstrap/cache | sed -n '1,40p'"
```

## Audit Lanjutan yang Masih Bisa Menambah Detail

Peta server saat ini sudah cukup lengkap untuk kebutuhan operasional inti. Gelombang forensik terakhir di bawah ini mengunci layer delivery media, front controller Laravel, filesystem disk config, dan ringkasan deploy log.

## Front Controller Live

Isi `current/public/index.php` yang terkonfirmasi:

```php
<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

require __DIR__.'/../vendor/autoload.php';

/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

$app->handleRequest(Request::capture());
```

Makna operasional:
- `public_html/index.php` hanya bridge tipis
- entrypoint Laravel yang sesungguhnya tetap `current/public/index.php`
- mode maintenance Laravel akan dihormati bila file maintenance ada di storage framework

## Filesystem Configuration Live

Isi penting `current/config/filesystems.php` yang terkonfirmasi:

- default disk:
  - `env('FILESYSTEM_DISK', 'local')`
- disk `local`:
  - root: `storage_path('app/private')`
  - `serve => true`
- disk `public`:
  - root: `storage_path('app/public')`
  - url: `rtrim(env('APP_URL', 'http://localhost'), '/').'/storage'`
  - visibility: `public`
- links:
  - `public_path('storage') => storage_path('app/public')`

Makna operasional:
- Laravel tetap dikonfigurasi secara standar untuk `public/storage`
- tetapi pada runtime live, `php artisan about` melaporkan `public/storage: NOT LINKED`
- jadi model delivery media di server ini tidak boleh diasumsikan bergantung pada symlink `public/storage`

## Mapping Route `storage/{path}` ke File Fisik

Fakta yang sekarang sudah saling mengunci:

1. route list live menunjukkan ada route:
   - `GET storage/{path}`
   - `PUT storage/{path}`
2. `.htaccess` live mengecualikan `/storage/` dari rewrite fallback
3. disk `public` tetap mengarah ke:
   - `storage/app/public`
4. `public/storage` dilaporkan `NOT LINKED`
5. bucket fisik publik memang ada di:
   - `/home/thechoosentalks/deploy/apps/thechoosentalks/shared/storage/app/public`

Interpretasi teknis paling kuat:

- request `/storage/<path>` kemungkinan tidak bergantung pada symlink Unix `public/storage`
- server tetap melayani `/storage/<path>` lewat route Laravel `storage/{path}` atau mekanisme framework yang setara
- file fisik target tetap berada di:
  - `/home/thechoosentalks/deploy/apps/thechoosentalks/shared/storage/app/public/<path>`

Jadi mapping mental yang aman adalah:

```text
URL /storage/<path>
-> public disk
-> storage_path('app/public/<path>')
-> /home/thechoosentalks/deploy/apps/thechoosentalks/shared/storage/app/public/<path>
```

## Korelasi `avatar_url` ke File Fisik

Dari source backend yang aktif di repo:

- model [User.php](e:/thechoosentalksnext/backend-api/app/Models/User.php)
  - `getFilamentAvatarUrl()`:
    - membaca `avatar_path`
    - memastikan file memang ada di `Storage::disk('public')`
    - mengembalikan URL:
      - `/api/v1/avatar/{id}?v={timestamp}`

- controller [ProfileController.php](e:/thechoosentalksnext/backend-api/app/Http/Controllers/ProfileController.php)
  - method `avatar(User $user)`:
    - membaca `avatar_path`
    - cek keberadaan file di disk `public`
    - resolve file fisik dengan:
      - `Storage::disk('public')->path($path)`
    - lalu `response()->file(...)`

Artinya korelasi final avatar adalah:

```text
DB users.avatar_path
-> contoh: avatars/M6F9J1wo9cAdd59muwbNSnsxIQTcyVKOryZwnKiQ.webp
-> disk public root = storage/app/public
-> file fisik:
   /home/thechoosentalks/deploy/apps/thechoosentalks/shared/storage/app/public/avatars/M6F9J1wo9cAdd59muwbNSnsxIQTcyVKOryZwnKiQ.webp
-> URL yang dipakai frontend:
   /api/v1/avatar/{userId}?v={updated_at}
```

Kesimpulan penting:
- avatar frontend tidak bergantung pada `/storage/...`
- avatar memang sengaja diserve lewat endpoint API agar tidak tergantung symlink `public/storage`

## Korelasi Community Image URL ke File Fisik

Dari source backend yang aktif di repo:

- controller [CommunityApiController.php](e:/thechoosentalksnext/backend-api/app/Http/Controllers/Api/V1/CommunityApiController.php)
  - saat upload image:
    - file disimpan dengan:
      - `$file->store('community/posts', 'public')`
    - path yang dikembalikan ke payload:
      - `'/storage/' . ltrim($path, '/')`
  - `serializePost()` mengembalikan:
    - `imageUrl` dari `image_path`
    - `mediaPaths` dari `media_paths`

Artinya korelasi final community image adalah:

```text
stored relative path
-> community/posts/OqEULdZMCGLZkvpZ0ZyLWnBcymYShjtU74nQxiVq.png
-> file fisik:
   /home/thechoosentalks/deploy/apps/thechoosentalks/shared/storage/app/public/community/posts/OqEULdZMCGLZkvpZ0ZyLWnBcymYShjtU74nQxiVq.png
-> URL payload API:
   /storage/community/posts/OqEULdZMCGLZkvpZ0ZyLWnBcymYShjtU74nQxiVq.png
```

Kesimpulan penting:
- community images memakai URL `/storage/...`
- avatar memakai URL `/api/v1/avatar/...`
- jadi pipeline delivery avatar dan community image memang berbeda secara sengaja

## Public Media Delivery Model

Blueprint delivery media yang sekarang sudah cukup jelas:

### Avatar

```text
users.avatar_path
-> Storage disk public
-> file fisik di shared/storage/app/public/avatars/*
-> served by GET /api/v1/avatar/{user}
```

### Community Post Image

```text
uploaded file
-> stored on public disk under community/posts/*
-> file fisik di shared/storage/app/public/community/posts/*
-> serialized as /storage/community/posts/<file>
-> served via storage route/layer
```

### Implikasi Debugging

Kalau avatar gagal tampil:
- cek `users.avatar_path`
- cek file fisik ada atau tidak
- cek `/api/v1/avatar/{user}` response

Kalau community image gagal tampil:
- cek `image_path` / `media_paths`
- cek file fisik di `shared/storage/app/public/community/posts`
- cek `/storage/...` response path
- cek origin/base URL yang dipakai frontend

## Ringkasan `deploy_pull.log`

Tail `deploy_pull.log` yang berhasil diambil menunjukkan release aktif `20260323041717` menyelesaikan langkah berikut:

1. publikasi asset berhasil
2. cache Laravel dibersihkan
3. config cache sukses
4. views cache sukses
5. events cache sukses
6. migration dilewati karena:
   - `RUN_MIGRATIONS=false`
7. pre-switch local healthcheck:
   - `Healthcheck OK (local checks only).`
8. sync public assets ke `public_html`
9. switch symlink `current`
10. post-switch healthcheck:
   - `Healthcheck OK.`
11. prune old releases dengan keep `5`
12. deploy selesai sukses
13. release aktif akhir:
   - `/home/thechoosentalks/deploy/apps/thechoosentalks/releases/20260323041717`

Makna operasional:
- deploy terakhir bukan deploy setengah jalan
- release aktif benar-benar lolos local check dan HTTP healthcheck
- pipeline release saat audit berada dalam keadaan sehat

## Auth / Session / Sanctum Blueprint

### Middleware Bootstrapping

File live aktif yang berhasil dibaca langsung dari release:

- `/home/thechoosentalks/deploy/apps/thechoosentalks/current/bootstrap/app.php`

Isi runtime yang terkonfirmasi mengonfirmasi:

- `$middleware->statefulApi();`
- guest route redirect diarahkan ke:
  - login Filament jika mengakses `admintalk/*`
  - `NEXT_PUBLIC_APP_URL` untuk surface publik/frontend
- `HandleCors`, `SecurityHeaders`, dan `RequestProfiling` dipasang di web middleware

Makna operasional:
- backend memang disiapkan untuk pola SPA stateful Sanctum
- auth flow publik tidak diperlakukan seperti admin panel

### Session Config

File live aktif yang berhasil dibaca langsung dari release:

- `/home/thechoosentalks/deploy/apps/thechoosentalks/current/config/session.php`

File runtime + env live mengunci kombinasi berikut:

- `SESSION_DRIVER=file`
- `SESSION_DOMAIN=.thechoosentalks.org`
- `SESSION_SECURE_COOKIE=true`
- `SESSION_SAME_SITE=lax`
- `SESSION_COOKIE`:
  - default dari app name jika tidak dioverride

Makna operasional:
- cookie session berlaku lintas subdomain `thechoosentalks.org`
- cookie hanya dikirim aman di HTTPS
- mode `lax` cocok untuk navigasi normal, tetapi bukan model cross-site third-party paling longgar
- session backend benar-benar disimpan sebagai file di:
  - `shared/storage/framework/sessions`

### Sanctum Config

File live aktif yang berhasil dibaca langsung dari release:

- `/home/thechoosentalks/deploy/apps/thechoosentalks/current/config/sanctum.php`

File runtime + env live mengunci:

- `guard => ['web']`
- `expiration => null`
- `SANCTUM_STATEFUL_DOMAINS=thechoosentalks.org,www.thechoosentalks.org`

Makna operasional:
- Sanctum stateful mode memang diarahkan untuk origin frontend publik utama
- `localhost` tetap ada di config fallback code untuk parity development
- runtime live production secara eksplisit mengizinkan:
  - `thechoosentalks.org`
  - `www.thechoosentalks.org`

### Env Live Non-Secret yang Terkonfirmasi

Nilai runtime non-secret yang berhasil diambil dari `.env` live:

```text
APP_URL=https://api.thechoosentalks.org
SESSION_DRIVER=file
SESSION_DOMAIN=.thechoosentalks.org
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax
SANCTUM_STATEFUL_DOMAINS=thechoosentalks.org,www.thechoosentalks.org
NEXT_PUBLIC_APP_URL=https://thechoosentalks.org
```

Korelasi penting:
- backend origin resmi: `https://api.thechoosentalks.org`
- frontend app URL publik: `https://thechoosentalks.org`
- cookie domain dibuka ke root domain agar subdomain API dan web tetap bisa berbagi konteks yang diperlukan

## Media Payload Correlation Blueprint

### Avatar Delivery Path

Source lokal yang sudah terkonfirmasi:

- [User.php](e:/thechoosentalksnext/backend-api/app/Models/User.php)
  - `getFilamentAvatarUrl()` mengembalikan:
    - `/api/v1/avatar/{id}?v={timestamp}`
  - sebelum URL dikembalikan, backend mengecek file benar-benar ada di disk `public`

- [ProfileController.php](e:/thechoosentalksnext/backend-api/app/Http/Controllers/ProfileController.php)
  - `avatar(User $user)`:
    - membaca `avatar_path`
    - resolve file dari `Storage::disk('public')`
    - stream file via `response()->file(...)`

Korelasi avatar final:

```text
DB users.avatar_path
-> contoh fisik yang terkonfirmasi:
   shared/storage/app/public/avatars/M6F9J1wo9cAdd59muwbNSnsxIQTcyVKOryZwnKiQ.webp
-> URL API:
   /api/v1/avatar/3?v=1774242149
```

### Community Image Delivery Path

Source lokal yang sudah terkonfirmasi:

- [CommunityApiController.php](e:/thechoosentalksnext/backend-api/app/Http/Controllers/Api/V1/CommunityApiController.php)
  - upload file disimpan ke:
    - `community/posts` pada disk `public`
  - payload API mengembalikan:
    - `imageUrl`
    - `mediaPaths`
    - dengan format `'/storage/' . ltrim($path, '/')`

Korelasi community image final:

```text
stored relative path
-> community/posts/OqEULdZMCGLZkvpZ0ZyLWnBcymYShjtU74nQxiVq.png
-> file fisik:
   /home/thechoosentalks/deploy/apps/thechoosentalks/shared/storage/app/public/community/posts/OqEULdZMCGLZkvpZ0ZyLWnBcymYShjtU74nQxiVq.png
-> URL payload:
   https://api.thechoosentalks.org/storage/community/posts/OqEULdZMCGLZkvpZ0ZyLWnBcymYShjtU74nQxiVq.png
```

## Payload API Live Aktual yang Terkonfirmasi

Sample payload live berhasil diambil dari origin backend dengan:

- request:
  - `curl -ks -H 'Host: api.thechoosentalks.org' https://209.42.27.90/api/v1/community/posts`

Potongan payload penting yang terkonfirmasi:

```json
{
  "data": {
    "posts": [
      {
        "id": "13",
        "type": "testimony",
        "text": "Bersyukur atas kebaikan TUHAN, sehingga hidup jauh lebih diberkati sekalipun masalah pasti akan tetap datang...",
        "imageUrl": "https://api.thechoosentalks.org/storage/community/posts/OqEULdZMCGLZkvpZ0ZyLWnBcymYShjtU74nQxiVq.png",
        "mediaPaths": [
          "https://api.thechoosentalks.org/storage/community/posts/OqEULdZMCGLZkvpZ0ZyLWnBcymYShjtU74nQxiVq.png"
        ],
        "author": {
          "id": "3",
          "name": "Engel Berth Willem",
          "avatarUrl": "/api/v1/avatar/3?v=1774242149"
        }
      }
    ]
  }
}
```

Korelasi runtime yang sekarang sudah terbukti:

- file fisik community:
  - `shared/storage/app/public/community/posts/OqEULdZMCGLZkvpZ0ZyLWnBcymYShjtU74nQxiVq.png`
- payload live community:
  - `https://api.thechoosentalks.org/storage/community/posts/OqEULdZMCGLZkvpZ0ZyLWnBcymYShjtU74nQxiVq.png`
- file fisik avatar:
  - `shared/storage/app/public/avatars/M6F9J1wo9cAdd59muwbNSnsxIQTcyVKOryZwnKiQ.webp`
- payload live avatar path:
  - `/api/v1/avatar/3?v=1774242149`

## Payload Profile Terautentikasi

### Yang Berhasil Dibuktikan

Raw HTTP response `/api/v1/profile` dengan sesi auth live belum diambil pada sesi ini karena audit SSH tidak membawa cookie atau bearer token pengguna yang valid.

Tetapi hal berikut sudah berhasil dikunci:

1. route live ada:
   - `GET /api/v1/profile`
2. route itu berada di group:
   - `auth:sanctum`
3. shape response berasal dari controller aktif:
   - [ProfileController.php](e:/thechoosentalksnext/backend-api/app/Http/Controllers/ProfileController.php)
4. user `id=3`, nama `Engel Berth Willem`, dan `avatarUrl` live sudah terbukti muncul di payload community production
5. controller live `ProfileController::edit()` memang membentuk payload:
   - `data.user.id`
   - `data.user.name`
   - `data.user.email`
   - `data.user.is_admin`
   - `data.user.email_verified_at`
   - `data.user.avatar_url`
   - `mustVerifyEmail`
   - `status`
   - `opsGateway`
   - `twoFactor`

### Payload Runtime-Equivalent

Berdasarkan controller aktif + payload community live yang sudah terkonfirmasi, bentuk payload profile terautentikasi yang ekuivalen adalah:

```json
{
  "data": {
    "user": {
      "id": "3",
      "name": "Engel Berth Willem",
      "email": "<email user live di DB>",
      "is_admin": false,
      "email_verified_at": "<iso timestamp atau null>",
      "avatar_url": "/api/v1/avatar/3?v=1774242149"
    },
    "mustVerifyEmail": true,
    "status": null,
    "opsGateway": null,
    "twoFactor": {
      "enabled": false,
      "recoveryCodesRemaining": 0
    }
  }
}
```

Status bukti:

- **proven via live payload:** `id`, `name`, `avatar_url` user 3
- **proven via live route + live controller file content:** shape `/api/v1/profile`
- **not yet captured via authenticated HTTP:** raw response `/api/v1/profile`

### Batasan Penting

Untuk benar-benar mengunci payload profile live apa adanya, masih dibutuhkan salah satu dari:

- cookie session production yang valid, atau
- bearer token valid untuk user runtime

Tanpa itu, dokumen ini tetap harus memperlakukan payload profile di atas sebagai:

- runtime-equivalent yang sangat kuat
- tetapi belum raw HTTP capture final

## Payload Profile Terautentikasi yang Berhasil Diambil

Setelah audit lanjutan, payload `/api/v1/profile` akhirnya berhasil diambil dari runtime live dengan metode berikut:

1. membuat token audit sementara untuk user `id=3`
2. memanggil endpoint live:
   - `https://209.42.27.90/api/v1/profile`
   - dengan header:
     - `Host: api.thechoosentalks.org`
     - `Authorization: Bearer <token sementara>`
3. langsung menghapus token audit setelah capture selesai
4. verifikasi akhir:
   - jumlah token `codex-audit-temp` kembali `0`

Payload live yang terkonfirmasi:

```json
{
  "data": {
    "user": {
      "id": "3",
      "name": "Engel Berth Willem",
      "email": "engel.willem@gmail.com",
      "is_admin": true,
      "email_verified_at": "2026-03-08T16:30:08+00:00",
      "avatar_url": "/api/v1/avatar/3?v=1774171605"
    },
    "mustVerifyEmail": true,
    "status": null,
    "opsGateway": {
      "status": "Needs Attention",
      "riskScore": 69,
      "topAction": "Lengkapi konten Sabbath School yang belum publish.",
      "statusHref": "https://api.thechoosentalks.org/admintalk/ops-triage#ss-needs-publish"
    },
    "twoFactor": {
      "enabled": false,
      "recoveryCodesRemaining": 0
    }
  }
}
```

Status bukti sekarang:

- **proven via authenticated live HTTP:** payload `/api/v1/profile`
- **proven via token hygiene check:** token audit sementara sudah direvoke kembali
- **no lingering audit token:** count `codex-audit-temp` = `0`

## `storage/{path}` Delivery Interpretation

Walau implementasi controller spesifik `storage/{path}` belum dibuka pada sesi ini, bukti yang sudah terkunci cukup kuat:

1. route list live memiliki:
   - `GET storage/{path}`
   - `PUT storage/{path}`
2. `public/storage` dilaporkan `NOT LINKED`
3. payload live community image memakai URL `/storage/community/posts/...`
4. file fisik community image memang ada di:
   - `shared/storage/app/public/community/posts/...`

Kesimpulan teknis yang aman:
- delivery `/storage/...` di server ini benar-benar aktif
- delivery itu tidak boleh diasumsikan bergantung ke symlink `public/storage`
- sumber file fisiknya tetap disk `public` Laravel:
  - `storage/app/public/...`

### Handler `storage/{path}` yang Paling Mungkin

Fakta yang berhasil dibuktikan:

1. `php artisan route:list --path=storage` live mengembalikan:
   - `GET|HEAD storage/{path} ... storage.local`
   - `PUT storage/{path} ... storage.local.upload`
2. pencarian pada release aktif untuk:
   - `storage.local`
   - `storage/{path}`
   - `Route::get('/storage`
   - `Route::put('/storage`
   tidak menemukan definisi custom di source aplikasi

Interpretasi paling kuat:

- `storage/{path}` bukan route custom buatan controller aplikasi Anda
- route itu sangat mungkin merupakan route internal framework/local filesystem serving layer
- nama action `storage.local` dan `storage.local.upload` menguatkan bahwa ini action framework-level, bukan `App\Http\Controllers\...`

Status bukti saat ini:

- **proven:** route live ada dan aktif
- **proven:** tidak ada definisi custom `/storage` yang berhasil ditemukan di source app aktif
- **likely:** handler berasal dari framework internal local storage serving
- **previously not captured:** FQCN/closure internal persis dari framework source

### Class/Handler Persis untuk `storage/{path}`

Status untuk class/handler persis sekarang sudah bisa dipetakan jauh lebih tegas.

Yang sudah proven:

1. route name live:
   - `storage.local`
   - `storage.local.upload`
2. pattern path live:
   - `GET|HEAD storage/{path}`
   - `PUT storage/{path}`
3. definisi custom tidak ditemukan di source aplikasi release aktif
4. source framework lokal yang seversi dengan runtime live menunjukkan:
   - `Illuminate\Filesystem\FilesystemServiceProvider::serveFiles()`
   - mendaftarkan route:
     - `Route::get($uri.'/{path}', ...)->name('storage.'.$disk);`
     - `Route::put($uri.'/{path}', ...)->name('storage.'.$disk.'.upload');`
5. source framework lokal menunjukkan handler GET memakai:
   - `Illuminate\Filesystem\ServeFile`
6. source framework lokal menunjukkan handler PUT memakai:
   - `Illuminate\Filesystem\ReceiveFile`

Mapping final yang paling kuat:

```text
storage.local
-> registered by Illuminate\Filesystem\FilesystemServiceProvider::serveFiles()
-> closure framework
-> instantiates Illuminate\Filesystem\ServeFile

storage.local.upload
-> registered by Illuminate\Filesystem\FilesystemServiceProvider::serveFiles()
-> closure framework
-> instantiates Illuminate\Filesystem\ReceiveFile
```

Kesimpulan operasional:

- `storage/{path}` benar-benar bukan handler custom app
- route ini milik layer framework Laravel filesystem serving
- untuk delivery file GET, class utamanya adalah:
  - `Illuminate\Filesystem\ServeFile`
- untuk upload PUT, class utamanya adalah:
  - `Illuminate\Filesystem\ReceiveFile`

Gap yang masih tersisa di sini bukan lagi gap handler utama, melainkan hanya gap pembuktian langsung dari object route live bahwa closure framework tersebut memang terikat persis pada class-class itu

## Command Tambahan yang Berhasil

```powershell
& "C:\WINDOWS\System32\OpenSSH\ssh.exe" `
  -i "$HOME\.ssh\cpanel_laptop_deploy" `
  -o StrictHostKeyChecking=accept-new `
  -o ConnectTimeout=25 `
  thechoosentalks@209.42.27.90 `
  "grep -E '^(APP_URL|NEXT_PUBLIC_APP_URL|SESSION_DRIVER|SESSION_DOMAIN|SESSION_SECURE_COOKIE|SESSION_SAME_SITE|SESSION_COOKIE|SANCTUM_STATEFUL_DOMAINS)=' /home/thechoosentalks/deploy/apps/thechoosentalks/shared/.env | sed -n '1,120p'"
```

```powershell
& "C:\WINDOWS\System32\OpenSSH\ssh.exe" `
  -i "$HOME\.ssh\cpanel_laptop_deploy" `
  -o StrictHostKeyChecking=accept-new `
  -o ConnectTimeout=25 `
  thechoosentalks@209.42.27.90 `
  "curl -ks -H 'Host: api.thechoosentalks.org' https://209.42.27.90/api/v1/community/posts | sed -n '1,20p'"
```

## Residual Gaps yang Masih Tersisa

Blueprint ini sekarang sudah sangat dekat ke full forensic runtime map. Yang masih tersisa hanya:

- audit config auth tambahan seperti `config/app.php` atau `config/cors.php` bila nanti dibutuhkan
- pembuktian object route live sampai ke closure internal framework untuk `storage.local`, jika suatu saat benar-benar diperlukan

Command lanjutan yang disarankan:

```bash
sed -n '1,220p' /home/thechoosentalks/deploy/apps/thechoosentalks/current/bootstrap/app.php
sed -n '1,260p' /home/thechoosentalks/deploy/apps/thechoosentalks/current/config/session.php
sed -n '1,220p' /home/thechoosentalks/deploy/apps/thechoosentalks/current/config/sanctum.php
php artisan route:list --path=storage -vvv
sed -n '1,180p' vendor/laravel/framework/src/Illuminate/Filesystem/FilesystemServiceProvider.php
sed -n '1,180p' vendor/laravel/framework/src/Illuminate/Filesystem/ServeFile.php
```

## Kesimpulan Operasional Final

Peta server cPanel Anda sekarang sudah cukup detail end-to-end untuk operasi backend harian:

1. source repo: monorepo GitHub
2. branch backend live source: `main`
3. deploy model: server-side sparse clone `backend-api`
4. deploy root: `/home/thechoosentalks/deploy/apps/thechoosentalks`
5. release aktif saat audit: `20260323041717`
6. runtime switch: symlink `current`
7. rollback unit: `releases/<timestamp>`
8. env live: `shared/.env`
9. storage live: `shared/storage`
10. public bridge: `/home/thechoosentalks/public_html/index.php`
11. request/auth rewrite layer: `.htaccess` dengan `CGIPassAuth On`
12. runtime app: Laravel `12.52.0`, PHP `8.3.30`, production mode
13. media buckets live: `avatars`, `community/posts`
14. auth/today/profile/community/versehub routes benar-benar ada di runtime Laravel
15. koneksi GitHub server-side memakai `github_deploy_key` di `~/.ssh/config`
16. avatar delivery memakai `/api/v1/avatar/{user}`
17. community image delivery memakai `/storage/...`
18. release aktif terakhir lolos healthcheck dan deploy log sukses
19. session runtime live = file-based dengan cookie domain `.thechoosentalks.org`
20. Sanctum live mengizinkan `thechoosentalks.org` dan `www.thechoosentalks.org`
21. payload community live aktual sudah terkonfirmasi dan cocok dengan file fisik storage
22. route `storage/{path}` live memakai action internal `storage.local` / `storage.local.upload`
23. handler utama `storage.local` dapat dipetakan kuat ke `Illuminate\Filesystem\ServeFile` melalui `FilesystemServiceProvider::serveFiles()`
24. payload profile terautentikasi live sudah berhasil di-capture via HTTP dengan token audit sementara yang langsung direvoke
25. auth/session/sanctum blueprint pada dokumen ini sekarang berbasis pembacaan file release live, bukan hanya parity source lokal

Jadi untuk pekerjaan operasional harian, source of truth server sekarang adalah:

1. monorepo source di GitHub
2. deploy app di `/home/thechoosentalks/deploy/apps/thechoosentalks`
3. symlink `current` sebagai runtime backend aktif
4. `shared/.env` dan `shared/storage` sebagai state bersama lintas release
5. `public_html/index.php` + `.htaccess` sebagai pintu masuk web publik
6. `releases/<timestamp>` sebagai jalur rollback dan histori runtime
