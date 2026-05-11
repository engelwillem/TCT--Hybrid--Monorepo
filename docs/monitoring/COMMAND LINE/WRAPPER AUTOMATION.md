Wrapper otomatis sudah dibuat.

File utama:
- [drill8-controlled.ps1](/e:/thechoosentalksnext/scripts/drill8-controlled.ps1)

Kemampuan script:
- one-command execution untuk Drill 8 end-to-end,
- auto raw log: `drill8-controlled-<timestamp>.log`,
- auto summary report: `drill8-controlled-summary-<timestamp>.md`,
- verdict PASS/FAIL berdasarkan acceptance criteria (termasuk expected-fail check `Unknown column 'legacy_title'` setelah rollback image).

Lokasi output log+summary:
- `docs/monitoring/DevSecOps Report/staging-drill`

Report pengerjaan sudah dibuat:
- [devsecops-task-report-2026-04-21-drill8-wrapper-script.md](/e:/thechoosentalksnext/docs/monitoring/DevSecOps%20Report/devsecops-task-report-2026-04-21-drill8-wrapper-script.md)

Validasi:
- syntax check script: `SYNTAX_OK`.

Perintah pakai:
```powershell
pwsh -NoProfile -File scripts/drill8-controlled.ps1
```