**Blueprint DevOps 30 Hari (Repo `E:\thechoosentalksnext`)**

**Target akhir (20 April 2026 -> 20 Mei 2026):**
- CI/CD stabil, security gate aktif, deploy terkontrol, observability + alerting jalan, operasional terdokumentasi.

1. **Hari 1-3: Baseline & freeze standar**
- Tetapkan CI utama: **GitHub Actions** sebagai source of truth, Jenkins sebagai fallback/manual.
- Bekukan gate wajib: typecheck, unit test, contract test, build, backend readiness, scan security.
- Rapikan dokumen operasi inti di monitoring.
- File acuan: [devsecops-e2e-baseline.md](E:\thechoosentalksnext\docs\monitoring\devsecops-e2e-baseline.md), [devsecops-e2e.yml](E:\thechoosentalksnext\.github\workflows\devsecops-e2e.yml), [Jenkinsfile](E:\thechoosentalksnext\Jenkinsfile).

2. **Hari 4-7: Hardening CI gate**
- Ubah scan advisory bertahap jadi blocking untuk severity jelas (`CRITICAL` dulu, lalu `HIGH`).
- Tambahkan branch protection: PR wajib lulus gate sebelum merge.
- Tambahkan artifact retention policy dan naming standar.
- File kerja: [codeql-analysis.yml](E:\thechoosentalksnext\.github\workflows\codeql-analysis.yml), [main-website-zip.whitelist.json](E:\thechoosentalksnext\scripts\main-website-zip.whitelist.json).

3. **Hari 8-14: CD staging + rollback**
- Buat workflow deploy staging otomatis saat merge ke `main`.
- Tambahkan post-deploy smoke test (`/api/today/readiness`, `/api/v1/community/posts`).
- Siapkan rollback script 1-command dan runbook insiden.
- File target: [docker-compose.yml](E:\thechoosentalksnext\docker-compose.yml), [smoke-production.ps1](E:\thechoosentalksnext\scripts\smoke-production.ps1), [README.md](E:\thechoosentalksnext\README.md).

4. **Hari 15-21: Observability production grade**
- Finalkan dashboard ops dan alert rules: latency p95, error rate, service down.
- Integrasikan alert ke channel tim (Slack/Telegram/Email).
- Tambahkan SLO awal: availability dan latency untuk frontend/backend.
- File acuan: [prometheus.yml](E:\thechoosentalksnext\docker\observability\prometheus\prometheus.yml), [tct-operational-mvp.json](E:\thechoosentalksnext\docker\observability\grafana\dashboards\tct-operational-mvp.json), [prometheus-grafana-mvp.md](E:\thechoosentalksnext\docs\observability\prometheus-grafana-mvp.md).

5. **Hari 22-26: Repo hygiene & release discipline**
- Terapkan policy “root clean” + enforce lint dokumen release.
- Kunci whitelist artifact deploy agar hanya runtime files.
- Jadwalkan weekly dependency update + audit.
- File kunci: [.gitignore](E:\thechoosentalksnext\.gitignore), [.gitattributes](E:\thechoosentalksnext\.gitattributes), [create_main_website_zip.py](E:\thechoosentalksnext\scripts\create_main_website_zip.py).

6. **Hari 27-30: Agent layer (ops copilot)**
- Tambahkan agent hanya untuk triage: ringkas gagal CI, klasifikasi root cause, draft fix checklist.
- Guardrail: agent tidak boleh auto-deploy ke production tanpa approval manusia.
- Output agent wajib berbasis log + evidence, bukan asumsi.

**KPI keberhasilan 30 hari**
- CI success rate `>= 90%`.
- MTTR pipeline failure turun `>= 40%`.
- False positive alert `< 20%`.
- Deployment failure rate `< 10%`.
- Rollback siap pakai `<= 10 menit`.

**Rekomendasi struktur eksekusi tim**
- 1 DevOps owner.
- 1 backend owner untuk readiness/smoke.
- 1 frontend owner untuk contract/build.
- 1 reviewer security gate mingguan.

