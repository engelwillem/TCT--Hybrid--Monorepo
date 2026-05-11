# MASTER BOOK DEPLOY CPANEL — TheChosenTalks

Versi operasional utama untuk server:
- User cPanel: `thechoosentalks`
- Home: `/home/thechoosentalks`
- Deploy root: `~/deploy/apps/thechoosentalks`
- Repo checkout: `~/repositories/TCT--Laravel`
- Web root: `~/public_html`
- Active release: `~/deploy/apps/thechoosentalks/current`
- Domain: `https://thechoosentalks.org`

---

## 1. Arsitektur server

Alur runtime:

```text
Browser
  -> LiteSpeed/Apache
  -> ~/public_html/index.php
  -> ~/deploy/apps/thechoosentalks/current/public/index.php
  -> Laravel active release
```

Struktur utama:

```text
/home/thechoosentalks
├── repositories/TCT--Laravel
├── deploy/apps/thechoosentalks
│   ├── build.tar.gz
│   ├── deploy.sh
│   ├── healthcheck.sh
│   ├── rollback.sh
│   ├── current -> releases/<timestamp>
│   ├── releases/<timestamp>/...
│   └── shared/.env + shared/storage
└── public_html/index.php + public assets
```

Poin penting:
- `public_html` bukan source app penuh; ia proxy tipis.
- release aktif diatur lewat symlink `current`.
- `.env` dan `storage` harus berasal dari `shared/`.
- deploy model ini adalah **atomic release**.

---

## 2. Permission minimum

Jaga permission ini:

```bash
chmod 700 ~/deploy
chmod 700 ~/deploy/apps
chmod 700 ~/deploy/apps/thechoosentalks
chmod 700 ~/deploy/apps/thechoosentalks/releases
chmod 700 ~/deploy/apps/thechoosentalks/deploy.sh
chmod 600 ~/deploy/apps/thechoosentalks/healthcheck.sh
chmod 600 ~/deploy/apps/thechoosentalks/rollback.sh
chmod 600 ~/deploy/apps/thechoosentalks/shared/.env
```

---

## 3. Setup awal satu kali

### 3.1 Siapkan folder

```bash
mkdir -p ~/deploy/apps/thechoosentalks/{releases,shared}
mkdir -p ~/deploy/apps/thechoosentalks/shared/storage
```

### 3.2 Siapkan env production

```bash
nano ~/deploy/apps/thechoosentalks/shared/.env
```

Minimum isi:
- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=https://thechoosentalks.org`
- `APP_KEY=...`
- `DB_CONNECTION=...`
- `DB_HOST=...`
- `DB_DATABASE=...`
- `DB_USERNAME=...`
- `DB_PASSWORD=...`

### 3.3 Pastikan proxy web root benar

Isi `~/public_html/index.php`:

```php
<?php
declare(strict_types=1);
require __DIR__ . '/../deploy/apps/thechoosentalks/current/public/index.php';
```

---

## 4. Peran 3 script inti

### `deploy.sh`
Tugas:
- validasi artifact
- buat release baru
- extract release
- link `.env` dan `storage`
- cache + migrate
- pre healthcheck
- switch `current`
- publish public asset
- post healthcheck
- cleanup release lama

### `healthcheck.sh`
Tugas:
- cek release bisa boot
- cek writable path
- cek data bisnis penting
- cek endpoint HTTP utama

### `rollback.sh`
Tugas:
- kembali ke release stabil sebelumnya
- republish public asset bila perlu
- reset proxy publik jika dibutuhkan

---

## 5. Deploy manual aman

```bash
cd ~/deploy/apps/thechoosentalks
chmod +x deploy.sh healthcheck.sh rollback.sh
export REQUIRED_BIBLE_AYT_ID_MIN=1
bash ./deploy.sh | tee -a ~/deploy/apps/thechoosentalks/deploy.log
```

Syarat artifact:
- sudah berisi `vendor/`
- sudah berisi `public/build/manifest.json`
- berasal dari build bersih

---

## 6. Healthcheck dan verifikasi pasca deploy

```bash
cd ~/deploy/apps/thechoosentalks/current
php artisan tinker --execute="echo 'Total Users: '.\App\Models\User::count();"
```

```bash
bash ~/deploy/apps/thechoosentalks/healthcheck.sh \
  --release ~/deploy/apps/thechoosentalks/current \
  --required-bible-min 1 \
  --base-url https://thechoosentalks.org \
  --urls "/ /today /versehub/id"
```

