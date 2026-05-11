# DevSecOps Task Report - 2026-04-20 (Day 15-21)

Task scope:
- Eksekusi blueprint Hari 15-21.
- Menambahkan alert routing, SLO objective, dan peningkatan dashboard observability.

## Aktivitas yang dikerjakan

1. Menambahkan Alertmanager config dan wiring ke Prometheus.
2. Menambahkan Prometheus alert rules untuk availability, latency, error-rate, dan SLO burn.
3. Menambahkan service `alertmanager` di Docker Compose.
4. Menambah panel dashboard Grafana untuk SLO dan active alert visibility.
5. Menambahkan script report SLO mingguan dan menjalankannya.
6. Menyusun dokumen SLO + runbook alert routing.

## File yang dibuat/diubah

- `docker/observability/alertmanager/alertmanager.yml` (baru)
- `docker/observability/prometheus/alerts.yml` (baru)
- `docker/observability/prometheus/prometheus.yml` (update)
- `docker/observability/grafana/dashboards/tct-operational-mvp.json` (update)
- `docker-compose.yml` (update)
- `scripts/slo-weekly-report.ps1` (baru)
- `.env.docker.example` (no net change required)
- `docs/monitoring/slo-objectives.md` (baru)
- `docs/monitoring/alert-routing-runbook.md` (baru)
- `docs/monitoring/devops-30d-day15-21-implementation-pack.md` (baru)
- `docs/monitoring/devsecops-e2e-baseline.md` (update)
- `docs/monitoring/DevSecOps Report/slo-weekly-2026-04-20.md` (baru)

## Status hasil

- Alert routing stack: **siap** (perlu mengganti destination channel di file alertmanager config untuk routing aktual).
- Alert rules SLO/availability/latency: **siap**.
- Dashboard visibility release/SLO: **siap**.
- Weekly SLO report: **berhasil digenerate**.

## Catatan operasional

- Default webhook URL pada `alertmanager.yml` adalah placeholder, wajib diganti untuk channel produksi.
- Email smarthost default ke `mailpit:1025` (dev/local), bukan SMTP produksi.

## Bukti eksekusi

- `docker compose config` -> valid.
- `scripts/slo-weekly-report.ps1` -> sukses.

