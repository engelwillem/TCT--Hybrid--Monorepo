Rekomendasi versi PHP (stabil untuk 1 tahun ke depan)

Untuk Laravel 12 (butuh PHP 8.2+), yang paling “aman & stabil” untuk 1 tahun ke depan biasanya PHP 8.3 (lebih matang dari 8.4, dan masih panjang masa security support-nya).
Kalau di cPanel kamu tidak ada opsi 8.3, pakai PHP 8.4 juga oke (lebih baru, support lebih panjang).
Laravel 12 memang kompatibel minimal PHP 8.2.

STEP 1 — Set PHP Version + centang extensions yang wajib (di PHP Selector)

Di halaman PHP Selector → Extensions (seperti screenshot kamu):

Ubah “Current PHP version” ke 8.3 (kalau ada)

lalu klik Apply

Kalau tidak ada 8.3, biarkan 8.4 (sudah aman)

Centang extension ini (kalau ada di list):

bcmath

ctype

curl

dom

fileinfo

intl

mbstring

openssl

pdo

pdo_mysql

tokenizer

xml / xmlreader / xmlwriter (kalau dipisah)

zip

gd atau imagick (pilih minimal salah satu; biasanya gd cukup)

opcache (recommended)

sodium (kalau ada)

Setelah checklist beres, klik Apply lagi (kalau tombol Apply muncul untuk menyimpan perubahan extension).


✅ STEP 2 (Revisi) — Generate SSH Key dengan Password
2.1 Generate Key (pakai password)

Masuk cPanel → SSH Access → Manage SSH Keys

Klik Generate a New Key

Isi seperti ini:

Key Name: github-actions

Key Password: isi password kuat (contoh: GhA-Deploy2026!)
👉 SIMPAN password ini baik-baik

Key Type: RSA

Key Size: 4096

Klik Generate Key

2.2 Authorize Key

Setelah key dibuat

Klik Manage di key tersebut

Klik Authorize

Status harus jadi: ✅ Authorized

2.3 Copy Private Key

Di daftar key → klik View/Download

Copy seluruh isi:

-----BEGIN RSA PRIVATE KEY-----
....
-----END RSA PRIVATE KEY-----

Simpan di notepad

2.4 Catat ini juga

Kamu butuh 4 data ini nanti:

SSH Host server.cloudssd.net (penulisan yang benar)

SSH Port (biasanya 22, cek di halaman SSH)

SSH Username (username cPanel)

SSH Private Key (yang tadi kamu copy)

SSH Key Password (yang tadi kamu buat)


✅ STEP 3 — Masukkan SSH ke GitHub (Secrets)

Sekarang kita hubungkan GitHub → Server kamu.

3.1 Masuk ke Repository GitHub kamu

Buka repo project Laravel kamu di GitHub

Klik Settings

Klik Secrets and variables

Klik Actions

Klik New repository secret

3.2 Tambahkan Secrets ini satu per satu
1️⃣ SSH_HOST

Name: SSH_HOST

Value: isi dengan host server kamu
(contoh: server.cloudssd.net)

2️⃣ SSH_PORT

Name: SSH_PORT

Value: biasanya 22 (cek tadi di cPanel)

3️⃣ SSH_USERNAME

Name: SSH_USERNAME

Value: username cPanel kamu

4️⃣ SSH_PRIVATE_KEY

Name: SSH_PRIVATE_KEY

Value: paste seluruh isi private key:

-----BEGIN RSA PRIVATE KEY-----
....
-----END RSA PRIVATE KEY-----
5️⃣ SSH_PASSPHRASE

Name: SSH_PASSPHRASE

Value: password yang kamu isi waktu generate SSH key


STEP 4 — Siapkan folder deploy di server (di cPanel Terminal)

Target step ini: server kamu punya struktur folder “release” biar bisa swap versi hanya kalau deploy sukses.

4.1 Buka cPanel → Terminal

Copy–paste perintah ini, lalu Enter:

mkdir -p ~/apps/thechoosentalks/{releases,shared}
mkdir -p ~/apps/thechoosentalks/shared/storage
4.2 Buat file .env untuk produksi (1x saja)

Jalankan:

nano ~/apps/thechoosentalks/shared/.env

Tempel isi .env produksi kamu (minimal ada ini, sesuaikan nilainya):

APP_NAME="TheChosenTalks"
APP_ENV=production
APP_KEY=base64:ISI_DARI_APP_KEY
APP_DEBUG=false
APP_URL=https://DOMAIN_KAMU

LOG_CHANNEL=stack

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=thechoosentalks_appdb
DB_USERNAME=thechoosentalks_app1
DB_PASSWORD=PASSWORD_DB_KAMU

CACHE_STORE=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync

Simpan nano:

tekan CTRL + O lalu Enter

lalu CTRL + X

4.3 Generate APP_KEY (kalau belum ada)

Kalau kamu belum punya APP_KEY, jalankan ini untuk generate key di server (nanti kita tempel ke .env):

