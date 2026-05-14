# Share Prepare Rate Limiting Design

Last updated: 2026-04-17

## Goal

Provide deterministic, production-safe rate limiting for share prepare endpoints at Laravel level.
Edge-level throttling may exist, but Laravel is the final enforcement.

## Protected Endpoints

- `POST /api/v1/community/posts/{memberPost}/share-assets/prepare`
- `POST /api/v1/renungan/share/{token}/prepare`
- `POST /api/v1/versehub/{lang}/{slug}/share-assets/prepare`

## Final Strategy

### 1) Key strategy

- Primary actor key: authenticated user id
  - `user:{id}`
- Fallback actor key (defense-in-depth if request reaches limiter unauthenticated):
  - `ip:{hash16}`
- Route/action dimension:
  - `share-prepare:{surface}:{actor}:{window}`
- Surface is one of: `community`, `renungan`, `versehub`.

This avoids broad collisions while still allowing per-surface tuning and clear observability.

### 2) Thresholds (initial)

- Community: `8/min` + burst `3 per 10s`
- Renungan: `6/min` + burst `2 per 10s`
- Versehub: `12/min` + burst `4 per 10s`

Reasoning:
- conservative enough for abuse suppression
- still allows normal user share behavior
- easy to tune through `config/share_assets.php` and env overrides

### 3) Enforcement order

Applied at route level with middleware:
- `auth:sanctum`
- `throttle:share-prepare`

Auth is enforced first. Throttle then becomes backend final gate before controller action.

### 4) 429 contract

When throttled:
- status: `429`
- JSON:
  - `message`
  - `code` = `SHARE_PREPARE_RATE_LIMITED`
  - `status` = `429`
  - `retry_after`
  - `request_id`

Headers from Laravel throttle middleware are preserved (including `Retry-After`).

## Observability

On throttle hit, backend writes warning log event:
- `share_prepare.throttled`
- fields:
  - `surface`
  - `route`
  - `user_id` (if available)
  - `actor_key`
  - `ip_hash`
  - `retry_after`
  - `request_id`

Raw IP is not logged; hash is used to reduce privacy risk while preserving incident triage utility.

## Production Recommendation

For deterministic multi-instance behavior, use a shared cache store for limiter:
- preferred: Redis (`CACHE_STORE=redis`)
- fallback: database cache store

If using local file/array cache in production, limiter counters can fragment per instance.
