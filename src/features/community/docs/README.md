# TCT Community Feature: Release Hardening & Architecture Review

> [!IMPORTANT]
> This documentation follows the verification of three critical patches in April 2026: **Avatar Collision**, **Rail Scrolling**, and **Body-Lock Recovery**.

## 1. Release-Hardening Checklist (Patch Specific)

### Pre-Merge (Code Review Focus)
- [ ] **Identity Check:** Ensure `useCurrentUserAvatarStyle` uses strict equality (`authId === ownerId`) and handles null identities gracefully.
- [ ] **Touch Action:** Verify `touch-action: pan-y` is applied to the horizontal scrolling rail to prevent blocking vertical page scroll.
- [ ] **Component Purge:** Ensure `CommentsSheet` does not leave residual `overflow: hidden` on the `body` after transition.

### Pre-Release (Docker & Sync)
- [ ] **Docker Connectivity:** Verify `LARAVEL_API_BASE_URL` in `.env.local` or Docker environment points to `127.0.0.1:8000` (IPv4) to avoid loopback resolution issues in Windows/WSL.
- [ ] **Proxy Stability:** Check `proxy-laravel.ts` for timeout handling on slow backend responses (Laravel API can take 4-10s under load).

### Post-Release (Smoke Test)
- [ ] **Safari Mobile:** Physically test on iOS to verify gesture recovery after closing the Bottom Sheet.
- [ ] **Carousel Integrity:** Ensure horizontal swipes on image carousels still work inside the `pan-y` container.

---

## 2. Architecture & Component Review

### Current State Analysis
The Community feature is currently centralized in a few "God Components" which makes regression testing difficult. There is an overlap between `PostCard.tsx` and `MemberPostCard.tsx` that should be unified.

### Recommended Structure
To prevent future regressions, we should move towards a **Feature-Sliced Design (FSD)** inspired structure:

```text
src/features/community/
├── api/                # Proxy route interaction
├── hooks/              # useCommunityActions, useCommunityFeed
├── components/         
│   ├── feed/           # Orchestrators (PostList, MemberPostCard)
│   ├── rail/           # Interaction primitives (CategoryRail)
│   └── shared/         # CommentSheet, ActionBar
└── docs/               # Technical notes (this file)
```

### Regression Prevention Strategy
- **Source of Truth:** All avatar rendering logic must flow through `lib/avatar-presentation.ts`.
- **Gesture Ownership:** Use `touch-action` sparingly and locally on the smallest possible container to avoid breaking global app shell behaviors.
- **State Ownership:** Move the "Active Comment Post ID" into a local context to avoid complex prop drilling in `CommunityPage.tsx`.

### Priority Actions
1. **High Impact:** Merge `PostCard` and `MemberPostCard` into a single polymorphic component.
2. **Medium Impact:** Extract feed orchestration logic into a custom hook to slim down `CommunityPage.tsx`.

---

## 3. Definition of Done (DoD) for Future Patches
- [ ] Manual verification on at least one physical mobile device (Android/iOS).
- [ ] Clean build in Docker environment.
- [ ] Verified auth bypass for E2E tests (`e2e_bypass_token`).

*Created: April 2026*
*Author: Senior Release Architect (Antigravity)*
