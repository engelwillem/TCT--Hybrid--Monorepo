# Day 22-26 Implementation Pack (DevOps 30 Hari)

Tanggal eksekusi: 2026-04-20
Scope: repo hygiene enforcement, hardening release artifact policy, dependency scan blocking bertahap

## Outcome

1. Repo hygiene enforcement ditambahkan ke CI sebagai gate blocking.
2. Release artifact policy check ditambahkan ke CI sebagai gate blocking.
3. Dependency scan dipisah menjadi dua mode:
   - advisory pada PR
   - blocking bertahap pada push `main`/manual/schedule
4. `Release Gate Status` diperluas agar merangkum hygiene + artifact + dependency blocking stage.

## Perubahan yang diterapkan

### Workflow CI

File: `.github/workflows/devsecops-e2e.yml`

- Added `repo-hygiene` job (blocking)
  - menjalankan `scripts/ci-repo-hygiene.ps1`
- Added `artifact-policy` job (blocking)
  - menjalankan `scripts/ci-validate-release-artifact.py`
- Dependency scan dipecah:
  - `dependency-scan-advisory` (PR, non-blocking)
  - `dependency-scan-blocking` (push `main`/manual/schedule, blocking)
- `gate-status` diperluas untuk mengevaluasi:
  - repo hygiene
  - frontend/backend quality
  - secrets scan
  - artifact policy
  - trivy fs/container
  - dependency scan blocking stage

### Script baru

- `scripts/ci-repo-hygiene.ps1`
  - menolak artifact/cache/tmp/docs non-monitoring yang ikut tracking pada perubahan.
- `scripts/ci-validate-release-artifact.py`
  - validasi whitelist release
  - generate ZIP release
  - validasi isi ZIP (required entries, forbidden patterns, size/files threshold)

### Dokumentasi

- `docs/monitoring/devsecops-e2e-baseline.md` (update kebijakan day 22-26)

## Policy dependency scan (tahap transisi)

- PR: advisory, tidak memblok merge
- Main/manual/schedule: blocking stage untuk menjaga kualitas release branch

## Next follow-up (hari 27-30)

1. Agent-assisted ops triage (CI failure summarization + remediation hints).
2. Guardrail agent agar tidak melakukan deploy tanpa approval manusia.
3. Integrasi hasil agent ke runbook insiden.
