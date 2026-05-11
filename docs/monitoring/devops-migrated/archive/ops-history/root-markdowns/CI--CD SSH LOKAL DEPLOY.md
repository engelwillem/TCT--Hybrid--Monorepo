# CI--CD LOKAL DEPLOY

Panduan ini dibuat untuk alur **CI lokal manual di laptop + deploy ke server cPanel** untuk project:

- **Repo lokal:** `E:\thechoosentalksbeta`
- **Repo Git:** `https://github.com/engelwillem/TCT--Laravel.git`
- **Server user:** `thechoosentalks`
- **Server host:** `209.42.27.90`
- **Deploy path:** `/home/thechoosentalks/deploy/apps/thechoosentalks`

Tujuan panduan ini adalah agar Anda bisa:

1. build aplikasi di laptop,
2. membuat artifact deploy yang bersih,
3. upload ke server,
4. menjalankan `deploy.sh`,
5. menjaga deploy tetap konsisten, aman, dan mudah diulang.

---

## Gambaran arsitektur

Alur yang dipakai:

```text
Laptop (CI lokal)
  ├─ composer install --no-dev
  ├─ npm ci
  ├─ npm run build
  ├─ build.tar.gz
  └─ build.tar.gz.sha256
            │
            ▼
Server cPanel
  ├─ /home/thechoosentalks/deploy/apps/thechoosentalks/build.tar.gz
  ├─ /home/thechoosentalks/deploy/apps/thechoosentalks/shared/.env
  ├─ releases/<timestamp>
  ├─ current -> releases/<timestamp>
  └─ public_html -> proxy ke current/public/index.php
```

Deploy **tidak** membuild di server. Server hanya:
- menerima artifact,
- extract ke release baru,
- link `.env` dan `shared/storage`,
- jalankan migrate + healthcheck,
- switch `current`.

---

# Step 1 — Pastikan laptop punya tool minimum

Jalankan di PowerShell:

```powershell
php -v
composer --version
node -v
npm -v
git --version
tar --version
```

Checklist:
- PHP tersedia
- Composer tersedia
- Node.js tersedia
- npm tersedia
- git tersedia
- tar tersedia

Contoh status yang sudah valid:
- PHP 8.3.x
- Composer 2.x
- Node 20.x
- npm 10.x

Kalau salah satu tidak ada, perbaiki dulu sebelum lanjut.

---

# Step 2 — Pastikan repo lokal yang dipakai memang benar

Masuk ke folder repo:

```powershell
cd E:\thechoosentalksbeta
```

Lalu cek:

```powershell
pwd
git remote -v
git branch --show-current
git status --short
Get-ChildItem artisan, composer.json, package.json, deploy.sh, healthcheck.sh, rollback.sh
```

Yang harus dipastikan:
- folder kerja memang repo Laravel yang benar
- remote Git mengarah ke repo yang benar
- branch aktif sesuai target deploy
- file penting deploy tersedia:
  - `artisan`
  - `composer.json`
  - `package.json`
  - `deploy.sh`
  - `healthcheck.sh`
  - `rollback.sh`

Catatan:
- file catatan seperti `MIGRATION PROMPTS.md`, `BUILDandBENCHMARK.md`, dan sejenisnya **tidak** ikut deploy artifact.

---

# Step 3 — Install dependency lokal dan pastikan build dasar jalan

Masih di root project, jalankan:

```powershell
composer install --no-dev --prefer-dist --optimize-autoloader
npm ci
npm run build
```

Lalu verifikasi:

```powershell
Test-Path vendor\autoload.php
Test-Path public\build\manifest.json
```

Hasil yang diinginkan:

```text
True
True
```

Arti pengecekan:
- `vendor\autoload.php` memastikan dependency PHP production siap
- `public\build\manifest.json` memastikan build frontend Vite berhasil

Catatan:
- warning Composer saat membuang package dev di Windows biasanya masih bisa ditoleransi selama proses selesai normal
- warning `EBADENGINE` dari package frontend tidak otomatis berarti gagal, selama `npm run build` sukses

---

# Step 4 — Buat artifact deploy lokal (whitelist only)

## Prinsip penting

**Jangan archive seluruh root project.**

Karena di root bisa ada file lain yang tidak dibutuhkan server. Gunakan **whitelist**, artinya hanya file/folder yang memang diperlukan server saat deploy.

## Isi artifact yang boleh masuk

Artifact `build.tar.gz` hanya boleh berisi:

```text
artisan
app
bootstrap
config
database
public
resources
routes
vendor
composer.json
composer.lock
```

## Isi yang tidak ikut ke artifact

Jangan masukkan:
- `.git`
- `.github`
- `node_modules`
- `tests`
- file catatan `.md`
- file deploy server:
  - `deploy.sh`
  - `healthcheck.sh`
  - `rollback.sh`

