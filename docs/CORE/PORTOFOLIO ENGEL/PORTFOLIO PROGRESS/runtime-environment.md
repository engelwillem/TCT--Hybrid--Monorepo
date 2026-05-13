# Runtime Environment (Step 3)

## Docker Architecture
Primary local stack is defined in `docker-compose.yml`:
- `frontend` (Next.js)
- `backend` (Laravel)
- `mariadb`
- `redis`
- `mailpit`
- optional observability services (`prometheus`, `grafana`, etc. when enabled by compose/runtime)

## Service Matrix
| Service | Runtime status | URL/Port (local) | Dependencies | Notes |
|---|---|---|---|---|
| Frontend (`tct-frontend`) | Runtime verified (intermittent bottlenecks) | `http://127.0.0.1:9002` | backend | Can hit compile/startup bottlenecks in some modes. |
| Backend (`tct-backend`) | Runtime verified | `http://127.0.0.1:8000` | mariadb, redis, mailpit | API direct login verified. |
| MariaDB | Runtime verified | `127.0.0.1:3307` | none | Persistent volume-backed. |
| Redis | Runtime verified | `127.0.0.1:6379` | none | Cache/queue support. |
| Mailpit | Runtime verified | `http://127.0.0.1:8025` | none | Dev mail sink. |
| Prometheus | Configured/partial runtime | `http://127.0.0.1:9090` | scrape targets | Verify per local session. |
| Grafana | Configured/partial runtime | `http://127.0.0.1:3001` | prometheus | Verify dashboards per session. |
| Jenkins | Configured only (portfolio context) | env-dependent | CI infra | No blanket runtime claim here. |
| GitHub Actions | Configured only | GitHub | repo workflows | Runtime depends on GitHub execution logs. |

## Known Runtime Issues and Workarounds

### 1) Frontend build timeout
- Symptom: local production build or startup build exceeds expected time.
- Impact: delays route/API proof checks.
- Workaround: use container recreation + dev runtime strategy when suitable for verification flow.

### 2) `.next` lock/cache corruption
- Symptom: stale module/chunk resolution errors.
- Impact: frontend pages return 500/timeout.
- Workaround: recreate frontend container and clear/rebuild related volumes/caches.

### 3) Docker networking instability in proxy path
- Symptom: frontend proxy returns unreachable while direct backend API works.
- Impact: false-negative auth/connectivity perception.
- Fix/strategy:
  - Prefer service-name networking: `LARAVEL_API_BASE_URL=http://backend:8000` inside frontend container env.
  - Keep host-only URLs for browser-facing public vars only where appropriate.

### 4) `LARAVEL_API_BASE_URL` misalignment
- Symptom: using loopback addresses in container context can target wrong host.
- Correct local Docker value: `http://backend:8000`.

## Current Practical Guidance
- For Docker container-to-container backend calls: use `http://backend:8000`.
- Preserve clear error codes:
  - `LARAVEL_API_UNREACHABLE`
  - `LARAVEL_API_TIMEOUT`
- Do not convert connectivity failures into credential errors or vice versa.

## Related Docs / Tests / Routes / Evidence
- Docs: [Architecture Proof](./architecture-proof.md), [Demo Guide](./demo-guide.md), [Portfolio Index](./README.md)
- Routes/config: `docker-compose.yml`, `src/lib/proxy-laravel.ts`, `src/lib/laravel-api.ts`
- Tests: [Runtime Proof Checklist](./runtime-proof-checklist.md)
- Evidence: [Evidence Map](./evidence-map.md)
