Selesai, MVP Prometheus + Grafana sudah saya implementasikan di repo Anda.

**Yang sudah ditambahkan**
1. Service observability di Compose  
- [docker-compose.yml](E:\thechoosentalksnext\docker-compose.yml)  
  - `blackbox-exporter` (`:9115`)  
  - `prometheus` (`:9090`)  
  - `grafana` (`:3001` -> container `3000`)

2. Konfigurasi scrape health/latency dasar  
- [prometheus.yml](E:\thechoosentalksnext\docker\observability\prometheus\prometheus.yml)  
  - HTTP probe:
    - `frontend /api/today/readiness`
    - `backend /api/v1/community/posts`
  - TCP probe (container up/down):
    - frontend, backend, mariadb, redis, mailpit

3. Blackbox module config  
- [blackbox.yml](E:\thechoosentalksnext\docker\observability\blackbox\blackbox.yml)

4. Grafana provisioning otomatis  
- Datasource: [prometheus.yml](E:\thechoosentalksnext\docker\observability\grafana\provisioning\datasources\prometheus.yml)  
- Dashboard provider: [dashboards.yml](E:\thechoosentalksnext\docker\observability\grafana\provisioning\dashboards\dashboards.yml)

5. Dashboard operasional awal  
- [tct-operational-mvp.json](E:\thechoosentalksnext\docker\observability\grafana\dashboards\tct-operational-mvp.json)  
  - HTTP status  
  - p95 latency  
  - error rate  
  - containers up/down

6. Dokumentasi runbook observability  
- [prometheus-grafana-mvp.md](E:\thechoosentalksnext\docs\observability\prometheus-grafana-mvp.md)

**Validasi**
- `docker compose config` berhasil (syntax/config valid).
- Saat mencoba `docker compose up -d blackbox-exporter prometheus grafana`, pull image gagal karena DNS/network Docker host (`lookup registry-1.docker.io: no such host`), jadi runtime startup belum bisa diverifikasi penuh dari environment ini.

**Setelah network Docker normal**, jalankan:
```bash
docker compose up -d blackbox-exporter prometheus grafana
```
Lalu akses:
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3001` (admin/admin default)