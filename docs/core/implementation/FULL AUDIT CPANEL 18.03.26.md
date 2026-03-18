STEP 1 — COMMAND WAJIB PERTAMA

Tujuan step ini hanya satu:

membuat audit snapshot server production yang aman, read-only, dan memverifikasi asumsi deploy aktual.

Tempel command ini di terminal cPanel:

```bash
set -e

echo "===== TCT STEP 1: SERVER REALITY AUDIT ====="
echo "DATE: $(date)"
echo "USER: $(whoami)"
echo "HOME: $HOME"
echo

echo "---- PHP / COMPOSER / GIT ----"
command -v php || true
php -v || true
command -v composer || true
composer --version || true
command -v git || true
git --version || true
echo

echo "---- PUBLIC_HTML BRIDGE ----"
ls -la "$HOME/public_html" || true
echo
echo "public_html/index.php:"
sed -n '1,80p' "$HOME/public_html/index.php" || true
echo

echo "---- DEPLOY ROOT ----"
APP_DIR="$HOME/deploy/apps/thechoosentalks"
echo "APP_DIR=$APP_DIR"
ls -la "$HOME/deploy" || true
echo
ls -la "$HOME/deploy/apps" || true
echo
ls -la "$APP_DIR" || true
echo

echo "---- CURRENT SYMLINK ----"
readlink "$APP_DIR/current" || true
readlink -f "$APP_DIR/current" || true
echo

echo "---- RELEASES ----"
find "$APP_DIR/releases" -mindepth 1 -maxdepth 1 -type d -printf '%f\n' 2>/dev/null | sort || true
echo

echo "---- SHARED ----"
ls -la "$APP_DIR/shared" || true
echo
[ -f "$APP_DIR/shared/.env" ] && echo "shared .env exists" || echo "shared .env MISSING"
[ -d "$APP_DIR/shared/storage" ] && echo "shared storage exists" || echo "shared storage MISSING"
echo

echo "---- CURRENT RELEASE FILES ----"
CURRENT_REAL="$(readlink -f "$APP_DIR/current" || true)"
echo "CURRENT_REAL=$CURRENT_REAL"
[ -n "$CURRENT_REAL" ] && ls -la "$CURRENT_REAL" || true
echo
[ -n "$CURRENT_REAL" ] && ls -la "$CURRENT_REAL/public" || true
echo

echo "---- DEPLOY SCRIPTS ----"
for f in "$APP_DIR/deploy.sh" "$APP_DIR/rollback.sh" "$APP_DIR/healthcheck.sh"; do
  if [ -f "$f" ]; then
    echo "[FOUND] $f"
    ls -l "$f"
    echo "--- HEAD $f ---"
    sed -n '1,120p' "$f"
    echo
  else
    echo "[MISSING] $f"
  fi
done

echo "---- WEBHOOK / SECRET ----"
[ -f "$HOME/.deploy_secret" ] && echo ".deploy_secret exists" || echo ".deploy_secret MISSING"
find "$HOME/public_html" -maxdepth 1 -type f \( -name "*webhook*.php" -o -name "deploy*.php" \) -print || true
echo

echo "---- CURRENT RELEASE HEALTH BASICS ----"
if [ -n "$CURRENT_REAL" ]; then
  [ -f "$CURRENT_REAL/artisan" ] && echo "artisan exists" || echo "artisan MISSING"
  [ -f "$CURRENT_REAL/vendor/autoload.php" ] && echo "vendor exists" || echo "vendor MISSING"
  [ -d "$CURRENT_REAL/bootstrap/cache" ] && echo "bootstrap/cache exists" || echo "bootstrap/cache MISSING"
  [ -d "$CURRENT_REAL/storage" ] && echo "storage exists" || echo "storage MISSING"
  php "$CURRENT_REAL/artisan" --version || true
fi
echo

echo "===== END STEP 1 ====="
```





















ok kalau begitu berikutnya anda harus memberikan saya command line untuk full audit folder, file dan real condition yang ada di server cpanel saya, agar anda tau persis membuat prompt yang tepat untuk gemini lakukan agar sesuai dengan status dan kondisi server cpanel saya saat ini.

