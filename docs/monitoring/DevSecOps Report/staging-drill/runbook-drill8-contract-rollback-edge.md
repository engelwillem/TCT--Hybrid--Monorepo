# Runbook Permanen - Drill 8 Contract Rollback Edge Case

## Tujuan
Menguji dan membuktikan bahwa rollback image saja tidak cukup saat terjadi perubahan schema yang contract-breaking, lalu memastikan recovery compatibility bisa dijalankan aman.

## Frekuensi
- Minimum: 1x per sprint.
- Wajib dijalankan sebelum release yang membawa migration contract.

## Scope dan Safety Guardrails
- Jalankan hanya di staging.
- Gunakan tabel isolasi khusus drill: `drill8_contract_edge`.
- Dilarang memakai tabel domain produk (`members`, `posts`, dll.) untuk drill ini.

## Prasyarat
1. Service staging healthy (`backend`, `frontend`, `mariadb`, `prometheus`, `alertmanager`).
2. Rollback snapshot image tersedia:
   - `thechoosentalksnext-backend:staging-prev`
   - `thechoosentalksnext-frontend:staging-prev`
3. Env deploy:
   - `BACKEND_ENV_FILE=backend-api/.env.docker`
   - `FRONTEND_ENV_FILE=.env.docker`

## Template SQL
- Contract-break: `sql-template-drill8-contract-break.sql`
- Recovery: `sql-template-drill8-recovery.sql`

## Prosedur Eksekusi Standar
1. Siapkan tabel isolasi dan data awal.
2. Jalankan old-contract probe sebelum contract change (harus PASS).
3. Terapkan contract-breaking SQL (drop kolom legacy).
4. Jalankan rollback image (`scripts/rollback-staging.ps1`).
5. Jalankan old-contract probe setelah rollback (harus FAIL dengan unknown column).
6. Terapkan SQL recovery untuk restore compatibility.
7. Jalankan old-contract probe pasca recovery (harus PASS).
8. Simpan seluruh output ke log file drill baru.

## Command Template (PowerShell)
```powershell
Set-Location 'E:\thechoosentalksnext'
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$log = "docs/monitoring/DevSecOps Report/staging-drill/drill8-controlled-$stamp.log"
$contractSql = "docs/monitoring/DevSecOps Report/staging-drill/sql-template-drill8-contract-break.sql"
$recoverySql = "docs/monitoring/DevSecOps Report/staging-drill/sql-template-drill8-recovery.sql"

# 1) Setup isolated table + seed
Get-Content -LiteralPath $contractSql -Raw | docker exec -i tct-mariadb mariadb -uroot -proot thechoosentalks *>&1 | Tee-Object -FilePath $log -Append

# 2) Pre-check old contract (expect PASS)
docker exec tct-mariadb mariadb -uroot -proot thechoosentalks -N -e "SELECT legacy_title FROM drill8_contract_edge LIMIT 1;" *>&1 | Tee-Object -FilePath $log -Append

# 3) Apply contract break
docker exec tct-mariadb mariadb -uroot -proot thechoosentalks -e "ALTER TABLE drill8_contract_edge DROP COLUMN legacy_title;" *>&1 | Tee-Object -FilePath $log -Append

# 4) Rollback image
$env:BACKEND_ENV_FILE='backend-api/.env.docker'
$env:FRONTEND_ENV_FILE='.env.docker'
pwsh -NoProfile -File 'scripts/rollback-staging.ps1' -HealthTimeoutSec 900 -HealthInitialDelaySec 30 -MinHealthyConsecutive 2 -MaxUnhealthyConsecutive 3 *>&1 | Tee-Object -FilePath $log -Append

# 5) Post-rollback old contract probe (expect FAIL)
docker exec tct-mariadb mariadb -uroot -proot thechoosentalks -N -e "SELECT legacy_title FROM drill8_contract_edge LIMIT 1;" *>&1 | Tee-Object -FilePath $log -Append

# 6) Recovery compatibility
Get-Content -LiteralPath $recoverySql -Raw | docker exec -i tct-mariadb mariadb -uroot -proot thechoosentalks *>&1 | Tee-Object -FilePath $log -Append

# 7) Post-recovery old contract probe (expect PASS)
docker exec tct-mariadb mariadb -uroot -proot thechoosentalks -N -e "SELECT legacy_title FROM drill8_contract_edge LIMIT 1;" *>&1 | Tee-Object -FilePath $log -Append
```

## Acceptance Criteria
1. **Pre-check PASS**: query old contract (`legacy_title`) sukses sebelum contract-break.
2. **Contract-break efektif**: query old contract gagal setelah kolom legacy di-drop.
3. **Rollback image tidak revert schema**: setelah rollback image, query old contract tetap gagal dengan error `Unknown column`.
4. **Recovery berhasil**: setelah recovery SQL, query old contract kembali sukses.
5. **Service readiness aman**: post-rollback smoke check PASS.
6. **Evidence lengkap**: log drill tersimpan di folder `staging-drill` dan direferensikan di report.

## PASS/FAIL Rubric
- PASS: seluruh acceptance criteria 1-6 terpenuhi.
- PARTIAL: edge case ter-reproduce tetapi recovery tidak lengkap atau evidence tidak lengkap.
- FAIL: edge case tidak ter-reproduce atau rollback/recovery merusak kesehatan staging.

## Format Report Hasil Drill
Minimal memuat:
1. tanggal dan scope
2. aktivitas yang dikerjakan
3. file yang diubah
4. hasil/status
5. catatan follow-up
