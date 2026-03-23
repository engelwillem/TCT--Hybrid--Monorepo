# 20 - Codex Deploy And CSRF Execution

## Date
- 2026-03-23

## Scope
- Backend manual deploy for 2FA/auth hardening that was already present in backend source.
- Frontend source patch for Sanctum CSRF warming in Next.js auth flows.

## Source Files Changed
- `src/app/login/page.tsx`
- `src/app/forgot-password/page.tsx`
- `src/app/reset-password/page.tsx`
- `src/lib/sanctum-csrf.ts`
- `docs/QA Full Audit/10-fix-validation-log.md`
- `docs/QA Full Audit/13-gemini-codex-collaboration-board.md`
- `docs/QA Full Audit/17-next-action-checklist.md`
- `docs/QA Full Audit/20-codex-deploy-and-csrf-execution.md`

## Backend Deploy Model Used
- Source of truth: `docs/QA Full Audit/00a-current-deploy-truth.md`
- Backend deploy is manual from cPanel / server terminal.
- Backend source path is monorepo `backend-api/`.
- Server deploy script path: `/home/thechoosentalks/deploy/apps/thechoosentalks/deploy.sh`
- Backend release source branch: `main`

## Exact Deploy Steps Performed
1. Audited deploy truth docs and backend deploy script before execution.
2. Confirmed local repo branch = `main`.
3. Confirmed backend target fixes are already present in source used by deploy path.
4. Ran manual SSH deploy against cPanel host.
5. Queried the active release symlink and tailed deploy log after completion.

## Exact SSH / Deploy Commands Run
```powershell
ssh -i "$HOME\.ssh\cpanel_laptop_deploy" -p 22 -o StrictHostKeyChecking=accept-new -o ServerAliveInterval=15 -o ServerAliveCountMax=3 -o ConnectTimeout=20 thechoosentalks@209.42.27.90 "HEALTHCHECK_BASE_URL='https://api.thechoosentalks.org' bash /home/thechoosentalks/deploy/apps/thechoosentalks/deploy.sh"
```

```powershell
ssh -i "$HOME\.ssh\cpanel_laptop_deploy" -p 22 -o StrictHostKeyChecking=accept-new -o ServerAliveInterval=15 -o ServerAliveCountMax=3 -o ConnectTimeout=20 thechoosentalks@209.42.27.90 "readlink /home/thechoosentalks/deploy/apps/thechoosentalks/current && tail -n 40 /home/thechoosentalks/deploy/apps/thechoosentalks/deploy_pull.log"
```

## Important Deploy Output
- Deployment started: `20260323135854`
- Previous release: `/home/thechoosentalks/deploy/apps/thechoosentalks/releases/20260323080125`
- Composer dependencies installed successfully.
- Cache rebuild completed successfully.
- Migrations skipped because `RUN_MIGRATIONS=false`.
- Pre-switch healthcheck: `OK`
- Post-switch healthcheck: `OK`
- Current release after deploy:
  - `/home/thechoosentalks/deploy/apps/thechoosentalks/releases/20260323135854`

## What Is Patched In Source
- Next auth flows now warm Sanctum CSRF through `/api/sanctum/csrf-cookie`.
- After warming, frontend reads cookie `XSRF-TOKEN` and sends `X-XSRF-TOKEN` header on POST.
- This was applied to:
  - login
  - signup/register
  - forgot password
  - reset password

## What Is Already Deployed
- Backend manual deploy for the current `main` backend source.
- 2FA/auth hardening backend code is now deployed to cPanel runtime.

## Verification Performed
- `npm run typecheck` passed after the frontend CSRF patch.
- Backend deploy command returned success.
- Server log confirms successful healthchecks and active symlink switch.

## What Still Needs Runtime Verification
- `/profile` 2FA:
  - setup
  - confirm OTP
  - disable
  - regenerate recovery codes
- Auth flow after frontend deploy:
  - signup should no longer fail because of missing Sanctum CSRF warmup
  - login should continue to behave correctly with explicit `X-XSRF-TOKEN`

## Stage Separation
- Backend 2FA/auth hardening:
  - patched in source: yes
  - deployed: yes
  - runtime verified: no
  - docs updated: yes
- Frontend CSRF warming:
  - patched in source: yes
  - deployed: no
  - runtime verified: no
  - docs updated: yes

## Risks / Rollback Concerns
- Backend deploy skipped migrations. That is safe for this execution, but any schema-dependent future fix still needs an explicit migration plan.
- Frontend CSRF patch is not live until frontend deploy occurs from the correct `main` source.
- If runtime 2FA still fails after this deploy, root cause is no longer "backend not deployed" and should move to authenticated runtime/API inspection.
- Rollback path remains the server-side release rollback script:
  - `backend-api/rollback.sh`
  - or the mirrored server path under `/home/thechoosentalks/deploy/apps/thechoosentalks`

## Recommended Next Validation
1. Gemini retest `/profile` with a real authenticated account and verify the full 2FA lifecycle.
2. Operator or frontend release owner deploy the Next.js CSRF patch from `main`.
3. Gemini retest signup/login against live runtime to confirm the 419 CSRF mismatch no longer appears.