---
Bisa. Dan ini langkah yang sangat tepat.
Karena pada titik ini, kita sudah cukup banyak membangun teori dan desain deploy. Sekarang yang paling bernilai adalah mengambil potret nyata server Anda:

struktur folder

lokasi repo

lokasi webroot

path Laravel

versi PHP/Composer/Git

izin file

apakah shell_exec hidup

apakah .git ada

apakah public_html mengarah ke mana

apakah ada deploy lama

apakah ada symlink

apakah storage/logs writable

dan seterusnya

Tanpa itu, prompt untuk Gemini akan tetap setengah menebak.
Dengan itu, prompt bisa jauh lebih presisi dan tidak generik.

Jadi saya akan bantu Anda dengan audit command pack yang aman dan cukup lengkap, tapi tetap tidak destruktif.

Tujuan audit ini

Kita ingin mendapatkan 5 hal besar:

1. Identitas environment

user shell

hostname

OS

working directory

PHP / Composer / Git path

2. Struktur filesystem nyata

di mana repo ada

di mana webroot ada

apakah ada public_html

apakah ada folder project lama/baru

apakah ada .git

apakah ada backend-api

apakah ada public / storage / bootstrap/cache

3. Kondisi Laravel/backend

apakah .env ada

apakah vendor ada

apakah artisan ada

apakah log ada

apakah permissions tampak sehat

4. Kemampuan deploy

apakah shell_exec aktif

apakah Git bisa jalan

apakah Composer bisa jalan

apakah repo bisa pull

apakah script bisa executable

5. Kandidat lokasi webhook/deploy

webroot sebenarnya di mana

host www atau apex mengarah ke mana

file PHP publik seharusnya ditaruh di mana

Cara kerja yang saya sarankan

Jangan jalankan semua sebagai satu command raksasa.

Lebih aman:

jalankan bertahap

copy output

simpan ke file teks

upload ke saya

Saya akan susun menjadi 4 blok:

Server identity

Filesystem map

Laravel/app health

Deploy readiness

BLOK 1 — Server identity audit

Jalankan ini dulu:

echo "===== SERVER IDENTITY ====="
whoami
id
hostname
pwd
uname -a
echo
echo "===== PATH / BINARIES ====="
echo "$PATH"
which php || true
php -v || true
which composer || true
composer --version || true
which git || true
git --version || true
which bash || true
which curl || true
which wget || true
echo
echo "===== HOME / SHELL ====="
echo "$HOME"
echo "$SHELL"
Yang saya cari dari output ini

user server

home directory

apakah php, composer, git, curl benar-benar ada

apakah environment shell terlihat normal

BLOK 2 — Filesystem map audit

Jalankan ini:

echo "===== HOME TREE (TOP LEVEL) ====="
ls -lah ~
echo
echo "===== PUBLIC_HTML ====="
ls -lah ~/public_html 2>/dev/null || echo "no ~/public_html"
echo
echo "===== POSSIBLE PROJECT DIRECTORIES ====="
find ~ -maxdepth 2 -type d \( \
  -name "backend-api" -o \
  -name "public_html" -o \
  -name ".git" -o \
  -name "vendor" -o \
  -name "storage" -o \
  -name "bootstrap" -o \
  -name "app" -o \
  -name "routes" \
\) 2>/dev/null | sort
echo
echo "===== POSSIBLE PROJECT ROOTS ====="
find ~ -maxdepth 3 -type f \( \
  -name "artisan" -o \
  -name "composer.json" -o \
  -name ".env" -o \
  -name "package.json" \
\) 2>/dev/null | sort
Yang saya cari dari output ini

project root sebenarnya ada di mana

apakah repo Laravel hidup di:

~/backend-api

~/thechoosentalksnext/backend-api

atau lokasi lain

apakah public_html kosong / symlink / berisi app

apakah ada lebih dari satu copy project

BLOK 3 — Laravel/backend condition audit

Kalau Anda sudah tahu root backend-nya, misalnya:

/home/USERNAME/thechoosentalksnext/backend-api

ganti <BACKEND_ROOT> dengan path nyata itu, lalu jalankan:

BACKEND_ROOT="<BACKEND_ROOT>"

