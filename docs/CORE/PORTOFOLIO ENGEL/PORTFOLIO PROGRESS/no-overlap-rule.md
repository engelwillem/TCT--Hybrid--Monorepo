# Portfolio No-Overlap Rule — Step 3 Focus 3

> Scope: Documentation and guardrails only. This file does **not** implement subdomains, does **not** move portfolio/AIOS routes, and does **not** authorize replacing the main app.

## Core Rules

1. **Main app remains main app.** TheChoosenTalks core product routes keep their current ownership and behavior.
2. **`/` must remain the public main website landing.** Portfolio, AIOS, and automation demos must never replace or hijack it.
3. **AIOS, automation, and portfolio demos must remain isolated.** Use existing isolated routes such as `/aios`, `/portfolio*`, and specific API namespaces.
4. **No portfolio/demo feature may hijack core pages:**
   - landing page `/`
   - auth/login
   - profile
   - community
   - VerseHub
   - Renungan
   - admin
5. **Admin/API routes must remain protected.** Authenticated/member/admin-only endpoints must not be made public to support a portfolio demo.
6. **Experimental/demo surfaces must be labeled honestly.** Demo fallback, mock data, adapter-only integrations, and simulated steps must be visible.
7. **Mock/simulated/adapter-ready features must be visible as such.** Do not imply production integrations or real delivery where not proven.
8. **Future subdomain routing must map to isolated routes, not replace core app pages.** A subdomain can point at `/aios` or `/portfolio*`, but must not overwrite `/`, `/login`, `/profile`, `/community`, `/versehub`, `/renungan`, or admin/API protections.

## Route Ownership Table

| Route | Owner/domain | Access | Portfolio relevance | Can be used as demo? | Overlap risk | Evidence file |
|---|---|---|---|---|---|---|
| `/` | Main public website / core brand landing | Public | Context only; not a portfolio demo host | No | High — must not be replaced by portfolio/AIOS | `src/app/page.tsx`, `backend-api/routes/web.php`, `backend-api/tests/Feature/UiSmokeTest.php` |
| `/login` | Auth surface | Public page / auth flow | Context only | No | High — auth route must not be hijacked | `src/app/login/page.tsx`, `backend-api/routes/web.php`, `backend-api/tests/Feature/Auth/AuthenticationTest.php` |
| `/profile` | Member profile and preferences | Authenticated | Step 3 proof surface only | Yes, only after login and with test/demo account | High — contains private user data | `src/app/profile/page.tsx`, `backend-api/routes/api.php`, `backend-api/tests/Feature/ProfileNotificationAndWhatsappVerificationTest.php`, `backend-api/tests/Feature/ProfileTest.php` |
| `/community` | Community feed and composer | Public reads + authenticated actions | AI assistant proof surface | Yes, with safe demo/user data | Medium — must not expose private/member-only data | `src/app/community/page.tsx`, `backend-api/routes/api.php`, `backend-api/tests/Feature/CommunityAIAssistApiTest.php` |
| `/versehub` | Bible reader / mentor | Public reads + authenticated actions | AI mentor proof surface | Yes, for public reader/mentor flows | Medium — auth-only mentor ask/reflections must stay protected | `src/app/versehub/**`, `backend-api/routes/api.php`, `backend-api/tests/Feature/VerseHubMentorApiTest.php` |
| `/renungan` | Devotional/renungan experience | Public/auth mixed | AI mentor/personalization proof surface | Yes, with privacy-safe content | Medium — private renungan data must remain protected | `src/app/renungan/page.tsx`, `backend-api/routes/api.php`, `backend-api/tests/Feature/RenunganPersonalizationModeSafetyTest.php`, `backend-api/tests/Feature/CommunityPrivateRenunganVisibilityTest.php` |
| `/aios` | AIOS onboarding automation MVP/demo | Public frontend with live/demo fallback | Primary AIOS proof surface | Yes | Low if isolated and honestly labeled | `src/app/aios/page.tsx`, `src/app/api/onboarding/**`, `backend-api/routes/api.php`, `backend-api/tests/Feature/AiosOnboardingRuntimeProofTest.php` |
| `/portfolio` and `/portfolio*` | Portfolio/case study surfaces | Public | Primary portfolio case study routes | Yes | Low if isolated and not replacing `/` | `src/app/portfolio/**`, `src/app/portfolio1`, `src/app/portfolio2`, `src/app/portfolio3` |
| `/wa-reminder` | WhatsApp reminder info/link page | Public | Partial WA automation evidence only | Yes, as info/link page only | Medium — must not claim complete dashboard | `src/app/wa-reminder/page.tsx`, `backend-api/app/Console/Commands/ProcessDueWaRemindersCommand.php` |
| `/admin` | Frontend admin route / Laravel redirect compatibility | Unknown frontend route; Laravel `/admin` redirects to `/admintalk/login` | Admin/ops context only | No, unless using protected demo admin account | High — admin must remain protected | `src/app/admin/analytics/composer/page.tsx`, `backend-api/routes/web.php`, `backend-api/tests/Feature/UiSmokeTest.php`, `backend-api/tests/Feature/LocalAdminBootstrapTest.php` |
| `/api/v1/*` | Laravel API | Mixed public/auth/admin by route | Backend proof evidence | Yes, via safe documented endpoints only | High — auth/admin/private endpoints must remain protected | `backend-api/routes/api.php`, `backend-api/tests/Feature/**/*Test.php` |

## Existing Guardrail Tests to Cite

- Root and legacy auth/admin redirects: `backend-api/tests/Feature/UiSmokeTest.php`
- Login/auth behavior: `backend-api/tests/Feature/Auth/AuthenticationTest.php`, `backend-api/tests/Feature/AuthApiRegisterTest.php`
- Profile/auth protection and Step 3 endpoints: `backend-api/tests/Feature/ProfileNotificationAndWhatsappVerificationTest.php`, `backend-api/tests/Feature/ProfileTest.php`
- Admin protection: `backend-api/tests/Feature/LocalAdminBootstrapTest.php`
- AIOS onboarding private route protection: `backend-api/tests/Feature/AiosOnboardingRuntimeProofTest.php`
- Renungan private visibility: `backend-api/tests/Feature/CommunityPrivateRenunganVisibilityTest.php`

## Enforcement Guidance

- New portfolio copy must link to evidence routes/files instead of replacing main routes.
- New demo APIs must return safe payloads and hide private data.
- Adapter-only services must say “adapter-ready” or “generic webhook,” not provider-specific claims.
- Simulated services must say “simulated/mock,” not production delivery.
- Any subdomain implementation must be planned separately and validated against this table before deployment.
---

## Related Docs / Tests / Routes / Evidence
- Docs: [Portfolio Index](./README.md), [Subdomain Strategy](./subdomain-strategy.md), [Portfolio Evidence Gate](./Portfolio%20Evidence%20Gate.md)
- Tests: [Proof Checklist](./proof-checklist.md)
- Routes/Evidence: [Evidence Map](./evidence-map.md), `src/app/page.tsx`, `src/app/portfolio*`, `src/app/aios/**`
