# Recommendations (08)

## Immediate Operational Priorities
- Confirm the real frontend release source used by Tencent Edge.
- Align the frontend release branch with the branch that actually contains the latest fixes.
- Execute manual backend deploy on cPanel for Laravel auth/runtime parity.

## Frontend Recommendations
- Treat `main` as the only active frontend production branch baseline.
- Remove or archive any operational assumption that Tencent production should be reading `frontend-prod`.
- Keep frontend CI as validation-only; do not describe it as frontend production deployment.

## Backend Recommendations
- Keep backend deployment explicitly manual from cPanel until a separate deployment model is re-established and verified.
- Use `deploy.sh` as the canonical release entry point for backend production deploys.
- Verify Laravel auth routes after each manual deploy instead of assuming source changes are live.

## Documentation Recommendations
- Treat older dated audit files as historical evidence, not current runtime truth.
- Keep current operational truth concentrated in:
  - `03-findings-summary.md`
  - `07-release-readiness.md`
  - `09-codex-handoff.md`
  - `13-gemini-codex-collaboration-board.md`
  - `15-bug-separation-matrix.md`

## Deferred Product/UX Work
- Guest/member UX polish
- deeper `/today` ritual refinements
- visual polish outside active release blockers

These should stay deferred until frontend release sync and backend runtime parity are stable.
