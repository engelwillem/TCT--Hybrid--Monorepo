# Portfolio Evidence Map — Step 3 Audit

> Purpose: validate which **AI & Automation portfolio claims** are supported by repository evidence. This document is an audit artifact only. It does **not** move any feature to the production landing page, does **not** implement subdomains, and does **not** mark anything production-ready unless verified by code/tests/routes/configs/runtime pages.

## Scope and Rules

- Main production landing remains `https://www.thechoosentalks.org/` and route `/`.
- Portfolio/AI automation evidence must stay isolated in existing routes such as `/portfolio*`, `/aios`, API routes, backend commands, docs, and tests.
- No invented integrations. Generic webhooks are labeled as generic webhooks only.
- Mock/simulated behavior is labeled as mock/simulated.
- Frontend Genkit/Gemini is labeled as historical/development compatibility, not production orchestration.

---

## Claim Validation Map

### Summary Counts

| Status | Count |
|---|---:|
| Verified | 18 |
| Runtime verified MVP | 1 |
| Partially verified | 3 |
| Simulated/mock | 1 |
| Adapter-ready only | 2 |
| Needs confirmation | 0 |
| Not found | 1 |
| **Total claims audited** | **26** |

### Detailed Claim Map

| # | Claim name | Claim status | Evidence files | Related backend routes or commands | Related frontend routes/pages | Test coverage if available | Manual demo steps if available | Risks / notes |
|---:|---|---|---|---|---|---|---|---|
| 1 | AI provider abstraction | Verified | `backend-api/app/Providers/AppServiceProvider.php`, `backend-api/app/Services/AI/AIProviderInterface.php`, `backend-api/app/Services/AI/OpenAIResponsesClient.php`, `backend-api/app/Services/AI/NullAIProvider.php`, `backend-api/config/ai.php` | Used by services that inject `AIProviderInterface` | API consumers through AI-related pages/proxies | Not directly found | Inspect service container binding in `AppServiceProvider` | Verified as code-level abstraction, not a runtime provider health check. |
| 2 | OpenAI Responses API integration | Verified | `backend-api/app/Services/AI/OpenAIResponsesClient.php`, `backend-api/config/ai.php` | Used by AI provider abstraction and downstream AI services | Indirect through Community AI, VerseHub/Renungan, AIOS if routed | Not directly found | Configure `OPENAI_API_KEY`, call an AI endpoint that uses provider | Real HTTP call to `https://api.openai.com/v1/responses`. Runtime success depends on API key/network. |
| 3 | Claude mentor driver | Verified | `backend-api/app/Services/Mentor/ClaudeMentorDriver.php`, `backend-api/app/Providers/AppServiceProvider.php` | Used through `MentorDriverInterface` binding when configured | Indirect through VerseHub mentor routes/pages | Not directly found | Configure `versehub_mentor.driver=claude` and Claude key, then call VerseHub mentor route | Real Anthropic API code exists; runtime success depends on key/config. |
| 4 | AI safety classifier | Verified | `backend-api/app/Services/AI/AISafetyService.php`, `backend-api/app/Services/AI/CommunityAIService.php`, `backend-api/app/Services/AI/RenunganAIService.php` | Used inside community/renungan AI service flows | Indirect via community/renungan surfaces | Not directly found | Submit sensitive text to supported AI workflow in local environment | Lightweight keyword classifier; not a replacement for clinical/moderation-grade safety systems. |
| 5 | AI telemetry persistence | Partially verified | `backend-api/app/Services/AI/AITelemetryService.php`, `backend-api/database/migrations/2026_05_12_140200_create_ai_activity_logs_table.php`, `backend-api/config/ai.php`, `backend-api/app/Models/AiActivityLog.php` | AI service calls record events | Indirect through AI features | Not directly found | Enable `AI_TELEMETRY_PERSIST=true`, run AI flow, inspect `ai_activity_logs` | Persistence is implemented but disabled by default via config (`persist=false`). Runtime DB persistence must be confirmed per environment. |
| 6 | AI result caching | Verified | `backend-api/app/Services/AI/AIResultCacheService.php`, `backend-api/config/ai.php`, `backend-api/app/Services/AI/CommunityAIService.php` | Used in community AI service | Indirect via `/community` composer AI | Not directly found | Enable cache and repeat same community AI request | Verified in code. Cache backend/runtime behavior depends on environment. |
| 7 | Community AI assistant | Verified | `backend-api/app/Http/Controllers/Api/V1/CommunityAIController.php`, `backend-api/app/Services/AI/CommunityAIService.php`, `src/app/api/community/ai/assist/route.ts`, `backend-api/routes/api.php` | `POST /api/v1/community/ai/assist` under `auth:sanctum` | Next proxy: `POST /api/community/ai/assist`; related UI likely `/community` | Not directly found | Login, open `/community`, trigger AI assist if UI exposes it; or call authenticated API | Requires authentication. Has fallback templates if AI provider/key unavailable. |
| 8 | VerseHub AI Mentor | Verified | `backend-api/app/Services/AI/VerseHubAIService.php`, `backend-api/app/Services/Mentor/OpenAIMentorDriver.php`, `backend-api/app/Services/Mentor/ClaudeMentorDriver.php`, `backend-api/routes/api.php` | `GET /api/v1/versehub/{lang}/{ref}/mentor`; `POST /api/v1/versehub/{lang}/{ref}/mentor/ask` authenticated | `/versehub`, `/versehub/[lang]`, `/versehub/[lang]/[slug]` | Not directly found | Open `/versehub/id`, choose verse, use mentor/ask flow if UI exposes it | AI provider can be OpenAI/Claude/template depending config. Do not claim a specific provider is active in production without env verification. |
| 9 | Renungan AI Mentor | Verified | `backend-api/app/Services/AI/RenunganAIService.php`, `backend-api/app/Services/Renungan/OpenAIRenunganMentorDriver.php`, `backend-api/routes/api.php`, `src/app/api/renungan/personalize/route.ts` | `POST /api/v1/renungan/personalize`; share routes under `/api/v1/renungan/share*` | `/renungan`, `/renungan/share/[token]` | Not directly found | Open `/renungan`; call personalization flow if UI exposes it | Includes safety/privacy metadata. Runtime OpenAI usage depends on configured driver/key. |
| 10 | AIOS onboarding automation pipeline | Runtime verified MVP | `backend-api/routes/api.php`, `backend-api/app/Http/Controllers/Api/V1/OnboardingController.php`, `backend-api/app/Services/Onboarding/OnboardingPipelineService.php`, `backend-api/app/Jobs/Onboarding/ProcessOnboardingLeadJob.php`, `backend-api/database/migrations/2026_05_11_100000_create_onboarding_tables.php`, `backend-api/tests/Feature/AiosOnboardingRuntimeProofTest.php`, `src/app/aios/page.tsx`, `src/app/api/onboarding/dashboard/recent-runs/route.ts` | `POST /api/v1/onboarding/leads`; `GET /api/v1/onboarding/runs/{correlationId}/status`; `GET /api/v1/onboarding/dashboard/summary`; `GET /api/v1/onboarding/dashboard/kpi-detail`; `GET /api/v1/onboarding/dashboard/recent-runs`; auth-only admin detail routes under `/api/v1/onboarding/leads*` and `/logs` | `/aios`, `/aios/runs/[runId]`; Next proxies under `/api/onboarding/dashboard/*` and `/api/onboarding/integrations/test` | `backend-api/tests/Feature/AiosOnboardingRuntimeProofTest.php` passed: 7 tests, 39 assertions | Open `/aios`; if backend is connected and has data it shows “Live backend mode — MVP proof”; otherwise it shows “Demo fallback — backend not connected”. Submit `POST /api/v1/onboarding/leads` and inspect safe status via correlation ID. | Runtime MVP routes are registered and tested. Status/recent-run responses are demo-safe and hide private lead fields. Email remains simulated/mock. CRM/calendar remain generic webhook adapter-ready only unless env URLs are configured. |
| 11 | Onboarding AI summary | Verified | `backend-api/app/Services/Onboarding/OnboardingPipelineService.php` lines for `generateAiSummary()` | Internal pipeline stage `ai_summary_generated` | Reflected in `/aios` demo/live metrics | Not directly found | Trigger onboarding pipeline in a configured backend and inspect events | Depends on `AIProviderInterface`; runtime requires OpenAI/provider configuration. |
| 12 | Onboarding advisor task creation | Verified | `backend-api/app/Services/Onboarding/OnboardingPipelineService.php`, `backend-api/app/Models/OnboardingTask.php`, `backend-api/database/migrations/2026_05_11_101000_create_onboarding_tasks_and_kpis_tables.php` | Internal pipeline stage `advisor_task_created` | `/aios` demo displays advisor tasks | Not directly found | Trigger onboarding lead and inspect `onboarding_tasks` | Verified in code. Runtime route exposure still depends on routing. |
| 13 | Onboarding email delivery or simulation | Simulated/mock | `backend-api/app/Services/Onboarding/OnboardingPipelineService.php` records `welcome_email_sent` with `channel=mock`, `status_label=simulated/mock`, and `delivery=not_sent` | Internal event stage `welcome_email_sent` | `/aios` labels email as “Simulated/mock only — no production email delivery claimed.” | `AiosOnboardingRuntimeProofTest::test_simulated_email_step_is_recorded_honestly` | Inspect onboarding events after pipeline run; open `/aios` and confirm email status card | **Simulated/mock email step. Do not claim real email delivery.** |
| 14 | CRM integration | Adapter-ready only | `backend-api/app/Providers/AppServiceProvider.php`, `backend-api/app/Services/Onboarding/Adapters/WebhookCrmSyncAdapter.php`, `backend-api/app/Services/Onboarding/Adapters/MockCrmSyncAdapter.php`, `backend-api/app/Services/Onboarding/Contracts/CrmSyncAdapterInterface.php`, `backend-api/config/onboarding.php` | Internal pipeline stage `crm_synced`; `POST /api/v1/onboarding/integrations/test`; adapter binding resolves through service container | `/aios` integration test button calls `/api/onboarding/integrations/test` frontend route | `AiosOnboardingRuntimeProofTest::test_generic_webhook_adapters_missing_config_do_not_crash_pipeline` | Configure `ONBOARDING_INTEGRATIONS_MODE=webhook` and optionally `ONBOARDING_CRM_WEBHOOK_URL`; without URL, adapter returns `status=skipped`, `configured=false` safely | **Generic webhook adapter only.** Do not claim HubSpot/Salesforce/etc. |
| 15 | Calendar integration | Adapter-ready only | `backend-api/app/Providers/AppServiceProvider.php`, `backend-api/app/Services/Onboarding/Adapters/WebhookCalendarAdapter.php`, `backend-api/app/Services/Onboarding/Adapters/MockCalendarAdapter.php`, `backend-api/app/Services/Onboarding/Contracts/CalendarAdapterInterface.php`, `backend-api/config/onboarding.php` | Internal pipeline stage `calendar_event_created`; `POST /api/v1/onboarding/integrations/test`; adapter binding resolves through service container | `/aios` integration test button calls `/api/onboarding/integrations/test` frontend route | `AiosOnboardingRuntimeProofTest::test_generic_webhook_adapters_missing_config_do_not_crash_pipeline` | Configure `ONBOARDING_INTEGRATIONS_MODE=webhook` and optionally `ONBOARDING_CALENDAR_WEBHOOK_URL`; without URL, adapter returns `status=skipped`, `configured=false` safely | **Generic webhook adapter only.** Do not claim Google Calendar/Calendly/etc. |
| 16 | WhatsApp reminder automation via Fonnte | Verified | `backend-api/app/Console/Commands/ProcessDueWaRemindersCommand.php`, `backend-api/app/Console/Commands/CreateWaClientCommand.php`, WA migrations `backend-api/database/migrations/2026_04_27_*` to `2026_04_29_*` | `php artisan wa:process-due-reminders`; `php artisan wa:create-client` | `/wa-reminder` is a simple Google Sheet link page | Not directly found for command | Configure WA client/reminders, run `php artisan wa:process-due-reminders --limit=50` | Real Fonnte API send code exists. Requires active client/token/data. `/wa-reminder` is not a full dashboard. |
| 17 | WhatsApp OTP verification from Step 3 | Verified | `backend-api/app/Http/Controllers/Api/V1/UserWhatsappVerificationController.php`, `backend-api/config/whatsapp_verification.php`, `backend-api/app/Providers/AppServiceProvider.php`, `backend-api/routes/api.php`, `backend-api/app/Models/UserWhatsappVerification.php` | Auth routes: `GET /api/v1/profile/whatsapp-verification/status`, `POST /request`, `POST /verify` with throttles | `/profile` likely consumes profile APIs | `backend-api/tests/Feature/ProfileNotificationAndWhatsappVerificationTest.php`, `backend-api/tests/Unit/WhatsappPhoneNormalizerTest.php` | Login, open `/profile`, request/verify WA OTP if UI exposes it; or call authenticated APIs | Verified API and tests. Runtime send depends on Fonnte token/client config. Sensitive code hash is not exposed in tested responses. |
| 18 | Notification preferences from Step 3 | Verified | `backend-api/app/Http/Controllers/Api/V1/UserNotificationPreferenceController.php`, `backend-api/routes/api.php`, `backend-api/app/Models/UserNotificationPreference.php`, `backend-api/database/migrations/2026_05_12_140000_create_user_notification_preferences_table.php` | Auth routes: `GET /api/v1/profile/notification-preferences`, `PUT/PATCH /api/v1/profile/notification-preferences` | `/profile` likely consumes profile APIs | `backend-api/tests/Feature/ProfileNotificationAndWhatsappVerificationTest.php` | Login and update notification preferences from `/profile` if UI exposes it, or call authenticated APIs | Verified API/test coverage. UI wiring should be confirmed separately if needed. |
| 19 | Queue/job automation | Verified | `backend-api/app/Jobs/Onboarding/ProcessOnboardingLeadJob.php`, `backend-api/composer.json` dev script runs queue listener | Onboarding job dispatch in `OnboardingController`; Laravel queue worker command via composer dev | Indirect through `/aios` if backend routes work | Not directly found | Run backend queue worker and dispatch onboarding lead | Queue implementation exists. Runtime depends on queue config/worker. |
| 20 | Scheduled backend tasks | Verified | `backend-api/routes/console.php`, command files under `backend-api/app/Console/Commands/**` | `app:publish-due-posts`, `app:daily-maintenance`, `app:recalculate-user-metrics`, `app:bridge-daily-content`, `app:generate-pulse`, share asset warm/repair commands | Not frontend-accessible | Not directly found | Run `php artisan schedule:list` or individual commands | Verified scheduled definitions. Actual scheduler daemon/cron in production must be confirmed. |
| 21 | Admin/Filament ops pages | Verified | `backend-api/app/Providers/Filament/AdminPanelProvider.php`, `backend-api/app/Filament/Pages/BulkSchedulePosts.php`, `ContentHealthAudit.php`, `OpsTriage.php`, `VerseHubLandingKpi.php`, resources under `backend-api/app/Filament/Resources/**` | Filament panel path `admintalk`; protected by Filament `Authenticate` middleware | `/admin` frontend directory exists separately; Laravel admin is `/admintalk` | Not directly found | Visit backend `/admintalk`, login as admin | Admin panel is protected by Filament middleware. Do not conflate Next `/admin` with Laravel `/admintalk`. |
| 22 | DevSecOps GitHub Actions | Verified | `.github/workflows/devsecops-e2e.yml`, `.github/workflows/codeql-analysis.yml`, `.github/workflows/ops-triage-assistant.yml`, `.github/dependabot.yml` | GitHub Actions only | GitHub repo Actions UI | GitHub workflow execution history not audited here | Run workflows from GitHub Actions | Code exists. Actual pass/fail status depends on GitHub runtime. |
| 23 | Production deployment guardrails | Verified | `.github/workflows/backend-deploy-production.yml`, `scripts/deploy-production.ps1`, `scripts/migrate-production.ps1`, `scripts/rollback-production.ps1`, `scripts/smoke-production.ps1` | GitHub workflow guarded deploy/migration jobs | GitHub Actions UI | Not directly found | Manual dispatch with required approval phrase/SHA in GitHub Actions | Guardrails exist in workflow code. Production readiness depends on secrets/runners/environment. |
| 24 | Docker local infrastructure | Verified | `docker-compose.yml`, `docker/backend/Dockerfile`, `docker/frontend/Dockerfile`, `docker/backend/start.sh`, `docker/frontend/start.sh`, `docker/observability/**` | `npm run docker:up`, `docker compose up --build` | Frontend available at configured port when running | Not directly found | Run `npm run docker:up` | Verified config for MariaDB, Redis, Mailpit, backend, frontend. Runtime not executed in this audit. |
| 25 | `apps/wa-dashboard` completeness | Not found | Filesystem shows only `.dev.err.log`, `.dev.out.log`, `.env.local`, `tsconfig.tsbuildinfo`; no `package.json` or source files found in `apps/wa-dashboard` | None found | None confirmed | None found | Not demoable as an app from current evidence | **Incomplete or not confirmed.** Do not present as a finished WA dashboard. |
| 26 | Frontend Genkit/Gemini usage status | Partially verified | `package.json`, `src/ai/genkit.ts`, `src/ai/dev.ts` | No production backend route depends on frontend Genkit from inspected evidence | Genkit dev scripts only: `npm run genkit:dev`, `npm run genkit:watch` | `src/ai/orchestration.resolvers.test.ts` exists | Run Genkit dev scripts for local/dev if needed | **Historical/development compatibility, not production orchestration.** `src/ai/genkit.ts` explicitly says frontend-side AI runtime is intentionally not used in production flows. |

