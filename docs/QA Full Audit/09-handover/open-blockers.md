# Active & Resolved Blockers

## Active Blockers — Current Reality

### 1. Frontend source-of-truth mismatch
- **Status:** BLOCKED
- **Type:** release-source / runtime mismatch
- **Owner:** frontend / release engineering
- **Why open:** production frontend still shows legacy runtime behavior that does not match current source patches.
- **Impact:** frontend bugfixes cannot be trusted as live even when code is already patched in repo.

### 2. Backend manual deploy dependency
- **Status:** ACTIVE
- **Type:** operational deployment dependency
- **Owner:** operator / user
- **Why open:** Laravel runtime changes still require explicit cPanel pull + deploy.
- **Impact:** auth and other backend-dependent fixes cannot be considered live by commit alone.

### 3. Mixed auth E2E not ready
- **Status:** BLOCKED
- **Type:** cross-layer dependency
- **Owner:** frontend + operator
- **Why open:** login/register flows require both frontend live sync and backend live deploy.
- **Impact:** E2E auth cannot be treated as final while either layer is stale.

## Current Operational Workaround
Backend deploy remains:
```bash
HEALTHCHECK_BASE_URL="https://api.thechoosentalks.org" bash /home/thechoosentalks/deploy/apps/thechoosentalks/deploy.sh
```

## Resolved / Historical Notes
- Duplicate Tencent webhook trigger issue is no longer the primary blocker baseline.
- GitHub Actions SSH deploy path is no longer the operative backend release model for current daily operations.
- Older firewall/webhook blocker narratives remain historical context only.