Tiga script deploy akan di-upload terpisah.

## Cek whitelist itu memang ada

```powershell
Get-ChildItem artisan, app, bootstrap, config, database, public, resources, routes, vendor, composer.json, composer.lock
```

Kalau semua ada, lanjut buat artifact.

## Buat artifact

```powershell
tar -czf build.tar.gz `
artisan `
app `
bootstrap `
config `
database `
public `
resources `
routes `
vendor `
composer.json `
composer.lock
```

## Buat checksum

```powershell
(Get-FileHash build.tar.gz -Algorithm SHA256).Hash | Out-File -Encoding ascii build.tar.gz.sha256
```

## Verifikasi artifact

```powershell
Get-Item build.tar.gz
Get-FileHash build.tar.gz -Algorithm SHA256
Get-Content build.tar.gz.sha256
```

Hash dari `Get-FileHash` dan isi `build.tar.gz.sha256` harus sama persis.

---

# Step 5 — Siapkan SSH key-based login dari laptop ke server

## Cek apakah key sudah ada

```powershell
Get-ChildItem $HOME\.ssh
```

Kalau belum ada key deploy yang valid, buat key baru:

```powershell
ssh-keygen -t ed25519 -C "laptop-deploy" -f "$HOME\.ssh\cpanel_laptop_deploy"
```

Saat diminta passphrase:
- boleh kosong
- tekan Enter dua kali

## Lihat public key

```powershell
Get-Content "$HOME\.ssh\cpanel_laptop_deploy.pub"
```

## Pasang public key ke server

Masuk ke server dengan password sekali:

```powershell
ssh -p 22 thechoosentalks@209.42.27.90
```

Lalu di server:

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
printf '%s\n' 'ISI_PUBLIC_KEY_ANDA_DI_SINI' >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
tail -n 3 ~/.ssh/authorized_keys
```

## Uji login tanpa password

Dari laptop:

```powershell
ssh -i "$HOME\.ssh\cpanel_laptop_deploy" -p 22 thechoosentalks@209.42.27.90 "echo KEY_OK"
```

Hasil yang diinginkan:

```text
KEY_OK
```

Kalau masih minta password:
- cek key private rusak atau tidak
- cek public key sudah benar masuk ke `authorized_keys`
- cek permission `.ssh` dan `authorized_keys`

---

# Step 6 — Siapkan struktur server minimum untuk deploy

Masuk ke server, lalu jalankan:

```bash
mkdir -p ~/deploy/apps/thechoosentalks/releases
mkdir -p ~/deploy/apps/thechoosentalks/shared/storage/framework/cache/data
mkdir -p ~/deploy/apps/thechoosentalks/shared/storage/framework/sessions
mkdir -p ~/deploy/apps/thechoosentalks/shared/storage/framework/views
mkdir -p ~/deploy/apps/thechoosentalks/shared/storage/logs

chmod 700 ~/deploy/apps/thechoosentalks
chmod 700 ~/deploy/apps/thechoosentalks/releases
chmod 700 ~/deploy/apps/thechoosentalks/shared
chmod 755 ~/deploy/apps/thechoosentalks/shared/storage
chmod 755 ~/deploy/apps/thechoosentalks/shared/storage/framework
chmod 755 ~/deploy/apps/thechoosentalks/shared/storage/framework/cache
chmod 755 ~/deploy/apps/thechoosentalks/shared/storage/framework/cache/data
chmod 755 ~/deploy/apps/thechoosentalks/shared/storage/framework/sessions
chmod 755 ~/deploy/apps/thechoosentalks/shared/storage/framework/views
chmod 755 ~/deploy/apps/thechoosentalks/shared/storage/logs
```

## Pastikan `.env` production sudah ada

File wajib:

```text
/home/thechoosentalks/deploy/apps/thechoosentalks/shared/.env
```

Minimal permission:

```bash
chmod 600 ~/deploy/apps/thechoosentalks/shared/.env
```

---

# Step 7 — Pastikan `deploy.sh` server-side siap

`deploy.sh` harus mendukung minimal:
- `ARTIFACT_PATH`
- `ARTIFACT_SHA256`
- release folder `releases/<timestamp>`
- `shared/.env`
- symlink `current`
- `shared/storage`

## Guard minimal yang harus ada di deploy.sh

### Cek artifact
```bash
[[ -f "$ARTIFACT_PATH" ]] || fail "Artifact not found: $ARTIFACT_PATH"
```

### Cek checksum
```bash
if [[ -n "${ARTIFACT_SHA256:-}" ]]; then
    require_cmd sha256sum
    ACTUAL_SHA256="$(sha256sum "$ARTIFACT_PATH" | awk '{print $1}')"
    [[ "$ACTUAL_SHA256" == "$ARTIFACT_SHA256" ]] || fail "Artifact checksum mismatch"
fi
```

