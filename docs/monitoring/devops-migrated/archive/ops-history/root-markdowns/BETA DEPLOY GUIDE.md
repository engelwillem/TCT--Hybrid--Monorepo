# BETA DEPLOY GUIDE (VerseHub CI/CD)

Panduan ini berisi langkah-langkah untuk melakukan pembaruan (deployment) aplikasi VerseHub ke server cPanel menggunakan GitHub Actions atau manual SSH.

## 🚩 LANGKAH PRIORITAS (Wajib)
*Lakukan langkah-langkah ini untuk update rutin aplikasi.*

### 1. Sinkronisasi Kode & Build (GitHub Actions)
Setiap push ke branch `main` akan memicu pipeline otomatis:
- **Lint & Test**: Memastikan kode PHP dan JS valid.
- **Build Artifact**: Membuat bundle production (`vendor`, `public/build`).
- **Atomic Deploy**: Mengirim bundle ke server dan mengupdate symlink `current`.

#### GitHub Secrets Wajib (Repo Settings):
- `CPANEL_SSH_KEY`, `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_PATH`.

### 2. Verifikasi Guardrail (Manual SSH)
Setelah deploy sukses via GitHub, pastikan integritas data tetap terjaga:
```bash
cd ~/deploy/apps/thechoosentalks/current
# Pastikan database terhubung ke 'shared' dan user tidak hilang
php artisan tinker --execute="echo 'Total Users: '.\App\Models\User::count();"
```

### 3. Healthcheck Produksi
Pastikan semua endpoint utama dapat diakses:
```bash
cd ~/deploy/apps/thechoosentalks
bash ./healthcheck.sh --release ~/deploy/apps/thechoosentalks/current --base-url https://thechoosentalks.org --urls "/ /today /versehub/id"
```

---

## ⚙️ LANGKAH OPSIONAL (Hanya jika Diperlukan)
*Lakukan langkah-langkah ini untuk pemeliharaan atau perubahan infrastruktur.*

### 1. Migrasi Database (SQLite -> MySQL)
Gunakan jika Anda ingin memindahkan storage database ke MySQL:
- Update `shared/.env` dengan kredensial MySQL.
- Jalankan manual workflow di GitHub dengan flag `migrate_sqlite_to_mysql = true`.
- Atau jalankan command artisan: `php artisan db:migrate-sqlite-to-mysql`.

### 2. Pelaporan & KPI
Gunakan untuk memantau performa landing page dan engagement user:
```bash
php artisan app:versehub-landing-kpi --days=7 --lang=id
```

### 3. Rollback (Jika Terjadi Error)
Jika versi terbaru bermasalah, segera kembalikan ke versi stabil:
```bash
cd ~/deploy/apps/thechoosentalks
bash ./rollback.sh
```

### 4. Audit Keamanan & Permission
Sekali-sekali pastikan folder deploy tetap terkunci (700):
```bash
chmod 700 ~/deploy/apps/thechoosentalks/releases
chmod 700 ~/deploy/apps/thechoosentalks/deploy.sh
```

---
> [!IMPORTANT]
> Selalu gunakan `php artisan migrate --force` untuk update schema. **JANGAN PERNAH** jalankan `migrate:fresh` di production.