Kalau Anda mau, saya lanjutkan langsung dengan **Hari 1-3 implementation pack** (PR-ready): update workflow, branch protection checklist, dan runbook operasional minimal.
---

Implementasi Hari 1-3 sudah saya lanjutkan dan diterapkan langsung di repo.

Perubahan utama:
- Menambahkan gate agregat `Release Gate Status` di workflow CI utama.
  - [.github/workflows/devsecops-e2e.yml](E:\thechoosentalksnext\.github\workflows\devsecops-e2e.yml)
- Memperjelas policy “GitHub Actions = source of truth, Jenkins = fallback/manual”.
  - [devsecops-e2e-baseline.md](E:\thechoosentalksnext\docs\monitoring\devsecops-e2e-baseline.md)
- Menambahkan checklist branch protection siap pakai.
  - [github-branch-protection-checklist.md](E:\thechoosentalksnext\docs\monitoring\github-branch-protection-checklist.md)
- Menambahkan dokumen implementation pack Day 1-3.
  - [devops-30d-day1-3-implementation-pack.md](E:\thechoosentalksnext\docs\monitoring\devops-30d-day1-3-implementation-pack.md)
- Memperbaiki exception `.gitignore` agar `docs/monitoring` bisa tetap ter-track.
  - [.gitignore](E:\thechoosentalksnext\.gitignore)

Catatan:
- Branch protection tidak bisa diset hanya dari file repo; harus Anda aktifkan di GitHub Settings sesuai checklist yang saya buat.

Next step yang saya sarankan (langsung lanjut Hari 4-7):
1. Saya ubah scan security dari advisory ke blocking bertahap (CRITICAL dulu).
2. Saya siapkan workflow deploy staging + post-deploy smoke + rollback script.
---

Laporan sudah dibuat dulu, lalu Next Step Hari 4-7 sudah saya implementasikan.

**Laporan**
- [devsecops-task-report-2026-04-20-day4-7.md](E:\thechoosentalksnext\docs\monitoring\DevSecOps%20Report\devsecops-task-report-2026-04-20-day4-7.md)
- [REPORTING_POLICY.md](E:\thechoosentalksnext\docs\monitoring\DevSecOps%20Report\REPORTING_POLICY.md)  
  (mulai sekarang semua task DevOps dicatat di folder ini)

**Implementasi Hari 4-7**
- Workflow hardening:
  - [devsecops-e2e.yml](E:\thechoosentalksnext\.github\workflows\devsecops-e2e.yml)
  - `gitleaks`, `trivy fs (CRITICAL)`, `trivy image (CRITICAL)` sekarang blocking.
  - `Release Gate Status` sekarang mengevaluasi quality + security gate.
- Release note otomatis dari CI:
  - Job `Release Notes Preview` ditambahkan (push `main`), output artifact `release-notes-preview-<run_id>`.
- Dokumen policy diperbarui:
  - [devsecops-e2e-baseline.md](E:\thechoosentalksnext\docs\monitoring\devsecops-e2e-baseline.md)
  - [github-branch-protection-checklist.md](E:\thechoosentalksnext\docs\monitoring\github-branch-protection-checklist.md)
  - [devops-30d-day4-7-implementation-pack.md](E:\thechoosentalksnext\docs\monitoring\devops-30d-day4-7-implementation-pack.md)

Jika Anda setuju, saya lanjutkan Hari 8-14: staging auto-deploy + smoke test wajib + rollback runbook/script.
---

Hari 8-14 sudah saya lanjutkan dan **sudah diimplementasi**.

**Report (sesuai instruksi)**
- [devsecops-task-report-2026-04-20-day8-14.md](E:\thechoosentalksnext\docs\monitoring\DevSecOps%20Report\devsecops-task-report-2026-04-20-day8-14.md)

