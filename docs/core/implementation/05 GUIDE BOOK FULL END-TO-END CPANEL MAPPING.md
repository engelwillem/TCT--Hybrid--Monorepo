ok sekarang saya mau anda dokumentasikan task cpanel mapping berikut ini sejak awal pengerjaan mulai dari memetakan akses dan struktur yang tersedia dari sisi lokal, hingga berhasil melakukan semua task menjadi dokumen yang layak dianggap blueprint operasional-forensik yang utuh untuk backend cPanel saya menjadi sebuah Guide Book Full End-to-End Cpanel Mapping secara lengkap, detail, presisi baik command, script tinggal copy paste, tidak boleh ada info yang tertinggal ataupun kurang, bahkan lebih bagus lagi bila anda berikan tambahan info, saran, rekomendasi, etc. gunakan tetap file dokumentasi dalam format .md, silahkan langsung anda kerjakan tugas membuat Guide Book Full End-to-End Cpanel Mapping tersebut di E:\thechoosentalksnext\docs\CORE\implementation, karena dokumentasi yang anda buat nantinya akan menjadi buku pelajaran saya supaya sebagai operator server saya bisa melakukan pemetaan server cpanel melalui lokal desktop ataupun mobile akses ke cpanel via ssh.

# Guide Book Full End-to-End cPanel Mapping

Dokumen ini adalah buku panduan operator untuk memetakan server cPanel backend The Chosen Talks secara end-to-end dari sisi lokal.

Tujuan dokumen ini:
- mengajarkan cara membaca struktur server cPanel dari nol
- menjelaskan bagaimana runtime Laravel live benar-benar bekerja di server
- memberi command yang bisa langsung di-copy-paste
- membantu operator desktop maupun mobile melakukan audit, deploy, rollback, dan verifikasi tanpa menebak-nebak
- mengubah hasil audit forensik menjadi SOP operasional yang bisa dipakai berulang

Dokumen ini disusun berdasarkan audit nyata terhadap server produksi, bukan teori umum.

Dokumen pelengkap teknis yang menjadi basis hasil akhirnya:
- [01 READING ORDER CPANEL OPERATOR PACKAGE.md](e:/thechoosentalksnext/docs/CORE/implementation/01%20READING%20ORDER%20CPANEL%20OPERATOR%20PACKAGE.md)
- [02 QUICK START 5 MENIT CPANEL OPERATOR.md](e:/thechoosentalksnext/docs/CORE/implementation/02%20QUICK%20START%205%20MENIT%20CPANEL%20OPERATOR.md)
- [06 CPANEL SERVER FULL MAIN BLUEPRINT MAP.md](e:/thechoosentalksnext/docs/CORE/implementation/06%20CPANEL%20SERVER%20FULL%20MAIN%20BLUEPRINT%20MAP.md)
- [04 SCRIPT PULL & DEPLOY GIT CPANEL.MD](e:/thechoosentalksnext/docs/CORE/implementation/04%20SCRIPT%20PULL%20%26%20DEPLOY%20GIT%20CPANEL.MD)
- [03 PULL & DEPLOY GIT CPANEL.MD](e:/thechoosentalksnext/docs/CORE/implementation/03%20PULL%20%26%20DEPLOY%20GIT%20CPANEL.MD)

## 1. Context Operasional

Model project saat ini:

- frontend: Next.js
- backend: Laravel
- repo: monorepo
- frontend production: auto-redeploy dari `main`
- backend production: manual deploy via cPanel / SSH

Artinya:

- perubahan source backend memang ikut masuk ke GitHub monorepo
- tetapi runtime backend production **tidak berubah** hanya karena ada push
- runtime backend baru berubah setelah operator:
  - masuk ke server
  - menjalankan deploy backend

Itulah mengapa kemampuan memetakan server cPanel secara benar sangat penting.

## 2. Target Belajar

Setelah mengikuti guide ini, operator harus bisa:

1. login ke server via SSH dari desktop maupun mobile
2. mengenali home directory, deploy root, public root, release aktif, dan shared state
3. memahami bagaimana Laravel live dijalankan lewat `current -> releases/<timestamp>`
4. memetakan env, storage, routes, media, auth, session, sanctum
5. membaca script deploy, rollback, dan healthcheck
6. memverifikasi route dan endpoint yang live
7. menangkap perbedaan antara:
   - source repo
   - release aktif
   - shared runtime state
   - bridge publik