echo "===== BACKEND ROOT ====="
echo "$BACKEND_ROOT"
ls -lah "$BACKEND_ROOT" || true
echo
echo "===== IMPORTANT FILES ====="
ls -lah "$BACKEND_ROOT/.env" 2>/dev/null || echo "no .env"
ls -lah "$BACKEND_ROOT/artisan" 2>/dev/null || echo "no artisan"
ls -lah "$BACKEND_ROOT/composer.json" 2>/dev/null || echo "no composer.json"
ls -lah "$BACKEND_ROOT/vendor" 2>/dev/null || echo "no vendor"
ls -lah "$BACKEND_ROOT/public" 2>/dev/null || echo "no public"
ls -lah "$BACKEND_ROOT/storage" 2>/dev/null || echo "no storage"
ls -lah "$BACKEND_ROOT/bootstrap/cache" 2>/dev/null || echo "no bootstrap/cache"
echo
echo "===== STORAGE / CACHE WRITABILITY ====="
test -w "$BACKEND_ROOT/storage" && echo "storage writable" || echo "storage NOT writable"
test -w "$BACKEND_ROOT/bootstrap/cache" && echo "bootstrap/cache writable" || echo "bootstrap/cache NOT writable"
echo
echo "===== ROUTES / APP / CONFIG ====="
ls -lah "$BACKEND_ROOT/routes" 2>/dev/null || echo "no routes dir"
ls -lah "$BACKEND_ROOT/app" 2>/dev/null || echo "no app dir"
ls -lah "$BACKEND_ROOT/config" 2>/dev/null || echo "no config dir"
echo
echo "===== RECENT LOGS ====="
ls -lah "$BACKEND_ROOT/storage/logs" 2>/dev/null || echo "no storage/logs"
tail -n 50 "$BACKEND_ROOT/storage/logs/laravel.log" 2>/dev/null || echo "no laravel.log"
Yang saya cari dari output ini

apakah ini benar-benar install Laravel hidup

apakah .env ada

apakah vendor ada

apakah writable

apakah ada log error lama yang relevan

BLOK 4 — Git/deploy readiness audit

Masih dengan BACKEND_ROOT yang sama, jalankan:

BACKEND_ROOT="<BACKEND_ROOT>"

echo "===== GIT STATUS ====="
cd "$BACKEND_ROOT" || exit 1
git rev-parse --is-inside-work-tree 2>/dev/null || echo "not a git repo"
git remote -v 2>/dev/null || echo "no git remote"
git branch --show-current 2>/dev/null || echo "no current branch"
git status --short 2>/dev/null || echo "git status unavailable"
echo
echo "===== DEPLOY FILES ====="
find "$BACKEND_ROOT" -maxdepth 2 \( \
  -name "deploy.sh" -o \
  -name "webhook-template.php" -o \
  -name "*deploy*.php" \
\) 2>/dev/null | sort
echo
echo "===== FILE PERMISSIONS ====="
find "$BACKEND_ROOT" -maxdepth 1 -type f -name "*.sh" -exec ls -lah {} \; 2>/dev/null
echo
echo "===== PHP FUNCTION CHECK ====="
php -r 'echo "shell_exec: "; echo function_exists("shell_exec") ? "yes\n" : "no\n";'
echo
echo "===== BASIC ARTISAN CHECK ====="
php artisan --version 2>/dev/null || echo "artisan failed"
echo
echo "===== COMPOSER CHECK FROM PROJECT ====="
composer --version 2>/dev/null || echo "composer unavailable in project shell"
Yang saya cari dari output ini

apakah repo benar-benar git repo

remote ke GitHub ada atau tidak

branch aktif apa

ada deploy script atau tidak

shell_exec hidup atau mati

artisan bisa dieksekusi atau tidak

BLOK 5 — Webroot / apex redirect candidate audit

Ini penting untuk jalur apex redirect nanti. Jalankan:

echo "===== PUBLIC_HTML CONTENT ====="
ls -lah ~/public_html 2>/dev/null || echo "no public_html"
echo
echo "===== PUBLIC_HTML PHP FILES ====="
find ~/public_html -maxdepth 2 -type f \( -name "*.php" -o -name ".htaccess" \) 2>/dev/null | sort
echo
echo "===== PUBLIC_HTML SYMLINK CHECK ====="
ls -lah ~/public_html
echo
echo "===== HTACCESS CHECK ====="
cat ~/public_html/.htaccess 2>/dev/null || echo "no .htaccess in public_html"
Yang saya cari

