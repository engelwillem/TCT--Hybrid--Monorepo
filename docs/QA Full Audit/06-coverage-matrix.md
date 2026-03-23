# Coverage Matrix (06)

| Area / Feature | Tested? | Depth | Test Types | Notes | Gaps |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Landing Page** | ✅ Yes | Deep | Snapshot / Smoke | Basic layout and CTAs active. | None |
| **Login Flow** | ✅ Yes | Deep | Negative / UI | Discovered broken API (404) and confusing button. | Valid credentials testing. |
| **Registration** | ✅ Yes | Deep | Negative / URL | Discovered missing path (404) and broken mode switch. | None |
| **Today Ritual** | ✅ Yes | Moderate | UI / Data | Verified data flow and UI rail layout. | Form submisison. |
| **VerseHub** | ✅ Yes | Deep | UX / Navigation | Found conflict between Nav and Verse Sheet. | Search functionality deeper check. |
| **Community Feed** | ✅ Yes | Moderate | Permission / UI | Real data found. Silent guest block found. | Pagination, Feed scrolling. |
| **Paths** | ✅ Yes | Smoke | UI / Message | Empty state confirmed. | Final path content. |
| **Profile** | ✅ Yes | Smoke | Permission | Entry gated correctly for guest. | CRUD / Avatar Upload. |