### Cek Vite manifest
```bash
[[ -f "$NEW_RELEASE/public/build/manifest.json" ]] || fail "public/build/manifest.json missing in artifact. Run Vite build in CI first."
```

### Cek vendor autoload
```bash
[[ -f "$NEW_RELEASE/vendor/autoload.php" ]] || fail "vendor/autoload.php missing in artifact."
```

### Cek artisan
```bash
[[ -f "$NEW_RELEASE/artisan" ]] || fail "artisan missing in artifact"
```

---

# Step 8 — Buat script deploy lokal 1 perintah

Di laptop, buat file `deploy-local.ps1` di root project.

## Isi final yang direkomendasikan

```powershell
$ErrorActionPreference = "Stop"

$HostName = "209.42.27.90"
$Port = 22
$User = "thechoosentalks"
$KeyPath = "$HOME\.ssh\cpanel_laptop_deploy"
$DeployPath = "/home/thechoosentalks/deploy/apps/thechoosentalks"

function Invoke-RemoteCommand {
    param(
        [string]$Command
    )

    $tmpFile = Join-Path $env:TEMP ("remote-command-" + [guid]::NewGuid().ToString() + ".sh")
    $Command = $Command -replace "`r", ""
    Set-Content -Path $tmpFile -Value $Command -NoNewline -Encoding ascii

    try {
        Get-Content $tmpFile | ssh -i $KeyPath -p $Port "${User}@${HostName}" "bash -s"
    }
    finally {
        Remove-Item $tmpFile -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "== Checking local files =="

$requiredFiles = @(
    "build.tar.gz",
    "build.tar.gz.sha256",
    "deploy.sh",
    "healthcheck.sh",
    "rollback.sh"
)

foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        throw "Missing required file: $file"
    }
}

Write-Host "== Uploading bundle to server =="

scp -i $KeyPath -P $Port .\build.tar.gz "${User}@${HostName}:${DeployPath}/build.tar.gz"
scp -i $KeyPath -P $Port .\build.tar.gz.sha256 "${User}@${HostName}:${DeployPath}/build.tar.gz.sha256"
scp -i $KeyPath -P $Port .\deploy.sh "${User}@${HostName}:${DeployPath}/deploy.sh"
scp -i $KeyPath -P $Port .\healthcheck.sh "${User}@${HostName}:${DeployPath}/healthcheck.sh"
scp -i $KeyPath -P $Port .\rollback.sh "${User}@${HostName}:${DeployPath}/rollback.sh"

Write-Host "== Verifying remote files =="

Invoke-RemoteCommand @"
set -e
test -f '$DeployPath/build.tar.gz'
test -f '$DeployPath/build.tar.gz.sha256'
test -f '$DeployPath/deploy.sh'
test -f '$DeployPath/healthcheck.sh'
test -f '$DeployPath/rollback.sh'
chmod 700 '$DeployPath/deploy.sh' '$DeployPath/healthcheck.sh' '$DeployPath/rollback.sh' || true
"@

Write-Host "== Running remote deploy =="

Invoke-RemoteCommand @"
set -e
export ARTIFACT_PATH='$DeployPath/build.tar.gz'
export ARTIFACT_SHA256=`$(cat '$DeployPath/build.tar.gz.sha256')
bash '$DeployPath/deploy.sh'
"@

Write-Host "== Deploy finished =="
```

---

# Step 9 — Bersihkan artefak gagal sebelum deploy ulang

## Bersihkan lokal

```powershell
Remove-Item .\build.tar.gz -Force -ErrorAction SilentlyContinue
Remove-Item .\build.tar.gz.sha256 -Force -ErrorAction SilentlyContinue
Remove-Item .\upload-bundle -Recurse -Force -ErrorAction SilentlyContinue
```

Verifikasi:

```powershell
Get-Item .\build.tar.gz, .\build.tar.gz.sha256
```

Kalau muncul `Cannot find path`, itu bagus.

## Bersihkan server

Masuk ke server, lalu:

```bash
rm -f ~/deploy/apps/thechoosentalks/build.tar.gz
rm -f ~/deploy/apps/thechoosentalks/build.tar.gz.sha256
```

Verifikasi:

```bash
ls -lh ~/deploy/apps/thechoosentalks
```

Kalau artifact sudah hilang, server siap menerima upload baru.

---

# Step 10 — Deploy ulang dari laptop

Urutan aman:

1. build artifact
2. buat checksum
3. jalankan `deploy-local.ps1`

Perintah:

```powershell
tar -czf build.tar.gz `
artisan `
app `
bootstrap `
config `
database `
public `
resources `
routes `
vendor `
composer.json `
composer.lock

