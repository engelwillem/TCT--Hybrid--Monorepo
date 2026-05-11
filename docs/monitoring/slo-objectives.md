# SLO Objectives (Day 15-21)

Tanggal acuan: 2026-04-20

## Service SLO

1. Frontend readiness (`/api/today/readiness`)
   - Availability SLO: 99.5% / 30 hari
   - Warning threshold: < 99.5% (30m burn check)
   - Critical threshold: endpoint down >= 2 menit

2. Backend community API (`/api/v1/community/posts`)
   - Availability SLO: 99.5% / 30 hari
   - Warning threshold: < 99.5% (30m burn check)
   - Critical threshold: endpoint down >= 2 menit

## Performance Objective

- p95 probe latency target: <= 2.0 detik (window 10m)
- Alert warning jika p95 > 2.0 detik selama 10 menit

## Error Budget Policy

- Error budget bulanan: 0.5%
- Warning saat burn 30m > 0.5%
- Escalation saat burn 30m > 1.0%

## SLI Queries

- Availability 30d:
  - `avg_over_time(probe_success{job="blackbox-http"}[30d]) * 100`
- Error budget burn 30d:
  - `(1 - avg_over_time(probe_success{job="blackbox-http"}[30d])) * 100`
- p95 latency 30m:
  - `quantile_over_time(0.95, probe_duration_seconds{job="blackbox-http"}[30m])`

## Reporting

Generate laporan mingguan:

```bash
pwsh ./scripts/slo-weekly-report.ps1 -OutFile "docs/monitoring/DevSecOps Report/slo-weekly-<tanggal>.md"
```
