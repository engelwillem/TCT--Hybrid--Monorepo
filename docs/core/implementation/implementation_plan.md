# Migration Plan: Laravel to Next.js Perfect Parity

This plan outlines the strategy to achieve 100% visual and functional parity between the existing Laravel frontend and a new Next.js implementation, specifically optimized for **Firebase Studio**.

## Strategic Approach: "Cut and Replace" (Frontend Decoupling)
We are moving from a monolith (Laravel/Inertia) to a decoupled architecture (Tailwind/Next.js). Every frontend element in the Laravel `backend-api` directory will be **cut** (migrated and then deleted) to ensure Laravel remains purely a backend API.

### 1. Style & Design System Sync
- **Action**: Copy [app.css](file:///e:/thechoosentalksnext/backend-api/resources/css/app.css) directly to the Next.js `styles/` or `app/globals.css`.
- **Action**: Mirror the `tailwind.config.js` to ensure custom shadow tokens, font families ("DM Serif Display"), and brand HSL variables are identical.
- **Outcome**: Exact same typography, spacing, and premium effects (Grain texture, Mesh gradients).

### 2. SEO & Global Layout Parity
- **Action**: Port the logic from [app.blade.php](file:///e:/thechoosentalksnext/backend-api/resources/views/app.blade.php) into the Next.js `RootLayout`.
- **Mechanism**: Use Next.js Metadata API to replicate the dynamic OG tag generation (WhatsApp, Facebook, Twitter) currently handled by Laravel Blade.
- **Runtime Tokens**: Inject the same CSS variables for `--brand` and `--brand-foreground` to maintain dynamic theming.

### 3. Component Lifting
- **Action**: Move pages from `resources/js/Pages` to `app/(routes)`.
- **Action**: Replace Inertia-specific tags (`<Link>`, `router.get`) with Next.js equivalents (`next/link`, `useRouter`).
- **Data Fetching**: Replace `usePage().props` with standard React props or Next.js `use` hook, fetching from the `backend-api` URL.

### 4. Legacy Purge (Post-Migration)
To achieve a "Clean Backend" state, the following will be executed after verification:
- **Action**: Delete `backend-api/resources/js` entirely.
- **Action**: Delete `backend-api/resources/views/app.blade.php`.
- **Action**: Remove `inertia-laravel`, `vite`, and frontend build scripts from `package.json` in `backend-api`.

### 5. Firebase Studio Optimization
- **Firebase App Hosting**: Configure `apphosting.yaml` for Next.js SSR/ISR parity.
- **API Proxying**: Ensure Next.js communicates with the Laravel backend via environment variables, avoiding any frontend leakage in the backend repo.

## Proposed Changes

### [NEW] Setup
- Initialize Next.js in the root directory if it doesn't already exist (or update existing one).
- Configure `next.config.ts` to allow cross-origin requests to the Laravel API.

### [MODIFY] Design Token Integration
- Update `tailwind.config.ts` with Laravel's custom animations (`tct-shimmer`) and color tokens.

### [TRANSPLANT] Complete Component & Page Suite
- **Today Index**: Full migration of `Today/Index.tsx` and all 15+ sub-components.
- **Community**: Porting of the complex `Community/Index.tsx` and feed logic.
- **VerseHub**: Migration of the `Reader`, `Activity`, and `StudyPaths` systems.
- **Profile/Auth**: Porting all authentication shells and profile management pages.

### [DELETE] Frontend Cleanup (Laravel)
- Remove all `.tsx` and `.css` files from `backend-api/resources`.

## Verification Plan
1. **Visual Parity**: Run both Laravel (local) and Next.js (local) side-by-side. Inspect element dimensions, colors, and font rendering.
2. **Path Parity**: Ensure `/today`, `/community`, and `/versehub` routes match exactly.
3. **Firebase Validation**: Deploy to Firebase Preview channel and verify that all "Premium" UI elements (Framer Motion animations, Grain effects) render correctly.
