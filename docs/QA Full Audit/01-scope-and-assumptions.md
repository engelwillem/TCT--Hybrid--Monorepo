# Scope and Assumptions (01)

## Scope Under Audit
- Landing page (`/`)
- Login and registration surfaces (`/login`, `/register`)
- Today ritual (`/today`)
- VerseHub (`/versehub`)
- Community (`/community`)
- Profile (`/profile`)

## User Roles
- **Guest:** anonymous user with no authenticated session
- **Member:** authenticated regular user
- **Admin:** Filament/admin access is observed only when needed for integration understanding

## Current Runtime Baseline
- **Frontend production URL:** `https://www.thechoosentalks.org/`
- **Backend production API:** `https://api.thechoosentalks.org/`
- **Frontend deploy model:** Tencent Edge auto-deploy from GitHub monorepo branch `main`
- **Backend deploy model:** Laravel manual pull + deploy from cPanel terminal

## Current Assumptions
- Frontend source changes are **not automatically equal** to live production state until Tencent runtime is confirmed.
- Backend source changes are **not live** until cPanel manual deploy has been executed.
- `main` is the active local engineering branch in this repo.
- `main` is the active frontend production branch baseline for Tencent.

## Known Unknowns
- Whether Tencent runtime is currently serving the latest artifact from `main` or a stale/cached build.
- Regional cache propagation latency on Tencent Edge after frontend source updates.
- Authentication/session behavior when frontend runtime and backend runtime are out of sync.

## Documentation Interpretation Note
- Historical audit files may describe earlier failure modes that are no longer today's primary blocker.
- For current release decisions, prefer the latest handoff, blocker, and matrix documents over older dated audit narratives.