```
php -r "echo 'base64:'.base64_encode(random_bytes(32)).PHP_EOL;"
```

Copy output-nya, lalu edit lagi .env:

nano ~/apps/thechoosentalks/shared/.env

Isi APP_KEY= dengan hasil tadi, simpan.


✅ STEP 5 — Pindahkan public_html supaya pakai sistem release

Sekarang kita ubah supaya:

public_html → link ke release terbaru

Bukan langsung isi project.

5.1 Backup isi public_html dulu (penting)

Di Terminal ketik:

mv ~/public_html ~/public_html_backup

Kalau tidak error, lanjut.

5.2 Buat symlink baru

Ketik ini:

ln -s ~/apps/thechoosentalks/current/public ~/public_html

Sekarang:

public_html bukan folder asli

tapi link ke release aktif

5.3 Cek hasilnya

Ketik:

ls -la ~

Harus terlihat:

public_html -> /home/USERNAME/apps/thechoosentalks/current/public



✅ STEP 6 — Buat Script Deploy di Server

Sekarang kita buat file script yang nanti dipanggil GitHub Actions.

6.1 Masih di Terminal, jalankan:
nano ~/apps/thechoosentalks/deploy.sh
6.2 Paste ini ke dalamnya:
#!/bin/bash

set -e

APP_DIR="$HOME/apps/thechoosentalks"
RELEASES_DIR="$APP_DIR/releases"
SHARED_DIR="$APP_DIR/shared"

TIMESTAMP=$(date +%Y%m%d%H%M%S)
NEW_RELEASE="$RELEASES_DIR/$TIMESTAMP"

echo "Creating new release folder..."
mkdir -p $NEW_RELEASE

echo "Extracting new build..."
tar -xzf $APP_DIR/build.tar.gz -C $NEW_RELEASE

echo "Linking shared .env..."
ln -s $SHARED_DIR/.env $NEW_RELEASE/.env

echo "Linking storage..."
rm -rf $NEW_RELEASE/storage
ln -s $SHARED_DIR/storage $NEW_RELEASE/storage

cd $NEW_RELEASE

echo "Running artisan optimize..."
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan optimize

echo "Switching current release..."
ln -sfn $NEW_RELEASE $APP_DIR/current

echo "Deploy completed successfully!"
6.3 Save file

Tekan:

CTRL + O → Enter

CTRL + X

6.4 Buat script bisa dieksekusi
chmod +x ~/apps/thechoosentalks/deploy.sh


✅ STEP 7 — Buat GitHub Actions Auto Deploy (AMAN)

Sekarang kita buat workflow yang:

Build Laravel + React

Install dependencies

Build production

Zip hasilnya

Upload ke server

Jalankan deploy.sh

Kalau build gagal → tidak deploy

7.1 Di repository GitHub kamu

Buka repo

Klik tab Actions

Klik New workflow

Klik set up a workflow yourself

7.2 Hapus semua isi file, lalu paste ini:
name: Deploy to cPanel

on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: 8.3
          extensions: mbstring, bcmath, intl, pdo_mysql, zip
          coverage: none

      - name: Install Composer dependencies
        run: composer install --no-dev --optimize-autoloader

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install NPM dependencies
        run: npm install

      - name: Build frontend
        run: npm run build

      - name: Create deployment archive
        run: |
          tar --exclude='.git' \
              --exclude='node_modules' \
              --exclude='tests' \
              -czf build.tar.gz .

      - name: Upload to server
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USERNAME }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          passphrase: ${{ secrets.SSH_PASSPHRASE }}
          port: ${{ secrets.SSH_PORT }}
          source: "build.tar.gz"
          target: "~/apps/thechoosentalks"

      - name: Run deployment script
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USERNAME }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          passphrase: ${{ secrets.SSH_PASSPHRASE }}
          port: ${{ secrets.SSH_PORT }}
          script: |
            cd ~/apps/thechoosentalks
            ./deploy.sh
7.3 Klik Commit changes

Sekarang lakukan test:

Buat commit kecil di repo (ubah README misalnya) lalu push ke branch main.

GitHub Actions akan jalan otomatis.


✅ STEP 8 — Perbaiki Workflow

Buka file workflow kamu:

.github/workflows/deploy.yml

Cari bagian ini:

- name: Create deployment archive
  run: |
    tar --exclude='.git' \
        --exclude='node_modules' \
        --exclude='tests' \
        -czf build.tar.gz .
Ganti dengan ini:
- name: Create deployment archive
  run: |
    tar \
      --exclude=.git \
      --exclude=node_modules \
      --exclude=tests \
      --exclude=.github \
      --exclude=storage/logs \
      --exclude=storage/framework/cache \
      --warning=no-file-changed \
      -czf build.tar.gz .
Lalu:

1️⃣ Commit changes

2️⃣ Push ke branch main

GitHub Actions akan auto run lagi.


