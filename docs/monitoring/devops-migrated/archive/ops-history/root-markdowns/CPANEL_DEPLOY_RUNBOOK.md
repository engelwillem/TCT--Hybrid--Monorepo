# cPanel Deploy Runbook (VerseHub)

Dokumen teknis mendalam untuk operasional deployment di server cPanel. Selaras dengan `BETA DEPLOY GUIDE.md`.

## 🚩 LANGKAH PRIORITAS (Update Rutin)

### 1. Persiapan Database & Shared State
Pastikan `.env` di folder `shared/` selalu valid karena setiap release akan melakukan symlink ke sana.
```bash
ls -la ~/deploy/apps/thechoosentalks/shared/.env
```

### 2. Deployment Flow (Manual Pull)
Jika tidak menggunakan CI/CD GitHub, gunakan urutan aman ini:
```bash
cd ~/deploy/apps/thechoosentalks/current
git fetch --all && git reset --hard origin/main
composer install --no-dev --optimize-autoloader
npm ci && npm run build
php artisan migrate --force
php artisan optimize
rsync -av public/build/ ~/public_html/build/
```

### 3. Smoke Test (Mandatory)
```bash
curl -I https://thechoosentalks.org/
bash ~/deploy/apps/thechoosentalks/healthcheck.sh --release ~/deploy/apps/thechoosentalks/current
```

---

## ⚙️ LANGKAH OPSIONAL (Maintenance)

### 1. Pembersihan & Optimasi Storage
Jika disk space menipis atau asset tidak terupdate:
```bash
php artisan optimize:clear
rm -rf ~/deploy/apps/thechoosentalks/releases/<timestamp_lama>
```

### 2. Migrasi Data SQLite ke MySQL
Langkah pemindahan satu kali (One-time cutover):
1. Siapkan DB MySQL di cPanel.
2. Update `shared/.env`.
3. Jalankan: `php artisan db:migrate-sqlite-to-mysql --truncate --target-connection=mysql`.

### 3. Analisis KPI & User Retention
Jalankan setiap minggu untuk review performa:
```bash
php artisan app:versehub-landing-kpi --days=7 --json > /tmp/kpi_report.json
```

### 4. Rollback Release
Kembalikan ke release sebelumnya dalam hitungan detik:
```bash
cd ~/deploy/apps/thechoosentalks
bash ./rollback.sh
```

---
> [!WARNING]
> Area `/deploy` harus memiliki permission `700` agar tidak bisa diintip oleh user lain di server shared hosting yang sama.
