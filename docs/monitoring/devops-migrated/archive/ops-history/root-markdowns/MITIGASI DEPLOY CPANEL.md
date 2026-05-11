Penanganan sudah saya kerjakan langsung di repo untuk masalah deploy cPanel Anda.

**Yang saya ubah**
1. [deploy.sh](/e:/thechoosentalksbeta/deploy.sh)  
   - Diganti ke versi atomic deploy yang lebih aman:
   - `set -euo pipefail`
   - preflight artifact + shared `.env`
   - link shared storage/env
   - SQLite path konsisten
   - **tidak** `composer install` di production (wajib `vendor` sudah ada di artifact)
   - migrate + cache
   - **pre-switch healthcheck**
   - atomic symlink switch
   - publish `public_html`
   - **post-switch healthcheck**
   - auto rollback ke release sebelumnya jika post-check gagal
   - cleanup old releases

2. [healthcheck.sh](/e:/thechoosentalksbeta/healthcheck.sh) (baru)
   - Validasi release:
   - `artisan` boot
   - writable `storage` + `bootstrap/cache`
   - validasi data bisnis `BibleVerse(provider=ayt, lang=id)` minimal threshold
   - optional HTTP checks `/`, `/today`, `/versehub/id`

3. [rollback.sh](/e:/thechoosentalksbeta/rollback.sh) (baru)
   - Rollback otomatis ke release sebelumnya, atau target release spesifik
   - republish `public_html`
   - reset proxy `public_html/index.php`

4. [CPANEL_DEPLOY_RUNBOOK.md](/e:/thechoosentalksbeta/CPANEL_DEPLOY_RUNBOOK.md)
   - Disesuaikan dengan script baru
   - tambah healthcheck manual
   - update rollback command
   - hapus anjuran `composer install` di production

---

**Masalah utama dari log Anda yang sudah saya address**
1. Data Bible AYT-ID kosong (`0`) tidak terdeteksi sebagai blocker deploy.
2. Deploy masih fallback `composer install` di production.
3. Belum ada healthcheck fungsional dan rollback standar.
4. Belum ada guardrail bisnis sebelum atomic switch.

---

**Langkah jalankan di server (sekarang)**
```bash
cd ~/deploy/apps/thechoosentalks
chmod +x deploy.sh healthcheck.sh rollback.sh

# wajib: artifact harus sudah include vendor + build assets
export REQUIRED_BIBLE_AYT_ID_MIN=1
bash ./deploy.sh | tee -a ~/deploy/apps/thechoosentalks/deploy.log
```

Healthcheck manual:
```bash
bash ./healthcheck.sh --release ~/deploy/apps/thechoosentalks/current --required-bible-min 1 --base-url https://thechoosentalks.org --urls "/ /today /versehub/id"
```

Rollback cepat:
```bash
bash ./rollback.sh
```

---

**Untuk menyelesaikan akar masalah data server Anda (BibleVerse masih 0)**
1. Upload file `ayt.csv` ke:
`~/deploy/apps/thechoosentalks/current/storage/app/ayt/ayt.csv`
2. Import:
```bash
cd ~/deploy/apps/thechoosentalks/current
php artisan versehub:import-ayt --path=storage/app/ayt/ayt.csv --truncate
php artisan optimize:clear
```
3. Verifikasi:
```bash
php -r 'require "vendor/autoload.php"; $app=require "bootstrap/app.php"; $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap(); echo App\Models\BibleVerse::where("provider","ayt")->where("lang","id")->count();'
```

Catatan: di environment lokal ini saya tidak bisa mengeksekusi `bash -n` (terblokir `E_ACCESSDENIED`), jadi validasi runtime shell script perlu Anda jalankan di server cPanel langsung dengan `bash -n deploy.sh`, `bash -n healthcheck.sh`, `bash -n rollback.sh`.