---

## Access Map

| Route / surface | Access type | Evidence | Notes |
|---|---|---|---|
| `/` | Public | `src/app/page.tsx` | Main production landing. Must remain untouched. |
| `/profile` | Authenticated | `src/app/profile/page.tsx`, backend routes in `backend-api/routes/api.php` | Profile APIs include notification preferences and WhatsApp verification under auth:sanctum. |
| `/aios` | Public frontend page with live API/demo fallback | `src/app/aios/page.tsx`, `src/app/api/onboarding/dashboard/recent-runs/route.ts`, backend routes in `backend-api/routes/api.php` | Portfolio/AIOS dashboard route. Does not replace `/`. Labels “Live backend mode — MVP proof” only when summary/detail/recent-runs APIs load; otherwise labels “Demo fallback — backend not connected.” |
| `/aios/runs/[runId]` | Public frontend demo/detail page | `src/app/aios/runs/[runId]/page.tsx`, `src/features/aios/demo-data.ts` | Uses demo run data if live data unavailable. |
| `/community` | Public page with authenticated actions | `src/app/community/page.tsx`, backend routes in `backend-api/routes/api.php` | Posting/AI assist requires auth. Feed routes include public reads. |
| `/versehub` and `/versehub/[lang]` | Public with authenticated actions for some features | `src/app/versehub/**`, `backend-api/routes/api.php` | Mentor ask and reflections require auth; some reader data/routes are public. |
| `/renungan` | Public/auth mixed | `src/app/renungan/page.tsx`, `backend-api/routes/api.php` | Personalization endpoint public in backend route list; share creation/deletion authenticated. |
| `/wa-reminder` | Public frontend info/link page | `src/app/wa-reminder/page.tsx` | Simple Google Sheet link page; not a complete WA dashboard. |
| `/admin` | Public/unknown frontend route | `src/app/admin/analytics/composer/page.tsx` | Next route exists. Access protection not audited here. Laravel Filament admin is separate `/admintalk`. |
| `/admintalk` | Admin-only / protected backend panel | `backend-api/app/Providers/Filament/AdminPanelProvider.php` | Filament panel protected by `Authenticate` middleware. |
| `/portfolio/ai-client-onboarding` | Public portfolio page | `src/app/portfolio/ai-client-onboarding/page.tsx` | Portfolio case study page, isolated from `/`. |
| `/portfolio/ai-knowledge-os` | Public portfolio page | `src/app/portfolio/ai-knowledge-os/page.tsx` | Portfolio case study page, isolated from `/`. |
| `/portfolio/operations-dashboard` | Public portfolio page | `src/app/portfolio/operations-dashboard/page.tsx` | Portfolio case study page, isolated from `/`. |
| `/portfolio1` | Public portfolio page | `src/app/portfolio1/page.tsx` | Standalone portfolio route. |
| `/portfolio2` | Public portfolio page | `src/app/portfolio2/page.tsx` | Standalone portfolio route. |
| `/portfolio3` | Public portfolio page | `src/app/portfolio3/page.tsx` | Standalone portfolio route. |
| `POST /api/v1/community/ai/assist` | Authenticated API-only | `backend-api/routes/api.php`, `CommunityAIController.php` | Proxied by `src/app/api/community/ai/assist/route.ts`. |
| `POST /api/v1/renungan/personalize` | API-only | `backend-api/routes/api.php`, `RenunganPersonalizationController.php` | Public in current backend route group. |
| `GET /api/v1/versehub/{lang}/{ref}/mentor` | API-only public | `backend-api/routes/api.php` | Mentor insights route. |
| `POST /api/v1/versehub/{lang}/{ref}/mentor/ask` | Authenticated API-only | `backend-api/routes/api.php` | User question route. |
| `GET /api/v1/profile/notification-preferences` | Authenticated API-only | `backend-api/routes/api.php`, `UserNotificationPreferenceController.php` | Covered by feature test. |
| `PUT/PATCH /api/v1/profile/notification-preferences` | Authenticated API-only | `backend-api/routes/api.php`, `UserNotificationPreferenceController.php` | Covered by feature test. |
| `GET /api/v1/profile/whatsapp-verification/status` | Authenticated API-only | `backend-api/routes/api.php`, `UserWhatsappVerificationController.php` | Covered by feature test. |
| `POST /api/v1/profile/whatsapp-verification/request` | Authenticated API-only | `backend-api/routes/api.php`, `UserWhatsappVerificationController.php`, `AppServiceProvider.php` | Throttled by `whatsapp-otp-request`. Covered by feature test. |
| `POST /api/v1/profile/whatsapp-verification/verify` | Authenticated API-only | `backend-api/routes/api.php`, `UserWhatsappVerificationController.php`, `AppServiceProvider.php` | Throttled by `whatsapp-otp-verify`. Covered by feature test. |
| `php artisan wa:process-due-reminders` | Command-only | `backend-api/app/Console/Commands/ProcessDueWaRemindersCommand.php` | Sends due WA reminders via Fonnte when configured. |
| `php artisan app:daily-maintenance` and scheduled commands | Command-only | `backend-api/routes/console.php`, `backend-api/app/Console/Commands/**` | Scheduler must be configured externally. |
| `apps/wa-dashboard` | Not currently accessible | Filesystem scan of `apps/wa-dashboard` | Missing app source/package files. |

