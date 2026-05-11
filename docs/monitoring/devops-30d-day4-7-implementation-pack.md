# Day 4-7 Implementation Pack (DevOps 30 Hari)

Tanggal eksekusi: 2026-04-20
Scope: hardening gate security bertahap + automation release notes dari CI

## Outcome

1. Security gate tahap 1 diaktifkan sebagai blocking (`CRITICAL`).
2. Gate agregat `Release Gate Status` diperluas untuk quality + security.
3. Dependency audit tetap advisory sementara remediation debt berlangsung.
4. Release notes preview otomatis dibuat pada push `main` sebagai artifact CI.

## Perubahan yang diterapkan

### Workflow

File: `.github/workflows/devsecops-e2e.yml`

- `secrets-scan (Gitleaks)` diubah menjadi blocking.
- `trivy-fs-scan`:
  - severity dari `HIGH,CRITICAL` menjadi `CRITICAL`.
  - status diubah menjadi blocking.
- `container-scan (Trivy image)` diubah menjadi blocking (`CRITICAL`).
- `gate-status (Release Gate Status)` sekarang merangkum:
  - frontend quality
  - backend quality
  - secrets scan
  - trivy fs scan
  - container scan
- Added job baru: `release-notes-preview`
  - trigger pada push `main`
  - menghasilkan `release-notes-preview.md`
  - upload artifact `release-notes-preview-<run_id>`

### Dokumen policy

- `docs/monitoring/devsecops-e2e-baseline.md`
  - policy blocking/advisory diperbarui.
- `docs/monitoring/github-branch-protection-checklist.md`
  - catatan required checks diselaraskan dengan blocking tahap 1.

## Kebijakan gate saat ini

### Blocking
- Frontend quality gate
- Backend quality gate
- Gitleaks
- Trivy FS severity CRITICAL
- Trivy container severity CRITICAL
- Release Gate Status

### Advisory (sementara)
- Dependency audit (`npm audit` + `composer audit`)
- Unit test frontend (pada workflow ini)

## Cara pakai release notes otomatis

1. Merge PR ke `main`.
2. Buka run `DevSecOps E2E Gate`.
3. Download artifact `release-notes-preview-<run_id>`.
4. Gunakan file markdown sebagai draft release note/changelog.

## Next follow-up (hari 8-14)

1. Deploy staging otomatis setelah `Release Gate Status` hijau.
2. Post-deploy smoke test wajib.
3. Rollback script satu perintah + runbook insiden.
