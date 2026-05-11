# Staging Incident Runbook

Tanggal acuan: 2026-04-20

## Scope

Runbook ini dipakai untuk insiden staging setelah deployment otomatis.

## Komponen utama

- Workflow: `.github/workflows/staging-deploy.yml`
- Deploy script: `scripts/deploy-staging.ps1`
- Smoke script: `scripts/smoke-staging.ps1`
- Rollback script: `scripts/rollback-staging.ps1`

## Trigger deploy

1. Otomatis: setelah workflow `DevSecOps E2E Gate` sukses di `main`.
2. Manual: `workflow_dispatch` pada workflow `Staging Deploy`.

## Prosedur triage cepat

1. Buka run workflow `Staging Deploy`.
2. Identifikasi step yang gagal:
   - build image
   - up/recreate container
   - health check container
   - smoke endpoint
3. Cek log container:

```bash
docker compose logs backend --tail=120
docker compose logs frontend --tail=120
```

4. Verifikasi health container:

```bash
docker inspect --format='{{json .State.Health}}' tct-backend
docker inspect --format='{{json .State.Health}}' tct-frontend
```

## Rollback satu perintah

```bash
pwsh ./scripts/rollback-staging.ps1
```

Script rollback akan:
1. Restore tag image snapshot `staging-prev`.
2. Recreate container backend/frontend.
3. Tunggu health check hijau.
4. Jalankan smoke test pasca rollback.

## Exit criteria insiden selesai

1. Endpoint smoke status `200`:
   - `http://127.0.0.1:9002/api/today/readiness`
   - `http://127.0.0.1:8000/api/v1/community/posts`
2. Container backend/frontend status `healthy`.
3. Penyebab insiden dicatat di report DevSecOps harian.
