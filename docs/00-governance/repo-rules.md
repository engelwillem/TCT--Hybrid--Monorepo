# Repository Rules

## Monorepo Architecture
This repository implements a Hybrid Monorepo architecture joining a Laravel 11 Backend (API & Admin) and a Next.js 14 Frontend (App Router, Client Components).

## Core Principles
1. **Decoupled Data, Coupled Experience**: Laravel remains stateless API, Next.js handles complex client state and UI routing.
2. **Spiritual Relevance Engine**: The design philosophy prohibits "content silos." Every long-form content must offer a handoff to the response layer (Community).
3. **API Contracts**: Existing domains and backend endpoints MUST NOT be aggressively rewritten unless necessary for parity. Progressive enhancement is prioritized.
4. **No Feature Bleed**: Keep components strictly typed and domain-specific unless explicitly promoted to `src/components/shared` or `src/components/system`.

## Technology Stack
- **Backend:** Laravel 11, Sanctum (Token Auth, No Stateful SPA for E2E speed), MySQL.
- **Frontend:** Next.js (React), Tailwind CSS, Framer Motion, Zustand (if needed).
- **Testing:** Playwright for E2E, acting through full stack bypass modes where necessary.