---

## Main App Safety / No-Overlap Assessment

| Question | Assessment |
|---|---|
| Does any portfolio or AI demo overwrite the main landing page? | No evidence found. Main landing remains `src/app/page.tsx`. Portfolio/AIOS pages are separate routes. |
| Does any AIOS/portfolio page interfere with `/`? | No. AIOS is under `/aios`; portfolio pages are under `/portfolio/*`, `/portfolio1`, `/portfolio2`, `/portfolio3`. |
| Does Step 3 profile work affect unrelated profile features? | Step 3 APIs are scoped under authenticated profile endpoints for notification preferences and WhatsApp verification. Feature tests also check privileged profile fields cannot be mass assigned. Evidence: `ProfileNotificationAndWhatsappVerificationTest.php`. |
| Are admin-only features protected? | Laravel Filament panel `/admintalk` is protected by Filament `Authenticate` middleware in `AdminPanelProvider.php`. Next `/admin` route access protection was not fully audited. |
| Which features should later be isolated by subdomain? | Portfolio case studies, AIOS demo/dashboard, WA automation dashboard if completed, Laravel API/admin surfaces. See recommendation table below. |

---

## Subdomain Recommendation Only — Do Not Implement Yet

| Subdomain | Purpose | Current matching route/page if any | Readiness level | Risks |
|---|---|---|---|---|
| `www.thechoosentalks.org` | Main public website | `/` (`src/app/page.tsx`) | Ready/current main app | Must not be overwritten by portfolio demos. |
| `portfolio.thechoosentalks.org` | Portfolio and case studies | `/portfolio/ai-client-onboarding`, `/portfolio/ai-knowledge-os`, `/portfolio/operations-dashboard`, `/portfolio1-3` | Route-ready, subdomain not implemented | Needs routing/deployment decision; keep separate from main landing. |
| `aios.thechoosentalks.org` | AIOS demo/dashboard | `/aios`, `/aios/runs/[runId]` | Demo route exists; live backend needs route/runtime confirmation | Avoid exposing real client data; use demo/fake data unless auth and data policy are ready. |
| `wa.thechoosentalks.org` | WhatsApp automation dashboard if completed | `/wa-reminder`; `apps/wa-dashboard` not confirmed | Not ready as dashboard | Current `/wa-reminder` is a Google Sheet link page; `apps/wa-dashboard` lacks source/package evidence. |
| `admin.thechoosentalks.org` or existing `/admintalk` | Protected admin operations | Backend Filament `/admintalk` | Admin panel exists | Requires auth, secure deployment, IP/2FA policy if exposed. |
| `api.thechoosentalks.org` | Laravel API if deployment supports it | Backend API routes under `/api/v1/*` | Backend API exists | Requires CORS/session/Sanctum/domain config and deployment separation. |

