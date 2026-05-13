# Runtime Proof Checklist — Step 3 Focus 2

> Scope: Runtime Proof Gate for AI & Automation Portfolio MVP. This checklist does **not** move to Step 4 and does **not** alter the main landing route `/`.

## 1. Main app proof

- [ ] `/` opens
- [ ] `/login` opens
- [ ] `/profile` opens after login
- [ ] `/community` opens
- [ ] `/versehub` opens
- [ ] `/renungan` opens

## 2. Step 3 proof

- [ ] Login works locally
- [ ] Admin account works locally
- [ ] Notification preferences save/reload
- [ ] WhatsApp OTP request works
- [ ] Wrong OTP fails
- [ ] Correct OTP verifies
- [ ] Verified status persists
- [ ] Real Fonnte send status: not tested in this Focus 2 runtime gate

## 3. AIOS proof

- [x] `/aios` opens as an isolated route in source (`src/app/aios/page.tsx`)
- [x] Backend route exists (`php backend-api/artisan route:list --path=onboarding` shows 10 onboarding routes)
- [x] Lead can be submitted (`POST /api/v1/onboarding/leads`, covered by `AiosOnboardingRuntimeProofTest`)
- [x] Run/status can be viewed by safe correlation ID (`GET /api/v1/onboarding/runs/{correlationId}/status`, covered by test)
- [x] KPI/dashboard can load (`GET /api/v1/onboarding/dashboard/summary`, `kpi-detail`, `recent-runs`)
- [x] Simulated/mock steps clearly labeled (email event records `status_label=simulated/mock`, `delivery=not_sent`; `/aios` labels email as simulated/mock)
- [x] Adapter-ready CRM/calendar clearly labeled (generic webhook adapter-ready; missing URLs skip safely)

## 4. Build/test proof

- [ ] Backend full tests
- [ ] Step 3 feature tests
- [ ] Phone normalizer tests
- [x] AIOS/onboarding tests (`AiosOnboardingRuntimeProofTest`: 7 passed, 39 assertions)

## 5. Main landing safety

- [x] `/` unchanged in this Focus 2 change set
- [x] No AIOS route moved into `/`
- [x] No portfolio route hijacks `/`
- [x] Production landing remains independent

## Ops / Observability / CI Proof Links

| Service | Purpose | Config evidence file | Local URL if available | Auth requirement if known | Runtime status | Notes |
|---|---|---|---|---|---|---|
| Prometheus | Metrics scraping and alert rule evaluation | `docker/observability/prometheus/prometheus.yml` | Not confirmed from running service config | Unknown | configured only — runtime not verified | Prometheus config exists and targets frontend/backend plus TCP probes, but no Prometheus service is defined in the current `docker-compose.yml`. |
| Grafana | Metrics dashboard UI | `docker/observability/grafana/provisioning/datasources/prometheus.yml`, `docker/observability/grafana/provisioning/dashboards/dashboards.yml` | Not confirmed from running service config | Unknown | configured only — runtime not verified | Grafana provisioning exists and points to Prometheus, but no Grafana service/port is defined in current `docker-compose.yml`. |
| Jenkins | CI pipeline execution | `Jenkinsfile` | Not confirmed from config | Unknown | configured only — runtime not verified | Jenkins pipeline file exists, but no Jenkins local service/port is defined in `docker-compose.yml`. |
| Mailpit | Local/dev mail capture UI and SMTP sink | `docker-compose.yml` | `http://localhost:8025` | None shown in config | configured only — runtime not verified | SMTP exposed on `localhost:1025`; web UI exposed on `localhost:8025`. |
| Laravel backend | Backend API runtime | `docker-compose.yml`, `README.md` | `http://localhost:8000` | App auth varies by route | configured only — runtime not verified | Docker maps `8000:8000`; README also documents local `php artisan serve` on port 8000. |
| Next.js frontend | Main frontend runtime | `docker-compose.yml`, `README.md` | `http://localhost:9002` | Public route auth varies by page | configured only — runtime not verified | Docker maps `9002:9002`; README documents local app at `http://localhost:9002`. |
| Redis | Cache/queue/session backing service | `docker-compose.yml` | Not applicable (TCP only, exposed on `localhost:6379`) | None shown in config | configured only — runtime not verified | Redis is exposed by port mapping, but no HTTP UI URL is configured. |
| Database (MariaDB) | Primary relational database | `docker-compose.yml` | Not applicable (TCP only, exposed on `localhost:3307`) | Credentials defined in compose | configured only — runtime not verified | MariaDB is exposed by port mapping `3307:3306`, not an HTTP URL. |
| GitHub Actions workflows | Hosted CI/CD, deploy, code scanning, and ops automation | `.github/workflows/devsecops-e2e.yml`, `.github/workflows/backend-deploy-production.yml`, `.github/workflows/backend-validation.yml`, `.github/workflows/codeql-analysis.yml`, `.github/workflows/ops-triage-assistant.yml` | Not local; GitHub Actions repo UI | GitHub repository access | configured only — runtime not verified | Multiple workflow files exist for quality gates, deploys, smoke checks, and ops triage. |

## Known limitations before Step 4

- AIOS is Runtime verified MVP, not production-ready.
- Onboarding email is simulated/mock only; no real delivery is claimed.
- CRM/calendar are generic webhook adapter-ready only; no HubSpot/Salesforce/Google Calendar/Calendly provider integration is claimed.
- `/aios` shows “Demo fallback — backend not connected” if the Laravel backend/proxies are unavailable or live datasets are empty.
- Real Fonnte OTP sending was not tested in this Focus 2 gate.


---

## Related Docs / Tests / Routes / Evidence
- Docs: [Portfolio Index](./README.md), [Evidence Integrity Rules](./evidence-integrity-rules.md), [Portfolio Evidence Gate](./Portfolio%20Evidence%20Gate.md)
- Tests: [Proof Checklist](./proof-checklist.md)
- Routes/Evidence: [Evidence Map](./evidence-map.md), [Architecture Proof](./architecture-proof.md)