apakah apex/webhook nanti realistis diletakkan di public_html

apakah .htaccess sudah ada

apakah docroot berisi Laravel public, landing page, atau kosong

Cara paling aman mengumpulkan output

Kalau Anda ingin lebih rapi, jalankan semua blok sambil simpan output ke file.

Contoh:

bash audit-server.sh > ~/server-audit-output.txt 2>&1

Tapi kalau Anda belum membuat file script, lebih gampang:

jalankan blok satu per satu

copy hasilnya ke file teks

upload ke saya

Kalau Anda mau, Anda juga bisa langsung gabungkan ke file seperti ini:

{
  echo "### BLOCK 1 ###"
  whoami
  id
  hostname
  pwd
  uname -a
  echo "$PATH"
  which php || true
  php -v || true
  which composer || true
  composer --version || true
  which git || true
  git --version || true
  which bash || true
  which curl || true
  which wget || true
  echo "$HOME"
  echo "$SHELL"
} > ~/server-audit-output.txt 2>&1

lalu blok-blok berikutnya tinggal append dengan >>.

Hal yang jangan Anda jalankan dulu

Untuk audit awal ini, jangan dulu menjalankan:

composer install

git pull

php artisan migrate

chmod -R sembarangan

rm -rf

git reset --hard

Kita sedang memotret server dulu, bukan mengubahnya.

Setelah Anda upload hasil audit

Begitu Anda kirim output blok-blok ini, saya bisa bantu Anda dengan jauh lebih presisi untuk tiga hal:

1. Prompt Gemini yang benar-benar sesuai kondisi server Anda

Bukan generik lagi.

2. Instalasi pull-deploy yang cocok dengan path nyata server Anda

absolute path

lokasi webhook

lokasi secret

lokasi log

docroot nyata

3. Apex redirect implementation yang sesuai document root nyata

Kalau ternyata apex memang hidup di public_html, kita bisa tulis rule final dengan yakin.


baca public_html/index.php

Ini penting sekali.

Jalankan:

echo "===== PUBLIC_HTML INDEX.PHP ====="
sed -n '1,220p' ~/public_html/index.php
Yang saya cari dari output ini

apakah file ini melakukan require ke path lain
apakah dia bootstrap Laravel atau framework lain
apakah ada absolute path ke app di luar webroot
apakah ini sebenarnya entry point ke backend yang tersembunyi di tempat lain


cari Laravel root lebih dalam

Pencarian sebelumnya terlalu dangkal. Sekarang cari lebih dalam, tapi tetap terarah.

Jalankan:

echo "===== DEEP SEARCH: ARTISAN / COMPOSER / ENV ====="
find /home/thechoosentalks -maxdepth 6 -type f \( \
  -name "artisan" -o \
  -name "composer.json" -o \
  -name ".env" \
\) 2>/dev/null | sort


cari Laravel root lebih dalam

Pencarian sebelumnya terlalu dangkal. Sekarang cari lebih dalam, tapi tetap terarah.

Jalankan:

echo "===== DEEP SEARCH: ARTISAN / COMPOSER / ENV ====="
find /home/thechoosentalks -maxdepth 6 -type f \( \
  -name "artisan" -o \
  -name "composer.json" -o \
  -name ".env" \
\) 2>/dev/null | sort


lihat folder deploy di home

Saya melihat ada:

/home/thechoosentalks/deploy

Itu mencurigakan dan penting.

Jalankan:

echo "===== HOME DEPLOY DIR ====="
ls -lah /home/thechoosentalks/deploy
find /home/thechoosentalks/deploy -maxdepth 3 -type f 2>/dev/null | sort

Karena bisa jadi:
ada script deploy lama
ada clone repo
ada webhook lama
atau minimal petunjuk layout sebelumnya


lihat isi public_html lebih rinci

Karena sekarang hanya terlihat asset dan index.php.

Jalankan:

echo "===== PUBLIC_HTML TREE ====="
find ~/public_html -maxdepth 3 -type f 2>/dev/null | sort



