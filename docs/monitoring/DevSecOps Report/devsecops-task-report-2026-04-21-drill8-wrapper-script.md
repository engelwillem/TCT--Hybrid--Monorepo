# DevSecOps Task Report - 2026-04-21 (Drill 8 Wrapper Script)

## 1) Tanggal dan Scope
- Tanggal: 2026-04-21
- Scope: Membuat wrapper otomatis `scripts/drill8-controlled.ps1` untuk eksekusi Drill 8 one-command + auto summary report.

## 2) Aktivitas yang Dikerjakan
- Menambahkan script baru `drill8-controlled.ps1` yang menjalankan langkah Drill 8 end-to-end:
  - setup isolated table via SQL template
  - pre-probe old contract (expected PASS)
  - contract-breaking change
  - rollback staging image
  - post-rollback probe (expected FAIL with unknown column)
  - recovery SQL
  - post-recovery probe (expected PASS)
- Menambahkan output otomatis:
  - raw log `drill8-controlled-<timestamp>.log`
  - summary markdown `drill8-controlled-summary-<timestamp>.md`
- Menambahkan verdict PASS/FAIL berbasis acceptance snapshot.

## 3) File yang Diubah
- `scripts/drill8-controlled.ps1`

## 4) Hasil / Status
- Status: **PASS**
- Script selesai dibuat dan lolos syntax validation (`SYNTAX_OK`).
- Siap dijalankan berkala sesuai runbook Drill 8.

## 5) Catatan Follow-up
- Jalankan perintah berikut untuk eksekusi:
  - `pwsh -NoProfile -File scripts/drill8-controlled.ps1`
- Opsi lanjut:
  - integrasi ke scheduler CI/staging drill job mingguan.

