# VerseHub Domain Parity Map

**Status:** Ready for Batch 1 Execution  
**Source of Truth:** `/docs/archive/TCT-Laravel-Legacy/resources/js/Pages/VerseHub/*`  
**Target:** `src/app/versehub/**` & `src/features/versehub/**`

---

## 1. Core Flows & Pages

| Flow Name | Legacy Logic | Next.js Implementation | Status | Gap Key |
|---|---|---|---|---|
| **Reader Home** | Book list (OT/NT) | `VersehubReaderPage.tsx` | **PARTIAL** | Mock book counts & testament sorting |
| **Chapter View** | Verse list + Reflection Prompt | `[slug]/page.tsx` | **PARTIAL** | Scroll-sync progress bar & haptics |
| **Verse Share** | Dedicated Blade page with OG | `[slug]/page.tsx` | **PARTIAL** | Dynamic OG Image generation proxy |
| **Action Menu** | Long-press (MB) / Click (DT) | `Reader.tsx` logic | **PARTIAL** | Consistency of haptic feedback levels |
| **Scripture Guide** | 4-tab Mentor Panel | `MentorPanel.tsx` | **DONE** | Data parity achieved in Batch 0 |
| **Journey / Activity**| Timeline grouping | `Activity.tsx` | **PARTIAL** | Note editing optimistic UI |
| **Study Paths** | Curated Curriculums | `StudyPaths/**` | **PARITY DONE** | Already migrated to API-first |

---

## 2. Route & API Mapping

| Legacy Route | Next Route | API Proxy | Laravel Backend Endpoint |
|---|---|---|---|
| `GET /versehub/{lang}` | `GET /versehub/[lang]` | `/api/versehub/[lang]` | `GET /api/v1/versehub/{lang}` |
| `GET /v.../{ref}` | `GET /v.../[slug]` | `/api/versehub/[lang]/[slug]` | `GET /api/v1/versehub/{lang}/{ref}` |
| `POST /.../actions` | `POST /api/.../actions`| `/api/versehub/[lang]/actions` | `POST /api/v1/versehub/{lang}/reader-actions` |
| `POST /.../reflections`| `POST /api/.../refl...`| `/api/versehub/[lang]/reflections`| `POST /api/v1/versehub/{lang}/reflections` |
| `GET /.../mentor` | `GET /api/.../mentor` | `/api/versehub/[lang]/[ref]/mentor` | `GET /api/v1/versehub/{lang}/{ref}/mentor` |

---

## 3. Component Parity Audit

### A. Reader Layout
- **Visual**: Sticky header must have the exact `backdrop-blur` and border bottom token from legacy.
- **Interaction**: Chapter navigation (Next/Prev) must prefetch the next segment to avoid white-flashes.
- **Progress**: Vertical scroll progress must update the "Verse X of Y" label in real-time.

### B. Verse Action Bar
- **Visual**: Icon weight (Lucide 1.5 vs 1.8) must match legacy high-density look.
- **Logic**: Clicking a verse number should open the system share sheet (Legacy behavior).
- **Haptics**: Long-press on mobile (2.5s) must trigger a distinct vibration before the menu appears.

### C. Search & Suggestions
- **Performance**: Search autocomplete must feel "local" (under 150ms).
- **Format**: Support flexible inputs: `yoh 3:16`, `yoh-3-16`, `yoh 3 16`.

---

## 4. Residual Gaps (VerseHub Specific)

1.  **Dynamic PNG Proxy**: Next.js metadata must correctly point to `/api/versehub/og/[slug].png` which proxies to Laravel's GD engine.
2.  **Cross-Reference Panels**: Legacy displays dual panels for cross-refs. Next.js currently uses a single-column layout. **Tindakan**: Implement Side-by-side view for Tablet/Desktop.
3.  **Haptic Standard**: Synchronize `triggerHaptic('strong')` for major saves (Favorite) and `triggerHaptic('light')` for minor toggles.
4.  **Note Context**: Cataloging notes in "My Spiritual Journey" must include the verse text snippet, not just the reference.

---

## 5. VerseHub Batch 1 Execution Scope

To reach `PARITY DONE`, this batch will:

1.  **Un-mock Reader Data**: Replace all `setTimeout` mock loads with real API fetches for book/chapter data.
2.  **Action Persistence**: Wire up `Like`, `Bookmark`, and `Note` directly to the `user_verse_actions` MySQL table.
3.  **Mentor Hardening**: Ensure the "Denominational Context" tab is active and accurate.
4.  **Reflections Loop**: Connect the `ReflectionComposer` to the real creation API.

**Verdict: READY FOR BATCH 1 EXECUTION**
*The data contracts and proxy layers for VerseHub were fully validated in Batch 0 hardening.*