8. melakukan deploy dan rollback dengan lebih aman

## 3. Prinsip Kerja Aman

Sebelum menjalankan command apa pun, pegang prinsip ini:

1. jangan ubah file produksi kalau tujuan Anda hanya audit
2. prioritaskan command read-only dulu
3. jangan `cat` seluruh `.env` produksi ke layar
4. untuk config sensitif, ambil hanya field non-secret yang memang dibutuhkan
5. setiap kali selesai membuat token audit sementara, revoke lagi sampai count kembali `0`
6. bedakan:
   - observasi
   - verifikasi
   - perubahan state

## 4. Data Dasar Server yang Sudah Terkonfirmasi

Berikut baseline nyata server yang berhasil dipetakan:

- host SSH: `209.42.27.90`
- port: `22`
- user SSH: `thechoosentalks`
- home directory: `/home/thechoosentalks`
- deploy root: `/home/thechoosentalks/deploy/apps/thechoosentalks`
- public root: `/home/thechoosentalks/public_html`
- runtime aktif via symlink:
  - `/home/thechoosentalks/deploy/apps/thechoosentalks/current`
- release aktif saat audit utama:
  - `/home/thechoosentalks/deploy/apps/thechoosentalks/releases/20260323041717`

## 5. Peralatan Operator

### Desktop Windows

Pilihan paling sederhana:

- PowerShell
- OpenSSH bawaan Windows
- key SSH lokal

Contoh path key lokal:

- `%USERPROFILE%\.ssh\cpanel_laptop_deploy`

### Mobile

Anda bisa memakai SSH client mobile apa pun yang mendukung:

- host
- username
- private key
- paste multi-line command

Contoh kategori aplikasi:

- Termius
- JuiceSSH
- Prompt / a-Shell / Blink jika Anda nyaman

Yang penting:

- koneksi SSH stabil
- bisa paste command
- bisa menyimpan host
- bisa memakai private key

## 6. Template Koneksi SSH

### Dari Desktop Windows

```powershell
& "C:\WINDOWS\System32\OpenSSH\ssh.exe" `
  -i "$HOME\.ssh\cpanel_laptop_deploy" `
  -o StrictHostKeyChecking=accept-new `
  -o ConnectTimeout=25 `
  thechoosentalks@209.42.27.90
```

### Dari Mobile

Gunakan parameter berikut pada aplikasi SSH:

- Host: `209.42.27.90`
- Port: `22`
- Username: `thechoosentalks`
- Authentication: private key
- Key file: private key deploy Anda

## 7. Cara Berpikir Saat Memetakan Server

Jangan mulai dari “fitur aplikasi”.

Mulailah dari lapisan server berikut:

1. identitas server
2. deploy root
3. public root
4. symlink runtime aktif
5. release aktif
6. shared env
7. shared storage
8. bridge publik
9. route live
10. media delivery
11. auth/session/sanctum
12. script deploy/rollback/healthcheck

Kalau urutannya benar, peta server akan jauh lebih mudah dipahami.

## 8. Phase 1 — Identity Mapping

Tujuan phase ini:
- memastikan Anda benar-benar masuk ke server yang benar
- memastikan user login yang aktif
- memastikan home directory

Command:

```bash
whoami
pwd
hostname
echo "$HOME"
```

Yang perlu Anda pahami dari output:

- `whoami` harus menunjukkan user server yang Anda pakai
- `pwd` dan `HOME` memberi konteks root kerja Anda
- `hostname` membantu kalau nanti Anda mengelola lebih dari satu server

## 9. Phase 2 — Map Deploy Root dan Public Root

Tujuan:
- menemukan folder deploy backend
- menemukan bridge web publik

Command:

```bash
ls -la /home/thechoosentalks
ls -la /home/thechoosentalks/deploy
ls -la /home/thechoosentalks/deploy/apps
ls -la /home/thechoosentalks/deploy/apps/thechoosentalks
ls -la /home/thechoosentalks/public_html
```

Hal yang perlu dicari:

- apakah ada `deploy.sh`
- apakah ada `rollback.sh`
- apakah ada `healthcheck.sh`
- apakah ada `current`
- apakah ada `releases`
- apakah ada `shared`
- apakah `public_html` berisi `index.php`, `css`, `js`, `fonts`

## 10. Phase 3 — Map Release Model

Tujuan:
- memahami bahwa runtime Laravel tidak hidup langsung dari root deploy
- runtime hidup dari release timestamped

Command:

```bash
cd /home/thechoosentalks/deploy/apps/thechoosentalks || exit 1
readlink -f current
ls -1 releases | tail -n 10
ls -la current
```

Interpretasi:

- `current` adalah symlink runtime aktif
- target `current` menunjukkan release yang sedang live
- `releases/<timestamp>` adalah unit rollback

Contoh mental model yang benar:

```text
deploy root
-> current
-> releases/20260323041717
-> Laravel yang benar-benar hidup
```

## 11. Phase 4 — Map Shared Runtime State

Tujuan:
- membedakan state bersama vs release sementara

Command:

```bash
cd /home/thechoosentalks/deploy/apps/thechoosentalks || exit 1
ls -la shared
readlink -f current/.env
readlink -f current/storage
find shared/storage -maxdepth 2 -type d | sort
```

Yang harus dipahami:

- `.env` live tidak hidup di dalam folder release
- `storage` live tidak hidup di dalam folder release
- keduanya hidup di `shared`

Mental model:

```text
release boleh berganti
tetapi env + storage tetap dipertahankan
```

## 12. Phase 5 — Baca Bridge Publik

Tujuan:
- memahami jalur request web publik

Command:

```bash
sed -n '1,80p' /home/thechoosentalks/public_html/index.php
ls -la /home/thechoosentalks/public_html
```

Output penting yang telah terbukti pada server ini:

```php
<?php
declare(strict_types=1);
require __DIR__ . '/../deploy/apps/thechoosentalks/current/public/index.php';
```

Makna operasional:

- `public_html` hanya bridge
- front controller Laravel yang hidup sebenarnya berada di:
  - `current/public/index.php`

## 13. Phase 6 — Map Release Aktif

Tujuan:
- melihat isi Laravel yang benar-benar sedang live

Command:

```bash
cd "$(readlink -f /home/thechoosentalks/deploy/apps/thechoosentalks/current)" || exit 1
pwd
ls -la
find public -maxdepth 2 -type f | sort | sed -n '1,120p'
```

Hal yang perlu dicari:

- `artisan`
- `app/`
- `bootstrap/`
- `config/`
- `routes/`
- `public/`
- `vendor/`
- symlink `.env`
- symlink `storage`

## 14. Phase 7 — Map Permission Runtime

Tujuan:
- memastikan Laravel bisa menulis log, session, cache, dan storage

Command:

```bash
stat current/storage
stat current/bootstrap/cache
stat shared/storage
ls -ld shared/storage/logs
ls -l shared/storage/logs/laravel.log
```

Hal yang perlu dinilai:

- owner/group
- mode permission
- apakah `storage` adalah symlink
- apakah `bootstrap/cache` writable

## 15. Phase 8 — Map Shared Storage dan Media

Tujuan:
- mengetahui lokasi file runtime dan media publik

Command:

```bash
find /home/thechoosentalks/deploy/apps/thechoosentalks/shared/storage -maxdepth 3 -type d | sort
find /home/thechoosentalks/deploy/apps/thechoosentalks/shared/storage/app/public -maxdepth 3 -type f | sort | sed -n '1,120p'
du -sh /home/thechoosentalks/deploy/apps/thechoosentalks/shared/storage/logs
du -sh /home/thechoosentalks/deploy/apps/thechoosentalks/shared/storage/framework/cache
du -sh /home/thechoosentalks/deploy/apps/thechoosentalks/shared/storage/framework/sessions
du -sh /home/thechoosentalks/deploy/apps/thechoosentalks/shared/storage/framework/views
```

Bucket penting yang sudah terbukti ada pada server ini:

- `shared/storage/app/public/avatars`
- `shared/storage/app/public/community/posts`

## 16. Phase 9 — Baca Rewrite Layer

