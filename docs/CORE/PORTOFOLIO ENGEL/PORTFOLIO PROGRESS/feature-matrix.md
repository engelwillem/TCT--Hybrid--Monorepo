# Recruiter/Client-Safe Feature Matrix

Status vocabulary allowed:
- Verified
- Runtime verified MVP
- Test verified only
- Configured only
- Adapter-ready only
- Simulated/mock
- Experimental
- Not found

| Feature | Category | Claim status | Runtime verified | Test coverage | UX proof available | Mocked/simulated? | Adapter-ready only? | Production-ready? | Evidence files | Demo route/page | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Main landing page safety | Core app | Test verified only | Partial | Yes | Partial | No | No | Not claimed | `src/app/page.tsx`, `backend-api/tests/Feature/UiSmokeTest.php` | `/` | Must remain untouched by portfolio scope. |
| Login auth backend API | Auth | Verified | Yes (API direct) | Yes | Partial | No | No | Not claimed | `backend-api/routes/api.php`, auth tests | `/login`, `/api/auth/login` | Frontend proxy runtime can be environment-sensitive. |
| Notification preferences | Profile | Verified | Partial | Yes | Partial | No | No | Not claimed | Step 3 controller/model/tests | `/profile` | Auth-only and user-scoped. |
| WhatsApp OTP verification API | Profile/WA | Verified | Partial | Yes | Partial | No | No | Not claimed | verification controller/model/tests | `/profile` | Hash storage + expiry + attempts validated. |
| Real Fonnte OTP delivery | Provider integration | Configured only | No (inconsistent) | Partial | No | No | No | No | provider config + OTP endpoint logs | `/profile` | Must not be claimed successful without live provider proof. |
| AIOS onboarding flow | AI automation | Runtime verified MVP | Yes (MVP) | Yes | Yes | Partial (email step) | Partial | Not claimed | onboarding services/routes/tests | `/aios` | Email step explicitly simulated/mock. |
| CRM sync | Integrations | Adapter-ready only | No | Partial | Demo-safe only | No | Yes | No | webhook adapter files/config | `/aios` | Generic webhook, not vendor claim. |
| Calendar sync | Integrations | Adapter-ready only | No | Partial | Demo-safe only | No | Yes | No | webhook adapter files/config | `/aios` | Generic webhook, not vendor claim. |
| Community AI assist | AI feature | Test verified only | Partial | Yes | Partial | Fallback possible | No | Not claimed | community AI controller/service/tests | `/community` | Provider runtime/env dependent. |
| VerseHub mentor | AI feature | Test verified only | Partial | Yes | Partial | Fallback possible | No | Not claimed | mentor drivers/tests/routes | `/versehub` | Do not claim fixed provider runtime. |
| Renungan personalization | AI feature | Test verified only | Partial | Yes | Partial | Fallback possible | No | Not claimed | renungan services/tests/routes | `/renungan` | Runtime depends on config/provider. |
| WA reminder dashboard app | WA ops | Not found | No | No | No | N/A | N/A | No | `apps/wa-dashboard` incomplete evidence | N/A | Do not present as completed app. |
| Prometheus/Grafana local observability | Ops | Configured only | Partial | N/A | Partial | No | No | Not claimed | `docker/observability/**`, compose services | Local ops ports | Runtime proof required per environment/session. |
| Jenkins pipeline setup | CI/CD | Configured only | Partial | N/A | No | No | No | Not claimed | docs + scripts/workflow references | N/A | Treat as operational config unless runtime evidence is shown. |

## Related Docs / Tests / Routes / Evidence
- Docs: [Portfolio Index](./README.md), [Architecture Proof](./architecture-proof.md), [Runtime Environment](./runtime-environment.md), [Demo Guide](./demo-guide.md)
- Tests: [Proof Checklist](./proof-checklist.md)
- Evidence: [Evidence Map](./evidence-map.md), [Portfolio Evidence Gate](./Portfolio%20Evidence%20Gate.md)