Kalau post-switch healthcheck gagal:
- rollback ke release sebelumnya
- cek `deploy.log`
- cek `deploy-last.log`

---

## 7. Rollback cepat

```bash
cd ~/deploy/apps/thechoosentalks
bash ./rollback.sh
```

Jangan jalankan `migrate:fresh` di production.

---

## 8. Integrasi auto deploy CI/CD

Agar benar-benar auto deploy, CI/CD harus:
1. build PHP + frontend
2. jalankan test
3. buat `build.tar.gz`
4. upload artifact ke server
5. SSH ke server dan jalankan `deploy.sh`

Alur:

```text
Git push
 -> GitHub Actions
 -> composer install + npm ci + npm run build
 -> php artisan test
 -> pack build.tar.gz
 -> upload ke ~/deploy/apps/thechoosentalks/build.tar.gz
 -> ssh server
 -> bash ~/deploy/apps/thechoosentalks/deploy.sh
```

---

## 9. Apakah script ini sudah membuat auto deploy?

**Jawaban:**
- **Ya, script Anda sudah membantu dan menyiapkan fondasi auto deploy.**
- **Tidak, script saja belum cukup untuk auto deploy kalau CI/CD belum memanggilnya.**

Artinya:
- kalau hanya ada `deploy.sh` di server -> belum auto deploy
- kalau GitHub Actions upload artifact lalu SSH menjalankan `deploy.sh` -> sudah auto deploy

Jadi script Anda adalah **mesin deploy**, sedangkan GitHub Actions adalah **pemicu otomatisnya**.

---

## 10. Checklist CI/CD sehat

Pastikan workflow melakukan ini sebelum deploy:

```bash
composer install --no-dev --optimize-autoloader
npm ci
npm run build
php artisan test
```

Lalu artifact harus memuat:
- source app
- `vendor/`
- `public/build/manifest.json`
- asset hasil build

Workflow lalu:
- upload `build.tar.gz`
- jalankan `bash ~/deploy/apps/thechoosentalks/deploy.sh`

---

## 11. Larangan production

Jangan lakukan ini:
- `php artisan migrate:fresh --force`
- simpan `.env` di `public_html`
- deploy langsung dari `repositories/` ke web root
- permission deploy jadi `755`
- andalkan `composer install` manual di production jika pola sudah artifact-based

---

## 12. Troubleshooting cepat

### Vite manifest not found
Penyebab:
- `npm run build` tidak jalan
- artifact tidak membawa `public/build`

Aksi:
- perbaiki workflow
- build ulang
- deploy ulang

### Error 500 setelah deploy
Penyebab:
- env salah
- cache/config rusak
- permission storage salah

Aksi:
- cek `deploy.log`
- cek `healthcheck.sh`
- rollback bila perlu

### User count 0
Penyebab:
- koneksi DB salah
- guardrail deploy mencegah switch berbahaya

Aksi:
- stop deploy
- verifikasi `shared/.env`
- pastikan DB production benar

---

## 13. Command cepat harian

```bash
# cek release aktif
readlink -f ~/deploy/apps/thechoosentalks/current

# cek permission inti
ls -ld ~/deploy ~/deploy/apps ~/deploy/apps/thechoosentalks ~/deploy/apps/thechoosentalks/releases
ls -l ~/deploy/apps/thechoosentalks/deploy.sh ~/deploy/apps/thechoosentalks/healthcheck.sh ~/deploy/apps/thechoosentalks/rollback.sh

# healthcheck
bash ~/deploy/apps/thechoosentalks/healthcheck.sh --release ~/deploy/apps/thechoosentalks/current --base-url https://thechoosentalks.org --urls "/ /today /versehub/id"

# rollback
cd ~/deploy/apps/thechoosentalks && bash ./rollback.sh
```

---

## 14. Rekomendasi operasional

- Gunakan dokumen ini sebagai **master book utama**.
- Simpan file ini di server juga, misalnya:

```bash
cp /path/lokal/MASTER_BOOK_DEPLOY_CPANEL_THECHOOSENTALKS.md ~/deploy/apps/thechoosentalks/
```

- Dokumen lama boleh disimpan sebagai referensi, tetapi instruksi operasional sehari-hari sebaiknya mengacu ke master book ini.