Tujuan:
- memahami bagaimana web request dan auth header diteruskan ke PHP

Command:

```bash
sed -n '1,120p' /home/thechoosentalks/public_html/.htaccess
sed -n '1,120p' /home/thechoosentalks/deploy/apps/thechoosentalks/current/public/.htaccess
```

Yang penting:

- `CGIPassAuth On`
- forwarding `Authorization`
- pengecualian `/storage/`
- fallback ke `index.php`

Makna praktis:

- bearer token tidak boleh hilang di FastCGI
- `/storage/` diperlakukan khusus

## 17. Phase 10 — Baca Runtime Versions

Tujuan:
- mengetahui versi runtime yang benar-benar sedang hidup

Command:

```bash
cd /home/thechoosentalks/deploy/apps/thechoosentalks/current || exit 1
php -v
composer --version
git --version
php artisan about
```

Yang perlu dicatat:

- versi Laravel
- versi PHP
- environment
- cache status
- database driver
- queue driver
- session driver
- apakah `public/storage` linked atau tidak

## 18. Phase 11 — Route Mapping Dasar

Tujuan:
- memetakan endpoint aktif yang benar-benar live

Command:

```bash
cd /home/thechoosentalks/deploy/apps/thechoosentalks/current || exit 1
php artisan route:list | sed -n '1,220p'
php artisan route:list --path=today
php artisan route:list --path=api/v1/login
php artisan route:list --path=api/v1/register
php artisan route:list --path=api/v1/profile -vvv
php artisan route:list --path=storage -vvv
```

Apa yang bisa dipelajari:

- route mana yang public
- route mana yang `auth:sanctum`
- middleware apa yang aktif
- controller mana yang dipakai

## 19. Phase 12 — Filesystem dan Route `/storage`

Tujuan:
- memahami bagaimana file `/storage/...` diserve pada runtime live

Command:

```bash
sed -n '1,220p' /home/thechoosentalks/deploy/apps/thechoosentalks/current/config/filesystems.php
php artisan route:list --path=storage -vvv
```

Fakta penting pada server ini:

- disk `public` menunjuk ke `storage/app/public`
- `public/storage` pada runtime live dilaporkan `NOT LINKED`
- route live tetap ada:
  - `storage.local`
  - `storage.local.upload`

### Mapping final yang perlu Anda pahami

```text
URL /storage/<path>
-> route framework storage.local
-> disk public Laravel
-> storage/app/public/<path>
-> shared/storage/app/public/<path>
```

### Pelacakan Handler Framework

Di source framework lokal yang seversi:

- `Illuminate\Filesystem\FilesystemServiceProvider::serveFiles()`
  - mendaftarkan route `storage.<disk>`
- GET memakai:
  - `Illuminate\Filesystem\ServeFile`
- PUT memakai:
  - `Illuminate\Filesystem\ReceiveFile`

Jadi untuk server ini, route `storage/{path}` bukan route custom aplikasi.

## 20. Phase 13 — Mapping Avatar dan Community Media

Tujuan:
- menghubungkan payload API dengan file fisik yang nyata

### Avatar

Pola yang sudah terbukti:

```text
users.avatar_path
-> storage disk public
-> shared/storage/app/public/avatars/<file>
-> served by /api/v1/avatar/{user}
```

### Community Image

Pola yang sudah terbukti:

```text
community image path
-> shared/storage/app/public/community/posts/<file>
-> serialized as /storage/community/posts/<file>
-> served by framework storage route
```

### Command Audit Media

```bash
find /home/thechoosentalks/deploy/apps/thechoosentalks/shared/storage/app/public/avatars -maxdepth 1 -type f | sed -n '1,40p'
find /home/thechoosentalks/deploy/apps/thechoosentalks/shared/storage/app/public/community/posts -maxdepth 1 -type f | sed -n '1,40p'
```

## 21. Phase 14 — Ambil Payload API Live Tanpa Merusak State

Tujuan:
- mengambil bukti payload runtime dari server

### Contoh Payload Community Live

Command:

```bash
curl -ks -H 'Host: api.thechoosentalks.org' https://209.42.27.90/api/v1/community/posts | sed -n '1,40p'
```

Dengan command ini, kita pernah mengonfirmasi:

