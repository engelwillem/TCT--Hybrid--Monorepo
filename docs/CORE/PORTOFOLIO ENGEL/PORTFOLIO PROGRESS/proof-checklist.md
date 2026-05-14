# Portfolio Proof Checklist — Step 3 Focus 4

> Purpose: A claim can be used in the AI & Automation portfolio only when its proof status is honest, evidence-backed, and does not affect the main app.

## Feature Proof Matrix

| Feature | Can open page | Can log in, if applicable | Can perform feature | Can see result | Can verify database/log evidence | Can run test | Can show screenshot/demo | Current status | Required next proof action |
|---|---|---|---|---|---|---|---|---|---|
| Main landing | Source route exists at `/` | N/A | N/A | Page/source exists; backend root redirects in decoupled mode | Funnel analytics can record landing events | `backend-api/tests/Feature/UiSmokeTest.php`, `backend-api/tests/Feature/ExampleTest.php` | Yes, manual browser screenshot still needed for current runtime | test verified only | Run local frontend and capture `/` screenshot without modifying route. |
| Login/auth | `/login` route/source exists; Laravel compatibility redirects to `/admintalk/login` | Yes | Login API and web auth covered | Token/auth responses covered | User/token DB state via tests | `AuthApiRegisterTest.php`, `Auth/AuthenticationTest.php`, `LocalAdminBootstrapTest.php` | Yes, with local test account | test verified only | Confirm current frontend `/login` manually against backend. |
| Profile + notification preferences | `/profile` route/source exists | Required | Save/reload preference API covered | API response returns preferences | `user_notification_preferences` table | `ProfileNotificationAndWhatsappVerificationTest.php`, `ProfileTest.php` | Yes, after login | test verified only | Confirm frontend UI save/reload manually. |
| WhatsApp OTP verification | `/profile` source likely consumes profile APIs | Required | Request, wrong OTP, correct OTP covered in tests | Status endpoint confirms verified state | `user_whatsapp_verifications` table; Fonnte HTTP faked in tests | `ProfileNotificationAndWhatsappVerificationTest.php`, `WhatsappPhoneNormalizerTest.php` | Yes, with local/faked or real configured account | test verified only | Test real Fonnte send only with approved token/client; do not claim external send until tested. |
| AIOS onboarding MVP | `/aios` route exists | Not required for public MVP dashboard; private routes require auth | Intake, status, summary, recent-runs, adapter skip covered | `/aios` shows live or demo fallback labels | Onboarding lead/run/event tables | `AiosOnboardingRuntimeProofTest.php` | Yes | runtime verified MVP | Run browser demo and optionally seed a safe demo run for live mode screenshot. |
| Community AI assistant | `/community` route exists | Required for assist action | Backend AI assist endpoint covered | JSON response/fallback visible via API/UI if wired | AI telemetry only if enabled | `CommunityAIAssistApiTest.php` | Yes, after login if UI exposes action | test verified only | Manually trigger community AI UI and document fallback/provider mode. |
| VerseHub AI mentor | `/versehub` route exists | Mentor insights public; ask may require auth | Mentor insights/ask covered | Mentor response shape visible | Logs/telemetry only if configured | `VerseHubMentorApiTest.php`, `VerseHubMentorGroundingTest.php` | Yes | test verified only | Manual demo with configured template/OpenAI/Claude mode label. |
| Renungan AI mentor | `/renungan` route exists | Depends on personalization/memory mode | Personalization/safety modes covered | Safety/personalization payload visible | Session memory and telemetry tests where applicable | `RenunganPersonalizationModeSafetyTest.php`, `RenunganPersonalizationPipelineQualityTest.php`, `RenunganPersonalizationTelemetryTest.php` | Yes | test verified only | Manual demo with privacy-safe input and provider/fallback label. |
| WhatsApp reminder automation | `/wa-reminder` info/link page exists; command exists | Admin/operator context | Command code exists; runtime external send not tested here | Logs if command is run | WA tables/logs | Not directly covered by a dedicated command test in this gate | Limited: page is Google Sheet link, not dashboard | configured only | Add/run command test or perform controlled local dry run; do not claim complete dashboard. |
| DevSecOps workflows | GitHub workflow files exist | GitHub repo access | CI/CD configured for checks/deploy/triage | GitHub Actions UI when run | Workflow artifacts/logs in GitHub | Workflow runtime not run locally here | Yes, GitHub UI screenshot if available | configured only | Capture actual passing workflow run before claiming runtime CI success. |
| Docker local infrastructure | `docker-compose.yml` defines services | Depends on app/admin routes | `docker compose up --build` configured | Local services expose ports | Container logs/healthchecks | Not run in this gate | Yes, once containers are running | configured only | Run `npm run docker:up` and record healthcheck status. |
| Ops/observability configs | Observability config files exist | Unknown | Prometheus/Grafana configs exist, but no compose services found | Dashboards/probes configured but runtime not verified | Prometheus/Grafana/Alertmanager logs if services added/run | Not run in this gate | Yes, after service wiring/runtime | configured only | Add/confirm compose services or deployment config before claiming accessible observability UI. |

## Before Claiming a Feature in Portfolio

- [ ] Route exists.
- [ ] Page/API opens.
- [ ] Action works.
- [ ] Result is visible.
- [ ] Data/log evidence exists.
- [ ] Tests pass.
- [ ] Privacy is protected.
- [ ] Copy is honest.
- [ ] Main app is not affected.

## Status Vocabulary

- **proven** — page/API/action/result/data/tests/manual proof all confirmed.
- **runtime verified MVP** — enough runnable proof for an honest MVP demo, with limitations disclosed.
- **test verified only** — automated tests pass, but current manual/browser runtime proof is not captured.
- **configured only** — config/source exists, but runtime was not started or verified.
- **adapter-ready only** — generic adapter interface exists; provider-specific integration is not proven.
- **simulated/mock** — intentionally not real delivery/integration; must be labeled.
- **not found** — no usable source/config/runtime evidence found.
---

## Related Docs / Tests / Routes / Evidence
- Docs: [Portfolio Index](./README.md), [Feature Matrix](./feature-matrix.md), [Demo Guide](./demo-guide.md)
- Tests: backend feature/unit tests listed in this checklist and in [Evidence Map](./evidence-map.md)
- Routes/Evidence: `backend-api/routes/api.php`, `src/app/profile/page.tsx`, `src/app/aios/page.tsx`
