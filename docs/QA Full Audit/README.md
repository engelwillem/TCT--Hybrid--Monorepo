# Senior QA Audit - TCT Hybrid Monorepo

## Audit Name
TCT Hybrid Monorepo Deep QA Audit (Reality Sync)

## Target Website
[https://www.thechoosentalks.org/](https://www.thechoosentalks.org/)

## Date
2026-03-22

## Current Audit Status
🟠 **IN PROGRESS**

Current project state is no longer a generic "deploy issue". The operative baseline is:
- **Frontend:** Next.js auto-deploys from GitHub monorepo into Tencent Edge from `main`.
- **Backend:** Laravel does **not** auto-deploy; it must be pulled and deployed manually from cPanel.
- **Main risk right now:** production frontend is likely serving a stale or misaligned release source, while some backend auth/runtime fixes still depend on manual cPanel deploy.

## Important Reading Order
1. `03-findings-summary.md` for the current hybrid-layer summary.
2. `07-release-readiness.md` for the present go/no-go decision.
3. `09-codex-handoff.md` for engineering execution details.
4. `13-gemini-codex-collaboration-board.md` and `15-bug-separation-matrix.md` for FE/BE dependency separation.
5. `00a-current-deploy-truth.md` for the current deploy reality baseline.

## Folder Interpretation Rules
- Files in `01-audits/` are mostly **historical audit snapshots**.
- Files in `09-handover/` and the root summary docs are the **current operational source of truth** unless a newer update overrides them.
- Historical documents should not be read as today's runtime truth without cross-checking against the handoff and blocker documents.
- Any old assumption that Tencent production deploys from `frontend-prod` is obsolete unless preserved only as historical context.

## Folder Summary
- `00-audit-plan.md`: audit objectives and strategy.
- `01-scope-and-assumptions.md`: current environment baseline and hybrid assumptions.
- `03-findings-summary.md`: current summary by layer.
- `07-release-readiness.md`: go/no-go decision using current hybrid reality.
- `08-recommendations.md`: action-oriented next steps.
- `09-codex-handoff.md`: engineering execution handoff.
- `13-gemini-codex-collaboration-board.md`: active collaboration board.
- `15-bug-separation-matrix.md`: frontend vs backend dependency matrix.

## Collaboration Roles
- **Gemini:** browser QA, repro evidence, retest validation.
- **Codex:** engineering investigation, source-of-truth analysis, code and release-path fixes.
