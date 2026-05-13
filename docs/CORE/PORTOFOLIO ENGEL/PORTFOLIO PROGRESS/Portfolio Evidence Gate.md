1. Files created
- `docs/portfolio/no-overlap-rule.md`
- `docs/portfolio/proof-checklist.md`
- `docs/portfolio/subdomain-strategy.md`

2. Files modified
- None for app/runtime code in Focus 3–5.
- Documentation-only additions were made under `docs/portfolio/`.
- Existing `docs/portfolio/runtime-proof-checklist.md` remains from Focus 2 with the ops/observability table already added.

3. No-overlap rule summary
- Added `docs/portfolio/no-overlap-rule.md`.
- It defines that:
  - the main app remains the main app
  - `/` must remain the public main website landing
  - AIOS/automation/portfolio demos stay isolated under routes like `/aios` and `/portfolio*`
  - portfolio/demo features may not hijack `/`, `/login`, `/profile`, `/community`, `/versehub`, `/renungan`, `/admin`, or protected APIs
  - admin/API routes must remain protected
  - mock/simulated/adapter-ready/demo surfaces must be labeled honestly
  - future subdomain routing must map to isolated routes, not replace core app pages

4. Route ownership table summary
- Added a route ownership table covering:
  - `/`
  - `/login`
  - `/profile`
  - `/community`
  - `/versehub`
  - `/renungan`
  - `/aios`
  - `/portfolio` and `/portfolio*`
  - `/wa-reminder`
  - `/admin`
  - `/api/v1/*`
- Each row documents:
  - owner/domain
  - public/auth/admin access type
  - portfolio relevance
  - whether it can be used as a demo
  - overlap risk
  - evidence files/tests

5. Proof checklist status summary
- Added `docs/portfolio/proof-checklist.md`.
- It covers portfolio-critical features:
  1. Main landing — `test verified only`
  2. Login/auth — `test verified only`
  3. Profile + notification preferences — `test verified only`
  4. WhatsApp OTP verification — `test verified only`
  5. AIOS onboarding MVP — `runtime verified MVP`
  6. Community AI assistant — `test verified only`
  7. VerseHub AI mentor — `test verified only`
  8. Renungan AI mentor — `test verified only`
  9. WhatsApp reminder automation — `configured only`
  10. DevSecOps workflows — `configured only`
  11. Docker local infrastructure — `configured only`
  12. Ops/observability configs — `configured only`
- It also includes the final “Before claiming a feature in portfolio” checklist:
  - route exists
  - page/API opens
  - action works
  - result visible
  - data/log evidence exists
  - tests pass
  - privacy is protected
  - copy is honest
  - main app is not affected

6. Subdomain strategy summary
- Added `docs/portfolio/subdomain-strategy.md`.
- It is strategy-only and does not implement DNS/proxy/hosting changes.
- It covers:
  - `www.thechoosentalks.org` — main public website, current route `/`, must remain primary
  - `portfolio.thechoosentalks.org` — planned portfolio/case-study/evidence subdomain, route-backed by `/portfolio*`
  - `aios.thechoosentalks.org` — route-backed MVP strategy for `/aios`
  - `wa.thechoosentalks.org` — partial/planned; current evidence is `/wa-reminder`, not a completed dashboard
  - `admin.thechoosentalks.org` or existing `/admin` — protected admin/ops strategy; Laravel `/admintalk` is the proven protected admin surface
  - `api.thechoosentalks.org` — Laravel API strategy; deployment-dependent with CORS/Sanctum/env separation risks

7. Tests added or cited
- No new tests were added in Focus 3–5 because this focus was documentation, route mapping, and safety guardrails.
- Existing tests cited:
  - `backend-api/tests/Feature/UiSmokeTest.php`
  - `backend-api/tests/Feature/Auth/AuthenticationTest.php`
  - `backend-api/tests/Feature/AuthApiRegisterTest.php`
  - `backend-api/tests/Feature/ProfileNotificationAndWhatsappVerificationTest.php`
  - `backend-api/tests/Feature/ProfileTest.php`
  - `backend-api/tests/Feature/LocalAdminBootstrapTest.php`
  - `backend-api/tests/Feature/AiosOnboardingRuntimeProofTest.php`
  - `backend-api/tests/Feature/CommunityPrivateRenunganVisibilityTest.php`
  - `backend-api/tests/Feature/CommunityAIAssistApiTest.php`
  - `backend-api/tests/Feature/VerseHubMentorApiTest.php`
  - `backend-api/tests/Feature/VerseHubMentorGroundingTest.php`
  - `backend-api/tests/Feature/RenunganPersonalizationModeSafetyTest.php`
  - `backend-api/tests/Feature/RenunganPersonalizationPipelineQualityTest.php`
  - `backend-api/tests/Feature/RenunganPersonalizationTelemetryTest.php`

8. Validation results

- backend route:list:
  - Passed.
  - `php backend-api/artisan route:list` completed and showed `182` routes.

- backend tests:
  - Started with `powershell -NoProfile -Command "Set-Location -Path 'backend-api'; php artisan test"`.
  - Local command timed out/killed after 10 minutes during this Focus 3–5 validation run.
  - Before timeout, many suites had already passed, including AIOS, auth, community, and related feature/unit suites.
  - Important context: Focus 2 full backend validation previously completed successfully after SQLite cleanup with `165 passed (783 assertions)`.
  - Current Focus 3–5 did not introduce backend code changes, only docs.

- frontend typecheck:
  - Passed.
  - `npm run typecheck` completed successfully with `tsc --noEmit --incremental false` and no reported TypeScript errors.

- frontend build:
  - Timed out after 10 minutes.
  - `npm run build` reached:
    - `Compiled successfully in 8.9min`
    - `Linting and checking validity of types ...`
    - `Collecting page data ...`
  - Then the process was killed by timeout.
  - No real TypeScript/build error was reported before timeout.
  - Exact blocker: local Next.js build exceeded the 10-minute command timeout while collecting page data after successful compilation.

9. Remaining blockers before Step 4
- Manual browser screenshots/runtime proof are still needed for portfolio-critical pages if they will be publicly claimed as “proven.”
- Frontend build needs a longer local timeout or CI runner to complete beyond `Collecting page data ...`.
- Current Focus 3–5 backend full test rerun timed out locally, though prior Focus 2 full backend test passed and no backend code changed in Focus 3–5.
- Next `/admin` frontend route protection remains not fully audited; Laravel `/admintalk` is the proven protected admin surface.
- WA dashboard remains partial/planned; `/wa-reminder` is only an info/link page.
- Prometheus/Grafana are configured but not wired as active services in current `docker-compose.yml`; runtime UI URLs are not proven.
- No subdomains were implemented; DNS/proxy/deployment work remains future strategy only.


---

## Related Docs / Tests / Routes / Evidence
- Docs: [Portfolio Index](./README.md), [Evidence Integrity Rules](./evidence-integrity-rules.md), [Feature Matrix](./feature-matrix.md)
- Tests: [Runtime Proof Checklist](./runtime-proof-checklist.md), [Proof Checklist](./proof-checklist.md)
- Routes/Evidence: [Evidence Map](./evidence-map.md), [Architecture Proof](./architecture-proof.md)