- `imageUrl`
- `mediaPaths`
- `author.id`
- `author.name`
- `author.avatarUrl`

### Catatan Penting

Untuk endpoint public, audit ini relatif aman.

Untuk endpoint terautentikasi, Anda harus lebih hati-hati.

## 22. Phase 15 — Auth, Session, Sanctum Mapping

Tujuan:
- memahami bagaimana backend mengenali user login

### Baca Bootstrap Middleware Live

```bash
sed -n '1,220p' /home/thechoosentalks/deploy/apps/thechoosentalks/current/bootstrap/app.php
```

Yang perlu dicari:

- `$middleware->statefulApi();`
- redirect guest
- cors / security middleware

### Baca Config Session Live

```bash
sed -n '1,260p' /home/thechoosentalks/deploy/apps/thechoosentalks/current/config/session.php
```

### Baca Config Sanctum Live

```bash
sed -n '1,220p' /home/thechoosentalks/deploy/apps/thechoosentalks/current/config/sanctum.php
```

### Ambil Env Non-Secret Saja

```bash
grep -E '^(APP_URL|NEXT_PUBLIC_APP_URL|SESSION_DRIVER|SESSION_DOMAIN|SESSION_SECURE_COOKIE|SESSION_SAME_SITE|SESSION_COOKIE|SANCTUM_STATEFUL_DOMAINS)=' /home/thechoosentalks/deploy/apps/thechoosentalks/shared/.env | sed -n '1,120p'
```

Nilai penting yang sudah terkonfirmasi:

- `APP_URL=https://api.thechoosentalks.org`
- `SESSION_DRIVER=file`
- `SESSION_DOMAIN=.thechoosentalks.org`
- `SESSION_SECURE_COOKIE=true`
- `SESSION_SAME_SITE=lax`
- `SANCTUM_STATEFUL_DOMAINS=thechoosentalks.org,www.thechoosentalks.org`
- `NEXT_PUBLIC_APP_URL=https://thechoosentalks.org`

## 23. Phase 16 — Ambil Payload Profile Terautentikasi dengan Aman

Ini adalah phase sensitif. Lakukan hanya bila memang perlu.

Tujuan:
- mengambil payload `/api/v1/profile` live yang benar-benar authenticated
- tanpa meninggalkan token audit menggantung

### Prinsip Aman

1. buat token audit sementara
2. pakai sekali untuk capture payload
3. revoke segera
4. verifikasi count token kembali `0`

### Script Audit Aman

```bash
cd /home/thechoosentalks/deploy/apps/thechoosentalks/current || exit 1

TOKEN=$(php artisan tinker --execute='$u=App\Models\User::find(3); if (! $u) { exit(1); } echo $u->createToken("codex-audit-temp")->plainTextToken;')

curl -ks \
  -H 'Host: api.thechoosentalks.org' \
  -H "Authorization: Bearer $TOKEN" \
  https://209.42.27.90/api/v1/profile

php artisan tinker --execute='$u=App\Models\User::find(3); if ($u) { echo $u->tokens()->where("name", "codex-audit-temp")->delete(); }'

php artisan tinker --execute='$u=App\Models\User::find(3); if ($u) { echo $u->tokens()->where("name", "codex-audit-temp")->count(); }'
```

### Kondisi Sukses

- payload JSON profile tampil
- revoke mengembalikan angka `1` untuk token yang dihapus
- count akhir = `0`

### Warning

Jangan biarkan token audit sementara tetap hidup.

## 24. Phase 17 — Audit Script Deploy, Rollback, dan Healthcheck

Tujuan:
- memahami apa yang sebenarnya dilakukan deploy script di server

Command:

```bash
cd /home/thechoosentalks/deploy/apps/thechoosentalks || exit 1
sed -n '1,260p' deploy.sh
sed -n '1,220p' rollback.sh
sed -n '1,220p' healthcheck.sh
tail -n 120 deploy_pull.log
```

Yang perlu dicari:

- branch yang dipull
- cara build/source dimaterialisasi
- symlink switch
- healthcheck
- prune old releases

## 25. Phase 18 — Deploy Backend Manual

Ini adalah command utama operator setelah source backend sudah masuk ke GitHub.

### Command Deploy Final

