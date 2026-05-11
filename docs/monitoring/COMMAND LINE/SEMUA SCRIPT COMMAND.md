Analisa folder `E:\thechoosentalksnext\scripts` sudah dibuat, lalu berikut daftar **perintah pakai** untuk semua script executable.

## PowerShell (.ps1)

### `check-observability.ps1`
Perintah pakai:
```powershell
pwsh -NoProfile -File scripts/check-observability.ps1
pwsh -NoProfile -File scripts/check-observability.ps1 -PrometheusUrl "http://127.0.0.1:9090" -AlertmanagerUrl "http://127.0.0.1:9093" -OutFile "docs/monitoring/DevSecOps Report/staging-observability-latest.md"
```

### `ci-repo-hygiene.ps1`
Perintah pakai:
```powershell
pwsh -NoProfile -File scripts/ci-repo-hygiene.ps1
pwsh -NoProfile -File scripts/ci-repo-hygiene.ps1 -Range "origin/main...HEAD"
```

### `ci.ps1`
Perintah pakai:
```powershell
pwsh -NoProfile -File scripts/ci.ps1
```

### `db-sync-prod-to-local.ps1`
Perintah pakai:
```powershell
pwsh -NoProfile -File scripts/db-sync-prod-to-local.ps1
pwsh -NoProfile -File scripts/db-sync-prod-to-local.ps1 -KeepRemoteDump
```

### `db-sync-prod-to-local-resilient.ps1`
Perintah pakai:
```powershell
pwsh -NoProfile -File scripts/db-sync-prod-to-local-resilient.ps1
pwsh -NoProfile -File scripts/db-sync-prod-to-local-resilient.ps1 -MaxAttempts 10 -InitialBackoffSeconds 8
```

### `db-sync-prod-to-local-bg.ps1`
Perintah pakai:
```powershell
pwsh -NoProfile -File scripts/db-sync-prod-to-local-bg.ps1
pwsh -NoProfile -File scripts/db-sync-prod-to-local-bg.ps1 -PollIntervalSeconds 20 -PollTimeoutMinutes 120
```

### `deploy-staging.ps1`
Perintah pakai:
```powershell
$env:BACKEND_ENV_FILE='backend-api/.env.docker'
$env:FRONTEND_ENV_FILE='.env.docker'
pwsh -NoProfile -File scripts/deploy-staging.ps1 -AutoRollbackOnFailure
```

### `deploy-production.ps1`
Perintah pakai:
```powershell
$env:BACKEND_ENV_FILE='backend-api/.env.production'
$env:FRONTEND_ENV_FILE='.env.production'
pwsh -NoProfile -File scripts/deploy-production.ps1 -BaseUrl "https://www.thechoosentalks.org" -AutoRollbackOnFailure
```

### `drill8-controlled.ps1`
Perintah pakai:
```powershell
pwsh -NoProfile -File scripts/drill8-controlled.ps1
```

### `migrate-staging.ps1`
Perintah pakai:
```powershell
$env:BACKEND_ENV_FILE='backend-api/.env.docker'
$env:FRONTEND_ENV_FILE='.env.docker'
pwsh -NoProfile -File scripts/migrate-staging.ps1 -SchemaStrategy expand
pwsh -NoProfile -File scripts/migrate-staging.ps1 -SchemaStrategy contract
```

### `migrate-production.ps1`
Perintah pakai:
```powershell
$env:BACKEND_ENV_FILE='backend-api/.env.production'
$env:FRONTEND_ENV_FILE='.env.production'
pwsh -NoProfile -File scripts/migrate-production.ps1 -SchemaStrategy expand
$env:ALLOW_CONTRACT_MIGRATIONS='true'
pwsh -NoProfile -File scripts/migrate-production.ps1 -SchemaStrategy contract -ContractConfirmPhrase "APPROVE_CONTRACT_MIGRATION"
```

### `rollback-staging.ps1`
Perintah pakai:
```powershell
pwsh -NoProfile -File scripts/rollback-staging.ps1
```

### `rollback-production.ps1`
Perintah pakai:
```powershell
pwsh -NoProfile -File scripts/rollback-production.ps1 -BaseUrl "https://www.thechoosentalks.org"
```

### `slo-weekly-report.ps1`
Perintah pakai:
```powershell
pwsh -NoProfile -File scripts/slo-weekly-report.ps1
pwsh -NoProfile -File scripts/slo-weekly-report.ps1 -PrometheusBaseUrl "http://127.0.0.1:9090" -OutFile "docs/monitoring/DevSecOps Report/slo-weekly-$(Get-Date -Format yyyy-MM-dd).md"
```

