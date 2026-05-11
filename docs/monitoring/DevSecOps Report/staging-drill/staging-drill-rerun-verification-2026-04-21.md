# Staging Drill Rerun Verification (2026-04-21)

## Scope
- Verifikasi dampak tuning health gate + observability stabilization.
- Eksekusi ulang Drill 1 dan Drill 6.
- Desain + eksekusi terkontrol Drill 8 (contract-breaking rollback edge case).

## Environment
- Repo: `E:\thechoosentalksnext`
- Staging env files:
  - `BACKEND_ENV_FILE=backend-api/.env.docker`
  - `FRONTEND_ENV_FILE=.env.docker`
- Container baseline: backend/frontend/mariadb/prometheus/alertmanager healthy.

---

## Drill 1 Rerun - Expand Happy Path
- Workflow:
  - `migrate-staging.ps1 -SchemaStrategy expand`
  - `deploy-staging.ps1 -AutoRollbackOnFailure -HealthTimeoutSec 900 -ObservabilityStabilizationSec 60 -ObservabilityRequireConsecutivePasses 2 -CriticalAlertMinActiveSec 60`
- Result:
  - Migration: PASS (`Nothing to migrate`)
  - Health gate: PASS dengan warm-up + consecutive healthy
  - Smoke: PASS
  - Observability gate: PASS (2/2 sample pass)
- Verdict: **PASS**
- Artifacts:
  - `drill1-rerun-migrate-2026-04-21-rerun.log`
  - `drill1-rerun-deploy-2026-04-21-rerun.log`

## Drill 6 Rerun - Contract Happy Path
- Workflow:
  - `ALLOW_CONTRACT_MIGRATIONS=true`
  - `migrate-staging.ps1 -SchemaStrategy contract`
  - `deploy-staging.ps1 -AutoRollbackOnFailure -HealthTimeoutSec 900 -ObservabilityStabilizationSec 60 -ObservabilityRequireConsecutivePasses 2 -CriticalAlertMinActiveSec 60`
- Result:
  - Migration: PASS (`Nothing to migrate`)
  - Health gate: PASS dengan warm-up + consecutive healthy
  - Smoke: PASS
  - Observability gate: PASS (2/2 sample pass)
- Verdict: **PASS**
- Artifacts:
  - `drill6-rerun-migrate-2026-04-21-rerun.log`
  - `drill6-rerun-deploy-2026-04-21-rerun.log`

## Drill 8 Controlled - Contract Rollback Edge Case

### Design
Skenario dibuat terkontrol dan isolated menggunakan tabel khusus `drill8_contract_edge` agar tidak mengganggu schema domain produksi:
1. Buat tabel dengan kolom legacy (`legacy_title`) + kolom baru (`canonical_title`).
2. Validasi query kontrak lama (`SELECT legacy_title`) berhasil.
3. Terapkan contract-breaking change: drop kolom `legacy_title`.
4. Jalankan rollback image (`rollback-staging.ps1`) untuk membuktikan rollback image tidak mengubah schema.
5. Validasi query kontrak lama gagal (`Unknown column`) setelah rollback image.
6. Recovery: restore kolom `legacy_title` + backfill dari `canonical_title`.
7. Validasi query kontrak lama kembali berhasil.

### Execution Result
- Old-contract probe sebelum contract change: PASS (`legacy-ok`)
- Rollback image script: PASS (container healthy + smoke PASS)
- Old-contract probe setelah rollback image: FAIL expected (`Unknown column 'legacy_title'`)
- Recovery compatibility: PASS
- Old-contract probe pasca recovery: PASS (`legacy-ok`)

### Verdict
**PASS (Edge case reproduced and recovered safely).**

### Key Finding
Rollback image **tidak cukup** untuk memulihkan kompatibilitas ketika schema contract-breaking sudah diterapkan. Diperlukan strategi migrasi kompatibilitas (dual-read/grace/backward-compatible phase) sebelum contract cutover.

### Artifacts
- `drill8-controlled-2026-04-21-rerun.log`

---

## Final Verification Status
- Drill 1 rerun: **PASS** (sebelumnya PARTIAL)
- Drill 6 rerun: **PASS** (sebelumnya PARTIAL)
- Drill 8 controlled: **PASS** (edge-case now proven with controlled recovery)

## Recommended Follow-up
1. Kodifikasikan prosedur Drill 8 terkontrol ke runbook (template SQL + recovery steps).
2. Tambahkan migration policy: contract phase hanya boleh jalan bila fallback compatibility disiapkan.
3. Pertimbangkan deploy artifact machine-readable (`deploy-result.json`) untuk auditability pipeline.

## Generated At
- 2026-04-21 13:31:42
