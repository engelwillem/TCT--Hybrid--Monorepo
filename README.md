# TheChoosenTalks

A premium spiritual content platform built on a decoupled architecture:

* **Next.js** as the edge-ready frontend.
* **Laravel** as the backend API + MariaDB.
* **Firebase** for authentication and real-time services.

## Main Tech Stack

* **Framework:** Next.js 15 (App Router)
* **Backend API:** Laravel 12 (`backend-api`)
* **Frontend:** React 19 + TypeScript
* **Styling:** Tailwind CSS v4
* **Animations:** Framer Motion
* **UI Components:** Shadcn UI + Lucide Icons
* **Auth & Realtime:** Firebase Auth + Firestore

## Application Structure

* `/` → Main landing page
* `/renungan` → Main daily devotional ritual
* `/today` → Legacy route that redirects to `/renungan`
* `/community` → Community feed and interactions
* `/versehub` → Modern Bible reader
* `/channels` → Learning spaces and mentorship programs
* `/paths` → Structured study paths / journeys

## Design & Aesthetics

* **Active Theme:** Light editorial spiritual
* **Visual Style:** Soft gradients, elevated cards, subtle textures

### Typography

* **Headings:** Serif brand styles (`tct-serif`)
* **Body:** Sans-serif UI stack used throughout the project

## Local Development

```bash
npm install
npm run dev
```

The application will run at:

```bash
http://localhost:9002
```

Before running the app, prepare the environment files:

* **Frontend:** copy `.env.example` to `.env.local`
* **Laravel Backend:** copy `backend-api/.env.example` to `backend-api/.env`

The frontend will call Next.js `/api/*` endpoints, which are proxied to Laravel (`LARAVEL_API_BASE_URL`).

## Firebase Studio

To keep the app running in Firebase Studio (frontend-only mode), use:

```bash
npm install
npm run dev:studio
```

### Notes

* If `LARAVEL_API_BASE_URL` is not yet available, some surfaces can still render using safe fallbacks for local development.
* For full decoupled production mode, the Laravel backend must be running and `LARAVEL_API_BASE_URL` must point to that backend.

## Deployment

* **Next.js Frontend:** Tencent Serverless Pages (or another serverless platform)
* **Laravel Backend:** cPanel (PHP/Apache + MariaDB)
* **Auth/Realtime:** Firebase

## License

MIT

---

# E2E Acceptance Environment (Auth + Privacy)

To run the acceptance suite (`tests/renungan-versehub-acceptance.spec.ts`) without skips:

```bash
npm run test:e2e:acceptance
```

Set the following environment variables (recommended):

```env
E2E_ADMIN_EMAIL=
E2E_ADMIN_PASSWORD=
E2E_MEMBER_A_EMAIL=
E2E_MEMBER_A_PASSWORD=
E2E_MEMBER_B_EMAIL=
E2E_MEMBER_B_PASSWORD=
```

## Supported Aliases / Fallbacks

```env
E2E_ADMIN_USER_EMAIL
E2E_ADMIN_USER_PASSWORD

E2E_MEMBER_EMAIL
E2E_MEMBER_PASSWORD

E2E_MEMBER_SECONDARY_EMAIL
E2E_MEMBER_SECONDARY_PASSWORD
```

### Legacy Fallback for Member A

```env
E2E_AUTH_EMAIL
E2E_AUTH_PASSWORD
```