audit deploy root

Jalankan ini:

echo "===== DEPLOY ROOT TREE ====="
ls -lah /home/thechoosentalks/deploy/apps/thechoosentalks
echo
echo "===== CURRENT LINK CHECK ====="
ls -lah /home/thechoosentalks/deploy/apps/thechoosentalks/current
readlink -f /home/thechoosentalks/deploy/apps/thechoosentalks/current || echo "current is not a symlink"


baca deploy scripts lama
echo "===== DEPLOY.SH ====="
sed -n '1,260p' /home/thechoosentalks/deploy/apps/thechoosentalks/deploy.sh

echo
echo "===== ROLLBACK.SH ====="
sed -n '1,260p' /home/thechoosentalks/deploy/apps/thechoosentalks/rollback.sh

echo
echo "===== HEALTHCHECK.SH ====="
sed -n '1,260p' /home/thechoosentalks/deploy/apps/thechoosentalks/healthcheck.sh


lihat release layout lebih dekat
echo "===== RELEASES ====="
ls -lah /home/thechoosentalks/deploy/apps/thechoosentalks/releases

echo
echo "===== LATEST RELEASE PUBLIC ====="
LATEST=$(ls -1 /home/thechoosentalks/deploy/apps/thechoosentalks/releases | sort | tail -n 1)
echo "LATEST=$LATEST"
ls -lah /home/thechoosentalks/deploy/apps/thechoosentalks/releases/$LATEST
ls -lah /home/thechoosentalks/deploy/apps/thechoosentalks/releases/$LATEST/public



lihat symlink shared state dalam current release
CUR=$(readlink -f /home/thechoosentalks/deploy/apps/thechoosentalks/current)
echo "CURRENT_RELEASE=$CUR"

echo "===== SHARED LINKS CHECK ====="
ls -lah "$CUR/.env" 2>/dev/null || echo "no .env at current release root"
ls -lah "$CUR/storage" 2>/dev/null || echo "no storage at current release root"
ls -lah "$CUR/bootstrap/cache" 2>/dev/null || echo "no bootstrap/cache"

Ini akan membantu kita melihat:
.env shared benar-benar di-link atau tidak
storage shared benar-benar di-link atau tidak
---


ok sebelum lanjut saya mau anda buatkan dahulu dokumentasi terupdate saat ini , karena anda sudah tidak buatkan prompt ke gemini  lagi, supaya saya tau apa saja informasi output yang anda dapatkan sejak tidak lagi menggunakan prompt ke gemini, yaitu sejak interaksi anda dan saya melalui command line manual ke cpanel, dan task selanjutnya yang belum dikerjakan

---
Tentu. Saya susunkan dokumentasi ringkas-terupdate berdasarkan temuan sejak kita beralih dari prompt Gemini ke audit manual via command line di cPanel.

Ini saya buat dalam format yang bisa langsung Anda pakai untuk mengisi docs atau handover internal.

Dokumentasi Status Terkini — Pasca Audit Manual cPanel
1. Ringkasan kondisi saat ini

Sejak audit manual langsung ke server cPanel, kita sudah mendapatkan beberapa fakta operasional penting yang sebelumnya belum terlihat dari repo saja.

A. Environment server cPanel tervalidasi

Server aktif dan sehat untuk kebutuhan deploy berbasis script:

user shell: thechoosentalks

home directory: /home/thechoosentalks

shell: /bin/bash

PHP CLI tersedia dan aktif: PHP 8.3.30

Composer tersedia: 2.8.12

Git tersedia: 2.48.2【turn57file0†L1-L25】

B. Layout production backend nyata berhasil ditemukan

Backend production ternyata sudah memakai release-based deployment architecture, bukan folder Laravel tunggal langsung di public_html.

Bukti utamanya:

~/public_html/index.php me-load:
/home/thechoosentalks/deploy/apps/thechoosentalks/current/public/index.php

terdapat struktur:

releases/<timestamp>

shared/.env

shared/storage

current

deploy.sh

rollback.sh

healthcheck.sh【turn58file0†L1-L30】【turn59file0†L1-L28】

C. public_html hanyalah jembatan webroot

