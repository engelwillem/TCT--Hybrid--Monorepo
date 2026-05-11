# Staging Drill Execution Report (2026-04-21)

## Baseline Evidence
- Commit SHA: `7775758e506b1af2169cfa970fd0a4922522c48e`
- Docker services baseline: `docker compose ps` healthy for backend/frontend/mariadb/prometheus/alertmanager.
- Smoke baseline: PASS (`final-smoke.log`).
- Observability baseline: PASS (`staging-observability-baseline.md`, `final-observability.log`).
- Migration status baseline/final: captured (`final-migrate-status.log`).

---

## Drill 1
**Drill ID:** 1 - Expand Happy Path  
**Tanggal:** 2026-04-21  
**Operator:** Codex  
**Commit SHA:** `7775758e506b1af2169cfa970fd0a4922522c48e`  
**Workflow Input:** `schema_strategy=expand`, `run_backfill=false`, `auto_rollback=true`  
**Expected Result:** migrate/deploy/smoke/observability success.  
**Actual Result:** migrate expand sukses (`Nothing to migrate`), deploy pertama timeout di health frontend karena build startup lama, rollback otomatis terpicu. Setelah recovery endpoint kembali 200.  
**Artifacts:** `drill1-migrate-expand.log`, `drill1-deploy-expand.log`  
**Verdict:** PARTIAL  
**Notes / tindakan lanjut:** perlu tuning health timing/build strategy agar false-fail berkurang.

## Drill 2
**Drill ID:** 2 - Backfill Happy Path  
**Tanggal:** 2026-04-21  
**Operator:** Codex  
**Commit SHA:** `7775758e506b1af2169cfa970fd0a4922522c48e`  
**Workflow Input:** `schema_strategy=none`, `run_backfill=true`, `backfill_command=php artisan app:repair-missing-share-og`, `auto_rollback=true`  
**Expected Result:** backfill sukses dan rerun aman.  
**Actual Result:** run #1b sukses, run #2 sukses, hasil backfill idempotent (`No ready share assets with missing OG image.`), smoke PASS.  
**Artifacts:** `drill2-run1b-migrate.log`, `drill2-run1b-deploy.log`, `drill2-run2-migrate.log`, `drill2-run2-deploy.log`  
**Verdict:** PASS  
**Notes / tindakan lanjut:** backfill command rerunnable terverifikasi.

## Drill 3
**Drill ID:** 3 - Partial Failure Backfill  
**Tanggal:** 2026-04-21  
**Operator:** Codex  
**Commit SHA:** `7775758e506b1af2169cfa970fd0a4922522c48e`  
**Workflow Input:** `schema_strategy=none`, `run_backfill=true`, `backfill_command=php artisan app:repair-missing-share-og; echo forced_failure_marker; exit 1`, `auto_rollback=true`  
**Expected Result:** gagal di migrate stage, deploy tidak lanjut.  
**Actual Result:** failure berhasil terjadi di migrate stage setelah patch exit-code enforcement. Recovery rerun normal sukses dan deploy kembali hijau.  
**Artifacts:** `drill3-fail-migrate.log`, `drill3-recovery-migrate.log`, `drill3-recovery-deploy.log`  
**Verdict:** PASS  
**Notes / tindakan lanjut:** bug critical ditemukan & diperbaiki: migrate script sebelumnya tidak memfailkan non-zero exit command.

## Drill 4
**Drill ID:** 4 - Observability Failure Blocking  
**Tanggal:** 2026-04-21  
**Operator:** Codex  
**Commit SHA:** `7775758e506b1af2169cfa970fd0a4922522c48e`  
**Workflow Input:** deploy dengan `PrometheusUrl=http://127.0.0.1:59999`  
**Expected Result:** observability gate fail, deploy fail/tertahan, rollback jalan.  
**Actual Result:** sesuai ekspektasi: observability fail, deploy throw, rollback otomatis jalan, post-rollback smoke PASS.  
**Artifacts:** `drill4-observability-block.log`  
**Verdict:** PASS  
**Notes / tindakan lanjut:** bug critical ditemukan & diperbaiki: deploy/rollback script sebelumnya tidak memfailkan non-zero exit smoke/observability.