(Get-FileHash build.tar.gz -Algorithm SHA256).Hash | Out-File -Encoding ascii build.tar.gz.sha256

.\deploy-local.ps1
```

---

# Step 11 — Verifikasi deploy di server

## Cek struktur deploy

```bash
ls -l ~/deploy/apps/thechoosentalks
ls -l ~/deploy/apps/thechoosentalks/releases
```

Yang diharapkan:
- ada `releases/<timestamp>`
- ada `current -> releases/<timestamp>`

## Cek artisan release aktif

```bash
cd ~/deploy/apps/thechoosentalks/current
php artisan --version
```

## Cek app key

```bash
php artisan tinker --execute="echo config('app.key');"
```

## Cek database

```bash
php artisan tinker --execute="try { DB::connection()->getPdo(); echo 'DB_OK'; } catch (Throwable $e) { echo $e->getMessage(); }"
```

## Cek website

```bash
curl -I https://thechoosentalks.org
```

---

# Step 12 — Pola kerja harian yang direkomendasikan

Setiap kali mau deploy:

## 1. Sinkronkan kode
```powershell
git pull origin main
```

## 2. Build ulang
```powershell
composer install --no-dev --prefer-dist --optimize-autoloader
npm ci
npm run build
```

## 3. Buat artifact
```powershell
tar -czf build.tar.gz `
artisan `
app `
bootstrap `
config `
database `
public `
resources `
routes `
vendor `
composer.json `
composer.lock

(Get-FileHash build.tar.gz -Algorithm SHA256).Hash | Out-File -Encoding ascii build.tar.gz.sha256
```

## 4. Jalankan deploy
```powershell
.\deploy-local.ps1
```

---

# Step 13 — Checklist siap production

Checklist minimum sebelum menganggap pipeline ini stabil:

- [ ] SSH key login tanpa password sudah bekerja
- [ ] `shared/.env` sudah ada dan benar
- [ ] `shared/storage/...` sudah ada
- [ ] `build.tar.gz` dibuat dengan whitelist only
- [ ] `build.tar.gz.sha256` cocok dengan hash lokal
- [ ] `deploy.sh` mendukung `ARTIFACT_PATH` dan `ARTIFACT_SHA256`
- [ ] artifact berisi:
  - [ ] `artisan`
  - [ ] `vendor/autoload.php`
  - [ ] `public/build/manifest.json`
- [ ] `current` terswitch ke release baru setelah deploy
- [ ] website lolos healthcheck

---

# Troubleshooting cepat

## 1. `Vite manifest not found`
Penyebab:
- `npm run build` belum dijalankan
- `public/build/manifest.json` tidak ikut ke artifact

Solusi:
- jalankan `npm run build`
- pastikan `public` ikut ke whitelist artifact

## 2. `Artifact checksum mismatch`
Penyebab:
- `build.tar.gz` berubah setelah checksum dibuat
- upload ke server tidak lengkap / terputus

Solusi:
- hapus artifact lokal dan server
- buat ulang artifact
- buat ulang checksum
- upload ulang

## 3. `Could not open input file: artisan`
Penyebab:
- menjalankan `php artisan` dari folder yang salah

Solusi:
- masuk ke release aktif:
```bash
cd ~/deploy/apps/thechoosentalks/current
```

## 4. `Missing shared env`
Penyebab:
- `/shared/.env` belum ada

Solusi:
- buat file:
```bash
~/deploy/apps/thechoosentalks/shared/.env
```

## 5. `invalid format` untuk private key
Penyebab:
- private key rusak

Solusi:
- generate key baru
- pasang public key baru ke server
- uji lagi dengan `ssh -i`

## 6. `invalid option` / remote command aneh
Penyebab:
- quoting PowerShell ke SSH rusak

Solusi:
- gunakan pendekatan `Invoke-RemoteCommand` + `bash -s`

## 7. `kex_exchange_identification` / connection reset
Penyebab:
- koneksi SSH hosting kadang reset

Solusi:
- ulang lagi
- kurangi jumlah koneksi beruntun
- kalau sering, nanti bisa dioptimalkan menjadi satu koneksi `scp` + satu koneksi `ssh`

---

# Penutup

Model **CI lokal manual + deploy server** ini cocok untuk kondisi Anda karena:

- build Laravel + Vite dilakukan di laptop, bukan di GitHub Free runner
- server cPanel hanya menerima artifact yang sudah jadi
- proses lebih ringan, lebih murah, dan lebih mudah dikontrol

Kalau pipeline ini sudah stabil, peningkatan berikutnya yang paling masuk akal adalah:
1. membuat `deploy-local.ps1` lebih tahan terhadap koneksi SSH yang reset,
2. mengecilkan artifact lebih jauh,
3. atau mengubah menjadi **incremental deploy** agar upload tidak selalu mengirim `vendor` penuh.
