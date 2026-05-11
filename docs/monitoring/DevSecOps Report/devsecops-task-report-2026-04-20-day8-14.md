# DevSecOps Task Report - 2026-04-20 (Day 8-14)

Task scope:
- Lanjutan blueprint DevOps 30 hari (Hari 8-14).
- Implementasi staging auto-deploy, smoke test wajib, rollback satu perintah.

## Aktivitas yang dikerjakan

1. Menambahkan workflow deployment staging otomatis.
2. Menambahkan script deploy staging dengan health check dan smoke test wajib.
3. Menambahkan script rollback staging satu perintah.
4. Menyusun runbook insiden staging.
5. Sinkronisasi baseline dokumentasi DevSecOps.

## File yang dibuat/diubah

- `.github/workflows/staging-deploy.yml` (baru)
- `scripts/deploy-staging.ps1` (baru)
- `scripts/smoke-staging.ps1` (baru)
- `scripts/rollback-staging.ps1` (baru)
- `docs/monitoring/staging-incident-runbook.md` (baru)
- `docs/monitoring/devops-30d-day8-14-implementation-pack.md` (baru)
- `docs/monitoring/devsecops-e2e-baseline.md` (update)

## Status hasil

- Auto deploy staging: **siap** (menunggu runner label `self-hosted, staging` aktif).
- Smoke wajib pasca deploy: **aktif** dalam script deploy.
- Rollback satu perintah: **aktif**.
- Runbook insiden: **tersedia**.

## Catatan operasional

- Workflow staging menggunakan runner `self-hosted, staging`.
- Jika runner belum tersedia, workflow tidak bisa dieksekusi sampai runner online.

## Perintah cepat

Deploy + auto rollback:

```bash
pwsh ./scripts/deploy-staging.ps1 -AutoRollbackOnFailure
```

Rollback manual:

```bash
pwsh ./scripts/rollback-staging.ps1
```