**Implementasi teknis**
- Workflow staging auto-deploy:
  - [staging-deploy.yml](E:\thechoosentalksnext\.github\workflows\staging-deploy.yml)
- Script deploy staging (dengan health check + smoke wajib):
  - [deploy-staging.ps1](E:\thechoosentalksnext\scripts\deploy-staging.ps1)
- Script smoke staging:
  - [smoke-staging.ps1](E:\thechoosentalksnext\scripts\smoke-staging.ps1)
- Script rollback satu perintah:
  - [rollback-staging.ps1](E:\thechoosentalksnext\scripts\rollback-staging.ps1)
- Runbook insiden staging:
  - [staging-incident-runbook.md](E:\thechoosentalksnext\docs\monitoring\staging-incident-runbook.md)
- Implementation pack Hari 8-14:
  - [devops-30d-day8-14-implementation-pack.md](E:\thechoosentalksnext\docs\monitoring\devops-30d-day8-14-implementation-pack.md)
- Baseline DevSecOps diperbarui:
  - [devsecops-e2e-baseline.md](E:\thechoosentalksnext\docs\monitoring\devsecops-e2e-baseline.md)

**Verifikasi yang sudah dijalankan**
- `scripts/smoke-staging.ps1` sukses:
  - `http://127.0.0.1:9002/api/today/readiness` -> `200`
  - `http://127.0.0.1:8000/api/v1/community/posts` -> `200`

**Catatan operasional penting**
- Workflow staging memakai runner label `self-hosted, staging`.  
  Pastikan runner ini aktif agar auto-deploy berjalan dari GitHub Actions.
---

Hari 15-21 sudah saya eksekusi dan report sudah dibuat di lokasi yang Anda tetapkan.

**Report**
- [devsecops-task-report-2026-04-20-day15-21.md](E:\thechoosentalksnext\docs\monitoring\DevSecOps%20Report\devsecops-task-report-2026-04-20-day15-21.md)
- [slo-weekly-2026-04-20.md](E:\thechoosentalksnext\docs\monitoring\DevSecOps%20Report\slo-weekly-2026-04-20.md)

**Implementasi Hari 15-21**
- Alert rules Prometheus (availability/latency/error-rate/SLO burn):
  - [alerts.yml](E:\thechoosentalksnext\docker\observability\prometheus\alerts.yml)
- Alertmanager routing config:
  - [alertmanager.yml](E:\thechoosentalksnext\docker\observability\alertmanager\alertmanager.yml)
- Wiring Prometheus -> Alertmanager:
  - [prometheus.yml](E:\thechoosentalksnext\docker\observability\prometheus\prometheus.yml)
- Service Alertmanager di Compose:
  - [docker-compose.yml](E:\thechoosentalksnext\docker-compose.yml)
- Dashboard visibility SLO + active alerts:
  - [tct-operational-mvp.json](E:\thechoosentalksnext\docker\observability\grafana\dashboards\tct-operational-mvp.json)
- Script report SLO mingguan:
  - [slo-weekly-report.ps1](E:\thechoosentalksnext\scripts\slo-weekly-report.ps1)
- Dokumen SLO + runbook:
  - [slo-objectives.md](E:\thechoosentalksnext\docs\monitoring\slo-objectives.md)
  - [alert-routing-runbook.md](E:\thechoosentalksnext\docs\monitoring\alert-routing-runbook.md)
  - [devops-30d-day15-21-implementation-pack.md](E:\thechoosentalksnext\docs\monitoring\devops-30d-day15-21-implementation-pack.md)
  - [devsecops-e2e-baseline.md](E:\thechoosentalksnext\docs\monitoring\devsecops-e2e-baseline.md)

**Validasi runtime**
- `docker compose config` valid.
- Alertmanager healthy di `http://localhost:9093/-/healthy` (`200`).
- Prometheus rules/alerts terbaca (`/api/v1/rules`, `/api/v1/alerts`).
- SLO report script sukses dijalankan dan output tersimpan di report folder.
---

Hari 22-26 sudah selesai dieksekusi.

