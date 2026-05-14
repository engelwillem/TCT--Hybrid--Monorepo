# Portfolio Subdomain Strategy — Step 3 Focus 5

> Strategy only. Do **not** implement DNS, proxy, rewrites, hosting changes, or Step 4 features from this document.

## Strategy Table

| Subdomain | Purpose | Current route/page evidence | Readiness | Required DNS/proxy/deployment work | Auth/security requirement | Portfolio claim status | Risks / notes |
|---|---|---|---|---|---|---|---|
| `www.thechoosentalks.org` | Main public website | `/` via `src/app/page.tsx`; Laravel root redirect in `backend-api/routes/web.php` | Must remain primary | Existing production routing must continue pointing to main app landing | Public; core app auth links remain separate | Main app route-backed | Cannot be replaced by portfolio demos. |
| `portfolio.thechoosentalks.org` | Portfolio/case studies/evidence | `/portfolio/ai-client-onboarding`, `/portfolio/ai-knowledge-os`, `/portfolio/operations-dashboard`, `/portfolio1`, `/portfolio2`, `/portfolio3` | Planned; route-backed in app source | DNS + host/proxy rule to route subdomain to isolated portfolio paths; canonical/SEO review | Public; must avoid private data | Route-ready / deployment not implemented | Must not hijack `/`; must keep claims evidence-based. |
| `aios.thechoosentalks.org` | AIOS onboarding automation MVP/demo | `/aios`, `/aios/runs/[runId]`, `/api/onboarding/**` proxies, Laravel `/api/v1/onboarding/**` | Route-backed MVP | DNS + host/proxy rule to `/aios`; backend API env/CORS/Sanctum review | Public dashboard must show safe/demo data; private onboarding routes remain authenticated | Runtime verified MVP | Must clearly show live/demo/mock labels; no sensitive lead data exposure. |
| `wa.thechoosentalks.org` | WhatsApp automation dashboard if completed | `/wa-reminder`; `apps/wa-dashboard` not proven complete | Partial/planned | DNS + route target only after dashboard source/runtime exists | If dashboard added, require auth/admin/tenant isolation | Partial/configured only | Do not claim completed WA dashboard; current page is a Google Sheet link/info page. |
| `admin.thechoosentalks.org` or existing `/admin` | Protected admin/ops | Next `/admin/analytics/composer`; Laravel `/admin` redirects to `/admintalk/login`; Filament `/admintalk` | Protected backend admin exists; Next admin protection not fully audited | DNS/proxy only after admin auth boundary reviewed; consider routing to Laravel admin not public Next page | Admin-only; strong auth, HTTPS, possible IP/2FA policy | Protected/admin evidence exists for Laravel `/admintalk` | Must remain admin-only; do not expose analytics/ops pages publicly. |
| `api.thechoosentalks.org` | Laravel API | `/api/v1/*` in `backend-api/routes/api.php` | Deployment-dependent | DNS + reverse proxy to Laravel API; CORS/Sanctum/session/env separation | Public/auth/admin per route; rate limiting and private data protections required | API route-backed / deployment-dependent | CORS, Sanctum stateful domains, cookies, CSRF, and environment secrets must be reviewed. |

## Implementation Guardrails for Future Work

- Subdomain routing must map to isolated app routes, not overwrite the main app landing.
- Subdomain work must include CORS/Sanctum/domain-specific environment review.
- Demo routes must never expose real private member/user/lead data.
- Portfolio subdomains must not claim provider integrations or production delivery unless runtime proof exists.
- Admin subdomains must be protected before any public DNS/proxy exposure.

## Current Recommendation

1. Keep `www.thechoosentalks.org` on `/`.
2. Use `/portfolio*` for portfolio content until a dedicated portfolio subdomain is implemented and tested.
3. Use `/aios` for the AIOS MVP demo with visible live/demo/mock labels.
4. Treat `/wa-reminder` as a partial WA automation info/link route, not a dashboard.
5. Keep Laravel Filament `/admintalk` as the proven protected admin surface.
6. Treat `api.thechoosentalks.org` as a future deployment concern requiring CORS/Sanctum review.
---

## Related Docs / Tests / Routes / Evidence
- Docs: [Portfolio Index](./README.md), [No-Overlap Rule](./no-overlap-rule.md), [Runtime Environment](./runtime-environment.md)
- Tests: [Proof Checklist](./proof-checklist.md)
- Routes/Evidence: [Evidence Map](./evidence-map.md), `src/app/portfolio*`, `src/app/aios/**`