### `smoke-production.ps1`
Perintah pakai:
```powershell
pwsh -NoProfile -File scripts/smoke-production.ps1 -BaseUrl "https://www.thechoosentalks.org"
pwsh -NoProfile -File scripts/smoke-production.ps1 -BaseUrl "https://www.thechoosentalks.org" -OutFile "docs/monitoring/DevSecOps Report/production-smoke-latest.md"
```

### `smoke-share-assets-prepare.ps1`
Perintah pakai:
```powershell
pwsh -NoProfile -File scripts/smoke-share-assets-prepare.ps1
pwsh -NoProfile -File scripts/smoke-share-assets-prepare.ps1 -BaseUrl "http://127.0.0.1:9002" -BurstRequests 20
```

### `smoke-staging.ps1`
Perintah pakai:
```powershell
pwsh -NoProfile -File scripts/smoke-staging.ps1
pwsh -NoProfile -File scripts/smoke-staging.ps1 -FrontendBaseUrl "http://127.0.0.1:9002" -BackendBaseUrl "http://127.0.0.1:8000" -OutFile "docs/monitoring/DevSecOps Report/staging-smoke-latest.md"
```

## Node.js (.mjs)

### `build-strict-today.mjs`
Perintah pakai:
```powershell
node scripts/build-strict-today.mjs
```

### `mirror-encoded-next-chunks.mjs`
Perintah pakai:
```powershell
node scripts/mirror-encoded-next-chunks.mjs
```

### `og-size-check.mjs`
Perintah pakai:
```powershell
node scripts/og-size-check.mjs
node scripts/og-size-check.mjs "https://www.thechoosentalks.org"
```

### `verify-ai-sharing.mjs`
Perintah pakai:
```powershell
node scripts/verify-ai-sharing.mjs
$env:API_URL='http://127.0.0.1:8000'; node scripts/verify-ai-sharing.mjs
```

## Python (.py)

### `create_main_website_zip.py`
Perintah pakai:
```powershell
python scripts/create_main_website_zip.py
python scripts/create_main_website_zip.py --clean --reveal
```

### `ci-validate-release-artifact.py`
Perintah pakai:
```powershell
python scripts/ci-validate-release-artifact.py
```

## PHP (.php)

### `renungan-latency-sample.php`
Perintah pakai:
```powershell
php scripts/renungan-latency-sample.php
php scripts/renungan-latency-sample.php --url=http://127.0.0.1:8000/api/v1/renungan/personalize --samples=40 --warmup=5 --json-out=docs/monitoring/DevSecOps Report/renungan-latency-sample.json
```

## File Non-Executable (Konfigurasi)

### `main-website-zip.whitelist.json`
Ini file konfigurasi untuk `create_main_website_zip.py`, bukan script yang dieksekusi langsung.

## Script Automation Lain (Di Luar Folder `scripts`)

### `backend-api/deploy-local.ps1`
Perintah pakai:
```powershell
Set-Location backend-api
pwsh -NoProfile -File .\deploy-local.ps1
```

### `backend-api/deploy-local.js`
Perintah pakai:
```powershell
Set-Location backend-api
node .\deploy-local.js
```

### `backend-api/deploy.sh`
Perintah pakai:
```powershell
# Jalankan di server Linux/cPanel terminal
bash ~/deploy/apps/thechoosentalks/deploy.sh

# Atau dengan env override
RUN_MIGRATIONS=true BASE_DIR=/home/thechoosentalks/deploy/apps/thechoosentalks bash ~/deploy/apps/thechoosentalks/deploy.sh
```

### `backend-api/healthcheck.sh`
Perintah pakai:
```powershell
# Jalankan di server Linux
bash backend-api/healthcheck.sh --release /home/thechoosentalks/deploy/apps/thechoosentalks/current --base-url https://www.thechoosentalks.org

# Local check only (tanpa HTTP check)
bash backend-api/healthcheck.sh --release /home/thechoosentalks/deploy/apps/thechoosentalks/current --skip-http
```

### `backend-api/rollback.sh`
Perintah pakai:
```powershell
# Rollback ke release sebelumnya (auto-pilih)
bash backend-api/rollback.sh

# Rollback ke release tertentu
bash backend-api/rollback.sh --release /home/thechoosentalks/deploy/apps/thechoosentalks/releases/20260421123000
```

### `docker/backend/start.sh`
Perintah pakai:
```powershell
# Biasanya dijalankan oleh Docker container backend
docker exec tct-backend sh -lc "/workspace/docker/backend/start.sh"
```

### `docker/frontend/start.sh`
Perintah pakai:
```powershell
# Biasanya dijalankan oleh Docker container frontend
docker exec tct-frontend sh -lc "/workspace/docker/frontend/start.sh"
```

### `docker/backend/wait-for-db.php`
Perintah pakai:
```powershell
php docker/backend/wait-for-db.php
```