---

## Evidence Gaps Before Step 4

| Gap | Why it matters | Affected portfolio claim | Recommended next action | Coding required? |
|---|---|---|---|---|
| AIOS backend route visibility | Resolved in Focus 2: route-list now shows onboarding MVP endpoints | AIOS onboarding pipeline, AIOS live API dashboard | Keep as Runtime verified MVP only, not production-ready. Continue to require safe demo data and auth for private lead detail/log routes. | Completed for MVP. |
| Onboarding adapter interface bindings | Resolved in Focus 2: `AppServiceProvider` binds CRM/calendar interfaces to mock or generic webhook adapters based on config | CRM/calendar integration, onboarding pipeline | Keep language as “generic webhook adapter-ready”; missing webhook URLs skip safely and do not crash pipeline. | Completed for MVP. |
| CRM/calendar providers are generic webhooks | Prevents false claims about HubSpot/Salesforce/Google Calendar/Calendly | CRM integration, calendar integration | Keep language as “generic webhook adapter / provider not confirmed.” | No. |
| Onboarding email is simulated | Avoids overclaiming real email automation | Onboarding email delivery | Keep label “Simulated/mock email step”; event payload records `delivery=not_sent`. | Yes only if real email delivery is required later. |
| AI telemetry persistence disabled by default | Code exists but DB persistence requires env config | AI telemetry persistence | Document config requirement; optionally add test later. | Not for audit. |
| `apps/wa-dashboard` incomplete | Prevents presenting an unfinished app as a dashboard | WA dashboard/completeness | Either remove from claims or scaffold/document in a future step. | Yes, later if needed. |
| Next `/admin` access protection not fully audited | Could expose admin analytics page if intended admin-only | Admin/ops pages | Review `src/app/admin/**` auth guard behavior before public portfolio claims. | Maybe. |
| Runtime page demos not executed in browser | Source routes exist, but visual runtime not verified | Portfolio route demo claims | Run local dev server and manually open routes in a future focus if requested. | No unless broken. |
| Production readiness not verified | User explicitly requested not to mark production-ready without verification | All portfolio claims | Use “code exists”, “route exists”, “adapter-ready”, or “demo” language only. | No. |

