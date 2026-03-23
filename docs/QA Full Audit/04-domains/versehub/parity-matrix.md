# VerseHub Parity Matrix

## Scope
- Domain: VerseHub (Bible Reader & Mentor)
- Date: 2026-03-17

## Matrix Status

| Feature Component | Backend Endpoint | Frontend Implementation | Parity Status | Notes |
|-------------------|------------------|-------------------------|---------------|-------|
| Books List | `/api/versehub/id` | `VersehubReaderPage` | ✅ PASS | Frontend fetches and maps `data.books` to `{code, label, testament}` format exactly as requested. |
| Chapter Reading | `/api/versehub/id/chapter/{ref}` | `VersehubReaderPage` | ⚠️ PARTIAL | Parses `verses`, `chapter_label`, and `chapters`, but intentionally ignores `has_reflected` and `reflection_question`. |
| Search Suggestion | `/api/versehub/id/suggest?q=` | `VersehubReaderPage` | ✅ PASS | Translates the debounce delay to grab `rich_items` with fallback handling mapping directly. |
| Verse Action API | `/api/versehub/id/actions` | `VersehubReaderPage` | ✅ PASS | Frontend posts exact schema `[book, chapter, verse, favorite, bookmarked, highlighted]` upon verse interaction. |
| End of Chapter Reflection | Embedded payload | `EndOfChapterPrompt` | ❌ FAIL | The AI-generated question sent from backend is hardcoded over in the current frontend code to a static placeholder. |

## Major Mismatch
1. The **Reflection Context Drop**. When finishing a chapter, users are given a generic reflection question ("Bagaimana ayat-ayat ini menguatkan imanmu hari ini?") instead of the one fetched from `VerseHubMentorService`. This disrupts the intended personalized mentor experience.
