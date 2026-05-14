# Evidence Integrity Rules

These rules are mandatory for portfolio safety and technical honesty.

## Core Rules
- Never claim provider integration success without runtime proof.
- Never claim production readiness without runtime + test + UX evidence.
- Mark simulated/mock behavior explicitly.
- Mark adapter-ready behavior explicitly.
- Screenshots and recordings must come from real runtime states.
- No fake dashboards.
- No fake metrics.
- No fake AI orchestration claims.
- Avoid misleading recruiter/client language.
- Prefer runtime proof over architecture diagrams alone.

## Claim Hygiene
- A route existing is not equal to a proven feature.
- Passing tests are strong evidence but still distinct from UX/runtime proof.
- Configured infra is not equivalent to operational proof.

## Sensitive Data Hygiene
- Do not expose raw OTPs, tokens, secrets, or password hashes.
- Keep local credentials out of public artifacts.
- Use redaction when sharing logs/screenshots.

## Status Taxonomy (enforced)
Use only:
- Verified
- Runtime verified MVP
- Test verified only
- Configured only
- Adapter-ready only
- Simulated/mock
- Experimental
- Not found

## Related Docs / Tests / Routes / Evidence
- Docs: [Feature Matrix](./feature-matrix.md), [Portfolio Evidence Gate](./Portfolio%20Evidence%20Gate.md), [Proof Checklist](./proof-checklist.md)
- Evidence: [Evidence Map](./evidence-map.md), [Runtime Proof Checklist](./runtime-proof-checklist.md)
- Governance: [No-Overlap Rule](./no-overlap-rule.md)
