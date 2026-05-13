# Step 3 Runtime Proof (Focus 1–5)

## Purpose
Make Step 2 foundation usable through real API/UX, add runtime-oriented evidence, and enforce portfolio honesty/safety rules.

## What Was Implemented
- Profile settings UX and API usage for notification preferences.
- WhatsApp OTP verification UX/API path with hashing, expiry, attempt limits, normalized phone storage, and status endpoint.
- Fonnte delivery integration path via existing/reused infrastructure strategy.
- Login/connectivity hardening in proxy layer (distinct timeout/unreachable behavior).
- Runtime proof artifacts for AIOS and portfolio evidence governance.
- Route/feature no-overlap governance docs and evidence gate docs.
- Adapter-ready CRM/calendar and simulated/mock email honesty consistently documented.

## What Was Intentionally NOT Implemented
- No Step 4 roadmap execution.
- No full production rollout claim for all AI/provider features.
- No fabricated provider-runtime claims.
- No architecture rewrite or state-management rewrite.

## Tests Run
- `backend-api/tests/Feature/ProfileNotificationAndWhatsappVerificationTest.php`
- `backend-api/tests/Unit/WhatsappPhoneNormalizerTest.php`
- `backend-api/tests/Feature/LocalAdminBootstrapTest.php`
- `backend-api/tests/Feature/AiosOnboardingRuntimeProofTest.php`
- Additional auth/profile/community/mentor-related feature tests cited in portfolio checklist/evidence map.

## Evidence
- Profile/OTP APIs: `backend-api/routes/api.php`, `UserNotificationPreferenceController.php`, `UserWhatsappVerificationController.php`
- Frontend proxy/profile UX: `src/app/api/profile/**`, `src/app/profile/page.tsx`
- Proxy behavior: `src/lib/proxy-laravel.ts`, `src/lib/laravel-api.ts`, `src/app/api/auth/login/route.ts`
- Step 3 docs: no-overlap/proof/runtime/evidence/subdomain docs under `docs/portfolio/**`

## Runtime Status
- Step 3 is partially runtime-verified:
  - Core backend login API reachable and valid.
  - Container-level frontend->backend direct API reachability proven.
  - Some host-path frontend runtime checks remain intermittently slow due dev/build/runtime bottlenecks.

## Risks
- Docker frontend startup/build slowness can mask actual API correctness during manual proof.
- Provider-dependent OTP delivery proof requires stable external provider response.

## Blockers
- Final stable browser-level proof for `/api/auth/login` via frontend host-path in all local runtime states.
- Real Fonnte delivery proof can still fail due provider/runtime constraints.

## Important Architectural Decisions
- Keep main landing protected and unchanged.
- Keep portfolio routes isolated and clearly labeled.
- Keep status taxonomy strict (verified/runtime verified/test-verified/configured/adapter-ready/mock).
- Prefer service-name Docker networking (`http://backend:8000`) for container-to-container communication.

## Privacy/Security Decisions
- Auth-required profile/verification routes.
- User-scoped preferences and verification records.
- OTP hash-only storage; no raw code leaks.
- Rate-limiting and validation protections for OTP request/verify.
- Mass-assignment protection emphasis for privileged fields.

## Honest Limitations
- Not all features are production-ready.
- Some claims remain adapter-ready/configured-only/simulated.
- Runtime bottlenecks still affect reproducibility of some manual proofs.

## Related Docs / Tests / Routes / Evidence
- Docs: [Portfolio Index](./README.md), [Runtime Environment](./runtime-environment.md), [Feature Matrix](./feature-matrix.md), [Demo Guide](./demo-guide.md)
- Routes: `src/app/api/auth/login/route.ts`, `src/app/api/profile/**`, `backend-api/routes/api.php`
- Tests: see [Proof Checklist](./proof-checklist.md)
- Evidence: [Evidence Map](./evidence-map.md), [Portfolio Evidence Gate](./Portfolio%20Evidence%20Gate.md)
