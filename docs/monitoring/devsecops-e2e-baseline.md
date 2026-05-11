# DevSecOps E2E Baseline

## Tujuan

Dokumen ini menetapkan baseline DevSecOps end-to-end untuk monorepo TheChosenTalks agar kualitas release tidak hanya bergantung pada build sukses.

## Workflow Utama

Workflow baru: `.github/workflows/devsecops-e2e.yml`

Policy CI utama:
- **Source of truth CI/CD: GitHub Actions**
- Jenkins diposisikan sebagai **fallback/manual runner** (bukan gate utama merge)

Trigger:
- Pull request ke `main`
- Push ke `main`
- Manual (`workflow_dispatch`)
- Jadwal mingguan (Senin 02:30 UTC / 09:30 WIB)

Workflow deploy staging lanjutan: `.github/workflows/staging-deploy.yml`

Trigger deploy staging:
- `workflow_run` setelah `DevSecOps E2E Gate` sukses di branch `main`
- Manual (`workflow_dispatch`) dengan opsi auto rollback

Gate yang dijalankan:
- Repo hygiene policy check: `scripts/ci-repo-hygiene.ps1`
- Frontend quality gate: `npm ci`, `typecheck`, `build`, `vitest`
- Backend quality gate: `composer validate`, `composer install`, `php -l`, `composer today:ready`
- Aggregated gate status: `Release Gate Status` (ringkasan gate blocking untuk branch protection)
- Secret scan: `gitleaks`
- Dependency scan advisory (PR): `npm audit` (production deps) + `composer audit`
- Dependency scan blocking stage (push `main` / manual / schedule): `npm audit` + `composer audit`
- Release artifact policy check: `scripts/ci-validate-release-artifact.py`
- SAST/misconfig/secret scan filesystem: `trivy fs`
- Container scan: build image frontend/backend lalu scan Trivy severity `CRITICAL`
- Release notes preview artifact otomatis pada push ke `main`

Catatan fase adopsi saat ini:
- Unit test frontend di gate ini bersifat advisory (non-blocking) sampai suite `src/ai/orchestration.resolvers.test.ts` distabilkan.
- Dependency audit pada PR tetap advisory; blocking diterapkan bertahap di jalur push `main`/manual/schedule.
- `gitleaks`, Trivy FS (`CRITICAL`), dan Trivy container (`CRITICAL`) sudah masuk jalur blocking via `Release Gate Status`.

## SAST Tambahan (CodeQL)

Workflow tambahan: `.github/workflows/codeql-analysis.yml`

Ruang lingkup:
- `javascript-typescript` (Next.js app, proxy routes, shared libs)

Trigger:
- Pull request ke `main`
- Push ke `main`
- Manual (`workflow_dispatch`)
- Jadwal mingguan (Senin 02:45 UTC / 09:45 WIB)

Tujuan:
- deteksi pattern vulnerability di source code yang tidak selalu tertangkap dependency/container scan
- memperkaya security signal di GitHub Security tab untuk triage terstruktur

Catatan operasional:
- Workflow punya precheck otomatis.
- Jika repository belum mengaktifkan GitHub Code Scanning, workflow akan `skip` dengan status sukses dan instruksi aktivasi.

## Policy Keputusan Gate

- Error quality gate inti (typecheck/build/backend readiness): merge **ditolak**
- Error pada `Release Gate Status`: merge **ditolak**
- Security scan blocking tahap 1: gitleaks + trivy fs/container severity `CRITICAL` (merge **ditolak** bila gagal)
- Dependency scan blocking bertahap: aktif di jalur `main`/manual/schedule, advisory di PR
- Security scan advisory sementara: unit test frontend

Jika tim perlu fase adopsi bertahap, severity Trivy FS bisa diturunkan sementara dari `HIGH,CRITICAL` menjadi `CRITICAL` saja. Perubahan ini harus dicatat di changelog operasional.

## Dependabot

File: `.github/dependabot.yml`

Update mingguan aktif untuk:
- npm root (`/`)
- composer backend (`/backend-api`)
- GitHub Actions (`/`)

Tujuan:
- kurangi age dependency
- percepat patch security
- jaga parity toolchain CI

## Operasional Lokal Sebelum PR

Jalankan minimum ini sebelum buat PR:

```bash
npm run typecheck
npm run build
npm run test:unit
composer --working-dir backend-api validate --strict
composer --working-dir backend-api today:ready
```

Untuk validasi Docker:

```bash
docker compose build frontend backend
```

## Triage Saat Gate Gagal

1. Gagal quality gate:
   - Perbaiki root cause di kode/test, jangan bypass gate.
2. Gagal dependency audit:
   - Prioritaskan upgrade patch/minor aman.
   - Jika belum ada fix upstream, dokumentasikan risk acceptance dengan expiry date.
