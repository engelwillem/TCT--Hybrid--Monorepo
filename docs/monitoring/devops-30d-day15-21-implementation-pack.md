# Day 15-21 Implementation Pack (DevOps 30 Hari)

Tanggal eksekusi: 2026-04-20
Scope: observability production-grade, alert routing, SLO, release visibility dashboard

## Outcome

1. Alert routing stack ditambahkan dengan Alertmanager.
2. Prometheus alert rules untuk availability/latency/error-budget aktif di config.
3. Dashboard Grafana ditingkatkan untuk visibility SLO + active alerts.
4. SLO objective + runbook alert routing terdokumentasi.
5. Laporan SLO mingguan bisa dihasilkan otomatis via script.

## Perubahan yang diterapkan

### Observability config

- `docker/observability/prometheus/alerts.yml` (baru)
  - Alert availability: service/container down
  - Alert latency p95 tinggi
  - Alert error rate tinggi
  - Alert SLO burn warning

- `docker/observability/alertmanager/alertmanager.yml` (baru)
  - Routing severity `critical` -> webhook critical + email
  - Routing severity `warning` -> webhook warning

- `docker/observability/prometheus/prometheus.yml` (update)
  - load `rule_files`
  - alerting target ke `alertmanager:9093`

- `docker-compose.yml` (update)
  - tambah service `alertmanager`
  - mount config alertmanager routing channel
  - mount alert rules ke service `prometheus`

### SLO + reporting

- `docs/monitoring/slo-objectives.md` (baru)
- `docs/monitoring/alert-routing-runbook.md` (baru)
- `scripts/slo-weekly-report.ps1` (baru)
- `.env.docker.example` (no additional alert vars required)

### Dashboard

- `docker/observability/grafana/dashboards/tct-operational-mvp.json` (update)
  - panel SLO Availability (30m)
  - panel Error Budget Burn (30m)
  - panel Error Rate (30m)
  - panel Active Alerts (firing)

## Validasi yang dijalankan

1. `docker compose config` -> valid.
2. `scripts/slo-weekly-report.ps1` -> sukses generate report.
3. Output report disimpan ke:
   - `docs/monitoring/DevSecOps Report/slo-weekly-2026-04-20.md`

## Next follow-up (hari 22-26)

1. Repo hygiene enforcement via CI check.
2. Release artifact policy hardening.
3. Dependency advisory -> blocking bertahap setelah remediation.

