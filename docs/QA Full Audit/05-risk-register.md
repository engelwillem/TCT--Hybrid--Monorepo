# Risk Register (05)

| Risk ID | Description | Area | Likelihood | Impact | Severity | Mitigation | Release concern |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| R-001 | User registration is blocked | Auth | High | High | 🛑 **Critical** | Fix `/register` and signup mode. | **BLOCKER** |
| R-002 | Session timeout / Login failure | Auth | High | High | 🔴 **Critical** | Verify API mapping for `/auth/login`. | **BLOCKER** |
| R-003 | VerseHub UI Clutter | UX | High | Medium | 🟠 **High** | Hide Nav when sheet is open. | UI Polish |
| R-004 | Avatar Display Failure | Profile | High | Medium | 🟠 **High** | Fix storage path / serve logic. | UX Polish |
| R-005 | Missing Assets (grain.png) | Assets | High | Low | 🟡 **Medium** | Re-upload assets to public root. | Aesthetics |