```bash
set -euo pipefail

APP_DIR="/home/thechoosentalks/deploy/apps/thechoosentalks"
API_ORIGIN="https://api.thechoosentalks.org"

cd "$APP_DIR"

echo "=== PRECHECK ==="
pwd
bash -n deploy.sh
bash -n rollback.sh
readlink -f current || true

echo "=== RUN BACKEND DEPLOY ==="
HEALTHCHECK_BASE_URL="$API_ORIGIN" bash deploy.sh

echo "=== ACTIVE RELEASE ==="
readlink -f current
cd "$(readlink -f current)"

echo "=== ROUTE VERIFY ==="
php artisan route:list | grep -E "api/today/session|api/v1/login|api/v1/register" || true

echo "=== ENDPOINT VERIFY ==="
curl -i "$API_ORIGIN/api/today/session"
curl -i -X POST "$API_ORIGIN/api/v1/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid@example.com","password":"invalid-password"}' || true
curl -i -X POST "$API_ORIGIN/api/v1/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"","email":"invalid","password":"short","password_confirmation":"short"}' || true
```

### Kapan Deploy Dianggap Sukses

- `deploy.sh` selesai tanpa error
- symlink `current` pindah ke release baru
- route penting masih ada
- endpoint dasar merespons

## 26. Phase 19 — Rollback Aman

Kalau deploy gagal, jangan panik. Gunakan rollback minimal.

```bash
set -euo pipefail
cd /home/thechoosentalks/deploy/apps/thechoosentalks
bash rollback.sh
readlink -f current
cd "$(readlink -f current)"
php artisan route:list | grep -E "api/today/session|api/v1/login|api/v1/register" || true
```

## 27. Phase 20 — Checklist Mapping Lengkap

Kalau Anda ingin memastikan mapping server sudah lengkap, cek semua item ini:

- [ ] tahu user SSH aktif
- [ ] tahu home directory
- [ ] tahu deploy root
- [ ] tahu public root
- [ ] tahu target `current`
- [ ] tahu isi `releases`
- [ ] tahu target `current/.env`
- [ ] tahu target `current/storage`
- [ ] tahu struktur `shared/storage`
- [ ] tahu isi `public_html/index.php`
- [ ] tahu `.htaccess` live
- [ ] tahu versi Laravel/PHP
- [ ] tahu route penting live
- [ ] tahu mapping `/storage/...`
- [ ] tahu mapping avatar
- [ ] tahu mapping community image
- [ ] tahu config session live
- [ ] tahu config sanctum live
- [ ] tahu script deploy
- [ ] tahu script rollback
- [ ] tahu script healthcheck

## 28. Desktop vs Mobile Workflow

### Kalau Anda bekerja dari Desktop

Keunggulan:

- lebih mudah copy-paste multi-line script
- lebih mudah simpan output
- lebih mudah audit file panjang

Pekerjaan yang lebih enak dari desktop:

- membaca `deploy.sh`
- membaca `route:list`
- menarik payload JSON
- membuat script audit sementara

### Kalau Anda bekerja dari Mobile

Keunggulan:

- cepat untuk verifikasi
- bagus untuk cek runtime ringan saat sedang tidak di depan laptop

Pekerjaan yang cocok di mobile:

- `whoami`, `pwd`
- `readlink -f current`
- `php artisan route:list --path=...`
- `tail -n 40 deploy_pull.log`
- `curl -I` endpoint dasar

Pekerjaan yang lebih baik tetap dikerjakan dari desktop:

- audit payload profile terautentikasi
- membaca script panjang
- forensic mapping mendalam

## 29. Rekomendasi Praktis Operator

### Rekomendasi 1

Simpan tiga kelompok command terpisah:

- audit command
- deploy command
- rollback command

Jangan campur semuanya dalam satu blok panjang.

### Rekomendasi 2

Untuk `.env`, selalu gunakan pendekatan:

- `grep` field non-secret yang dibutuhkan

Jangan `cat shared/.env` penuh ke layar.

### Rekomendasi 3

Setiap kali Anda membuat token audit:

- revoke langsung
- cek count kembali `0`

### Rekomendasi 4

Kalau koneksi SSH intermiten:

- pecah command jadi kecil
- hindari one-liner terlalu panjang
- audit per fase

