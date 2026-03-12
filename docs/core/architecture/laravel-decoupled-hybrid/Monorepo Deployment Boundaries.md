# Monorepo Deployment Boundaries

## Purpose

This note defines the practical deploy boundary between frontend and backend inside the Laravel Hybrid monorepo.

## Frontend Boundary

- Frontend CI is scoped by path filters in [`frontend-monorepo-checks.yml`](../../../../../.github/workflows/frontend-monorepo-checks.yml).
- Only root/frontend files trigger the frontend workflow:
  - `.idx/**`
  - `src/**`
  - `public/**`
  - root Next.js config files
- `backend-api/**` changes do not trigger the frontend GitHub workflow.

## Backend Boundary

- Backend CI/CD is scoped by path filters in [`backend-cpanel-deploy.yml`](../../../../../.github/workflows/backend-cpanel-deploy.yml).
- Only `backend-api/**` and the backend workflow file itself trigger backend deploy automation.

## Important Platform Caveat

- GitHub Actions path filters separate CI jobs inside the monorepo.
- They do **not** stop Tencent Edge or Firebase Studio from auto-pulling the whole repo if those platforms are configured to redeploy on every commit.
- If you want true deploy separation at platform level, you still need one of these:
  - separate deploy branches
  - platform-level path filtering, if supported
  - a deploy gate/manual promote step instead of auto-redeploy on every push

## Current Recommendation

- Keep monorepo CI separated by path filters.
- Keep backend deploy on GitHub Actions via SSH to cPanel.
- Treat Tencent Edge and Firebase Studio auto-redeploy as platform behavior outside repo control unless their project settings are tightened later.
