# Ops Triage Agent Runbook

Tanggal acuan: 2026-04-20

## Tujuan

Memberikan triage otomatis saat workflow DevOps gagal agar respon insiden lebih cepat dan konsisten.

## Workflow

- `.github/workflows/ops-triage-assistant.yml`

Trigger otomatis saat `workflow_run` completed untuk:
- DevSecOps E2E Gate
- Staging Deploy
- CodeQL Analysis
- Production Deploy (Guarded)

Hanya aktif jika conclusion bukan `success`/`skipped`.

## Output

1. Artifact triage markdown:
   - `ops-triage-summary-<run_id>`
2. Issue GitHub otomatis berisi ringkasan triage + next action.

## Isi triage summary

- metadata run (workflow, branch, sha, URL)
- daftar failed jobs + hint remediation
- langkah rekomendasi prioritas perbaikan

## Guardrail

- Workflow triage tidak punya step deploy.
- Scope terbatas ke read actions + create issue.

## Operasional

- Jika issue triage noise terlalu tinggi, ubah policy pada workflow:
  - create issue hanya untuk `main`
  - atau hanya untuk workflow tertentu.