3. Gagal secret scan:
   - Revoke credential dulu.
   - Hapus secret dari history jika perlu.
   - Rotasi env di semua environment.
4. Gagal container scan:
   - Upgrade base image atau paket OS di Dockerfile.
   - Ulangi scan sampai bersih dari `CRITICAL`.

## Staging Deploy + Rollback (Hari 8-14)

Script utama:
- `scripts/migrate-staging.ps1`
- `scripts/migrate-production.ps1`
- `scripts/deploy-staging.ps1`
- `scripts/smoke-staging.ps1`
- `scripts/rollback-staging.ps1`

Alur:
1. CI `DevSecOps E2E Gate` sukses di `main`.
2. Workflow deploy menjalankan **migration phase terpisah** (`none | expand | contract`) sebelum deploy.
3. Opsional backfill dijalankan setelah migration phase dengan command eksplisit.
4. Workflow `Staging Deploy` jalan otomatis di runner `self-hosted, staging`.
5. Deploy staging menjalankan smoke wajib:
   - `http://127.0.0.1:9002/api/today/readiness`
   - `http://127.0.0.1:8000/api/v1/community/posts`
6. Deploy menjalankan observability gate (`scripts/check-observability.ps1`) sebelum dinyatakan sukses.
7. Jika deploy/smoke/observability gagal dan auto rollback aktif, jalankan rollback satu perintah.

Guardrail schema strategy:
- `expand`: default aman untuk perubahan aditif.
- `contract`: hanya boleh berjalan jika `ALLOW_CONTRACT_MIGRATIONS=true`.
- production contract juga wajib confirm phrase: `APPROVE_CONTRACT_MIGRATION`.

Prinsip zero-downtime dan pemisahan tahap:
- Migrations tidak lagi digabung implicit di startup runtime.
- Runtime backend default `RUN_MIGRATIONS=false`.
- Deploy hanya menangani build + recreate service + health + smoke + observability.

Perintah rollback manual:

```bash
pwsh ./scripts/rollback-staging.ps1
```

## Observability Production Grade (Hari 15-21)

Komponen baru:
- Alert rules: `docker/observability/prometheus/alerts.yml`
- Alertmanager config: `docker/observability/alertmanager/alertmanager.yml`
- SLO objectives: `docs/monitoring/slo-objectives.md`
- Alert routing runbook: `docs/monitoring/alert-routing-runbook.md`
- SLO weekly report script: `scripts/slo-weekly-report.ps1`

Kebijakan alert:
- `critical`: endpoint/service down >= 2 menit, routed ke webhook critical + email
- `warning`: p95 latency tinggi, error rate tinggi, SLO burn warning

SLO awal:
- Availability target: `99.5%` per 30 hari untuk endpoint readiness frontend/backend
- p95 latency objective: `<= 2.0s` (window 10 menit)

Perintah generate laporan SLO:

```bash
pwsh ./scripts/slo-weekly-report.ps1 -OutFile "docs/monitoring/DevSecOps Report/slo-weekly-<tanggal>.md"
```

## Repo Hygiene + Artifact Hardening (Hari 22-26)

Komponen baru:
- Repo hygiene CI check: `scripts/ci-repo-hygiene.ps1`
- Release artifact policy CI check: `scripts/ci-validate-release-artifact.py`

Kebijakan:
- Perubahan file `docs` hanya diizinkan pada `docs/monitoring/**` dan `docs/README.md`
- Artifact/cache/tmp files dilarang masuk tracking Git
- ZIP website wajib lolos policy whitelist (required include/exclude + forbidden content check)

## Agent-Assisted Triage + Guardrail Approval (Hari 27-30)

Workflow baru:
- Ops triage: `.github/workflows/ops-triage-assistant.yml`
- Production guarded deploy: `.github/workflows/production-deploy.yml`

Prinsip:
- Agent triage hanya untuk ringkasan kegagalan + hint remediation (tidak melakukan deploy).
- Deploy production wajib approval manusia dan guardrail berlapis:
  - confirm phrase
  - SHA valid di `main`
  - SHA sudah lolos `DevSecOps E2E Gate`
  - approval environment `production`

## Catatan Arsitektur

- Baseline ini menjaga batas arsitektur Next.js proxy + Laravel API tetap konsisten.
- Guardrail `composer today:ready` tetap dipertahankan untuk domain ritual agar regressions produk inti tidak lolos ke release.
- Security gate ditempatkan di level monorepo agar frontend, backend, dan container dinilai sebagai satu sistem produk.
- CodeQL berjalan terpisah agar analisis SAST tidak memperlambat quality gate utama saat PR kecil.