---

## Validation Commands Requested

Validation was run as a safe audit-only activity. Because the Windows shell did not keep `cd backend-api && php artisan ...` in the expected working directory, equivalent PowerShell/root-path invocations were used where necessary.

| Command | Result | Notes |
|---|---|---|
| `php backend-api/artisan route:list --path=onboarding` | Passed | Route list generated successfully and now shows 10 onboarding routes, including intake, status by correlation ID, dashboard summary/KPI/recent-runs, integration test, and authenticated lead/log/admin routes. |
| `php artisan test` from `backend-api` via PowerShell `Set-Location` | Passed | 165 tests passed, 783 assertions, duration 535.29s. Local `database/testing.sqlite` was recreated first because a prior parallel test run corrupted the SQLite file. |
| `php artisan test tests/Feature/AiosOnboardingRuntimeProofTest.php` from `backend-api` via PowerShell `Set-Location` | Passed | 7 tests passed, 39 assertions, duration 72.10s after recreating the local testing SQLite DB. Covers intake validation, run creation, safe status payload, safe dashboard/recent-runs payload, missing generic webhook config skip behavior, simulated email labeling, and auth blocking for private routes. |
| `php artisan test tests/Feature/ProfileNotificationAndWhatsappVerificationTest.php` from `backend-api` via PowerShell `Set-Location` | Passed | 12 tests passed, 51 assertions, duration 111.46s after recreating the local testing SQLite DB. Covers notification preferences, WhatsApp OTP request/verify/status, unauthenticated protection, cross-user OTP protection, no sensitive OTP fields in responses, and profile privileged-field mass assignment guard. |
| `php artisan test tests/Unit/WhatsappPhoneNormalizerTest.php` from `backend-api` via PowerShell `Set-Location` | Passed | 3 tests passed, 14 assertions, duration 0.99s. Covers supported international formats, invalid inputs, and configurable default country codes. |





---

## Related Docs / Tests / Routes / Evidence
- Docs: [Portfolio Index](./README.md), [Feature Matrix](./feature-matrix.md), [Step 3 Runtime Proof](./step-3-runtime-proof.md)
- Tests: [Proof Checklist](./proof-checklist.md)
- Routes/Evidence: `src/app/**`, `src/app/api/**`, `backend-api/routes/api.php`, [Runtime Environment](./runtime-environment.md)
