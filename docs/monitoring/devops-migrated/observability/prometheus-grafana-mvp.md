# Prometheus + Grafana MVP

This repo now includes an MVP observability stack for local Docker:

- Prometheus
- Grafana
- Blackbox Exporter

## What this MVP covers

- Prometheus + Grafana boot with Docker Compose
- Basic frontend/backend health + latency scraping via HTTP probe
- Initial operational dashboard:
  - HTTP status
  - p95 latency
  - error rate
  - container up/down

## Services and ports

- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3001`
  - default user: `admin`
  - default password: `admin`
- Blackbox Exporter: `http://localhost:9115`

## Start

```bash
docker compose up -d prometheus grafana blackbox-exporter
```

If backend/frontend are not running yet, start full stack:

```bash
docker compose up -d
```

## Scrape targets

Configured in `docker/observability/prometheus/prometheus.yml`:

- HTTP probes (`blackbox-http`)
  - `http://frontend:9002/api/today/readiness`
  - `http://backend:8000/api/v1/community/posts`
- TCP probes (`blackbox-tcp`)
  - `frontend:9002`
  - `backend:8000`
  - `mariadb:3306`
  - `redis:6379`
  - `mailpit:1025`

## Dashboard provisioning

Grafana provisions:

- datasource: `Prometheus`
- dashboard: `TCT Operational MVP`

Files:

- `docker/observability/grafana/provisioning/datasources/prometheus.yml`
- `docker/observability/grafana/provisioning/dashboards/dashboards.yml`
- `docker/observability/grafana/dashboards/tct-operational-mvp.json`

## Optional credential override

Set these environment variables before starting Grafana:

- `GRAFANA_ADMIN_USER`
- `GRAFANA_ADMIN_PASSWORD`
