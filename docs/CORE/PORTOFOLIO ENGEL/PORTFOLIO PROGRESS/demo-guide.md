# Demo Guide (Screenshot/Video Preparation)

## Demo Safety Rules
- Use truthful labels matching current proof status.
- Never claim provider success unless it is visible in runtime.
- If fallback/simulated mode appears, show it and state it.

## Local Demo Account (if needed)
- Email: `engel.willem@gmail.com`
- Password: local-only, do not expose in public recordings or docs intended for broad sharing.

## Demo Scenarios

### 1) AIOS dashboard
- Route/page: `/aios`
- Login requirement: not always for read mode; depends on exposed actions.
- Required env/services: frontend + backend runtime, DB.
- Safe demo flow:
  1. Open `/aios`.
  2. Show runtime mode labels.
  3. Show summary/recent runs if available.
- Expected visible result: dashboard loads with either live MVP mode or demo fallback messaging.
- What NOT to claim: full production orchestration or guaranteed external integrations.
- Recommended screenshots: page hero/status cards, run status block, integration status notes.
- Known caveats: local runtime lag can affect freshness/load speed.

### 2) Profile settings
- Route/page: `/profile`
- Login requirement: yes.
- Required env/services: auth API + profile APIs.
- Safe demo flow:
  1. Login.
  2. Open profile settings.
  3. Toggle notification preferences and save.
- Expected visible result: success message + persisted values on reload.
- What NOT to claim: enterprise preference orchestration.
- Recommended screenshots: preferences form before/after save.
- Caveats: frontend runtime responsiveness can vary locally.

### 3) Notification preferences API UX
- Route/page: `/profile` (notification section)
- Login requirement: yes.
- Required env/services: backend profile routes.
- Safe demo flow: update `email/in_app/whatsapp/timezone/quiet hours`, reload.
- Expected visible result: updated values persist.
- What NOT to claim: cross-channel campaign engine.
- Screenshot points: save confirmation, reloaded values.

### 4) WhatsApp OTP verification
- Route/page: `/profile` (WA verification section)
- Login requirement: yes.
- Required env/services: backend OTP endpoints, optional Fonnte connectivity.
- Safe demo flow:
  1. Enter phone number.
  2. Request OTP.
  3. Verify with OTP if provider/runtime supports.
- Expected visible result: clear success/error status with no secret leakage.
- What NOT to claim: guaranteed live delivery in every environment.
- Screenshot points: request state, verify state, status badge.
- Caveats: provider/network-dependent.

### 5) VerseHub mentor
- Route/page: `/versehub` or `/versehub/[lang]/[slug]`
- Login requirement: mixed; ask action often auth-required.
- Required env/services: AI provider config for live responses.
- Safe demo flow: show route loading + mentor panel behavior.
- Expected visible result: response/fallback behavior.
- What NOT to claim: always-live specific provider without proof.
- Screenshot points: prompt area + result panel.

### 6) Renungan personalization
- Route/page: `/renungan`
- Login requirement: mixed depending action.
- Required env/services: renungan APIs and provider config.
- Safe demo flow: trigger personalization and show result/fallback.
- Expected visible result: generated/personalized content response.
- What NOT to claim: guaranteed therapeutic/clinical outcomes.
- Screenshot points: input + generated result.

### 7) Community AI assist
- Route/page: `/community`
- Login requirement: yes for assist action.
- Required env/services: community AI endpoint + auth.
- Safe demo flow: show assist request and resulting suggestion/fallback.
- Expected visible result: assist output appears.
- What NOT to claim: production moderation replacement.
- Screenshot points: composer + AI output.

### 8) Admin/Ops surfaces (safe subset)
- Route/page: backend `/admintalk` (Laravel Filament), optional frontend `/admin` route by policy.
- Login requirement: admin access required.
- Required env/services: backend admin runtime.
- Safe demo flow: show non-sensitive overview page only.
- Expected visible result: protected admin area and auth gate.
- What NOT to claim: unrestricted admin access or full production observability.

### 9) Observability tools
- Routes/pages: local Grafana/Prometheus endpoints (if running).
- Login requirement: environment-dependent.
- Required services: observability stack running.
- Safe demo flow: show health/metrics page availability.
- Expected visible result: tool UI reachable.
- What NOT to claim: production SLO/SLA coverage unless proven.

## Related Docs / Tests / Routes / Evidence
- Docs: [Feature Matrix](./feature-matrix.md), [Runtime Proof Checklist](./runtime-proof-checklist.md), [Evidence Integrity Rules](./evidence-integrity-rules.md)
- Routes: `src/app/**`, `src/app/api/**`, `backend-api/routes/api.php`
- Tests: [Proof Checklist](./proof-checklist.md)
- Evidence: [Evidence Map](./evidence-map.md)
