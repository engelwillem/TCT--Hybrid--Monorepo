# QA Login Report (Pre-Commit) — 2026-05-14

## Scope
Structured login QA for:
1. CMS Backoffice (`admintalk`)
2. Main Web App (`localhost:9002`)
3. WA Dashboard (`localhost:9012`)

All checks were executed on local Docker environment before commit/push.

## Environment Health
- `docker compose ps`: backend, frontend, wa-dashboard, mariadb all `healthy`.
- Backend route registration confirmed for:
  - `GET /admintalk/login`
  - `GET /admintalk` (auth-protected dashboard)
  - `ANY /admin/login` (redirect route)
  - `POST /api/v1/login`

## Structured QA Results

### 1. CMS Backoffice (admintalk)
Checks executed:
1. Reachability check for `http://127.0.0.1:8000/admintalk/login` => HTTP `200` (PASS).
2. Guest access check for `http://127.0.0.1:8000/admintalk` => HTTP `302` to login (PASS).
3. Runtime auth integrity check in Laravel container:
   - Admin user exists (`USER_ID=1`)
   - `is_admin=YES`
   - Password hash matches admin credential (`PASS_MAIN=YES`)
   - Filament panel authorization check (`CAN_PANEL=YES`)

Evidence output:
```
USER_ID=1
IS_ADMIN=YES
PASS_MAIN=YES
CAN_PANEL=YES
```

Status: **PASS (backend auth + panel authorization + route protection validated)**.

### 2. Main Web Login
Endpoint checked:
- `POST http://127.0.0.1:9002/api/auth/login`

Credential used:
- `engel.willem@gmail.com`
- `TctAdmin2026Reset`

Result: HTTP `200`, response `status: success`, token returned, redirect `/today`.

Status: **PASS**.

### 3. WA Dashboard Login
Endpoint checked:
- `POST http://127.0.0.1:9012/api/wa-proxy/login`

Credential used:
- `engel.willem@gmail.com`
- `WADashboard@2026!Reset`

Result: HTTP `200`, response `status: success`, token returned, redirect `/today`.

Status: **PASS**.

## Root Cause Tracking (for recurring login issue)
Observed root risk is credential/user-state drift in local DB (MariaDB), not Firebase frontend itself.
Hardening now in place:
1. Local admin self-heal command with smoke check:
   - `php artisan auth:self-heal-local-admin --smoke-login`
2. Startup self-heal hook in backend container.
3. Local admin fallback handling in auth flow for recovery.

## Recruiter-Ready Access Links
1. CMS Login: `http://localhost:8000/admintalk/login`
2. CMS Dashboard: `http://localhost:8000/admintalk`
3. Main Web Login: `http://localhost:9002/login`
4. WA Dashboard Login: `http://localhost:9012/login`

## Final QA Verdict (This Run)
**GREEN for login readiness** across CMS auth-path validation, Main Web login API, and WA Dashboard login API in local Docker environment.
