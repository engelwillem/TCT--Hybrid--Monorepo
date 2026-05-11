# Alert Routing Runbook

Tanggal acuan: 2026-04-20

## Komponen

- Prometheus rule file: `docker/observability/prometheus/alerts.yml`
- Alertmanager config: `docker/observability/alertmanager/alertmanager.yml`
- Compose service: `alertmanager` pada `docker-compose.yml`

## Routing policy

- Severity `critical`:
  - webhook critical receiver
  - email receiver
- Severity `warning`:
  - webhook warning receiver

## Channel configuration

Edit destination langsung di file:

- `docker/observability/alertmanager/alertmanager.yml`

Field yang wajib disesuaikan untuk production:

- `webhook_configs.url` (warning dan critical)
- `email_configs.to`
- `email_configs.from`
- `email_configs.smarthost`

## Startup / apply config

```bash
docker compose up -d alertmanager prometheus grafana blackbox-exporter
```

## Validation

1. Cek Alertmanager health:

```bash
curl -i http://localhost:9093/-/healthy
```

2. Cek rules loaded:

```bash
curl -s http://localhost:9090/api/v1/rules
```

3. Cek alert status:

```bash
curl -s http://localhost:9090/api/v1/alerts
```

## Escalation matrix

- Warning: observability owner review <= 30 menit
- Critical: on-call response <= 10 menit