public_html saat ini berisi:

index.php

.htaccess

folder asset lama seperti build/, css/, fonts/, js/

Artinya:

public_html bukan root Laravel penuh

ia hanya menjadi entry web yang meneruskan ke release aktif di luar webroot【turn57file0†L26-L52】【turn58file0†L1-L12】

D. Sistem deploy lama ternyata cukup matang

Script lama bukan deploy improvisasi. Ia sudah punya:

release per timestamp

shared env/storage

symlink current

rollback script

healthcheck script

Dan deploy lama bersifat artifact-based, karena deploy.sh mengandalkan build.tar.gz dan checksum sebelum mengekstrak release baru【turn59file0†L1-L28】

2. Keputusan arsitektur yang sudah berubah karena audit manual

Audit manual mengubah beberapa asumsi besar.

Sebelumnya kita mengira:

backend root di server belum jelas

mungkin belum ada sistem deploy yang nyata

pull-deploy baru perlu didesain dari nol

Sekarang kita tahu:

backend production sudah ada

release system sudah ada

rollback sudah ada

healthcheck sudah ada

yang perlu diubah adalah mekanisme materialisasi release, bukan seluruh arsitektur deploy【turn59file0†L1-L28】

Implikasi keputusan:

Kita tidak boleh mengganti sistem deploy dengan model sederhana “git pull ke satu folder tetap”.

Yang benar adalah:

mempertahankan pola:

releases/

shared/

current

lalu mengganti cara release baru dibuat, karena artifact push lama tidak lagi cocok dengan kondisi firewall/server.

3. Keputusan deploy backend terbaru
A. Push-based deploy resmi dianggap tidak viable

Eksperimen sebelumnya sudah membuktikan:

deploy via scp/ssh dari GitHub Actions gagal karena timeout

bahkan setelah preflight probe dihapus, failure tetap terjadi

blocker utamanya berada di firewall/server policy, bukan di Laravel app atau YAML repo【turn50file0†L1-L24】【turn51file0†L1-L18】

B. Path A ditinggalkan

Path A = tetap artifact-based push deploy dengan trigger baru.

Ini tidak dipilih karena:

masih bergantung pada inbound transfer/upload

tetap berisiko mentok di layer server connectivity

tidak menyelesaikan masalah inti lingkungan hosting Anda【turn60file0†L1-L23】

C. Path B dipilih

Path B = mempertahankan release architecture lama, tetapi mengganti cara release baru dibuat.

Setelah dibandingkan, dipilih:

Path B1 — per-release shallow clone

Alasan:

paling mudah dipahami

paling mudah di-debug

paling cocok untuk implementasi pertama

tetap mempertahankan rollback confidence【turn61file0†L1-L21】

4. Adaptasi deploy script yang sudah berhasil di repo
A. deploy.sh sudah diadaptasi dari artifact-based menjadi Path B1

Perubahan arah:

tidak lagi bergantung pada build.tar.gz

tetap memakai release folder baru per timestamp

tetap memakai current

tetap memakai shared/.env dan shared/storage

tetap menjaga atomic switch dan rollback compatibility【turn62file0†L1-L19】

B. Koreksi implementasi materialisasi monorepo juga sudah dilakukan

Versi awal adaptasi masih terlalu rapuh karena clone penuh lalu “mengangkat” isi backend-api.

Itu kemudian dikoreksi menjadi:

sparse checkout

Supaya:

hanya bagian backend-api yang dimaterialisasi

release target lebih bersih

proses lebih aman untuk rollout pertama【turn63file0†L1-L16】

C. Status patch deploy repo-side

Saat ini status yang paling tepat:

PASS untuk repo-side deploy redesign

Karena:

arah arsitektur sudah benar

Path B1 sudah dipakai

release system lama tetap dihormati

artifact logic lama sudah tidak lagi menjadi ketergantungan utama【turn63file0†L1-L16】

5. Progres eksekusi manual di server yang sudah dilakukan

Berikut langkah nyata yang sudah Anda lakukan di server.

Sudah tervalidasi:

binary utama tersedia (php, composer, git)【turn57file0†L1-L25】

deploy root lama ada dan current symlink valid【turn64file0†L1-L20】

