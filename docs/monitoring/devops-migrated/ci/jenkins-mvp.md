# Jenkins CI MVP (No Deploy)

This repository includes a safe Jenkins CI starter pipeline in `Jenkinsfile`.

## Scope

- No deploy steps
- Fast confidence checks on every branch:
  - dependency install
  - TypeScript typecheck
  - route/intent contract tests
- Extra checks on `main`:
  - production build
  - whitelist ZIP packaging
- Optional Docker validation when Docker is available on the agent:
  - `docker compose config`

## Pipeline stages

1. `Preflight`
2. `Install Dependencies`
3. `Typecheck`
4. `Contract Tests`
5. `Build (Main Only)`
6. `Docker Compose Validate (Optional)`
7. `Package Website ZIP (Main Only)`

Artifacts:

- `deliverables/*.zip` (when generated)
- `compose-resolved.yml` (when Docker validation runs)

## Jenkins job setup

1. Create a **Pipeline** job.
2. Set Definition to **Pipeline script from SCM**.
3. Point SCM to this repository and branch strategy as desired.
4. Ensure Jenkins agent has:
   - Node.js + npm available in PATH
   - Optional: Docker CLI + Compose plugin in PATH
5. Save and run.

## Notes

- Pipeline intentionally skips deploy/CD for now.
- Docker validation stage is auto-skipped when Docker is unavailable.
- `Contract Tests` uses the Docker-safe Vitest command already defined in `package.json`:
  - `npm run test:contracts:docker`
