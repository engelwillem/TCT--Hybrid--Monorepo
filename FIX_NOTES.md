# Fix Notes

I cleaned the portfolio so the main visitor journey now focuses on the AI Automation Specialist requirement:

- `/` is now a clear AI automation portfolio landing page.
- `/portfolio/ai-client-onboarding` shows the financial advisory onboarding automation case study.
- `/portfolio/operations-dashboard` shows the observability/dashboard case study.
- `/portfolio/ai-knowledge-os` now matches AI workflow operating system/SOP/compliance automation instead of unrelated community surfaces.
- `/aios` remains the live demo dashboard with demo fallback data when the Laravel backend is unavailable.
- Added `.env.example` and `backend-api/.env.example` so local setup is clearer.
- Removed misleading homepage references to unrelated spiritual/community app features.

Recommended local run:

```bash
npm install
npm run dev
```

Then open:

```text
http://localhost:9002
```

For production build:

```bash
npm run build
```