**Report**
- [devsecops-task-report-2026-04-20-day22-26.md](E:\thechoosentalksnext\docs\monitoring\DevSecOps%20Report\devsecops-task-report-2026-04-20-day22-26.md)

**Implementasi utama**
- CI repo hygiene enforcement (blocking):
  - [ci-repo-hygiene.ps1](E:\thechoosentalksnext\scripts\ci-repo-hygiene.ps1)
- CI release artifact policy hardening (blocking):
  - [ci-validate-release-artifact.py](E:\thechoosentalksnext\scripts\ci-validate-release-artifact.py)
- Workflow DevSecOps diperbarui:
  - [devsecops-e2e.yml](E:\thechoosentalksnext\.github\workflows\devsecops-e2e.yml)
  - Added jobs: `repo-hygiene`, `artifact-policy`, `dependency-scan-advisory`, `dependency-scan-blocking`
  - `Release Gate Status` kini meng-cover hygiene + artifact + dependency blocking stage
- Baseline policy diperbarui:
  - [devsecops-e2e-baseline.md](E:\thechoosentalksnext\docs\monitoring\devsecops-e2e-baseline.md)
- Implementation pack Hari 22-26:
  - [devops-30d-day22-26-implementation-pack.md](E:\thechoosentalksnext\docs\monitoring\devops-30d-day22-26-implementation-pack.md)
- Checklist branch protection disinkronkan:
  - [github-branch-protection-checklist.md](E:\thechoosentalksnext\docs\monitoring\github-branch-protection-checklist.md)

**Validasi yang dijalankan**
- `scripts/ci-repo-hygiene.ps1` -> pass.
- `scripts/ci-validate-release-artifact.py` -> pass.
- ZIP policy check menghasilkan artifact valid (`website-main-20260420-232951.zip`).

Kalau Anda mau, saya lanjut **Hari 27-30** sekarang (agent-assisted ops triage + guardrail approval).

Hari 27-30 sudah saya lanjutkan dan selesai diimplementasi.

Report resmi:
- [devsecops-task-report-2026-04-20-day27-30.md](E:\thechoosentalksnext\docs\monitoring\DevSecOps%20Report\devsecops-task-report-2026-04-20-day27-30.md)

Implementasi utama:

1. Agent-assisted ops triage
- Workflow baru: [ops-triage-assistant.yml](E:\thechoosentalksnext\.github\workflows\ops-triage-assistant.yml)
- Trigger saat workflow gagal, generate triage artifact, dan create issue triage otomatis.

2. Guardrail approval production deploy
- Workflow baru: [production-deploy.yml](E:\thechoosentalksnext\.github\workflows\production-deploy.yml)
- Guardrail berlapis:
  - manual dispatch only
  - confirm phrase wajib `APPROVE_PRODUCTION_DEPLOY`
  - `source_sha` wajib valid dan ada di `main`
  - commit wajib punya `DevSecOps E2E Gate` sukses
  - environment `production` untuk human approval

3. Script production deploy/rollback
- [deploy-production.ps1](E:\thechoosentalksnext\scripts\deploy-production.ps1)
- [rollback-production.ps1](E:\thechoosentalksnext\scripts\rollback-production.ps1)

4. Dokumentasi runbook + pack
- [ops-triage-agent-runbook.md](E:\thechoosentalksnext\docs\monitoring\ops-triage-agent-runbook.md)
- [production-approval-guardrail.md](E:\thechoosentalksnext\docs\monitoring\production-approval-guardrail.md)
- [devops-30d-day27-30-implementation-pack.md](E:\thechoosentalksnext\docs\monitoring\devops-30d-day27-30-implementation-pack.md)
- baseline update: [devsecops-e2e-baseline.md](E:\thechoosentalksnext\docs\monitoring\devsecops-e2e-baseline.md)

Validasi cepat:
- Parse check script PowerShell sukses (`PS_SCRIPT_PARSE_OK`).