deploy.sh lama sudah dibackup menjadi deploy.sh.bak【turn64file0†L21-L27】

deploy.sh baru sudah ditempel ke server【turn64file0†L28-L33】

secret file /home/thechoosentalks/.deploy_secret sudah dibuat dengan permission 600【turn64file0†L34-L39】

deploy SSH key untuk GitHub sudah dibuat【turn64file0†L40-L58】

SSH config untuk GitHub sudah dibuat

autentikasi ssh -T git@github.com berhasil【turn64file0†L59-L64】

Yang belum selesai di eksekusi manual:

file webhook belum dibuat karena masih memakai placeholder <RANDOM_WEBHOOK> saat command dijalankan, sehingga shell error syntax【turn64file0†L65-L71】

6. Status domain / host publik yang relevan terhadap deploy
Host sehat publik:

https://www.thechoosentalks.org sudah sehat

EdgeOne + HTTPS untuk www sudah deployed

ini adalah host publik utama yang valid【turn41file0†L1-L14】

Apex domain:

https://thechoosentalks.org masih belum sehat penuh

apex HTTPS recovery masih dipisahkan sebagai task server-side

karena itu, webhook sebaiknya tidak memakai apex dulu

host webhook yang aman untuk saat ini adalah:
https://www.thechoosentalks.org/...【turn41file0†L1-L14】【turn43file0†L1-L17】

7. Informasi baru terpenting yang didapat sejak tidak lagi memakai prompt Gemini

Ini daftar “fakta baru” yang muncul murni dari interaksi manual command line:

Server production backend sudah punya release architecture matang, jadi deploy redesign harus adaptif, bukan mulai dari nol【turn58file0†L1-L30】【turn59file0†L1-L28】

public_html hanya bootstrap bridge ke release aktif, bukan Laravel root penuh【turn58file0†L1-L12】

deploy.sh lama bersifat artifact-based dan memanfaatkan build.tar.gz【turn59file0†L1-L28】

Root deploy production yang benar adalah:
/home/thechoosentalks/deploy/apps/thechoosentalks

current symlink saat ini valid dan menunjuk ke release aktif:
20260317012344【turn64file0†L1-L20】

Lingkungan cPanel server secara binary/tooling siap untuk pull-deploy:
PHP, Composer, Git, Curl semuanya tersedia【turn57file0†L1-L25】

Server-side GitHub deploy key dan autentikasi SSH ke GitHub sudah berhasil dipersiapkan【turn64file0†L40-L64】

Eksekusi tertahan hanya karena file webhook belum dibuat dengan nama nyata, bukan karena problem server besar baru【turn64file0†L65-L71】

Task berikutnya yang belum dikerjakan

Ini saya susun dalam urutan paling logis.

A. Lanjutan deploy backend — prioritas operasional

rapikan permission deploy.sh kembali ke 700

tentukan nama webhook nyata, misalnya deploy-k9x72p.php

buat file webhook di public_html

isi path absolut yang benar di webhook:

secret file

deploy script

absolute log path

cek syntax webhook dengan php -l

audit isi webhook untuk memastikan token/header/path benar

cek syntax deploy.sh (bash -n)

jalankan deploy.sh manual

verifikasi release baru terbentuk dengan benar

verifikasi current switch dan shared links

baru test webhook via curl

baru setelah itu sambungkan GitHub Actions

B. Domain / apex

Masih ada task terpisah:

implementasi apex HTTPS redirect host di cPanel/provider yang benar

saat ini belum selesai, tetapi tidak lagi menghalangi progres deploy backend karena webhook bisa memakai host www

C. Frontend wajah baru

Track ini belum dilanjutkan setelah foundation/shell reset.
Yang belum dikerjakan:

redesign batch V1 screens:

Today

VerseHub

Community

Paths

deprecation/retirement final untuk layar yang tidak dipakai

visual cleanup layar inti

Status keseluruhan saat ini
Backend deploy redesign

repo-side redesign: PASS

server-side installation: IN PROGRESS

blocker aktif saat ini: webhook file belum dibuat dan diuji

Domain

www: sehat

apex HTTPS: belum selesai

Frontend UI reset

foundation/shell: sudah

redesign layar inti: belum lanjut

---

