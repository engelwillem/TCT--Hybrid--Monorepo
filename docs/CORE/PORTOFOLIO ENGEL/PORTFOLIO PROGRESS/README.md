# Portfolio Documentation Index (Step 3 Focus 6)

## Overview
This repository serves two concurrent purposes:
- Production-capable application repository (Next.js frontend + Laravel backend).
- AI and Automation engineering portfolio with auditable evidence.

Architecture summary:
- Frontend: Next.js App Router (`src/app/**`) with API proxy routes (`src/app/api/**`) for Laravel.
- Backend: Laravel 12 (`backend-api/**`) with Sanctum auth, feature modules, jobs/queues, and console commands.
- Data layer: MariaDB (runtime), Redis (cache/queue/runtime support), migrations/models under `backend-api/database` and `backend-api/app/Models`.

AI/automation summary:
- AI provider abstraction exists and supports real provider adapters with safe fallback modes.
- Step 3 finalized profile notification preferences and WhatsApp OTP verification APIs/UX.
- Onboarding/AIOS pipeline is MVP-level runtime proof, while some integrations remain adapter-ready or simulated.

Operational philosophy:
- Truthful MVPs over inflated claims.
- Runtime proof > architecture-only claims.
- No fake integrations or fake metrics.
- No hallucinated AI orchestration claims.

## Documentation Map
Core evidence and governance:
- [Evidence Map](./evidence-map.md)
- [Runtime Proof Checklist](./runtime-proof-checklist.md)
- [Portfolio Proof Checklist](./proof-checklist.md)
- [No-Overlap Rule](./no-overlap-rule.md)
- [Subdomain Strategy](./subdomain-strategy.md)
- [Portfolio Evidence Gate](./Portfolio%20Evidence%20Gate.md)

Step and architecture backfill:
- [Step 1 Baseline](./step-1-baseline.md)
- [Step 2 Foundation](./step-2-foundation.md)
- [Step 3 Runtime Proof](./step-3-runtime-proof.md)
- [Architecture Proof](./architecture-proof.md)

Portfolio safety and demos:
- [Feature Matrix](./feature-matrix.md)
- [Demo Guide](./demo-guide.md)
- [Runtime Environment](./runtime-environment.md)
- [Evidence Integrity Rules](./evidence-integrity-rules.md)

## Portfolio Status Summary
| Feature | Status | Evidence Type | Runtime Verified? | Tests? | Demo-safe? | Notes |
|---|---|---|---|---|---|---|
| Main app landing `/` | Verified | Route/page code + smoke tests | Partial | Yes | Yes | Must remain unchanged by portfolio work. |
| Step 3 notification preferences | Verified | API controllers/routes + profile UX + tests | Partial | Yes | Yes | Auth-only, user-scoped update/read. |
| Step 3 WhatsApp OTP verification | Verified | API + model + tests | Partial | Yes | Yes (with caveat) | Provider runtime depends on Fonnte availability/config. |
| AIOS onboarding dashboard/routes | Runtime verified MVP | API + frontend route + runtime proof tests | Yes (MVP scope) | Yes | Yes | Email step remains simulated/mock by design. |
| CRM/calendar integration | Adapter-ready only | Contracts/adapters/config | No | Partial | Yes (if labeled) | Generic webhook adapters, not vendor-specific claims. |
| Community/VerseHub/Renungan AI surfaces | Test verified only | Services/routes/tests | Partial | Yes | Cautious | Runtime provider success depends on env keys/network. |
| WA reminders automation | Configured only | Console commands + migrations | Not fully | Partial | Cautious | Do not claim dashboard completeness. |
| Ops observability stack | Configured only | Docker/monitoring config | Partial | N/A | Cautious | Runtime status environment-dependent. |

## Main Architectural Boundaries
- Main app remains main app: `/` is the primary site landing and is not a portfolio playground.
- Portfolio demos are isolated: `/aios`, `/portfolio*`, docs under `docs/portfolio/**`.
- Admin/API protected: admin and profile-sensitive APIs remain auth-protected and role-gated where applicable.
- Mock/simulated surfaces are explicitly labeled and must not be presented as live production integrations.

## Runtime Verification Philosophy
A feature claim should be treated as strong only when these checks are satisfied:
- Route exists and resolves.
- Page/API opens in runtime.
- Action works end-to-end.
- User-visible result is clear.
- Logs/data artifacts exist.
- Relevant tests pass.
- UX proof (screenshots/video/manual walkthrough) is preferred for demo claims.
- Privacy/security controls remain intact (authz, scoped data, no secret/raw sensitive leaks).

## Current Blockers Before Step 4
- Frontend Docker runtime can still become slow/hanging in some startup/build states, affecting manual proof flow.
- Frontend proxy `/api/auth/login` verification via host-path has intermittent runtime bottlenecks despite direct container-to-backend connectivity proof.
- Real Fonnte OTP delivery result remains environment/provider dependent (safe error handling exists; delivery proof still required per runtime).
- Some portfolio claims remain adapter-ready/configured-only until full runtime proof is captured.

## Related Routes / Tests / Evidence
- Backend routes: `backend-api/routes/api.php`, `backend-api/routes/console.php`
- Frontend proxy routes: `src/app/api/**`
- Core tests: `backend-api/tests/Feature/ProfileNotificationAndWhatsappVerificationTest.php`, `backend-api/tests/Feature/AiosOnboardingRuntimeProofTest.php`, `backend-api/tests/Unit/WhatsappPhoneNormalizerTest.php`
- Cross-doc evidence: [Evidence Map](./evidence-map.md), [Runtime Environment](./runtime-environment.md)
