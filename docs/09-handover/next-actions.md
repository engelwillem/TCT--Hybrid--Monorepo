# Next Actions

## Evidence-driven tasks added from production review
- [x] Revalidate production `/` accessibility after latest frontend patch set — Status: LIVE — Next action: keep in smoke monitor script — Evidence: live HTTP check returns `200` after deploy.
- [x] Revalidate production `/today`, `/community`, `/versehub/id`, `/paths`, `/profile` with fresh cache pass — Status: LIVE — Next action: keep visual QA cycle for UX regressions — Evidence: all listed routes return `200` on live recheck.

## A. Deployment & Infra Verification
- [x] Keep GitHub Actions as CI-only (no manual Tencent hook trigger) — Status: FIXED — Next action: maintain current workflow policy — Evidence: workflow cleanup completed, CI no longer coupled to `TENCENT_EDGE_DEPLOY_HOOK_URL`.
- [x] Tencent deploy blocker `CDN configuration size exceeds limit` remediation — Status: FIXED — Next action: keep encoded-chunk mirroring disabled/simplified path as baseline — Evidence: Tencent deploy success after config footprint reduction.
- [ ] Verify single deploy stream (no double deploy) on next release window — Status: PARTIAL — Next action: compare GitHub checks vs Tencent deployment timeline for one commit — Evidence: previous double-trigger risk from manual hook + auto deploy integration.

## B. API / Data Recovery Verification
- [x] Revalidate production `/api/today` after base URL fallback patch — Status: LIVE — Next action: monitor during peak traffic window — Evidence: live endpoint returns `200` with Today payload.
- [x] Revalidate production `/api/community/posts` after base URL fallback patch — Status: LIVE — Next action: add scripted monitor to detect regression quickly — Evidence: live endpoint returns `200` with `posts/archivePosts`.
- [x] Revalidate production `/api/versehub/id/books` after base URL fallback patch — Status: LIVE — Next action: keep in smoke test suite — Evidence: live endpoint returns `200` with books list.
- [x] Revalidate production `/api/versehub/id/chapter/*` with normalized chapter ref flow — Status: LIVE — Next action: preserve slug normalizer path in regression tests — Evidence: live `mzm-23` and `mzm-23-1` both return `200`.
- [ ] Add post-deploy API smoke automation (`today`, `community`, `versehub books/chapter`) — Status: DRIFT — Next action: create lightweight scripted checks and attach output to release notes — Evidence: repeated runtime drift despite successful CI/build.

## C. UI / Brand Regression Fixes
- [x] Force browser tab icon to T-based TCT mark across clients — Status: LIVE — Next action: preserve favicon order (`ico/png/svg`) and recheck after cache purge windows — Evidence: live `/favicon.png` serves T-mark icon.
- [x] Align brand font parity with Laravel legacy baseline — Status: LIVE — Next action: keep font stack token locked unless explicit brand change — Evidence: live CSS contains `Inter, system-ui, -apple-system` stack.
- [x] Remove remaining background noise/pattern from global shell surfaces — Status: LIVE — Next action: continue per-page cleanup where local overlays still exist — Evidence: live CSS no longer contains `.tct-global-background::before` pattern rule.
- [x] Fix Community OG brand casing to `The Chosen Talks` — Status: LIVE — Next action: validate share preview cache refresh on external platforms — Evidence: live OG title/alt now `The Chosen Talks - The Chosen People`.
- [x] Recover `/community` feed reliability end-to-end (UI + API confirmation) — Status: LIVE — Next action: maintain API fallback smoke tests — Evidence: `/api/community/posts` returns `200`, no mass 503 on revalidation.
- [ ] Recover `/profile` avatar render after upload — Status: PARTIAL — Next action: verify avatar URL candidate order in production and confirm image visible after upload refresh — Evidence: upload appears successful but avatar still not shown.
- [ ] Repair `/paths` visual regression (font/layout quality) with no extra background artifacts — Status: DRIFT — Next action: run focused UI pass only on Paths and capture before/after screenshots — Evidence: user report “makin buruk layouting font + background”.

## D. UX / Mobile Refinement
- [ ] Improve mobile bottom nav reachability (thumb zone) — Status: PARTIAL — Next action: validate on real devices after latest bottom offset reduction and decide final placement — Evidence: user complaint mobile nav sulit dijangkau.
- [x] Revalidate VerseHub mobile interaction flow after sync fixes (`search -> ref -> chapter`) — Status: LIVE — Next action: add this path to release smoke checklist — Evidence: live chapter API ref normalization (`mzm-23-1`) now stable.

## E. Deferred / Lower Priority Warnings
- [ ] Track preload warnings for CSS/font resources and tune only if UX/perf impact confirmed — Status: DRIFT — Next action: audit preload usage in production profile and reduce non-critical preloads opportunistically — Evidence: repeated console warnings `preloaded but not used within a few seconds`.

## Next Development backlog alignment (from `docs/core/Development/Next Development.md`)
- [ ] Standardize UI primitives (`AppButton`, `AppCard`, `SectionHeader`, `EmptyState`, `InlineAlert`, `LoadingBlock`) across core routes — Status: DRIFT — Next action: create adoption plan per route and start with Today/Community/Paths/VerseHub — Evidence: roadmap 30-day week 1 foundation.
- [ ] Lock design tokens (typography, spacing, radius, semantic colors, state colors) into one source of truth — Status: DRIFT — Next action: define token map and remove inconsistent utility drift — Evidence: roadmap calls for token-first consistency.
- [ ] Apply motion layer intentionally (card hover, tab/accordion transition, loading-to-content) without visual noise — Status: PARTIAL — Next action: keep motion only where clarity improves interaction — Evidence: roadmap week 2 interaction quality.
- [ ] Build observability baseline (Sentry + structured frontend/backend error visibility) — Status: DRIFT — Next action: implement minimal capture for runtime API failures and release correlation — Evidence: roadmap week 3 observability requirement.
- [ ] Define analytics event schema for core loop (`Today -> VerseHub -> Community -> Paths`) — Status: DRIFT — Next action: instrument key actions only, avoid event over-collection — Evidence: roadmap week 3 data-driven product tracking.
- [ ] Harden typed API contracts with response validation on critical surfaces — Status: PARTIAL — Next action: prioritize Today, Community, VerseHub, Profile response normalization — Evidence: roadmap week 3 contract hardening guidance.
- [ ] Prepare backend AI abstraction layer (provider-agnostic) before any wider AI UX rollout — Status: DRIFT — Next action: define Laravel AI gateway contract and safety/logging controls — Evidence: roadmap week 4 AI-ready architecture.
- [ ] Add journey/progress visualization where decision value exists (not decorative charts) — Status: PARTIAL — Next action: pilot one charted journey metric with clear user benefit — Evidence: roadmap week 4 progress visualization.