### Rekomendasi 5

Kalau Anda sedang debug media:

- cek file fisik dulu
- baru cek route
- baru cek payload

Urutan ini jauh lebih cepat daripada menebak dari frontend.

## 30. Red Flags yang Harus Diwaspadai

- `current` menunjuk ke release yang tidak Anda duga
- `current/.env` bukan symlink ke `shared/.env`
- `current/storage` bukan symlink ke `shared/storage`
- `storage` atau `bootstrap/cache` tidak writable
- `.htaccess` tidak punya `CGIPassAuth On`
- `route:list` tidak menunjukkan route penting
- payload media menunjuk URL yang tidak cocok dengan file fisik
- token audit masih hidup setelah selesai dipakai

## 31. Skenario Debug Cepat

### Kasus A — Login gagal

Cek urutan ini:

1. `php artisan route:list --path=api/v1/login -vvv`
2. `sed -n '1,220p' current/config/session.php`
3. `sed -n '1,220p' current/config/sanctum.php`
4. `grep` env non-secret session/sanctum
5. `.htaccess` untuk `CGIPassAuth On`

### Kasus B — Avatar tidak tampil

Cek urutan ini:

1. file avatar fisik ada atau tidak
2. `avatar_path` logic di backend
3. endpoint `/api/v1/avatar/{user}`
4. payload profile / community apakah mengembalikan `avatar_url`

### Kasus C — Gambar community tidak tampil

Cek urutan ini:

1. file fisik di `shared/storage/app/public/community/posts`
2. route `storage/{path}`
3. payload `imageUrl`
4. rewrite layer `/storage/`

## 32. Blueprint Mental Final

Untuk server ini, gambaran paling sederhana yang harus Anda hafal adalah:

```text
GitHub monorepo
-> backend source dipakai deploy script
-> release baru dibuat di releases/<timestamp>
-> current diarahkan ke release aktif
-> .env dan storage tetap hidup di shared
-> public_html hanya bridge
-> request masuk ke current/public/index.php
-> Laravel live memproses route, auth, media, dan API
```

Kalau mental model ini sudah kuat, Anda tidak akan mudah bingung saat ada bug runtime.

## 33. Appendix A — Command Pack Audit Cepat

```bash
whoami
pwd
hostname
echo "$HOME"
cd /home/thechoosentalks/deploy/apps/thechoosentalks || exit 1
readlink -f current
ls -1 releases | tail -n 10
ls -la shared
readlink -f current/.env
readlink -f current/storage
sed -n '1,80p' /home/thechoosentalks/public_html/index.php
php artisan about
php artisan route:list --path=api/v1/profile -vvv
php artisan route:list --path=storage -vvv
```

## 34. Appendix B — Command Pack Media Audit

```bash
find /home/thechoosentalks/deploy/apps/thechoosentalks/shared/storage/app/public/avatars -maxdepth 1 -type f | sed -n '1,40p'
find /home/thechoosentalks/deploy/apps/thechoosentalks/shared/storage/app/public/community/posts -maxdepth 1 -type f | sed -n '1,40p'
curl -ks -H 'Host: api.thechoosentalks.org' https://209.42.27.90/api/v1/community/posts | sed -n '1,40p'
```

## 35. Appendix C — Command Pack Deploy dan Rollback

```bash
cd /home/thechoosentalks/deploy/apps/thechoosentalks || exit 1
bash -n deploy.sh
bash -n rollback.sh
bash -n healthcheck.sh
HEALTHCHECK_BASE_URL="https://api.thechoosentalks.org" bash deploy.sh
```

```bash
cd /home/thechoosentalks/deploy/apps/thechoosentalks || exit 1
bash rollback.sh
readlink -f current
```

## 36. Penutup

Dokumen ini sengaja ditulis sebagai guide book operator, bukan sekadar memo teknis.

Kalau Anda belajar mengoperasikan server cPanel ini dari nol, urutan terbaik adalah:

1. pahami struktur
2. pahami release model
3. pahami shared state
4. pahami route dan media
5. baru pahami deploy dan rollback

Kalau lima lapisan itu sudah Anda kuasai, Anda akan jauh lebih siap menjadi operator backend server Anda sendiri.
