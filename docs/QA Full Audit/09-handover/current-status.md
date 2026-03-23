# Current Status

## Current Baseline — 2026-03-22
- **Product surface:** `/today` remains canonical.
- **Frontend runtime model:** Tencent Edge auto-deploys from GitHub monorepo, but production frontend must still be treated as **potentially stale** until branch/source mapping is proven.
- **Backend runtime model:** Laravel production is deployed manually from cPanel. Backend code in repo is **not live by default**.
- **Primary operational issue:** frontend production is still showing old UI/runtime behavior that does not match current source, while backend auth/runtime parity still depends on manual deploy.

## Frontend Status
- **Source state:** patched in repo for auth UI, signup mode, `/register`, `/today` pathing, and VerseHub overlay handling.
- **Production state:** not yet trustworthy as source-of-truth because live behavior still shows stale indicators.
- **Current risk:** branch drift, release-source mismatch, or stale Tencent runtime/cache.

## Backend Status
- **Today session endpoint:** canonical backend endpoint is present in source at `/api/today/session`.
- **Auth runtime:** latest login/register controller behavior exists in repo, but must still be treated as pending until cPanel deploy is executed and verified.
- **Deployment model:** manual pull + `deploy.sh` from cPanel remains the active production path.

## Git / Deploy Reality
- **GitHub Actions:** CI-only for frontend and backend validation. They do not equal production deployment.
- **Tencent Edge:** frontend deploy source must be verified against the intended release branch.
- **cPanel:** backend deploy remains an explicit operator action.

## Current Trust Rule
- **Source fixed** does not mean **production fixed**.
- **Backend in repo** does not mean **backend live**.
- **Historical 2026-03-19 / 2026-03-20 reports** should be treated as earlier snapshots, not current runtime proof.

