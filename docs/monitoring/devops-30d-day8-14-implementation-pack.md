# Day 8-14 Implementation Pack (DevOps 30 Hari)

Tanggal eksekusi: 2026-04-20
Scope: staging auto deploy, smoke wajib, rollback satu perintah, runbook insiden

## Outcome

1. Workflow deploy staging otomatis sudah ditambahkan.
2. Smoke test pasca deploy dijadikan mandatory pada alur deploy.
3. Rollback satu perintah tersedia (`pwsh ./scripts/rollback-staging.ps1`).
4. Runbook insiden staging tersedia untuk triage cepat.

## Perubahan yang diterapkan

### Workflow baru

File: `.github/workflows/staging-deploy.yml`

- Trigger otomatis: `workflow_run` dari `DevSecOps E2E Gate` saat sukses di `main`.
- Trigger manual: `workflow_dispatch` dengan input `auto_rollback` (`true/false`).
- Runner target: `self-hosted, staging`.
- Deploy script dijalankan via PowerShell.

### Script operasional

- `scripts/deploy-staging.ps1`
  - Snapshot image rollback (`staging-prev`).
  - Build + recreate service backend/frontend.
  - Wait health container.
  - Run smoke staging wajib.
  - Opsional auto rollback jika gagal.

- `scripts/smoke-staging.ps1`
  - Verifikasi endpoint wajib:
    - `/api/today/readiness`
    - `/api/v1/community/posts`

- `scripts/rollback-staging.ps1`
  - Restore image snapshot `staging-prev`.
  - Recreate service backend/frontend.
  - Validasi health + smoke pasca rollback.

### Dokumentasi

- `docs/monitoring/staging-incident-runbook.md`
- Update `docs/monitoring/devsecops-e2e-baseline.md`

## Prasyarat infrastruktur

1. GitHub self-hosted runner dengan label: `self-hosted`, `staging`.
2. Runner host memiliki Docker + Docker Compose.
3. Runner host memiliki akses repo + environment staging.

## Cara operasi manual cepat

Deploy staging:

```bash
pwsh ./scripts/deploy-staging.ps1 -AutoRollbackOnFailure
```

Rollback staging:

```bash
pwsh ./scripts/rollback-staging.ps1
```

## Next follow-up (hari 15-21)

1. Tambah alert routing ke channel tim (Slack/Telegram/Email).
2. Finalisasi SLO + alert noise tuning.
3. Dashboard operasional diperkaya untuk release visibility.