## Drill 5
**Drill ID:** 5 - Contract Guardrail Blocking  
**Tanggal:** 2026-04-21  
**Operator:** Codex  
**Commit SHA:** `7775758e506b1af2169cfa970fd0a4922522c48e`  
**Workflow Input:** `schema_strategy=contract`, `ALLOW_CONTRACT_MIGRATIONS=false`  
**Expected Result:** migrate fail cepat, deploy tidak lanjut.  
**Actual Result:** sesuai ekspektasi: fail cepat dengan pesan guardrail.  
**Artifacts:** `drill5-contract-guardrail.log`  
**Verdict:** PASS  
**Notes / tindakan lanjut:** guardrail contract bekerja.

## Drill 6
**Drill ID:** 6 - Contract Happy Path  
**Tanggal:** 2026-04-21  
**Operator:** Codex  
**Commit SHA:** `7775758e506b1af2169cfa970fd0a4922522c48e`  
**Workflow Input:** `schema_strategy=contract`, `ALLOW_CONTRACT_MIGRATIONS=true`, `run_backfill=false`  
**Expected Result:** migrate/deploy/smoke/observability sukses.  
**Actual Result:** migrate contract sukses (`Nothing to migrate`), deploy/smoke sukses, namun observability beberapa kali fail karena probe/alert transient saat restart sehingga rollback terpicu. Setelah stabil, observability kembali PASS secara standalone.  
**Artifacts:** `drill6-contract-migrate.log`, `drill6-contract-deploy.log`, `drill6-contract-deploy-rerun.log`, `drill6-contract-deploy-rerun2.log`, `drill6-observability-check-after-fail.md`  
**Verdict:** PARTIAL  
**Notes / tindakan lanjut:** perlu tuning gate (window/stabilization) agar tidak over-sensitive pada restart transien.

## Drill 7
**Drill ID:** 7 - Failed Deploy After Expand + Rollback  
**Tanggal:** 2026-04-21  
**Operator:** Codex  
**Commit SHA:** `7775758e506b1af2169cfa970fd0a4922522c48e`  
**Workflow Input:** simulated failed deploy via observability blocking with `auto_rollback=true`  
**Expected Result:** deploy fail, rollback otomatis, app pulih.  
**Actual Result:** rollback otomatis berulang kali berhasil memulihkan service; post-rollback smoke PASS konsisten.  
**Artifacts:** `drill4-observability-block.log`, `drill6-contract-deploy*.log`  
**Verdict:** PASS  
**Notes / tindakan lanjut:** skenario gagal deploy + rollback tervalidasi, meski trigger failure berasal dari gate observability.

## Drill 8
**Drill ID:** 8 - Contract Rollback Edge Case  
**Tanggal:** 2026-04-21  
**Operator:** Codex  
**Commit SHA:** `7775758e506b1af2169cfa970fd0a4922522c48e`  
**Workflow Input:** belum dieksekusi (butuh schema-contract yang benar-benar breaking + app incompatibility scenario)  
**Expected Result:** reproduksi edge case rollback-image tidak cukup.  
**Actual Result:** belum dieksekusi pada sesi ini.  
**Artifacts:** -  
**Verdict:** PARTIAL  
**Notes / tindakan lanjut:** perlu drill terkontrol dengan migration contract yang benar-benar menghapus dependency schema lama.

---

## Fixes Applied During Drill
1. `scripts/smoke-staging.ps1`
- Fix `Count` null/single-object issue:
  - `$failed = @($results | Where-Object { -not $_.ok })`

2. `scripts/migrate-staging.ps1` dan `scripts/migrate-production.ps1`
- Enforce non-zero backend task exit:
  - throw jika `$LASTEXITCODE -ne 0`

3. `scripts/deploy-staging.ps1` dan `scripts/deploy-production.ps1`
- Enforce fail-fast jika smoke / observability gagal (`$LASTEXITCODE` check)
- Enforce rollback script failure propagation

4. `scripts/rollback-staging.ps1` dan `scripts/rollback-production.ps1`
- Enforce fail-fast jika post-rollback smoke gagal

---

## Final State
- Final smoke: PASS (`final-smoke.log`)
- Final observability: PASS (`final-observability.log`)
- Final migrate status: all expected migrations remain `Ran` (`final-migrate-status.log`)

## Exit Criteria Snapshot
- Drill 1: PARTIAL
- Drill 2: PASS
- Drill 3: PASS
- Drill 4: PASS
- Drill 5: PASS
- Drill 6: PARTIAL
- Drill 7: PASS
- Drill 8: PARTIAL

Rekomendasi lanjut sebelum production contract pertama:
- Selesaikan Drill 8 terkontrol.
- Tuning observability deploy gate untuk mengurangi false block saat restart transien.
- Tambah artifact migrate metadata + docker logs otomatis di workflow stage migrate.
