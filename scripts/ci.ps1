#!/usr/bin/env pwsh
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$php = 'C:\\Users\\Yesi Jiliana\\AppData\\Local\\Programs\\Local\\resources\\extraResources\\lightning-services\\php-8.2.27+1\\bin\\win64\\php.exe'

if (-not (Test-Path $php)) {
  Write-Error "PHP binary not found at: $php. Adjust scripts/ci.ps1 for your environment."
}

$env:PHPRC = (Resolve-Path "./php.ini").Path

Write-Host "==> Clearing cached bootstrap files" -ForegroundColor Cyan
& $php artisan optimize:clear

Write-Host "==> Cache readiness check (route/config cache)" -ForegroundColor Cyan
& $php artisan config:cache
& $php artisan route:cache
& $php artisan optimize:clear

Write-Host "==> Typecheck + build" -ForegroundColor Cyan
npm run build

Write-Host "==> Running test suite" -ForegroundColor Cyan
& $php artisan test
