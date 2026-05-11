# Architecture Blueprint Plan Master

Generated: 2026-03-11 11:22:04

## Source: BIBLE ENGINE PROMPT.md

PROMPT 0 — MASTER CONTEXT KHUSUS /BIBLE

Kirim ini dulu.

You are a senior product architect, Laravel architect, Bible-study product strategist, and premium UX systems designer.

I have an existing Laravel project called TheChosenTalks.
For this task, focus ONLY on the /bible area (VerseHub).
Do NOT redesign or modify other areas like /today, /community, /channels, or other app sections.

Important:
You must work based on the EXISTING VerseHub codebase direction, not from a blank project.

Current stack:
- Laravel 12
- PHP 8.2+
- Inertia.js + React 18
- TypeScript
- Tailwind CSS
- Blade views also exist for some VerseHub pages
- Filament Admin

Existing VerseHub-related foundations already appear to include:
- VerseHubController
- VerseHubReaderController
- VersehubActionController
- VersehubCommentController
- VerseHubLibraryController
- BibleVerse model
- VerseHubActivityService
- VerseHubDailyService
- versehub Blade views
- VerseHub React components/pages
- OG image support already partially exists for verse sharing

Product direction for /bible:
I want VerseHub to become a Scripture-Centered Mentor System.

Meaning:
- Bible text must remain the center
- the experience should guide people through Scripture, not overwhelm them
- it should help answer questions about Christianity from the Bible text itself
- it should help users explore difficult questions, doubts, and major themes
- it should be useful for Christians across denominations
- it should also be accessible to seekers and non-Christians who want to learn honestly
- it should feel like a guided Bible-learning experience with a transparent study companion
- it must not feel manipulative or like a deceptive hidden bot

Important design principle:
The mentor layer should be transparent.
Prefer names like:
- Scripture Guide
- Study Companion
- VerseHub Mentor
- Bible Learning Guide

Do NOT present it as a fake human or hidden manipulative guide.

Additional requirement:
Every shareable text or study material inside /bible must have beautiful premium OG previews.
The preview must feel elegant, luxurious, and mobile-premium for iOS and Android users.

Your job in the next prompts is to help me design the product, architecture, interaction model, sharing system, and implementation plan specifically for VerseHub only.

Always:
- respect the existing VerseHub architecture
- extend what already exists
- keep the Bible text central
- prioritize trust, clarity, depth, and premium UX
- avoid generic chatbot product patterns
PROMPT 1 — AUDIT VERSEHUB SAAT INI

Supaya Gemini membaca arah yang sudah ada.

Based on the existing VerseHub codebase direction, help me audit the current /bible architecture and identify the best extension points for turning VerseHub into a Scripture-Centered Mentor System.

Focus only on VerseHub-related areas, such as:
- VerseHubController
- VerseHubReaderController
- VersehubActionController
- VersehubCommentController
- VerseHubLibraryController
- BibleVerse model
- VerseHubActivityService
- VerseHubDailyService
- versehub Blade views
- VerseHub React pages/components
- OG/share-related VerseHub functionality

Tasks:
1. infer the likely role of each existing VerseHub-related part
2. identify which parts are already strong foundations
3. identify which parts should be extended
4. identify likely gaps for building a Scripture-Centered Mentor System
5. identify likely gaps for premium OG sharing support
6. identify possible overlap between reader, activity, library, and share pages

Output format:
- current VerseHub architecture reading
- reusable foundations
- extension points
- likely gaps
- risks to avoid

Important:
Do not propose a full rewrite unless absolutely necessary.
PROMPT 2 — DEFINISIKAN VERSEHUB SEBAGAI SCRIPTURE-CENTERED MENTOR SYSTEM

Ini fondasi produk.

Now define VerseHub as a Scripture-Centered Mentor System.

Goal:
VerseHub should become more than a Bible reader.
It should become a guided Bible-learning experience centered on Scripture itself.

Tasks:
1. define what a Scripture-Centered Mentor System means in product terms
2. define the main user types it should serve
3. define the main user problems it should solve
4. define the main product principles
5. define the difference between:
   - a normal Bible reader
   - a Bible chatbot
   - a Scripture-Centered Mentor System
6. define what VerseHub should never become

Consider user groups such as:
- Christians seeking deeper Bible understanding
- believers with doctrinal questions
- users with doubts about Christianity
- seekers and non-Christians exploring the Bible honestly
- users from different Christian denominations

Output format:
- product definition
- target users
- core user problems
- product principles
- what VerseHub should do
- what VerseHub should avoid

Important:
Keep Scripture central, and avoid making the product feel like a generic AI chatbot.
PROMPT 3 — RANCANG ARSITEKTUR FITUR /BIBLE

Sekarang bentuk produknya.

Now design the feature architecture for /bible (VerseHub) only.

I want VerseHub to become a Scripture-Centered Mentor System with clear feature layers.

Tasks:
1. define the major feature layers VerseHub should have
2. define the role of each layer
3. explain how they connect without overwhelming the user
4. keep the architecture realistic for the existing Laravel project

Possible feature layers to consider:
- Reader Layer
- Verse Relationship Layer
- Study Layer
- Mentor Layer
- Reflection Layer
- Share Layer
- Library / Save Layer

Output format:
- feature layer
- purpose
- user value
- likely implementation location
- notes

Important:
Do not redesign the rest of the app. Focus only on /bible.
PROMPT 4 — RANCANG READER EXPERIENCE YANG DIPANDU

Agar reader menjadi inti sistem.

Now design the ideal VerseHub reader experience.

VerseHub should still be a Bible reader first, but with guided learning built around it.

Tasks:
1. define the ideal reading experience
2. define how verse actions should work naturally
3. define how the mentor system should appear without interrupting reading
4. define how users move from reading into deeper study
5. define how chapter reading, verse selection, highlighting, bookmarking, notes, and sharing should work together
6. define what should appear inline, in side panels, in bottom sheets, or in secondary views

Output format:
- reading flow
- verse interaction model
- mentor touchpoints
- deep study entry points
- UX rules
- anti-patterns to avoid

Important:
Reading must remain calm, premium, and text-centered.
PROMPT 5 — RANCANG VERSE RELATIONSHIP ENGINE

Ini inti “antar teks ayat saling hidup”.

Now design a Verse Relationship Engine for VerseHub.

Goal:
make Scripture feel interconnected in a meaningful and text-centered way.

The engine should help users move from one verse to:
- related verses
- parallel themes
- nearby context
- prophecy/fulfillment connections
- cross-book thematic connections
- clarifying passages

Tasks:
1. define what kinds of verse relationships VerseHub should support
2. define how those relationships should be shown in the UI
3. define how users discover them naturally
4. define how to keep them grounded in Scripture instead of vague AI opinion
5. define the minimum viable version and future advanced version

Output format:
- relationship type
- purpose
- example
- UI treatment
- data/logic requirement
- MVP vs future

Important:
This must feel like Scripture guiding Scripture.
PROMPT 6 — RANCANG MENTOR LAYER YANG TRANSPARAN

Bukan hidden bot, tapi pendamping studi.

Now design the mentor layer for VerseHub.

Important:
This must be a transparent Bible study companion, not a manipulative hidden mentor and not a fake human persona.

Possible names:
- Scripture Guide
- Study Companion
- VerseHub Mentor
- Bible Learning Guide

Tasks:
1. define the role of the mentor layer
2. define how the mentor appears in the UI
3. define when the mentor should proactively help
4. define when the mentor should stay silent
5. define what kinds of help it offers
6. define the right tone for the mentor
7. define how the mentor remains grounded in Scripture and context
8. define how to prevent it from sounding overly absolute or sectarian in the wrong places

Output format:
- mentor role
- UI presence
- trigger moments
- allowed guidance types
- tone rules
- trust rules
- guardrails

Important:
The mentor should feel wise, calm, transparent, and text-centered.
PROMPT 7 — RANCANG ASK-THE-BIBLE EXPERIENCE

Ini untuk pertanyaan besar.

Now design the "Ask the Bible" experience inside VerseHub.

Goal:
users should be able to ask major questions and be guided toward Scripture-based study.

Examples:
- Who is Jesus according to the Bible?
- Why does suffering exist?
- What is salvation?
- Can the Bible be trusted?
- What is the Sabbath?
- Why are there many denominations?
- What happens after death?
- What is the gospel?

Tasks:
1. define how Ask-the-Bible should work
2. define how answers should be structured
3. define how Scripture references should lead the experience
4. define how to distinguish:
   - explicit biblical text
   - theological interpretation
   - study guidance
5. define follow-up learning paths
6. define how this stays respectful for seekers and users across denominations

Output format:
- question flow
- answer structure
- Scripture-first logic
- interpretation handling
- follow-up paths
- trust rules

Important:
The product should guide study from Scripture, not argue like a debate bot.
PROMPT 8 — RANCANG STUDY PATHS / LEARNING JOURNEYS

Agar bukan cuma search.

Now design guided study paths for VerseHub.

Goal:
help users explore major Bible themes through structured learning journeys.

Possible paths:
- Who is Jesus?
- What is the gospel?
- Why trust the Bible?
- What is salvation?
- What does the Bible say about suffering?
- What is prayer?
- What is the Sabbath?
- What is the kingdom of God?
- What happens after death?
- How should I read the Bible?

Tasks:
1. define the purpose of study paths
2. define how they should be structured
3. define how short and deep versions can coexist
4. define how a study path connects to the reader
5. define how the mentor supports the path
6. define how users save, continue, and share paths

Output format:
- study path model
- structure
- mentor role
- save/resume model
- sharing model
- MVP vs future

Important:
Keep the learning journey calm, premium, and Scripture-centered.
PROMPT 9 — RANCANG SHARE SYSTEM + PREMIUM OG PREVIEW

Ini requirement penting Anda.

Now design the VerseHub sharing architecture and premium OG preview system.

Important requirement:
Every shareable text or study material inside /bible must have beautiful premium OG previews.

The OG previews must feel:
- elegant
- luxurious
- premium
- refined
- beautiful on iOS and Android link previews
- worthy of a high-end spiritual product

Possible shareable content inside /bible:
- single verse
- verse range
- chapter reading page
- study path
- question/answer study page
- reflection note
- lesson excerpt
- thematic Scripture collection
- saved quote card from Bible text

Existing project direction suggests VerseHub already has some OG/share support.
Extend that rather than redesign from scratch.

Tasks:
1. define all shareable entities inside VerseHub
2. define OG preview types needed
3. define visual design rules for OG previews
4. define content hierarchy for OG cards
5. define typography hierarchy
6. define premium visual language
7. define mobile preview constraints for iOS and Android
8. define safe truncation and layout rules
9. define how OG generation should work technically in Laravel
10. define how Blade, controller, and image endpoints should be structured

Output format:
- shareable entity
- OG preview type
- content hierarchy
- visual rules
- technical generation strategy
- Laravel implementation notes

Important:
The OG system must feel premium and consistent with VerseHub branding.
PROMPT 10 — RANCANG UI/UX PREMIUM UNTUK OG PREVIEWS

Lebih visual-spesifik.

Now go deeper into the premium UI/UX design language for VerseHub OG previews.

The OG cards should feel:
- premium
- elegant
- spiritual
- editorial
- luxurious but not flashy
- suitable for premium iPhone and Android users

Tasks:
1. define the visual design language for VerseHub OG cards
2. define background treatments
3. define card composition rules
4. define typography choices and hierarchy
5. define reference placement for verse labels
6. define translation/provider placement
7. define brand signature placement
8. define how different OG card types should vary while staying consistent
9. define how to make them feel classy instead of generic quote cards

Possible OG types:
- verse card
- chapter card
- study path card
- ask-the-bible answer card
- thematic study card
- lesson card

Output format:
- design principles
- layout rules
- typography rules
- spacing rules
- variation system
- premium quality checklist

Important:
These cards must look expensive, polished, and share-worthy.
PROMPT 11 — RANCANG DATA MODEL + BACKEND EXTENSIONS KHUSUS /BIBLE

Sekarang masuk Laravel.

Now design the minimum backend/data model extensions needed to evolve VerseHub into a Scripture-Centered Mentor System.

Focus only on /bible.

Assume the current codebase already includes:
- BibleVerse model
- VerseHub controllers
- VerseHub activity/comment/action logic
- some sharing and OG foundations

Tasks:
1. propose the minimum additional models or tables needed
2. propose which existing models should be extended
3. define what data is needed for:
   - verse relationships
   - mentor prompts
   - study paths
   - ask-the-bible topics/questions
   - shareable study materials
   - OG metadata
4. keep schema changes minimal and realistic
5. define MVP vs later expansion

Output format:
- existing model to extend
- possible new model/table
- purpose
- key fields
- MVP or future
- compatibility notes

Important:
Prefer extending the current VerseHub architecture over unnecessary rewrites.
PROMPT 12 — RANCANG FILE-LEVEL IMPLEMENTATION PLAN KHUSUS /BIBLE

Yang paling praktis untuk eksekusi.

Based on the final VerseHub direction we designed, create a FILE-LEVEL implementation plan for the existing Laravel project.

Focus ONLY on /bible.

I want you to think in terms of extending an existing codebase.

Please map the implementation into:

1. files to inspect first
2. files to modify
3. new files to create
4. migrations to add
5. model updates
6. controller updates
7. service updates/new services
8. Blade/React view updates
9. OG image generation flow
10. testing checklist

Use the known VerseHub-related codebase direction, such as:
- app/Http/Controllers/VerseHubController.php
- app/Http/Controllers/VerseHubReaderController.php
- app/Http/Controllers/VersehubActionController.php
- app/Http/Controllers/VersehubCommentController.php
- app/Http/Controllers/VerseHubLibraryController.php
- app/Models/BibleVerse.php
- app/Services/VerseHubActivityService.php
- app/Services/VerseHubDailyService.php
- resources/views/versehub/show.blade.php
- resources/views/versehub/reader.blade.php
- resources/js/Pages/VerseHub/*
- public/og/versehub-bg.png

Output format:
- inspect first
- modify
- create new
- coding order
- OG implementation checklist
- testing checklist

Important:
Prefer safe extension of the current VerseHub codebase.
Do not redesign the whole app.
PROMPT BONUS — KHUSUS UNTUK GEMINI AGAR MASUK KE IMPLEMENTASI OG

Kalau Anda ingin Gemini langsung fokus OG system.

Now design the full OG preview implementation strategy for VerseHub in Laravel.

Current direction already suggests:
- VerseHubController has share-friendly verse pages
- VerseHub has OG image endpoints
- there is already a public OG asset background

I want to evolve this into a premium OG system for all shareable /bible materials.

Tasks:
1. define all OG endpoints needed
2. define route patterns
3. define controller responsibilities
4. define image rendering strategy
5. define reusable OG templates
6. define how to support:
   - single verse
   - verse range
   - chapter page
   - study path
   - Ask-the-Bible page
   - lesson excerpt
7. define caching strategy
8. define fallback behavior
9. define typography/layout rendering constraints for dynamic text
10. define production-quality image generation approach in Laravel

Output format:
- endpoint map
- route map
- controller map
- rendering strategy
- caching plan
- template system
- fallback rules
- implementation notes

Important:
The OG previews must feel premium and polished, not like generic social quote cards.
Prompt bonus yang sangat penting: supaya Gemini tidak liar

Tempel ini di akhir prompt mana pun.

Use additive architecture.
Respect the existing VerseHub codebase.
Focus only on /bible.
Keep Scripture central.
Avoid generic chatbot patterns.
Prefer a transparent study companion over a hidden manipulative mentor.
Design premium OG previews that feel elegant, expensive, and mobile-premium.
Choose the simplest implementation that fits the current Laravel project.
Rekomendasi urutan paling efektif

---

## Source: BIBLE_ENGINE_EXECUTION_REPORT.md

# Bible Engine Execution Report (/bible only)

Date: 2026-03-07
Scope: VerseHub only (`/bible` / `/versehub/*`)

## Current status summary
- `PROMPT 3` already documented in [VERSEHUB_FEATURE_ARCHITECTURE_REPORT.md](E:/thechoosentalksbetaUpdate/VERSEHUB_FEATURE_ARCHITECTURE_REPORT.md).
- New VerseHub foundations already exist in codebase (mentor, study path, relationship models/services/routes, OG endpoints).
- Major blocker fixed this session: TypeScript check passed again.

## Prompt-by-prompt execution

### Prompt 1 - Audit VerseHub saat ini
Status: Completed
- Reusable foundations:
  - Reader and sharing routes in `routes/web.php`.
  - `VerseHubController`, `VerseHubReaderController`, `VerseHubLibraryController`, `VersehubActionController`, `VersehubCommentController`.
  - Existing OG endpoint support (`/versehub/{lang}/{ref}/og.png`).
- Extension points:
  - Mentor flow (`mentorInsights`, `mentorAsk`).
  - Relationship graph (`VerseRelationship`, `VerseTheme`, `VerseThemeMapping`).
  - Guided paths (`StudyPath`, `StudyPathStep`, `UserStudyPathProgress`).
- Risks:
  - Route/enum drift, type drift, and UX overload in reader panels.

### Prompt 2 - Define Scripture-Centered Mentor System
Status: Completed
- Scripture text remains primary surface.
- Mentor is explicit and transparent, not hidden persona.
- Interpretation should be separated from direct biblical references.

### Prompt 3 - Feature architecture
Status: Completed
- Reader, Relationship, Study, Mentor, Reflection, Share, Library layers are defined.

### Prompt 4 - Guided reader experience
Status: Completed
- Reader-first UX with progressive disclosure panels.
- Verse actions should open contextual secondary surfaces only (not page-jump heavy).

### Prompt 5 - Verse Relationship Engine
Status: Completed (MVP foundation in code)
- Supported direction:
  - related verse links
  - theme links
  - context adjacency
- Data models now present for relationship/theme mapping.

### Prompt 6 - Transparent mentor layer
Status: Completed (MVP foundation in code)
- Mentor endpoints are present.
- Guardrail direction: short, text-grounded, non-sectarian tone.

### Prompt 7 - Ask-the-Bible experience
Status: Completed (MVP endpoint foundation exists)
- `mentorAsk` route exists and is rate-limited.
- Next refinement: answer schema segmentation
  - biblical text references
  - interpretation notes
  - suggested next reading path

### Prompt 8 - Study paths
Status: Completed (MVP foundation in code)
- Study path models, migration, and controller are present.
- Next: improve path discovery/sorting rules in UI.

### Prompt 9 - Share system + premium OG
Status: In progress
- Existing OG support already active for verse pages.
- Next pending coding tasks:
  - unify premium OG templates for chapter/path/ask pages
  - explicit fallback typography/layout truncation rules

### Prompt 10 - Premium OG UI language
Status: In progress
- Visual direction already partly established (brand-centric and mobile-safe).
- Next pending coding tasks:
  - consistent editorial typography stack
  - strict content hierarchy per OG type
  - deterministic crop/truncation engine

### Prompt 11 - Data model + backend extension
Status: Completed (MVP)
- New VerseHub entities already present in codebase:
  - `VerseRelationship`, `VerseTheme`, `VerseThemeMapping`
  - `UserMentorSession`
  - `StudyPath`, `StudyPathStep`, `UserStudyPathProgress`
  - reflection responses

### Prompt 12 - File-level implementation plan
Status: Completed
- Core inspect/modify targets are already mapped in current VerseHub implementation paths and routes.

### Prompt Bonus - OG implementation strategy
Status: In progress
- Endpoint map exists at verse-level.
- Pending expansion remains on multi-entity OG parity.

## Tasks executed in this session
1. Re-checked `npx tsc --noEmit` -> PASS.
2. Fixed runtime typing blocker in new Filament VerseHub resources (`BackedEnum`/`UnitEnum` compatibility).
3. Added admin bootstrap policy for fixed owner email:
   - `BOOTSTRAP_ADMIN_EMAILS=engel.willem@gmail.com`
   - registration auto-assigns admin role if email matches whitelist.
4. Phase 1 completed: mentor answer schema hardened with explicit sections:
   - `scripture_basis` (anchor ref/text + related refs)
   - `sections` (`biblical_text`, `interpretation`, `study_guidance`)
   - backward compatible with existing Ask UI fields.
5. Phase 1 bugfix completed: `getThemes()` no longer depends on non-existent `bible_verses.verse_ref` column; now uses `verse_theme_mappings`.
6. Phase 2 completed (OG parity increment):
   - Added endpoint `GET /versehub/{lang}/{ref}/mentor/og.png`
   - Added premium Ask-the-Bible OG renderer flow in `VerseHubController`.
7. Added automated API tests:
   - `tests/Feature/VerseHubMentorApiTest.php` covering insights shape, ask schema, and mentor OG PNG endpoint.
8. Phase next-step executed:
   - Study Path progress flow fixed to match schema (`last_step_order`), replacing broken `step_id` assumption.
   - Study Path detail page now ships explicit canonical/OG metadata payload from backend.
   - Reader `/versehub/id/{chapter}` now emits explicit OG/Twitter meta for chapter consistency.
   - Reader action sheet refactored to progressive disclosure (primary actions + expandable advanced actions).
   - Fixed `handlePathSelect` route from wrong `/study-paths/*` to correct `/study/*`.
9. Added guardrail tests:
   - `tests/Feature/VerseHubStudyAndMentorGuardrailsTest.php`
   - covers mentor ask throttle boundary and study-step completion/order behavior.
10. Phase lanjutan executed (routing + OG parity hardening):
   - Study Path read routes moved to public access (`index/show/og`) so non-member seekers and social crawlers can access `/bible` study materials.
   - Generic verse routes now constrained by ref regex to prevent accidental capture of `/versehub/{lang}/study*`.
   - Legacy verse routes also constrained with the same ref pattern.
   - Chapter OG renderer now uses centralized OG template helper and canonicalizes alias refs before render.
   - OG visual preset logic centralized in `VerseHubController::ogThemeByType()` for verse/chapter/study/ask consistency.
11. Added route/OG regression tests:
   - `tests/Feature/VerseHubOgAndStudyRoutingTest.php`
   - verifies:
     - `/versehub/id/study` resolves to StudyPaths page (not swallowed by generic ref route)
     - study OG endpoint is publicly accessible and returns PNG
     - chapter reader includes `og_image_url` prop
     - chapter OG alias redirects to canonical path
12. Final OG premium polish phase executed:
   - Added deterministic truncation pipeline per OG entity type (`verse/chapter/study/ask`) to prevent layout jitter from variable text length.
   - Added centralized typography profiles (`font size / line height / max chars / max lines / static-bg policy`) per OG entity type.
   - Added robust cross-host font fallback stack:
     - repo/public custom fonts (if present)
     - common Linux server fonts (DejaVu/Liberation/Noto)
     - Windows local fonts.
   - Added bitmap text fallback renderer when TTF fonts are unavailable, so OG image remains readable instead of text-blank.
   - Refactored chapter/ask renderers to use unified OG template + typography preset engine.
13. Reader disclosure polish round 2 executed (`resources/js/Pages/VerseHub/Reader.tsx`):
   - Microcopy refinement:
     - Search placeholder made clearer (“Cari referensi…”).
     - Added contextual helper text for quick actions + shortcut discovery.
   - Action hierarchy polish:
     - Main actions now visually prioritized with icon-led labels (Save, Bookmark, Share, Scripture Guide).
     - Advanced actions remain behind disclosure and now use clearer labels/icons.
   - Keyboard shortcuts (desktop/non-input focus):
     - `/` or `Ctrl/Cmd + K`: focus search
     - `?`: toggle shortcut hint
     - `S`: save
     - `B`: bookmark
     - `H`: highlight
     - `N`: note
     - `M`: open mentor
     - `X`: cross-reference
   - Added shortcut hint panel in reader to reduce discoverability friction.
14. Brand-specific OG font asset bundling executed:
   - Added bundled font assets:
     - `resources/fonts/og/VerseHubBrand-Regular.ttf`
     - `resources/fonts/og/VerseHubBrand-Mono.ttf`
   - OG font resolver now prioritizes bundled assets first (so render is OS-independent across deploy targets).
   - Added optional explicit pin via env:
     - `VERSEHUB_OG_FONT=resources/fonts/og/VerseHubBrand-Regular.ttf`
   - Added font bundle operational notes:
     - `resources/fonts/og/README.md`
   - Added git binary attributes for font files:
     - `*.ttf binary`
     - `*.otf binary`

## Admin account note
- Current local DB still reports `engel.willem@gmail.com` as not found.
- With new bootstrap rule, when that email registers/logs in from fresh account creation flow, admin role is automatically applied.

## Remaining implementation backlog (/bible only)
1. Optional design refinement: brand-specific premium font asset bundling in repo for guaranteed typographic consistency across all servers.
2. Optional UX follow-up: add user-toggle to disable keyboard shortcuts for users who prefer mouse-only workflow.

---

## Source: Community_Interaction_Architecture.md

# Architecture: /community Interaction Model

Dokumen ini mendefinisikan desain interaksi untuk feed komunitas agar tetap terasa hidup, bermakna, dan tidak bising (noisy), sesuai dengan karakter *faith-based* platform TheChosenTalks.

## 1. Interaction Principles
- **Vibe over Volume**: Mengutamakan kualitas interaksi daripada kuantitas "like" yang kosong.
- **Natural Language**: Menggunakan istilah yang akrab bagi jemaat (misal: "Amin" atau "Doakan" alih-alih "Like").
- **Intentionality**: Membedakan antara dukungan cepat (Quick Support) dan diskusi mendalam (Reflection).
- **Zero Redundancy**: Memberikan satu cara utama untuk melakukan hal tertentu agar menghindari kebingungan.

## 2. Core Actions (The "Big Four")
| Nama Aksi | Label Visual | Tujuan |
| :--- | :--- | :--- |
| **Pray / Support** | 🙏 Amin | Bentuk dukungan emosional dan spiritual tercepat. |
| **Reflect** | 💬 Refleksi | Memberikan pemikiran mendalam atau testimoni di kolom komentar. |
| **Save** | 🔖 Simpan | Untuk konsumsi pribadi nanti (pembelajaran rohani). |
| **Share** | 🔗 Bagikan | Untuk menyebarkan berkat ke luar komunitas (WhatsApp/Internal). |

## 3. Conditional Actions by Post Type
Interaksi akan menyesuaikan dengan konteks postingan:

| Tipe Post | Primary Action | Secondary Action | Ketentuan Spesial |
| :--- | :--- | :--- | :--- |
| **Reflection / Testimoni** | 🙏 Amin | 💬 Refleksi | Mengaktifkan komentar secara default. |
| **Prayer Request** | 🙏 Amin | 💬 Refleksi | Amin di sini berarti "Saya mendoakan Anda". |
| **Daily Verse / Quote** | 🔖 Simpan | 🔗 Bagikan | Fokus pada retensi dan penyebaran konten. |
| **Official Announcement** | 🙏 Amin | 🔗 Bagikan | Komentar opsional (tergantung kebutuhan feedback). |
| **Contextual Prompt (AI)** | 💬 Refleksi | 🙏 Amin | Fokus pada menjawab pertanyaan pemicu diskusi. |

## 4. Redundant Patterns to Avoid
- **Hapus "Like" (Heart)**: Konsolidasikan semua bentuk persetujuan positif ke tombol **"Pray/Amin"**. Dua tombol yang mirip akan membuat feed terasa bising.
- **Hapus "Repost"**: Hindari sistem "retweet" yang bising. Gunakan "Internal Share" jika perlu, tapi biarkan feed tetap bersih.
- **Minimal Stats**: Tampilkan angka interaksi hanya jika signifikan (lebih dari 0) untuk menghindari perasaan "kosong" pada postingan baru.

## 5. Composer Behavior (Simple & Natural)
- **Mode Ringan**: Fokus pada teks mentah (spiritual thoughts) dan satu gambar opsional.
- **Prompt Awareness**: Jika pengguna memposting jawaban dari kartu refleksi harian, tampilkan label "Menjawab Refleksi: [Judul]".
- **Auto-Tagging**: Sistem mendeteksi secara otomatis jika postingan mengandung doa atau testimoni berdasarkan kata kunci sederhana atau pilihan tombol cepat.

## 6. UX Reasoning
Jemaat di platform rohani cenderung mencari kedamaian dan kedalaman. Tombol "Pray/Amin" memberikan nilai spiritual yang lebih tinggi daripada "Like" sosial biasa. Dengan menyembunyikan interaksi yang tidak perlu (seperti Share pada pengumuman yang bersifat sangat internal), kita menjaga fokus pengguna pada pertumbuhan rohani.

---

## Source: Daily_Automation_Architecture.md

# Architecture: Daily Automation Rhythm

Dokumen ini mendefinisikan desain otomasi harian untuk menjaga keaktifan feed `/today` dan `/community` menggunakan konten resmi dari akun sistem.

## 1. Automation Content Types
Konten yang diproduksi secara otomatis dibagi menjadi dua kategori:

| Tipe Konten | Sumber | Frekuensi | Akun |
| :--- | :--- | :--- | :--- |
| **Today Verse** | `DailyContent` | 1x / Hari (Pagi) | The Shepherd |
| **Quote of the Day** | `DailyContent` | 1x / Hari (Siang) | The Shepherd |
| **Reflection Prompt** | `DailyContent` / AI | 1x / Hari (Sore) | The Shepherd |
| **Prayer Prompt** | `DailyContent` / AI | 1x / Hari (Malam) | The Shepherd |
| **Community Highlight** | Algoritma (Post Populer) | 2x / Minggu | System |
| **Editorial Encouragement** | Manual/AI Assisted | Ad-hoc | The Encourager |

## 2. Scheduler Plan (Laravel Scheduler)
Jadwal eksekusi di `routes/console.php`:

- **05:00**: `app:daily-maintenance` (Mempublikasikan ayat harian & quote).
- **12:00**: `app:publish-due-posts` (Mengecek jika ada antrean pengumuman).
- **18:00**: `app:daily-engagement` (Memicu *Social Ignition* untuk diskusi sore).
- **Setiap Jam**: `app:publish-due-posts` (Sync status publikasi).

## 3. Command Responsibilities
- **`app:daily-maintenance` (Existing)**: 
    - Melakukan jembatan (`Bridge`) dari `DailyContent` ke `MemberPost`.
    - Membersihkan cache feed.
- **`app:publish-due-posts` (Existing)**:
    - Memproses postingan resmi yang memiliki `scheduled_at`.
- **`app:generate-community-summary` (New Suggestion)**:
    - Menggunakan AI untuk merangkum diskusi paling hangat dalam 24 jam terakhir menjadi satu kartu "Community Pulse".

## 4. Fallback Behavior
Jika pada hari tersebut tidak ada entri di `DailyContent` (Admin lupa mengisi):
- **Rule 1: Static Fallback**: Mengambil konten dari "Evergreen Library" (Ayat/Quote universal).
- **Rule 2: AI Generation**: Meminta `AIContentAssistant` untuk menghasilkan draf instruksi refleksi berdasarkan tema minggu ini.
- **Rule 3: Skip & Notify**: Jika gagal total, sistem tidak memposting apapun agar tidak terlihat "broken", dan mengirimkan notifikasi internal ke Admin.

## 5. Difference between /today and /community
- **Dashboard `/today` (Ritual Focus)**:
    - Konten bersifat statis dan langsung (Ayat hari ini).
    - Tidak menumpuk (Hanya menampilkan yang relevan untuk jam sekarang).
- **Feed `/community` (Social Focus)**:
    - Konten bersifat interaktif (Memicu komentar).
    - Membangun sejarah (Bisa di-*scroll* ke belakang).
    - Akun **The Encourager** hanya aktif di sini untuk memberikan dukungan di kolom komentar.

## 6. Safety Rules (No Deception)
- ✅ **Hanya Akun Resmi**: Otomasi hanya boleh memposting dari akun yang memiliki badge "Official".
- ✅ **Transparansi Waktu**: Konten otomatis boleh mencantumkan "Posted by System" jika bersifat rangkuman teknis.
- ❌ **No Ghost Likes**: Sistem dilarang memberikan *Like* otomatis pada postingan member hanya untuk membuat member merasa senang secara palsu.
- ❌ **No Bot Arguments**: AI tidak boleh berdebat dengan member; hanya boleh bertanya untuk klarifikasi atau memberikan penyemangat berbasis ayat.

---

## Source: engagement_engine_strategy.md

# Strategic Framework: Faith Community Engagement Engine

Sebagai Senior Product Strategist, saya merumuskan arsitektur ini bukan sekadar sebagai fitur media sosial, melainkan sebagai **sistem operasi spiritual** (Spiritual OS) yang mengelola perhatian, niat, dan interaksi komunitas untuk menghasilkan pertumbuhan iman.

---

### 1. Definisi Engine
**Faith Community Engagement Engine** adalah sistem orkestrasi konten dan partisipasi yang dirancang untuk membangun kebiasaan spiritual harian (Daily Liturgy) melalui perpaduan antara kurasi sistem (ritualitas) dan interaksi organik komunitas. 

Dalam konteks platform iman, engine ini bertindak sebagai "moderator digital" yang memastikan setiap kali pengguna membuka aplikasi, mereka tidak hanya melihat "informasi", tetapi masuk ke dalam sebuah "pengalaman peribadatan komunal" yang terpandu.

---

### 2. Masalah Utama yang Diselesaikan
- **The Empty Sanctuary Syndrome**: Menghindari kesan "aplikasi mati/sepi" saat user murni (UGC) masih sedikit. Engine mengisi kekosongan dengan konten sistem yang berkualitas tinggi namun tetap terasa personal.
- **Participation Paralysis**: Menghilangkan kebingungan "Saya harus posting apa?" dengan menyediakan pemicu yang sangat spesifik (Directed Participation).
- **Spiritual Burnout/Noise**: Berbeda dengan sosmed biasa yang menguras energi, engine ini memecahkan masalah distraksi dengan fokus pada satu pesan harian (Focus-driven UX).
- **Isolation in Faith**: Menyelesaikan paradoks "merasa sendirian saat beribadah online" dengan memberikan sinyal kehadiran nyata dari anggota komunitas lainnya (Social Proof of Faith).

---

### 3. Perbedaan: Community Feed Biasa vs. Faith Engine

| Dimensi | Community Feed Biasa (Social) | Faith Engagement Engine (Spiritual) |
| :--- | :--- | :--- |
| **Tujuan Utama** | Retensi & Adiksi (Dopamine) | Pertumbuhan Iman & Disiplin (Spirituality) |
| **Logika Konten** | Algoritma (Viralitas/Populer) | Liturgis (Ritual Harian/Tema) |
| **Pemicu Aksi** | Bebas/Generic ("Apa yang Anda pikirkan?") | Terpandu/Contextual ("Apa yang Anda syukuri?") |
| **Metrik Sukses** | Scroll Depth & Time Spent | Konsistensi Harian & Kedalaman Refleksi |
| **Vibe Visual** | Berisik, Cepat, Stimulatif | Kalem, Reflektif, Suci/Murni |

---

### 4. Pilar Engine (The 4 Pillars)
1. **Pillar of Ritual (Stabilitas)**: Konten tetap yang tidak pernah absen (Ayat, Quote, Doa). Ini adalah jangkar keamanan pengguna; mereka tahu platform selalu "siap" melayani mereka setiap pagi.
2. **Pillar of Fellowship (Koneksi)**: Lapisan interaksi antar user yang bukan sekadar 'Like', tapi 'Pray with' atau 'Encourage'. Menekankan pada beban bersama dan dukungan komunal.
3. **Pillar of Guidance (Aksi)**: Menghilangkan friksi kognitif. Pengguna tidak perlu berpikir, mereka hanya perlu merespons. "Satu hari, satu langkah kecil."
4. **Pillar of Presence (Sinyal)**: Indikator aktivitas halus yang menunjukkan bahwa di saat yang sama, ada "Chosen People" lain yang sedang melakukan hal yang sama. Menciptakan rasa *belonging*.

---

### 5. Engagement Loops (The Sacred Loop)
Engine ini bekerja dalam loop tertutup yang memperkuat identitas spiritual:

1. **Trigger (Internal/External)**: Notifikasi pagi atau alarm batin untuk perenungan.
2. **Ritual (Input)**: Membaca Ayat Hari Ini & Quote (Low energy consumption).
3. **Reflect (Output)**: Memberikan tanggapan singkat atas *Reflection Prompt* atau memilih emosi (Soft contribution).
4. **Connection (Social)**: Melihat bagaimana orang lain merenungkan hal yang sama, menekan "Amin" pada doa orang lain.
5. **Reward (Spiritual/Intrinsic)**: Perasaan damai, terkoneksi dengan Tuhan & sesama, dan kemajuan disiplin diri.

---

### 6. Menghidupkan Home /Today (Low User Strategy)

Engine ini menggunakan taktik **"System-Anchor, User-Accent"** untuk memastikan feed tidak pernah kosong:

- **Seeding Content**: Sistem secara otomatis menjadwalkan "konten pemicu" di sela-sela feed (Question of the day, Testimoni terpilih).
- **Density Control**: Jika tidak ada post user baru dalam 6 jam terakhir, engine akan memunculkan "Refleksi Editor" atau "Katalog Kebaikan" untuk menjaga kepadatan feed.
- **Aggregation Sinyal**: Alih-alih menunjukkan "0 Komentar", sistem menunjukkan "42 Orang sedang merenung secara privat". Ini menciptakan kesan kehidupan tanpa membutuhkan teks dari user.
- **Micro-Commitments**: Mendorong interaksi satu ketukan (Praying/Amin) yang membuat timeline tetap berdenyut secara visual meskipun tidak ada postingan panjang.

---

### 7. Prinsip Produk
- **Substance over Speed**: Lebih baik satu post bermakna daripada 10 post sampah.
- **Graceful Failure**: Jika user melewatkan satu hari, jangan beri mereka rasa bersalah, tapi berikan pintu masuk kembali yang hangat.
- **Community Managed, System Guided**: Berikan arahan dari sistem, tapi biarkan komunitas yang menghidupkan suasana.

---

### 8. Hal yang Harus Dihindari
- **Gamification Berlebihan**: Menghindari leaderboards kompetitif yang merusak ketulusan (spiritual ego).
- **Toxic Positivity**: Memungkinkan user untuk berbagi pergumulan (Vulnerability), tidak hanya hal-hal indah.
- **UGC Overlap**: Jangan biarkan feed menjadi tempat iklan atau postingan tidak relevan yang merusak "kesucian" ruang /today.
- **Complexity**: Jangan meminta user melakukan lebih dari 3 langkah dalam satu sesi pagi.

---

## Source: feed_composition_engine.md

# Desain Feed Composition Engine: TheChosenTalks

Halaman `/today` bukan sekadar "Timeline", melainkan sebuah **Curated Daily Dashboard**. Feed Engine ini berfungsi sebagai konduktor yang mengatur kapan *Ritual Sistem*, *Doa Jemaat*, dan *Kesaksian* muncul untuk menciptakan resonansi spiritual.

---

## 1. Struktur Komposisi Feed

Feed disusun menggunakan metode **Slotting & Interleaving**, bukan sekadar urutan waktu (reverse-chronological).

### A. Fixed Slots (Jangkar Feed)
Slot yang lokasinya tetap untuk menjamin struktur halaman tidak berantakan.
- **Slot 1 (Hero)**: `Daily Verse` (Pesan utama hari ini).
- **Slot 2 (Intro)**: `Reflection Prompt` (Pemicu partisipasi awal).
- **Slot 5 (Mid-Bridge)**: `Pinned Lesson` (Sabbath School / Learning path).
- **Slot 8 (Wisdom)**: `Quote of the Day` (Penguatan singkat).

### B. Dynamic Slots (The Pulse)
Diisi oleh item dari `Hybrid Feed Service` berbasis ranking.
- **Slot 3, 4, 6, 7, 9, 10+**: Diisi oleh campuran UGC, Seeded, dan Editorial.

---

## 2. Logika Ranking (The Score Engine)

Setiap item feed dinilai berdasarkan skor akumulatif:

| Faktor | Bobot | Deskripsi |
| :--- | :--- | :--- |
| **Freshness** | 40% | Menurun (decay) seiring bertambahnya usia post (half-life 24 jam). |
| **Urgency** | 30% | Skor tinggi untuk `Prayer Request` dengan **0 Amin**. |
| **Engagement** | 20% | Skor naik jika ada aktivitas baru (comment/reaction) dalam 1 jam terakhir. |
| **Featured** | 10% | Skor tambahan untuk konten yang ditandai **Editor's Choice** oleh Admin. |

---

## 3. Aturan Distribusi & Diversitas (The Variety Guard)

Untuk menghindari feed yang membosankan, Engine menerapkan aturan:
1.  **Max-in-a-Row**: Maksimal 2 item dengan tipe yang sama muncul berturutan.
2.  **Anti-Clumping**: Jika sudah ada `Prayer Request` di Slot 3, Slot 4 WAJIB bertipe lain (misal: `Testimony` atau `System Post`).
3.  **Source Balance**: Menjaga rasio 60% Seeded/System : 40% UGC di fase awal komunitas.

---

## 4. Fallback Rules (Ghost-Town Prevention)

Jika UGC (`member_posts`) masih sangat sedikit, Engine akan:
- **Time Stretching**: Memperpanjang usia tampil *Seeded Content* berkualitas tinggi.
- **Recursive Rituals**: Memasukkan `System Posts` menarik dari 2-3 hari lalu yang belum dibaca user tersebut.
- **Editorial Boost**: Menampilkan konten pengajaran (Editorial) lebih sering untuk mengisi ruang kosong.

---

## 5. Contoh Urutan 10 Item Feed (Simulasi)

| Urutan | Tipe Item | Sumber | Alasan Logis |
| :--- | :--- | :--- | :--- |
| 1 | **Daily Verse** | System (Fixed) | Entry point spiritual utama. |
| 2 | **Reflection Prompt** | System (Fixed) | Ajakan partisipasi mikro. |
| 3 | **Urgent Prayer** | UGC (Dynamic) | **No One Prays Alone** (0 Amin). |
| 4 | **Member Reflection** | Seeded (Dynamic) | Memberikan kedalaman narasi. |
| 5 | **Pinned Lesson** | System (Fixed) | Edukasi terstruktur (Sabbath School). |
| 6 | **Testimony** | UGC (Dynamic) | Merayakan karya Tuhan (High Engagement). |
| 7 | **Discussion Starter** | Admin (Dynamic) | Memicu interaksi antarmember. |
| 8 | **Quote of the Day** | System (Fixed) | Wisdom pearl untuk meditasi cepat. |
| 9 | **Prayer Request** | UGC (Dynamic) | Permintaan doa terbaru. |
| 10 | **Image Reflection** | Seeded (Dynamic) | Penutup feed yang visual dan menenangkan. |

---

## 6. Implementasi Teknis (Laravel Pseudocode)

```php
// Query Logic di TodayFeedService
$items = MemberPost::active()
    ->withUrgencyScore() // Boost prayer with 0 amins
    ->withFreshnessScore() 
    ->orderByDesc('composite_score')
    ->get();

return $this->applyVarietyGuard($items, $fixedSlots);
```

---

## Source: file_level_implementation_plan.md

# File-Level Implementation Plan: SAFE Engagement Architecture

This plan maps the specific file changes needed to implement the SAFE Engagement Architecture on top of the existing codebase.

## 1. Inspect First (Context)
- `app/Services/TodayFeedService.php`: Understand current hydration logic.
- `app/Services/Engagement/FeedComposerService.php`: Understand current scoring/variety logic.
- `app/Jobs/Engagement/DailyEngagementJob.php`: Existing bridging logic to be refactored into a service.
- `resources/js/Components/ActionBar.tsx`: Existing action visibility logic.

## 2. Enums (Refinement)
- [x] **[NEW]** `app/Enums/SourceType.php`: Done.
- [x] **[NEW]** `app/Enums/ReviewStatus.php`: Done.
- [x] **[MODIFY]** `app/Enums/PostType.php`: Added `allowedInteractions()`.

## 3. Database & Models
- [x] **[NEW]** `2026_03_06_120119_enhance_models_for_engagement_v2.php`: Migration run.
- [x] **[MODIFY]** `app/Models/User.php`: Added `is_system`, `system_type`.
- [x] **[MODIFY]** `app/Models/MemberPost.php`: Added `source_type`, `is_featured`, `daily_content_id`.
- [x] **[MODIFY]** `app/Models/DailyContent.php`: Added `source_type`, `review_status`, moderation fields.

## 4. Service Layer (The Core)

### [NEW] `app/Services/Engagement/CommunityFeedService.php`
- Handles fetching and formatting of the `/community` feed.
- Dependencies: `FeedComposerService`.

### [NEW] `app/Services/Engagement/DailyAutomationService.php`
- Orchestrates bridging rituals to community and triggering AI comments.
- Logic from `DailyEngagementJob` moves here.

### [NEW] `app/Services/Interaction/PostInteractionPolicyService.php`
- Backend enforcement of `allowedInteractions()` from the enum.

### [MODIFY] `app/Services/Engagement/FeedComposerService.php`
- Update `calculateScore()` to use the new `is_featured` column and `urgent` prayer logic.

### [MODIFY] `app/Services/Engagement/SystemAccountService.php`
- Add methods to retrieve `Pulse` account.
- Add helper for system-account-specific interaction badges.

## 5. Console & Scheduler

### [NEW] `app/Console/Commands/Community/BridgeDailyContentCommand.php`
- Triggers the bridging logic in `DailyAutomationService`.

### [NEW] `app/Console/Commands/Community/GeneratePulseCommand.php`
- Triggers `CommunityPulseService`.

### [MODIFY] `routes/console.php`
- Register the new commands in the scheduler.

## 6. Filament Admin

### [MODIFY] `app/Filament/Resources/DailyContentResource.php`
- Update form to show `ReviewStatus` and `SourceType`.
- Add "Approve" custom action to list and edit pages.
- Integrate "AI Suggest" draft trigger.

### [MODIFY] `app/Filament/Resources/MemberPostResource.php`
- Add "Feature" toggle.
- Add "Convert to Highlight" action.

## 7. Frontend Logic

### [MODIFY] `resources/js/Components/ActionBar.tsx`
- Sync action visibility with the backend `allowedInteractions()` policy.

## 8. Seeding

### [NEW] `database/seeders/SystemAccountSeeder.php`
- Ensures Shepherd, Encourager, and Pulse identities exist with the `is_system` flag.

---

## Coding Order
1. **Service Foundation**: `PostInteractionPolicyService` -> `DailyAutomationService`.
2. **Commands**: Wrap services into Artisan commands.
3. **Scheduler**: Wire up commands in `console.php`.
4. **Admin UI**: Enhance Filament resources for HITL workflow.
5. **Feed Orchestration**: `CommunityFeedService` -> Refactor `TodayFeedService`.
6. **Frontend**: Final UI polish for conditional actions.

---

## Testing Checklist
- [ ] Verify `BridgeDailyContentCommand` creates `MemberPost` with correct `daily_content_id`.
- [ ] Verify `is_featured` posts appear at the top of the feed (with enough weight).
- [ ] Verify `PostInteractionPolicyService` blocks "Like" on an `EDITORIAL` post.
- [ ] Verify Filament "Approve" action correctly sets `reviewed_at`.
- [ ] Verify system accounts are never returned as regular members in the feed (proper labeling).

---

## Source: final_engagement_engine_blueprint.md

# FINAL MASTER BLUEPRINT: Faith Community Engagement Engine (TheChosenTalks)

Dokumen ini adalah cetak biru komprehensif yang menyatukan visi produk, arsitektur teknis, dan strategi operasional untuk membangun ekosistem komunitas yang hidup dan bermakna di TheChosenTalks.

---

## 1. Visi & Tujuan Engine
**Vision**: Menjadikan TheChosenTalks sebagai "Rumah Rohani Digital" di mana setiap user merasa ditemani, didengar, dan dikuatkan setiap hari.

**Core Objectives**:
- **Daily Resonance**: Menciptakan ritme harian (Metronome) melalui ritual Ayat, Kutipan, dan Refleksi.
- **Deep Connection**: Mengubah interaksi dangkal (like/share) menjadi dukungan spiritual (Amin/Doakan).
- **Anti-Ghosting**: Memastikan tidak ada pengguna yang merasa sendirian, bahkan saat aktivitas jemaat asli masih rendah.

---

## 2. Peran Halaman /Today
Halaman /Today berfungsi sebagai **Dashboard Dashboard Spiritual** harian. Ia bukan sekadar timeline, melainkan kurasi yang mengikuti ritme waktu dan kondisi iman pengguna (Greeting personal, Hero Verse, dan Pulse Komunitas).

---

## 3. Struktur Hybrid Feed & Composition
Feed disusun menggunakan metode **Slotting & Interleaving** berbasis skor cerdas:
- **Ranking Logic**: Mengutamakan *Freshness* (40%), *Urgency/Prayer* (30%), *Engagement* (20%), dan *Editor's Choice* (10%).
- **Variety Guard**: Menjamin keberagaman konten agar tidak monoton (Max 2 item bertipe sama secara beruntun).
- **Hybrid Composition**: Campuran antara konten sistem (Ritual), konten seeded (Modelling), dan konten user asli (UGC).

---

## 4. Interaction & Participation Engine
Sistem UX dirancang untuk menurunkan hambatan partisipasi melalui:
- **Participation Journey**: Bimbingan bertahap dari *Observer* (Membaca) -> *Participant* (Amin/One-tap) -> *Contributor* (Minta Doa/Testimony).
- **Meaningful Actions**: Mengganti tombol "Post" dengan *Intent-based CTA* seperti "Bagikan Berkat" atau "Kirim Penguatan".
- **Directed Prompts**: Menghindari kanvas kosong dengan menyediakan pertanyaan harian yang spesifik.

---

## 5. Content Seeding Strategy
Strategi untuk "menghangatkan" komunitas di fase awal:
- **Seeded Inventory**: Koleksi 30 hari ritual dan 20+ postingan awal yang terasa natural.
- **Editorial Personas**: Penggunaan akun persona (*The Shepherd*, *The Encourager*) untuk menunjukkan perilaku komunitas yang sehat.
- **Modeling Behavior**: Menggunakan seeded content untuk menetapkan standar kualitas postingan komunitas.

---

## 6. Arsitektur Teknis (Laravel 12 + Inertia + React)

### A. Database Design (MVP)
- **`daily_contents`**: Tabel ritual sistem dengan JSON payload.
- **`member_posts`**: Tabel induk semua konten feed (Optimized for single-trip query).
- **`member_post_reactions`**: Tabel interaksi spiritual (Pray, Encouraged, Like).

### B. Backend Service Layer
- **`TodayFeedService`**: Orchestrator dashboard.
- **`DailyContentService`**: Ritual provider dengan caching.
- **`FeedComposerService`**: Logic ranking & variasi feed.
- **`SpiritualInteractionService`**: Logic interaksi & notifikasi.

### C. Frontend Component Architecture
- **Pola Atomic**: `Page` -> `Sections` -> `Cards` -> `FeedItems`.
- **Dynamic Rendering**: `FeedItemRenderer` sebagai switch dinamis untuk berbagai tipe postingan.
- **Type Safety**: Kontrak TypeScript yang ketat antara backend (FeedItem interface) dan frontend.

---

## 7. Admin Workflow (Filament)
- **Weekly Planning**: Admin mengelola konten ritual 7 hari ke depan.
- **Daily Heartbeat Check**: Editor mendoakan permintaan doa yang sepi (0 Amin) dan melakukan moderasi cepat.
- **Seeded Injection**: Menyuntikkan konten baru secara terjadwal untuk menjaga kesegaran feed.

---

## 8. Roadmap Implementasi
1.  **Phase 1 (Ritual Foundation)**: Menghidupkan dashboard harian (Ready).
2.  **Phase 2 (Engagement Loops)**: Implementasi interaksi "Amin" & "Minta Doa" (Ready).
3.  **Phase 3 (Intelligence)**: Implementasi komposisi feed dinamis & Variety Guard (In-progress).
4.  **Phase 4 (Social Proof & Scaling)**: Notifikasi real-time & Community analytics (Future).

---

## 9. Risiko Utama & Mitigasi
- **Risiko: Ghost-town Feel**. -> *Mitigasi*: Seeded behavior yang masif & algoritma fallback konten sistem.
- **Risiko: Spam/Konten Tidak Pantas**. -> *Mitigasi*: Moderasi kilat via Filament & Soft-hide mechanism.
- **Risiko: User Intimidation**. -> *Mitigasi*: UX harian berbasis prompt, bukan blank canvas.

---

**Cetak biru ini siap menjadi panduan utama untuk membawa TheChosenTalks ke tingkat keterlibatan komunitas yang lebih dalam dan berdampak.**

---

## Source: frontend_architecture_design.md

# Arsitektur Komponen Frontend: TheChosenTalks (/today)

Agar halaman `/today` tetap maintainable saat fitur bertambah, kita menerapkan pola **Atomic & Sectional Design**. Fokus utamanya adalah memisahkan antara *Layout Tetap (Dashboard)* dan *Umpan Dinamis (Feed)*.

---

## 1. Hierarki Komponen

### A. Page Level (The Orchestrator)
- **`TodayPage (Index.tsx)`**: Menampung data dari Inertia (rituals, hybridFeed) dan mendistribusikannya ke section-section.

### B. Section Level (The Layout)
- **`GreetingHeader`**: Ucapan selamat personal (Pagi/Siang/Malam) + Quick Stats.
- **`SpiritualHeroSection`**: Menampilkan `TodayVerseCard`.
- **`ActionShortcutBar`**: Container untuk `QuickActions` grid.
- **`HybridFeedSection`**: Container utama yang mengelola daftar `FeedItem`.

### C. UI & Content Cards (The Blocks)
- **`TodayVerseCard`**: Visualisasi utama ayat hari ini.
- **`QuoteCard`**: Kartu untuk kutipan inspiratif.
- **`ReflectionPromptCard`**: Kartu interaktif untuk memicu partisipasi mikro.
- **`CommunityHighlightCard`**: Widget statistik kehangatan komunitas.

### D. Feed Item Renderer (The Dynamic List)
- **`FeedItemRenderer`**: Komponen "Switch" yang memutuskan kartu mana yang harus dirender berdasarkan `post.type`.

---

## 2. Daftar Jenis Feed Item (Atom)

Setiap item di feed memiliki visual dan interaksi yang berbeda:

| Komponen | Tipe Data (`post.type`) | Fungsi Utama |
| :--- | :--- | :--- |
| **`UserPostCard`** | `member_post`, `testimony` | Menampilkan postingan umum atau kesaksian user. |
| **`PrayerRequestCard`** | `prayer_request`, `prayer` | Fokus pada teks doa & tombol "Amin". |
| **`SystemReflectionCard`** | `reflection` | Refleksi harian dari sistem/editor. |
| **`DiscussionPromptCard`** | `question` | Pertanyaan terbuka untuk diskusi komunitas. |
| **`ImagePostCard`** | `image_post` | Postingan visual dengan caption inspiratif. |

---

## 3. Struktur Folder (Scalable)

```text
resources/js/Pages/Today/
├── Index.tsx                  # Controller-like Page Component
├── Layouts/                   # Layout khusus Today (jika ada)
└── components/
    ├── sections/              # Komponen besar (Header, Feed Section)
    │   ├── GreetingHeader.tsx
    │   └── FeedList.tsx
    ├── cards/                 # Komponen dashboard (Verse, Quote)
    │   ├── TodayVerseCard.tsx
    │   └── ReflectionPrompt.tsx
    └── feed/                  # Semua variasi Feed Item
        ├── FeedItemRenderer.tsx
        ├── UserPostCard.tsx
        ├── PrayerRequestCard.tsx
        └── TestimonyCard.tsx
```

---

## 4. Pola Rendering Dinamis (FeedItemRenderer)

Gunakan pola ini untuk menangani berbagai jenis konten dalam satu loop:

```tsx
// FeedItemRenderer.tsx
const components = {
  member_post: UserPostCard,
  prayer_request: PrayerRequestCard,
  reflection: SystemReflectionCard,
  // ...
};

export const FeedItemRenderer = ({ item }: { item: FeedItem }) => {
  const Component = components[item.type] || UserPostCard;
  return <Component item={item} />;
};
```

---

## 5. Catatan TypeScript & Reusability
- **Shared Types**: Buat interface `FeedItem` pusat agar seragam antara backend (Service layer) dan frontend.
- **Optimistic Hoisting**: Interaksi seperti "Amin" atau "Encouraged" harus dikelola di level `FeedList` atau dipointing ke state global (jika menggunakan library state) untuk performa instan.
- **Micro-Animations**: Gunakan Framer Motion untuk transisi saat item feed masuk ke viewport atau saat interaksi diklik.

---

## 6. MVP vs Enhancement

| Tahap | Fokus Komponen |
| :--- | :--- |
| **MVP** | `Index`, `Greeting`, `VerseCard`, `FeedItemRenderer`, `PrayerRequestCard`, `UserPostCard`. |
| **Next Step** | `CommunityHighlight`, `ImagePostCard`, `InteractionTransitions`. |
| **Scaling** | `ChannelPostCard`, `GroupStudyWidget`. |

---

## Source: implementation_plan_final_polish.md

# Implementation Plan: Finalizing VerseHub Mentor System

This plan addresses the remaining gaps identified in the audit of `BIBLE ENGINE PROMPT.md`.

## User Review Required

> [!IMPORTANT]
> This phase introduces administrative tools (Filament) and UI refinements for the Mentor system.

## Proposed Changes

### [Frontend] VerseHub UI Refinements

#### [MODIFY] [MentorPanel.tsx](file:///e:/thechoosentalksbetaUpdate/resources/js/Components/versehub/MentorPanel.tsx)
- Update `AskResult` interface to include `interpretation` and `study_guidance`.
- Update rendering logic in the "Ask" tab to display these separate blocks with distinct styling.

### [Backend] Administrative Tools (Filament)

#### [NEW] [StudyPathResource.php](file:///e:/thechoosentalksbetaUpdate/app/Filament/Resources/StudyPathResource.php)
- Add management for Study Paths, Steps, and user progress.

#### [NEW] [VerseRelationshipResource.php](file:///e:/thechoosentalksbetaUpdate/app/Filament/Resources/VerseRelationshipResource.php)
- Add management for cross-verse links and canonical relationships.

#### [NEW] [VerseThemeResource.php](file:///e:/thechoosentalksbetaUpdate/app/Filament/Resources/VerseThemeResource.php)
- Add management for thematic mappings of verses.

### [Feature] Saved Quote Cards

#### [MODIFY] [VerseHubController.php](file:///e:/thechoosentalksbetaUpdate/app/Http/Controllers/VerseHubController.php)
- Add `quoteCard` method to render a dedicated OG preview with premium typography for "Saved Quotes".

#### [MODIFY] [web.php](file:///e:/thechoosentalksbetaUpdate/routes/web.php)
- Register route for `/versehub/{lang}/{ref}/quote`.

## Verification Plan

### Automated Tests
- `php artisan test` to ensure new routes don't break existing logic.

### Manual Verification
- Verify the "Ask" tab shows separated interpretation/guidance blocks.
- Verify Filament admin has new resources available.
- Preview the "Saved Quote Card" OG.

---

## Source: implementation_plan_phase_10.md

# Implementation Plan: Phase 10 (Safe Engagement Architecture)

Tujuan: Membangun sistem otomatisasi yang aman, transparan, dan spesifik untuk platform rohani tanpa menggunakan "fake users" atau bot penipu.

## Proposed Changes

### [Backend] System Interaction Engine

#### [NEW] [SystemAccountService.php](file:///e:/thechoosentalksbetaUpdate/app/Services/Engagement/SystemAccountService.php)
Layanan untuk mengelola akun resmi dan operasional platform (Official Personas).
- Metode `getShepherd()`: Mengembalikan user "The Shepherd" (Editorial & Wisdom).
- Metode `getEncourager()`: Mengembalikan user "The Encourager" (Support & Prayer).
- Metode `ensureSystemAccounts()`: Sinkronisasi akun sistem saat deployment/seeding.

#### [NEW] [DailyEngagementJob.php](file:///e:/thechoosentalksbetaUpdate/app/Jobs/Engagement/DailyEngagementJob.php)
Job yang dijadwalkan setiap pagi untuk menerbitkan postingan dari akun resmi.
- Logika: Mengambil data dari `DailyContent` (type `reflection_prompt` atau `prayer_prompt`).
- Aksi: Membuat `MemberPost` resmi berdasarkan konten harian tersebut.

#### [MODIFY] [routes/console.php](file:///e:/thechoosentalksbetaUpdate/routes/console.php)
- Menambahkan penjadwalan `DailyEngagementJob` setiap pagi (misal: 05:00 AM).

### [Admin] Human-in-the-Loop Management

#### [MODIFY] [DailyContentResource.php](file:///e:/thechoosentalksbetaUpdate/app/Filament/Resources/DailyContentResource.php)
- Menambahkan toggle "Auto-Post to Community" pada konten harian.
- Memberikan preview bagaimana konten tersebut akan tampil sebagai postingan resmi.

---

## Verification Plan

### Automated Tests
- `php artisan test --filter=SystemAccountServiceTest`: Memastikan akun sistem terdaftar dengan benar.
- `php artisan test --filter=DailyEngagementJobTest`: Memastikan job membuat postingan resmi dengan atribut yang tepat.

### Manual Verification
- Menjalankan `php artisan community:seed-demo` dan memverifikasi feed `/today`.
- Mencoba fitur "Auto-Post" melalui Filament Admin.

---

## Source: implementation_plan_phase_11.md

# Implementation Plan: Phase 11 (Community UX Refinement & AI Assistance)

Tujuan: Menyelaraskan UI Komunitas dengan mesin backend yang baru (Safe Engagement) dan memberikan asisten AI untuk persiapan konten di admin.

## Proposed Changes

### [Backend] Logic Unification

#### [MODIFY] [CommunityController.php](file:///e:/thechoosentalksbetaUpdate/app/Http/Controllers/CommunityController.php)
- Refactor `index()` untuk menggunakan `TodayFeedService` guna mengambil feed komunitas yang sudah ter-ranking.
- Sinkronisasi struktur data (menggunakan `formatFeedItem`).
- Gunakan `PostType` dan `ReactionType` enums secara konsisten.

#### [MODIFY] [CommunityPostController.php](file:///e:/thechoosentalksbetaUpdate/app/Http/Controllers/CommunityPostController.php)
- Update `store()` untuk mendukung `PostType` enum.
- Tambahkan dukungan unggah gambar sederhana (jika diperlukan untuk "image-based posts").

### [Frontend] Community UX Polish

#### [MODIFY] [Community/Index.tsx](file:///e:/thechoosentalksbetaUpdate/resources/js/Pages/Community/Index.tsx)
- Update TypeScript types (`CommunityPost`) untuk menyertakan `type`, `stats`, dan `interactions`.
- Hapus deteksi kategori client-side yang rapuh; gunakan `type` dari backend.
- **[NEW]** Integrasi `PostComposer` component di bagian atas feed.
- Tambahkan visual "Official" untuk postingan dari The Shepherd & The Encourager.

#### [MODIFY] [MemberPostCard.tsx](file:///e:/thechoosentalksbetaUpdate/resources/js/Components/community/MemberPostCard.tsx)
- Update aksi interaksi: Tambahkan tombol "Amin" (Pray) selain "Like".

### [Admin] AI-Assisted Workflow

#### [MODIFY] [DailyContentResource.php](file:///e:/thechoosentalksbetaUpdate/app/Filament/Resources/DailyContentResource.php)
- **[NEW]** Tambahkan Filament Action "AI Suggestion" untuk membantu admin menghasilkan draf renungan atau pertanyaan refleksi harian.

---

## Verification Plan

### Automated Tests
- `php artisan test --filter=CommunityControllerTest`: Memastikan feed terkirim dengan struktur baru.
- `php artisan test --filter=CommunityPostControllerTest`: Memastikan pembuatan post member tetap aman.

### Manual Verification
- Verifikasi feed `/community` menampilkan postingan dengan kategori yang benar (tanpa deteksi teks manual).
- Uji coba `PostComposer` baru dengan teks dan gambar.
- Cek tampilan "The Shepherd" di feed untuk memastikan autoritas transparan.

---

## Source: implementation_plan_phase_12.md

# Implementation Plan: Phase 12 (Automated Social Ignition)

Fase ini bertujuan untuk mengotomatiskan "jembatan" antara konten ritual harian (`DailyContent`) dengan aliran komunitas harian (`MemberPost`), serta memicu interaksi awal oleh akun sistem (AI-Assisted Social Ignition).

## User Review Required

> [!IMPORTANT]
> **Social Ignition Threshold**
> Konten yang diposting secara otomatis oleh sistem (Shepherd) akan mendapatkan komentar pembuka dari persona **The Encourager** untuk memancing partisipasi jamaah. Ini bertujuan agar tidak ada postingan yang terasa "kosong" di awal hari.

## Proposed Changes

### [Backend] Engagement Engine Extensions

#### [NEW] [DailyEngagementJob](file:///e:/thechoosentalksbetaUpdate/app/Jobs/DailyEngagementJob.php)
- Mencari `DailyContent` yang dijadwalkan hari ini.
- Melakukan transformasi data menjadi `MemberPost`.
- Mengatur atribusi ke **The Shepherd** (Editor).
- Memicu workflow "Social Ignition".

#### [MODIFY] [AIContentAssistant](file:///e:/thechoosentalksbetaUpdate/app/Services/AI/AIContentAssistant.php)
- Menambahkan metode `generateIgnitionComment(MemberPost $post)` untuk menghasilkan komentar pembuka yang relevan.

#### [NEW] [DailyMaintenanceCommand](file:///e:/thechoosentalksbetaUpdate/app/Console/Commands/DailyMaintenanceCommand.php)
- Artisan command `app:daily-maintenance` untuk membungkus semua tugas rutin harian.
- Menggantikan atau melengkapi `app:publish-due-posts`.

## Verification Plan

### Automated/Manual Tests
- Menjalankan `php artisan app:daily-maintenance` secara manual.
- Memverifikasi apakah record baru muncul di tabel `member_posts` dengan User ID milik Shepherd.
- Memverifikasi apakah komentar dari Encourager otomatis tercipta.
- Mengecek feed `/community` untuk melihat postingan "ritual" yang kini interaktif.

---

## Source: implementation_plan_phase_17.md

# Implementation Plan: Schema & Enum Extensions

This plan details the technical steps to implement the minimal schema and enum extensions identified in the proposal.

## 1. Enum Additions

### [NEW] `SourceType`
Tracks the provenance of content.
- `HUMAN` (member generated)
- `OFFICIAL` (manually created by staff/system)
- `AI_ASSISTED` (drafted by AI, reviewed by human)

### [NEW] `ReviewStatus`
Tracks the HITL (Human-in-the-Loop) workflow.
- `PENDING`
- `APPROVED`
- `REJECTED`

## 2. Minimal Schema Changes

### `users` table
- `is_system`: boolean flag for guides (Shepherd, etc).
- `system_type`: string category for internal logic.

### `daily_contents` table
- `source_type`: indexed enum (SourceType).
- `review_status`: indexed enum (ReviewStatus).
- `reviewed_by`: nullable foreign key to users.
- `reviewed_at`: nullable timestamp.

### `member_posts` table
- `source_type`: indexed enum (SourceType).
- `is_featured`: boolean for highlighting.
- `daily_content_id`: explicit relationship for bridged rituals.

## 3. Implementation Steps

1. **Enums**: Create `app/Enums/SourceType.php` and `app/Enums/ReviewStatus.php`.
2. **Migrations**: Create a consolidated migration to add these columns.
3. **Models**: Update `User`, `DailyContent`, and `MemberPost` with new `$fillable` fields and `$casts`.
4. **PostType Enhancement**: Add `allowedInteractions()` method to `app/Enums/PostType.php` to drive frontend action visibility.

## 4. Compatibility Notes
- Defaults are set to ensure existing member content is treated as `HUMAN` and `APPROVED`.
- No destructive changes; old metadata-based checks can coexist during the transition.

---

## Source: implementation_plan_phase_27.md

# Implementation Plan: Community Mobile UI Audit & Fixes

Targeting UI friction points on the `/community` page for iOS/Android mobile users.

## Proposed Changes

### [Component] [MemberPostCard](file:///e:/thechoosentalksbetaUpdate/resources/js/Components/community/MemberPostCard.tsx)
- **Modify**: Reduce padding from `px-8 pt-8` to `px-5 pt-5` (or `px-6 pt-6` on mobile) while keeping the roomier desktop padding.
- **Modify**: Increase inner padding for action bar on mobile to ensure tap targets are comfortable but densified.

### [Component] [PostComposer](file:///e:/thechoosentalksbetaUpdate/resources/js/Components/community/PostComposer.tsx)
- **New**: Add `overflow-x-auto` to the post-type selector row.
- **Modify**: Add `scrollbar-hide` (or equivalent) to keep it clean.
- **Modify**: Ensure "Send" button doesn't get pushed out of view.

### [Page] [Community/Index](file:///e:/thechoosentalksbetaUpdate/resources/js/Pages/Community/Index.tsx)
- **Modify**: Fix `sticky` archive header overlap. Sync it with layout header height.
- **Modify**: Ensure `TabsList` doesn't wrap oddly on narrow screens (min-width or horizontal scroll).
- **Modify**: Add subtle gradient fade to horizontal scroll area for archive categories.

## Verification Plan
### Browser Testing
1. Use Mobile Responsive mode (iPhone SE/12 Pro).
2. Verify card padding feels "premium" but not wasteful.
3. Scroll through archive categories horizontally.
4. Verify composer type chips don't break the layout.
5. Scroll down to check if sticky headers behave gracefully.

---

## Source: implementation_plan_phase_28.md

# Implementation Plan: PostComposer Mobile UI Polish (Phase 28)

Fixing the "terrible" mobile view of the community post composer by improving layout hierarchy, spacing, and component styling.

## Proposed Changes

### [Component] [PostComposer](file:///e:/thechoosentalksbetaUpdate/resources/js/Components/community/PostComposer.tsx)

#### 1. Layout Structure
- **Avatar Row**: Place the avatar alongside a friendly prompt (e.g., "Berbagi berkat...") to create a warm header.
- **Input Area**: Give the `textarea` its own full-width row with slightly more vertical room and a subtle background hint.
- **Action Bar**: Refactor the expanded section into two clear rows:
    - **Top row**: Horizontal scrollable chips for Post Type.
    - **Bottom row**: Channel selection + "Kirim" button.

#### 2. Visual Polish
- **Type Selection**: Add a gradient fade to the right of the scrollable chips to indicate more options.
- **Channel Selector**: Style the `select` to look like a premium chip with a Chevron icon.
- **Typography**: Match the `tct-` typography system for labels and inputs.
- **Animations**: Ensure smooth transitions between collapsed and expanded states.

#### 3. UX improvements
- Auto-focus or larger tap targets for mobile.
- Support for "All Joined Channels" default state.

## Verification Plan
1. Test on mobile viewports (Simulator).
2. Verify horizontal scroll for chips is intuitive.
3. Check that the Channel Selector dropdown works correctly and looks premium.
4. Ensure the "Kirim" button is prominent but doesn't feel clunky.

---

## Source: implementation_plan_phase_29.md

# Implementation Plan: VerseHub Mentor System (Phase 29)

Focusing on the architectural foundations and the premium sharing system.

## Proposed Changes

### [Backend] [VerseHubController](file:///e:/thechoosentalksbetaUpdate/app/Http/Controllers/VerseHubController.php)
#### [MODIFY] `renderOgPng`
- Redesign the OG template for a more "luxurious" look.
- Use a high-quality serif font (e.g., Playfair Display or similar via TTF).
- Implement a more sophisticated background generation or static asset loading.

### [Backend] [VerseHubMentorService](file:///e:/thechoosentalksbetaUpdate/app/Services/VerseHubMentorService.php) [NEW]
- Create service to handle queries to the "Scripture Guide".
- Implement prompts for "Initial Exploration" and "Theological Inquiries".
- Handle verse context injection for accurate AI responses.

### [Frontend] [Reader.tsx](file:///e:/thechoosentalksbetaUpdate/resources/js/Pages/VerseHub/Reader.tsx)
#### [MODIFY] UI Integration
- Add a "Scripture Guide" entry point in the verse tools menu.
- Implement a basic sidebar/panel for mentor interactions.
- Style with a premium, focused aesthetic.

## Verification Plan
1. **OG Previews**: Test `/versehub/{lang}/{ref}/og.png` on various refs to ensure visual consistency and luxury feel.
2. **Mentor Logic**: Verify `VerseHubMentorService` returns appropriately formatted and respectful responses.
3. **UI/UX**: Test the "Scripture Guide" panel on mobile and desktop for natural, non-intrusive feel.

---

## Source: implementation_plan_phase_30c.md

# Implementation Plan - Phase 30c: Study Paths & Progress Tracking

This phase implements guided Bible study paths within VerseHub, allowing users to follow curated sequences of verses with mentor-guided reflection questions.

## Proposed Changes

### [Backend] Routes & Controllers

#### [NEW] [StudyPathController.php](file:///e:/thechoosentalksbetaUpdate/app/Http/Controllers/StudyPathController.php)
Implement a controller to handle study path navigation and progress.
- `index()`: List all active study paths.
- `show()`: Show a specific path and its steps.
- `enroll()`: Join a study path (Auth required).
- `completeStep()`: Mark a step as read and trigger progress update.

#### [MODIFY] [web.php](file:///e:/thechoosentalksbetaUpdate/routes/web.php)
Register new routes:
- `GET /versehub/{lang}/study`
- `GET /versehub/{lang}/study/{slug}`
- `POST /versehub/{lang}/study/{slug}/join`
- `POST /versehub/{lang}/study/{slug}/complete/{stepId}`

### [Frontend] Inertia Pages

#### [NEW] [Index.tsx](file:///e:/thechoosentalksbetaUpdate/resources/js/Pages/VerseHub/StudyPaths/Index.tsx)
A premium-designed page for browsing available study paths.
- Use card-based layout with `cover_color` accents.
- Show difficulty and estimated time.

#### [NEW] [Show.tsx](file:///e:/thechoosentalksbetaUpdate/resources/js/Pages/VerseHub/StudyPaths/Show.tsx)
Details page for a specific study path.
- Show step list with completion status.
- Link directly to the VerseHub Reader with step context.

### [Data] Seeding

#### [NEW] [StudyPathSeeder.php](file:///e:/thechoosentalksbetaUpdate/database/seeders/StudyPathSeeder.php)
Seed 3 starter paths:
1. **Dasar Iman (Indonesian)** / **Foundations of Faith (English)**
2. **Mengenal Yesus** / **Knowing Jesus**
3. **Mengatasi Kecemasan** / **Overcoming Anxiety**

## Verification Plan

### Automated Tests
- `php artisan test --filter StudyPathTest` (to be created)
- Verify that a guest can view paths but not enroll.
- Verify that an enrolled user can mark steps as complete.

### Manual Verification
- Navigate to `/versehub/id/study` and verify the grid layout.
- Join a path and verify the progress bar updates when marking steps complete.

---

## Source: implementation_plan_phase_30d.md

# Implementation Plan - Phase 30d: Premium Share System & OG Generator

This phase focuses on making the Bible study experience highly shareable and visually stunning on social platforms. We will create a unified Share System and extend OG image support to Study Paths.

## Proposed Changes

### [Backend] Controllers & Routes

#### [MODIFY] [VerseHubController.php](file:///e:/thechoosentalksbetaUpdate/app/Http/Controllers/VerseHubController.php)
Refactor `renderOgPng` to be more flexible, supporting different themes and "Study Path" mode.
- Add `renderStudyPathOg(StudyPath $path)` method.
- Add thematic variants (Peace, Growth, Hope) based on `cover_color`.

#### [MODIFY] [StudyPathController.php](file:///e:/thechoosentalksbetaUpdate/app/Http/Controllers/StudyPathController.php)
Add OG image route for study paths.
- `ogImage(string $slug)`: Generates a premium OG image for the study path.

#### [MODIFY] [web.php](file:///e:/thechoosentalksbetaUpdate/routes/web.php)
Register:
- `GET /versehub/{lang}/study/{slug}/og.png`

### [Frontend] Components & UI

#### [NEW] [SharePanel.tsx](file:///e:/thechoosentalksbetaUpdate/resources/js/Components/versehub/SharePanel.tsx)
A premium, modal-based share interface.
- Options: Copy Link, WhatsApp, Telegram, and "Share to Community" (Inertia post).
- Shows a "Live Preview" of the premium OG image.

#### [MODIFY] [Reader.tsx](file:///e:/thechoosentalksbetaUpdate/resources/js/Pages/VerseHub/Reader.tsx)
Integrate the `SharePanel`.
- Add a "Share" button to the tool grid/sidebar.

#### [MODIFY] [Show.tsx](file:///e:/thechoosentalksbetaUpdate/resources/js/Pages/VerseHub/StudyPaths/Show.tsx)
Add a "Share Path" button that opens the `SharePanel`.

## Verification Plan

### Automated Tests
- `php artisan test --filter ShareSystemTest` (to be created)
- Verify `og.png` returns a valid image for both verses and paths.

### Manual Verification
- Share a verse to WhatsApp and verify the dark-navy/gold OG preview.
- Share a Study Path and verify the theme-colored OG preview.

---

## Source: implementation_plan_phase_30e.md

# Implementation Plan: Phase 30e — Bible Interaction Loop & Reflection History

This phase implements the "Reflect" pillar of the Scripture-Centered Mentor System, allowing users to move from passive reading to active spiritual engagement.

## Proposed Changes

### 1. Backend: Data & Persistence

#### [NEW] `create_reflection_responses_table` (Migration)
- `user_id` (FK)
- `verse_ref` (string, e.g., 'jhn-17-3')
- `question_text` (text)
- `answer_text` (text)
- `is_private` (boolean, default true)
- `timestamps`

#### [NEW] `ReflectionResponse` (Model)
- Basic model with `belongsTo(User)` and property casting.

#### [NEW] `VerseHubReflectionController`
- `store(Request $request)`: Validates and saves a reflection.
- `index(Request $request)`: Returns a paginated list of user reflections for the "My Spiritual Journey" page.

### 2. Frontend: Reader Integration

#### [NEW] `EndOfChapterPrompt.tsx`
- A premium, calm component that appears at the bottom of the verse list.
- Displays a single "Reflection of the Day" question generated by the `VerseHubMentorService`.
- Triggers the `ReflectionComposer`.

#### [NEW] `ReflectionComposer.tsx`
- A focused, distraction-free modal/drawer for writing reflections.
- Premium typography (Serif for the question).

#### [MODIFY] `Reader.tsx`
- Integrate `EndOfChapterPrompt` at the end of the verses loop.
- Add logic to check if a user has already reflected on the current chapter.
- Add "Inline Reflection Markers" (faint dots) next to verse numbers where a reflection exists.

### 3. Frontend: Spiritual Journey

#### [MODIFY] `MySpiritualJourney.tsx` (or similar)
- Add a new "Reflections" tab to show the history of saved responses.

---

## Verification Plan

### Automated Tests
- `php artisan test --filter ReflectionResponseTest` (I will create a basic test for the store logic).

### Manual Verification
1. **Reading Flow**: Scroll to the end of a chapter in VerseHub.
2. **Engagement**: Verify the "Reflection Prompt" appears with a relevant question.
3. **Submission**: Write and save a reflection.
4. **Visibility**: Verify the "Reflection Marker" appears next to the verse.
5. **History**: Go to "My Spiritual Journey" and verify the reflection is listed.

---

## Source: implementation_plan_phase_9.md

# Implementation Plan: Phase 9 (Engagement Intelligence)

Tujuan: Meningkatkan kualitas feed komunitas dengan algoritma ranking cerdas dan sistem penjamin variasi konten (Variety Guard).

## Proposed Changes

### [Backend] Engagement Engine Logic

#### [MODIFY] [FeedComposerService.php](file:///e:/thechoosentalksbetaUpdate/app/Services/Engagement/FeedComposerService.php)
- Implementasi `calculateScore()` method:
    - **Freshness**: Exponential decay (konten 24 jam pertama memiliki bobot tinggi).
    - **Urgency**: Bonus skor signifikan untuk `prayer_request` dengan `pray_count === 0`.
    - **Engagement**: Peningkatan skor berdasarkan jumlah Amin, Berkat, dan Komentar.
    - **Editor Choice**: Bonus skor untuk konten yang ditandai sebagai `featured` di metadata.
- Implementasi `VarietyGuard`:
    - Memastikan tidak ada lebih dari 2 item bertipe sama berurutan.
    - Sistem "Interleaving" yang lebih cerdas (jika terdeteksi duplikasi tipe, cari item terbaik berikutnya dari tipe yang berbeda).

#### [MODIFY] [TodayFeedService.php](file:///e:/thechoosentalksbetaUpdate/app/Services/TodayFeedService.php)
- Penyesuaian `fetchLimit` untuk memberikan ruang lebih bagi algoritma ranking (misal: ambil 100 untuk tampilkan 20).
- Memastikan meta-data yang dibutuhkan untuk ranking (counts) terambil dengan benar.

## Verification Plan

### Automated Tests
- Create unit test for `FeedComposerService` to verify:
    - Urgent prayers are ranked higher.
    - Variety guard correctly prevents 3 consecutive items of same type.
    - Fresh content is ranked higher than stagnant old content.

### Manual Verification
- Verifikasi visual di halaman `/today`:
    - Apakah postingan doa tanpa "Amin" muncul di posisi atas.
    - Apakah tipe postingan terlihat variatif (tidak menumpuk satu jenis).

---

## Source: implementation_plan.md

## Phase 2: Engagement Loops (Executed)
- Implementasi interaksi spiritual "AMIN" (Pray) dan "Tersentuh" (Encouraged).
- Integrasi "One-tap response" pada kartu refleksi dan pertanyaan harian.
- Restrukturisasi halaman `/today` mengikuti ritme spiritual (Verse -> Reflection -> Pulse -> Learning -> Quote).

## Phase 3: Hybrid Feed Logic (Executed)
- Algoritma "No One Prays Alone" untuk memprioritaskan doa yang belum dijawab.
- "Variety Guard" untuk menjaga keberagaman tipe konten di timeline.
- Strategi seeding konten untuk membangun kehangatan komunitas di fase awal.

## Phase 4: Admin Dashboard & Sustainability (Executed)
- `DailyContentResource` untuk pengelolaan mandiri konten ritual harian.
- Peningkatan `MemberPostResource` dengan visibilitas metrik interaksi spiritual.

## Participation Strategy (Designed)
- **Guided UX**: Mengganti input post kosong dengan prompt spesifik (misal: "Apa berkatmu hari ini?").
- **Low-Friction Loops**: Implementasi aksi "one-tap" untuk menurunkan hambatan bagi user baru.
- **Participation Journey**: Bimbingan bertahap dari Observer (Membaca/Amin) menuju Contributor (Posting Doa/Kesaksian).

## Frontend Architecture (Designed)
- **Component Hierarchy**: Page -> Sections -> Cards -> FeedItems.
- **FeedItemRenderer**: Komponen switch dinamis untuk merender berbagai jenis konten feed secara otomatis.
- **Atomic Design**: Struktur folder yang memisahkan dashboard tetap dari umpan dinamis.

## Verification Result
Semua fitur telah diuji secara lokal: interaksi bekerja secara optimistik, feed terdistribusi sesuai aturan variasi, dan admin panel mampu mengelola seluruh siklus konten harian.

---

## Source: implementation_roadmap.md

# Roadmap Implementasi: Faith Community Engagement Engine

Roadmap ini dirancang untuk mengubah blueprint strategis menjadi sistem hidup secara bertahap (sprint-based), memastikan setiap tahap memberikan nilai spiritual bagi pengguna sejak dini.

---

## Phase 1: Ritual Foundation (Sprint 1-2)
**Tujuan**: Menghidupkan "Metronome" harian (ritme tetap) di dashboard.

| Layer | Aktivitas Utama |
| :--- | :--- |
| **Product** | Finalisasi flow interaksi "Amin" & "Tersentuh". |
| **Backend** | Implementasi `DailyContent` model, migration, & Ritual Service. |
| **Frontend** | Refactor `/today` dashboard dengan `TodayVerseCard` & `Greeting`. |
| **Admin** | `DailyContentResource` di Filament untuk input ritual mingguan. |
| **Seed** | Input 14 hari pertama data ritual (Verse, Quote, Prompt). |

- **Output**: Dashboard `/today` tidak lagi kosong (ada ayat & kutipan harian).
- **Quick Win**: Personal greeting (Pagi/Siang/Malam) yang membuat aplikasi terasa "sadar waktu".

---

## Phase 2: Engagement Loops (Sprint 3-4)
**Tujuan**: Memulai percakapan antarumat dan interaksi mikro.

| Layer | Aktivitas Utama |
| :--- | :--- |
| **Backend** | `MemberPost` model & `SpiritualInteractionService`. |
| **Frontend** | `PrayerRequestCard`, `UserPostCard`, & `ReflectionPrompt` (Interactive). |
| **Admin** | Moderasi post dasar di Filament. |
| **Seed** | Pembuatan 10 Akun Editorial (Personas) & suntikan 20 doa awal. |

- **Output**: User bisa mulai mengirim permintaan doa dan merespon "Amin" pada doa orang lain.
- **Quick Win**: Tombol "Amin" yang memberikan feedback instan (Optimistic UI).

---

## Phase 3: Composition & Intelligence (Sprint 5-6)
**Tujuan**: Mengatur aliran feed agar selalu segar dan bervariasi.

| Layer | Aktivitas Utama |
| :--- | :--- |
| **Backend** | `TodayFeedService` (Logic Hybrid) & `FeedComposerService` (Ranking). |
| **Frontend** | `FeedItemRenderer` & transisi animasi antar-item feed. |
| **Admin** | Dashboard statistik kesehatan komunitas dasar (Filament). |
| **Seed** | Dokumentasi panduan bahasa post (natural style) untuk editor. |

- **Output**: Feed yang secara otomatis memprioritaskan doa yang belum dijawab (*No One Prays Alone*).
- **Quick Win**: Hilangnya postingan yang bertipe sama secara beruntun (Variety Guard).

---

## Phase 4: Social Proof & Scaling (Sprint 7-8+)
**Tujuan**: Meningkatkan retensi dan kepercayaan komunitas.

| Layer | Aktivitas Utama |
| :--- | :--- |
| **Product** | Sistem notifikasi "Seseorang mendoakanmu". |
| **Backend** | `NotificationService` & logic real-time. |
| **Frontend** | `CommunityHighlightCard` & widget "Sedang Berdoa: 24 Orang". |
| **Future** | Fitur **Channels** (Diskusi terarah) & **Pinned Lessons**. |

- **Output**: Efek "Crowded Room" yang positif (user merasa dikelilingi saudara seiman).
- **Quick Win**: Notifikasi push saat doa user mendapatkan respon.

---

## Tabel Prioritas & Risiko

| Risiko | Mitigasi |
| :--- | :--- |
| **Ghost Town** (Feed sepi) | Penggunaan Seeded Content terjadwal secara masif di Phase 2. |
| **Over-Engineering** | Fokus pada satu tabel `member_posts` dengan JSON payload. |
| **Intimidasi User** | Penggunaan *Directed Prompt* (Pertanyaan hari ini) daripada input kosong. |

---

## Status Proyek Saat Ini
- **Blueprint Strategy**: Selesai (100%)
- **Backend Architecture**: Selesai (Service Layer implemented)
- **Database Design**: Selesai (MVP models implemented)
- **Frontend Architecture**: Selesai (Component architecture designed)

**Langkah Terdekat**: Memulai Sprint 1 (Ritual Foundation) secara penuh.

---

## Source: interaction_model_audit.md

# Audit: Community Interaction Model & Naturalness

Dokumen ini mengaudit model interaksi di /community untuk memastikan setiap tindakan terasa natural, tidak redundan, dan sesuai dengan nilai-nilai komunitas iman (faith-based).

## 1. Essential Actions (The "Sacred Set")
Tindakan ini adalah fondasi interaksi yang memberikan nilai spiritual nyata:
- **Amin (Support/Pray)**: Pengganti "Like". Memberikan dukungan spiritual atau persetujuan terhadap kebenaran firman/refleksi.
- **Refleksi (Comment)**: Sarana untuk memberikan kata-kata penguatan (encouragement) atau menjawab pertanyaan diskusi.
- **Bagikan (Share)**: Untuk menyebarkan berkat ke luar platform (WhatsApp/Media Sosial).
- **Simpan (Save)**: Khusus untuk konten yang memiliki nilai edukasi rohani jangka panjang (Ayat, Kutipan).

## 2. Redundant Actions (To Remove/Avoid)
Untuk menjaga ketenangan visual dan fokus:
- **Hapus Tombol "Like" (Hati)**: Tidak boleh ada dua tombol positif. Hapus semua referensi "Like/Heart" dan gunakan "Amin".
- **Hapus "Repost/Retweet"**: Sistem "repost" menciptakan kebisingan (noise) yang tidak perlu di feed rohani. Gunakan "Share" internal jika sangat dibutuhkan.
- **Sembunyikan Angka Nol**: Jangan tampilkan "0 Amin" atau "0 Komentar". Tampilkan angka hanya jika sudah ada interaksi untuk menghindari kesan "sepi" pada konten baru.

## 3. Per-Post-Type Interaction Rules
Interaksi harus relevan dengan konteks konten:

| Tipe Post | Essential (Visible) | Optional (Overflow) | Filosofi Interaksi |
| :--- | :--- | :--- | :--- |
| **Member Reflection** | Amin, Comment | Share, Save | "Saya terinspirasi & ikut merenung." |
| **Image + Caption** | Amin | Share, Comment | Visual yang membangun iman. |
| **Prayer Request** | Amin, Comment | - | Amin = "Saya ikut mendoakan Anda." |
| **Official Announcement** | Amin | Share | "Saya telah membaca dan mengamini." |
| **Discussion Prompt** | Comment, Amin | Share, Save | "Mari berbagi perspektif rohani." |

## 4. Visibility & Hierarchy Rules
- **Primary Actions (Maksimal 2)**: Tombol "Amin" dan "Komentar" diletakkan di baris pertama kartu.
- **Secondary Actions (Overflow)**: Tombol "Share" dan "Save" dapat diletakkan di menu tiga titik (overflow) atau di posisi yang lebih diskrit di pojok kanan untuk menjaga kartu tetap "tenang".
- **Composer Input**: Tampilkan "What's on your heart?" (Bukan "What's happening") untuk memancing refleksi.

## 5. UI Calmness Guidelines
- **Warna Muted**: Hindari warna aksi yang terlalu kontras (merah/biru terang). Gunakan warna brand yang lembut atau emerald untuk "Amin".
- **Tabular Numerals**: Gunakan font monospaced/tabular untuk angka agar layout tidak bergeser saat angka berubah.
- **Micro-interactions**: Animasi yang halus saat tombol Amin ditekan, memberikan kepuasan tanpa kesan "loud".
- **White Space**: Berikan padding yang cukup antar baris interaksi untuk menghindari kesan "cluttered".

## 6. Faith-Based Design Identity
- **Languaging**: Gunakan "Didoakan oleh X orang" alih-alih "Disukai oleh X orang".
- **Iconography**: Gunakan ikon tangan (Hand/Pray) untuk Amin.
- **Focus**: Mengutamakan kualitas pesan daripada performa statistik (Clout).

---
**Rekomendasi Implementasi**:
Sesuaikan `ActionBar.tsx` dan `PostInteractionPolicyService` untuk menegakkan aturan visibilitas ini secara ketat per tipe postingan.

---

## Source: KPI Query VerseHub.md

# KPI Query VerseHub (A/B Landing) - SOP

## Tujuan
- Mengukur performa varian A/B landing `/versehub/id`.
- Membandingkan hasil per persona: `new_believer` vs `returning_reader`.

## 1. Deploy ke cPanel
Jalankan di server:

```bash
cd ~/deploy/apps/thechoosentalks
bash ./deploy.sh | tee -a ~/deploy/apps/thechoosentalks/deploy.log
```

Validasi release aktif:

```bash
readlink -f ~/deploy/apps/thechoosentalks/current
ls -lah ~/deploy/apps/thechoosentalks/current/public/build/manifest.json
```

## 2. Command KPI yang tersedia
Jalankan dari release aktif:

```bash
cd ~/deploy/apps/thechoosentalks/current
php artisan app:versehub-landing-kpi --days=7 --lang=id
php artisan app:versehub-landing-kpi --days=14 --lang=all --json
```

Parameter:
- `--days=` window waktu (hari).
- `--lang=` `id`, `en`, atau `all`.
- `--json` output JSON untuk arsip/report.

## 3. Evaluasi 24 jam setelah traffic masuk
```bash
cd ~/deploy/apps/thechoosentalks/current
php artisan app:versehub-landing-kpi --days=1 --lang=id
php artisan app:versehub-landing-kpi --days=1 --lang=all --json > /tmp/versehub_kpi_day1.json
cat /tmp/versehub_kpi_day1.json
```

## 4. KPI utama yang dibandingkan
- `sessions_viewed`
- `CTR any action`
- `CTR start_here`
- `CTR continue`
- `CTR explore`
- `CTR path`
- `CTR search`

## 5. Rule keputusan pemenang varian
- Utama: pilih varian dengan `CTR any action` tertinggi.
- Guardrail: pastikan `sessions_viewed` memadai (jangan ambil keputusan dari sampel kecil).
- Cek konsistensi per persona (jangan hanya global).

## 6. Arsip hasil harian (opsional, direkomendasikan)
```bash
cd ~/deploy/apps/thechoosentalks/current
TS=$(date +%Y%m%d-%H%M%S)
php artisan app:versehub-landing-kpi --days=1 --lang=all --json > "/tmp/versehub_kpi_${TS}.json"
ls -lah /tmp/versehub_kpi_*.json | tail -n 5
```

## Catatan
- Jika hasil masih `0` event, artinya traffic/event belum cukup masuk (normal di awal deploy).

---

## Source: Master_Blueprint_Faith_Community_Engagement_Engine.md

# MASTER BLUEPRINT: Faith Community Engagement Engine (TheChosenTalks)

**Versi**: 1.0 (Integration Final)  
**Status**: Authoritative Planning Document  
**Target Architecture**: Laravel 12 + Inertia.js + React 18

---

## 1. Definisi Strategis Engine
**Faith Community Engagement Engine** adalah inti dari ekosistem TheChosenTalks yang dirancang untuk menciptakan "denyut jantung" (Heartbeat) komunitas yang konsisten, religius, dan bermakna. Engine ini mengatasi masalah *Empty Room Syndrome* (perasaan sepi di platform baru) dengan memadukan kurasi editorial, konten otomatis, dan interaksi jemaat yang autentik.

**Misi Utama**: Mengubah pengunjung pasif menjadi anggota komunitas yang saling mendoakan melalui siklus **Read → Reflect → Respond → Return**.

---

## 2. Struktur Halaman /Today
Halaman `/today` bukan sekadar feed berita, melainkan **Daily Spiritual Dashboard**.
- **Header**: Salam personal berbasis waktu (Morning/Afternoon/Evening) + Greeting Emoji.
- **Entry Points (Action Bar)**: Tombol aksi cepat (Berbagi Berkat, Minta Doa, Jurnal, Channels).
- **Sacred Anchor (Hero)**: Ayat harian (Today's Verse) sebagai fokus utama.
- **Active Ritual**: Refleksi harian (Reflection Prompt) yang mengundang jawaban singkat.
- **Hybrid Feed**: Aliran konten campuran yang cerdas (Kesaksian, Permintaan Doa, Quotes).
- **Wisdom Pearl**: Kutipan rohani penutup hari.

---

## 3. Hybrid Feed Design
Feed menggunakan logika **Hybrid Composition** untuk menjaga kesegaran:
- **System-Generated Content (SGC)**: Ritual harian otomatis.
- **Editorial/Admin Content**: Pengumuman atau renungan mendalam dari kurator.
- **Seeded Content**: Konten contoh dari akun persona untuk memancing interaksi.
- **User-Generated Content (UGC)**: Postingan asli dari jemaat/user.

---

## 4. Content Seeding Strategy
Strategi "Menghangatkan Ruangan" (Warmin-up the room):
- **Editorial Personas**: Menggunakan akun seperti *The Shepherd* (Akun Penggembalaan) dan *The Encourager* (Akun Pendoa).
- **Behavior Modeling**: Seeded content tidak boleh terlihat seperti iklan, melainkan seperti postingan jemaat asli (misal: "Izin mendoakan untuk teman-teman yang sedang berjuang...")
- **Cadence**: Minimal 2 postingan "pancingan" setiap pagi untuk memastikan user pertama yang login tidak melihat feed kosong.

---

## 5. Tipe Post & Interaksi (Spiritual Loops)
Diferensiasi dari sosial media umum:
| Tipe Post | Primary Action | Spiritual Nuance |
| :--- | :--- | :--- |
| **Prayer Request** | **"Amin / Pray"** | Bukan sekadar 'Like', tapi komitmen mendoakan. |
| **Testimony** | **"Encouraged"** | Memberi semangat bahwa Tuhan bekerja. |
| **Verse Reflection** | **"Amen"** | Persetujuan atas kebenaran firman. |
| **Discussion Prompt** | **Comment/Reply** | Diskusi teologis atau praktis yang sehat. |

---

## 6. Participation Engine
Hambatan partisipasi diturunkan melalui **Gradual Onboarding**:
1.  **Level 1 (Observer)**: Membaca ayat dan kutipan (0 friction).
2.  **Level 2 (Soft Participant)**: Mengetuk tombol "Amin" pada permintaan doa (Low friction).
3.  **Level 3 (Contributor)**: Menjawab pertanyaan harian singkat (Medium friction).
4.  **Level 4 (Initiator)**: Menulis permohonan doa atau kesaksian sendiri (High engagement).

---

## 7. Database Schema Planning
Tabel inti di Laravel 12:

### `daily_contents`
- Menyimpan ritual terjadwal (verse, quote, prompt).
- Kolom: `id`, `date`, `type`, `payload` (JSON), `published_at`.

### `member_posts`
- Tabel tunggal untuk semua feed item (UGC & Seeded).
- Kolom: `id`, `user_id`, `type`, `title`, `text`, `metadata` (JSON), `expires_at`, `hidden_at`.

### `member_post_reactions`
- Menyimpan interaksi spiritual.
- Kolom: `id`, `member_post_id`, `user_id`, `type` (pray, encouraged, amen).

---

## 8. Feed Composition Logic
Algoritma pengurutan cerdas di `FeedComposerService`:
- **Slotting**: Menjamin item pertama di feed selalu tipe tertentu (misal: Ritual atau Pinned Content).
- **Variety Guard**: Mencegah 3 item dengan tipe yang sama muncul berurutan.
- **Urgency Bonus**: Permintaan doa yang baru dan belum mendapatkan "Amin" akan naik ke atas.
- **Aging Penalty**: Konten lama akan turun secara bertahap kecuali memiliki engagement sangat tinggi.

---

## 9. Backend Service Architecture (Laravel)
Pemisahan tanggung jawab secara bersih (Service Layer):
- **`TodayFeedService`**: Orchestrator yang mengumpulkan data dari berbagai sumber untuk controller.
- **`DailyContentService`**: Mengambil konten ritual harian (Verse/Quote).
- **`SpiritualInteractionService`**: Menangani logika interaksi (toggle Amin, send notifications).
- **`FeedComposerService`**: Menangani logika ranking dan variasi feed.

---

## 10. Frontend Component Architecture (React)
Menggunakan pendekatan **Atomic Design** yang terorganisir:
- **`Pages/Today/Index.tsx`**: Entry point utama (Container).
- **`sections/`**: Komponen besar seperti `GreetingHeader`, `FeedList`, `ActionShortcutBar`.
- **`cards/`**: Komponen kartu ritual (`QuoteCard`, `ReflectionPrompt`, `TodayVerseCard`).
- **`feed/`**: Komponen item feed spesifik (`UserPostCard`, `PrayerRequestCard`) dan `FeedItemRenderer.tsx`.

---

## 11. Filament Admin Workflow
Alur kerja operasional harian editor:
- **Planning**: Input ayat dan kutipan untuk 14 hari ke depan di `DailyContentResource`.
- **Engagement**: Memantau feed komunitas, mendoakan (Amin) postingan user yang sepi, dan moderasi konten negatif.
- **Analytics**: Melihat tren partisipasi (berapa banyak doa yang dinaikkan hari ini).

---

## 12. Seed Data Strategy
Implementasi seeding yang realistis:
- **`DailyContentSeeder`**: Mengisi 14 hari pertama dengan konten ritual pilihan.
- **`MemberPostSeeder`**: Menyuntikkan 10-15 postingan awal dari persona 'The Shepherd' dan 'The Encourager'.
- **Natural Dates**: Tanggal posting didistribusikan secara acak dalam beberapa hari terakhir agar feed tidak terlihat "baru saja diinstal".

---

## 13. Phased Implementation Roadmap
1.  **Phase 1 (Foundation)**: Migrasi DB, Seeder 14 hari, dan Dashboard /today basic. (COMPLETED)
2.  **Phase 2 (Composition)**: Refactoring Service Layer dan Implementasi Hybrid Feed. (COMPLETED)
3.  **Phase 3 (UX Refinement)**: Reorganisasi komponen Atomic Design dan Action Bar. (COMPLETED)
4.  **Phase 4 (Advanced Engagement)**: Notifikasi sistem, komentar, dan gamifikasi spiritual (Next).

---

## 14. Risiko Utama & Mitigasi
- **Risiko: Feeding sepi (Empty Feed)**. -> *Mitigasi*: Algoritma fallback ke seeded content dan ritual sistem.
- **Risiko: Interaksi dangkal**. -> *Mitigasi*: Penggunaan tombol interaksi spesifik ("Amin", "Terberkati") bukan "Like" umum.
- **Risiko: Beban Server (Query Heavy)**. -> *Mitigasi*: Unified content table dan caching pada `DailyContentService`.

---
**Document Conclusion**: 
Cetak biru ini memastikan setiap baris kode yang ditulis berkontribusi pada terciptanya komunitas yang hangat dan bermakna. Engine ini bukan hanya tentang algoritma, tapi tentang memfasilitasi pertemuan rohani jemaat di ruang digital.

---

## Source: MASTER_BOOK_DEPLOY_CPANEL.md

# MASTER BOOK DEPLOY CPANEL — TheChosenTalks

Versi operasional utama untuk server:
- User cPanel: `thechoosentalks`
- Home: `/home/thechoosentalks`
- Deploy root: `~/deploy/apps/thechoosentalks`
- Repo checkout: `~/repositories/TCT--Laravel`
- Web root: `~/public_html`
- Active release: `~/deploy/apps/thechoosentalks/current`
- Domain: `https://thechoosentalks.org`

---

## 1. Arsitektur server

Alur runtime:

```text
Browser
  -> LiteSpeed/Apache
  -> ~/public_html/index.php
  -> ~/deploy/apps/thechoosentalks/current/public/index.php
  -> Laravel active release
```

Struktur utama:

```text
/home/thechoosentalks
├── repositories/TCT--Laravel
├── deploy/apps/thechoosentalks
│   ├── build.tar.gz
│   ├── deploy.sh
│   ├── healthcheck.sh
│   ├── rollback.sh
│   ├── current -> releases/<timestamp>
│   ├── releases/<timestamp>/...
│   └── shared/.env + shared/storage
└── public_html/index.php + public assets
```

Poin penting:
- `public_html` bukan source app penuh; ia proxy tipis.
- release aktif diatur lewat symlink `current`.
- `.env` dan `storage` harus berasal dari `shared/`.
- deploy model ini adalah **atomic release**.

---

## 2. Permission minimum

Jaga permission ini:

```bash
chmod 700 ~/deploy
chmod 700 ~/deploy/apps
chmod 700 ~/deploy/apps/thechoosentalks
chmod 700 ~/deploy/apps/thechoosentalks/releases
chmod 700 ~/deploy/apps/thechoosentalks/deploy.sh
chmod 600 ~/deploy/apps/thechoosentalks/healthcheck.sh
chmod 600 ~/deploy/apps/thechoosentalks/rollback.sh
chmod 600 ~/deploy/apps/thechoosentalks/shared/.env
```

---

## 3. Setup awal satu kali

### 3.1 Siapkan folder

```bash
mkdir -p ~/deploy/apps/thechoosentalks/{releases,shared}
mkdir -p ~/deploy/apps/thechoosentalks/shared/storage
```

### 3.2 Siapkan env production

```bash
nano ~/deploy/apps/thechoosentalks/shared/.env
```

Minimum isi:
- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=https://thechoosentalks.org`
- `APP_KEY=...`
- `DB_CONNECTION=...`
- `DB_HOST=...`
- `DB_DATABASE=...`
- `DB_USERNAME=...`
- `DB_PASSWORD=...`

### 3.3 Pastikan proxy web root benar

Isi `~/public_html/index.php`:

```php
<?php
declare(strict_types=1);
require __DIR__ . '/../deploy/apps/thechoosentalks/current/public/index.php';
```

---

## 4. Peran 3 script inti

### `deploy.sh`
Tugas:
- validasi artifact
- buat release baru
- extract release
- link `.env` dan `storage`
- cache + migrate
- pre healthcheck
- switch `current`
- publish public asset
- post healthcheck
- cleanup release lama

### `healthcheck.sh`
Tugas:
- cek release bisa boot
- cek writable path
- cek data bisnis penting
- cek endpoint HTTP utama

### `rollback.sh`
Tugas:
- kembali ke release stabil sebelumnya
- republish public asset bila perlu
- reset proxy publik jika dibutuhkan

---

## 5. Deploy manual aman

```bash
cd ~/deploy/apps/thechoosentalks
chmod +x deploy.sh healthcheck.sh rollback.sh
export REQUIRED_BIBLE_AYT_ID_MIN=1
bash ./deploy.sh | tee -a ~/deploy/apps/thechoosentalks/deploy.log
```

Syarat artifact:
- sudah berisi `vendor/`
- sudah berisi `public/build/manifest.json`
- berasal dari build bersih

---

## 6. Healthcheck dan verifikasi pasca deploy

```bash
cd ~/deploy/apps/thechoosentalks/current
php artisan tinker --execute="echo 'Total Users: '.\App\Models\User::count();"
```

```bash
bash ~/deploy/apps/thechoosentalks/healthcheck.sh \
  --release ~/deploy/apps/thechoosentalks/current \
  --required-bible-min 1 \
  --base-url https://thechoosentalks.org \
  --urls "/ /today /versehub/id"
```

Kalau post-switch healthcheck gagal:
- rollback ke release sebelumnya
- cek `deploy.log`
- cek `deploy-last.log`

---

## 7. Rollback cepat

```bash
cd ~/deploy/apps/thechoosentalks
bash ./rollback.sh
```

Jangan jalankan `migrate:fresh` di production.

---

## 8. Integrasi auto deploy CI/CD

Agar benar-benar auto deploy, CI/CD harus:
1. build PHP + frontend
2. jalankan test
3. buat `build.tar.gz`
4. upload artifact ke server
5. SSH ke server dan jalankan `deploy.sh`

Alur:

```text
Git push
 -> GitHub Actions
 -> composer install + npm ci + npm run build
 -> php artisan test
 -> pack build.tar.gz
 -> upload ke ~/deploy/apps/thechoosentalks/build.tar.gz
 -> ssh server
 -> bash ~/deploy/apps/thechoosentalks/deploy.sh
```

---

## 9. Apakah script ini sudah membuat auto deploy?

**Jawaban:**
- **Ya, script Anda sudah membantu dan menyiapkan fondasi auto deploy.**
- **Tidak, script saja belum cukup untuk auto deploy kalau CI/CD belum memanggilnya.**

Artinya:
- kalau hanya ada `deploy.sh` di server -> belum auto deploy
- kalau GitHub Actions upload artifact lalu SSH menjalankan `deploy.sh` -> sudah auto deploy

Jadi script Anda adalah **mesin deploy**, sedangkan GitHub Actions adalah **pemicu otomatisnya**.

---

## 10. Checklist CI/CD sehat

Pastikan workflow melakukan ini sebelum deploy:

```bash
composer install --no-dev --optimize-autoloader
npm ci
npm run build
php artisan test
```

Lalu artifact harus memuat:
- source app
- `vendor/`
- `public/build/manifest.json`
- asset hasil build

Workflow lalu:
- upload `build.tar.gz`
- jalankan `bash ~/deploy/apps/thechoosentalks/deploy.sh`

---

## 11. Larangan production

Jangan lakukan ini:
- `php artisan migrate:fresh --force`
- simpan `.env` di `public_html`
- deploy langsung dari `repositories/` ke web root
- permission deploy jadi `755`
- andalkan `composer install` manual di production jika pola sudah artifact-based

---

## 12. Troubleshooting cepat

### Vite manifest not found
Penyebab:
- `npm run build` tidak jalan
- artifact tidak membawa `public/build`

Aksi:
- perbaiki workflow
- build ulang
- deploy ulang

### Error 500 setelah deploy
Penyebab:
- env salah
- cache/config rusak
- permission storage salah

Aksi:
- cek `deploy.log`
- cek `healthcheck.sh`
- rollback bila perlu

### User count 0
Penyebab:
- koneksi DB salah
- guardrail deploy mencegah switch berbahaya

Aksi:
- stop deploy
- verifikasi `shared/.env`
- pastikan DB production benar

---

## 13. Command cepat harian

```bash
# cek release aktif
readlink -f ~/deploy/apps/thechoosentalks/current

# cek permission inti
ls -ld ~/deploy ~/deploy/apps ~/deploy/apps/thechoosentalks ~/deploy/apps/thechoosentalks/releases
ls -l ~/deploy/apps/thechoosentalks/deploy.sh ~/deploy/apps/thechoosentalks/healthcheck.sh ~/deploy/apps/thechoosentalks/rollback.sh

# healthcheck
bash ~/deploy/apps/thechoosentalks/healthcheck.sh --release ~/deploy/apps/thechoosentalks/current --base-url https://thechoosentalks.org --urls "/ /today /versehub/id"

# rollback
cd ~/deploy/apps/thechoosentalks && bash ./rollback.sh
```

---

## 14. Rekomendasi operasional

- Gunakan dokumen ini sebagai **master book utama**.
- Simpan file ini di server juga, misalnya:

```bash
cp /path/lokal/MASTER_BOOK_DEPLOY_CPANEL_THECHOOSENTALKS.md ~/deploy/apps/thechoosentalks/
```

- Dokumen lama boleh disimpan sebagai referensi, tetapi instruksi operasional sehari-hari sebaiknya mengacu ke master book ini.

---

## Source: Minimal_Schema_and_Enum_Extensions.md

# Minimal Schema & Enum Extensions Proposal

This proposal outlines the minimum database and code-level extensions required to support the new Community Interaction and Automation features while maintaining compatibility with the existing Laravel structure.

## 1. Schema Extensions (Migrations)

### `users` table
- **[NEW]** `is_system` (boolean, default: `false`): Explicitly marks an account as a system guide (Shepherd, Encourager, Pulse).
- **[NEW]** `system_type` (string, nullable): Category of system account (e.g., 'shepherd', 'encourager', 'pulse').

### `daily_contents` table
- **[NEW]** `source_type` (string, default: 'official'): Provenance of the content ('official', 'ai_assisted').
- **[NEW]** `review_status` (string, default: 'approved'): Status for the Human-in-the-Loop workflow ('pending', 'approved', 'rejected').
- **[NEW]** `reviewed_by` (foreignID, nullable): User ID of the admin who approved/edited the draf.
- **[NEW]** `reviewed_at` (timestamp, nullable): When the review happened.

### `member_posts` table
- **[NEW]** `source_type` (string, default: 'human'): Tracks if post is from a 'human', 'official', or 'ai_assisted' bridge.
- **[NEW]** `is_featured` (boolean, default: `false`): Explicit flag for top-of-feed or highlight placement.
- **[NEW]** `daily_content_id` (foreignID, nullable): Direct link to the source ritual if bridged (currently in metadata).

---

## 2. Enum Additions

### `App\Enums\SourceType` (NEW)
```php
case HUMAN = 'human';
case OFFICIAL = 'official';
case AI_ASSISTED = 'ai_assisted';
```

### `App\Enums\ReviewStatus` (NEW)
```php
case PENDING = 'pending';
case APPROVED = 'approved';
case REJECTED = 'rejected';
```

---

## 3. Provenance & Interaction Tracking

### Tracking Rule
- **Provenance**: Use `source_type` on both `DailyContent` and `MemberPost` models.
- **AI-Assisted**: Set `source_type` to `ai_assisted` if AI drafted the content, even if a human edited it later (maintain audit trail).

### Conditional Action Logic
To avoid a complex "actions" table, we implement a **Static Policy** in the `PostType` enum or a Service:

```php
// app/Enums/PostType.php
public function allowedInteractions(): array {
    return match($this) {
        self::PRAYER_REQUEST => ['amin', 'comment', 'share'],
        self::VERSE_REFLECTION => ['amin', 'comment', 'save', 'share'],
        self::EDITORIAL => ['amin', 'share'], // Disable comments for announcements
        default => ['amin', 'comment', 'share'],
    };
}
```

---

## 4. Compatibility & Migration Notes
- **Retroactive Guard**: Migrations will set defaults (`is_system: false`, `source_type: human`) to ensure existing data remains valid.
- **Metadata Move**: We will progressively move fields like `is_official` or `featured` from the JSON `metadata` column to these explicit columns for better indexing and Filament filterability.
- **Filament Integration**: These columns will directly map to "Filters" in the Admin Panel (e.g., "Show pending reviews only").

---

## Source: participation_engine_design.md

# Desain Participation Engine: TheChosenTalks

Banyak platform gagal karena memberikan "Kanvas Kosong" (blank canvas) yang mengintimidasi user baru. **Participation Engine** TCT dirancang untuk menyediakan "Rel" yang membimbing user dari pengamat pasif menjadi kontributor aktif tanpa merasa terbebani.

---

## 1. User Journey: Dari Pendengar ke Pembicara

| Fase | Mental Model | Aksi UX | Status |
| :--- | :--- | :--- | :--- |
| **Silent Observer** | "Aku hanya ingin melihat dan membaca." | Membaca Ayat, Scroll Feed, Klik "Simpan". | **Aman** |
| **Micro-Participant** | "Aku setuju/tergerak dengan ini." | Klik tombol **Amin**, Pilih Chip Respon (One-tap). | **Hangat** |
| **Guided Contributor** | "Aku mau menjawab pertanyaan simpel ini." | Menjawab *Question of the Day* melalui form terarah. | **Terlibat** |
| **Active Contributor** | "Aku ingin membagikan pergumulanku." | Menulis *Prayer Request* atau *Testimony* (UGC). | **Dewasa** |
| **Community Pillar** | "Aku ingin menguatkan orang lain." | Membalas doa orang lain dengan teks dukungan panjang. | **Pilar** |

---

## 2. Hirarki CTA & Entry Points (Halaman /Today)

Jangan gunakan satu tombol "POST" yang besar. Gunakan **Contextual Action Entry Points**:

1.  **Primary CTA (The Micro-Form)**: 
    -   *Question of the Day* Input field langsung di dashboard.
    -   "Apa satu hal yang membahagiakanmu hari ini?"
2.  **Secondary CTA (Quick Actions)**:
    -   Row shortcut bar: [🙏 Minta Doa] [📖 Buka Alkitab] [✍️ Tulis Refleksi].
3.  **Low-Friction Entry**:
    -   "Pilih kata yang menggambarkan perasaanmu hari ini: [Bersyukur] [Butuh Doa] [Bingung]".

---

## 3. Aksi Terarah vs Tombol "Post" Biasa

Gunakan label yang **Berbasis Niat (Intent-Based Labels)**:

-   ❌ **Post** -> ✅ **Bagikan Berkat** / **Kirim Doa**
-   ❌ **Comment** -> ✅ **Kirim Penguatan** / **Titip Doa**
-   ❌ **Search** -> ✅ **Cari Kebenaran** / **Jelajahi Ayat**

---

## 4. Soft Participation vs Deep Participation

### Soft Participation (Bagi User Baru)
-   **Amin Multiplier**: Klik tombol doakan berkali-kali (memberikan rasa "aku berkontribusi").
-   **Reaction Chips**: Klik tombol "Tersentuh" yang kemudian memunculkan tooltip "Terima kasih sudah ikut mengapresiasi kesaksian saudara seiman".
-   **Verse Collections**: Menambahkan ayat ke koleksi pribadi ("Simpan untuk Meditasi").

### Deep Participation (Bagi User Aktif)
-   **Testimony Builder**: Form berpanduan ("Apa pergumulannya?", "Bagaimana Tuhan menolong?", "Apa ayat kekuatannya?").
-   **Prayer Ministry**: Notifikasi atau section khusus "Orang-orang yang belum ada yang mendoakan hari ini".

---

## 5. Jenis Prompt Pemicu Interaksi Rohani

| Target | Contoh Prompt | Efek UX |
| :--- | :--- | :--- |
| **Harian** | "Bagaimana ayat [Yeremia 29] berbicara padamu hari ini?" | Memicu refleksi teologis simpel. |
| **Emosional** | "Ada yang sedang merasa lelah? Ketuk 🙏 untuk saling menguatkan." | Menciptakan rasa solidaritas cepat. |
| **Komunitas** | "Siapa satu orang yang ingin kamu doakan hari ini secara khusus?" | Mengalihkan fokus dari diri sendiri ke orang lain. |

---

## 6. Alasan UX & Psikologi
-   **Social Proof**: Menampilkan "30 orang sudah mendoakan ini" membuat user baru merasa aman untuk ikut menekan tombol.
-   **Reciprocity**: Saat user merasa diberkati oleh ayat harian (System Content), mereka lebih cenderung untuk "memberi kembali" melalui partisipasi kecil.
-   **Friction Reduction**: Menghilangkan kebutuhan untuk berpikir "aku harus menulis apa?" dengan menyediakan pilihan respon atau prompt yang sangat spesifik.

---

## Source: Safe_AI_Assisted_Prompt_Architecture.md

# Architecture: Safe AI-Assisted Prompting

Dokumen ini mendefinisikan arsitektur dan kebijakan penggunaan kecerdasan buatan (AI) untuk membantu operasional komunitas di TheChosenTalks tanpa mengorbankan kejujuran dan kepercayaan pengguna.

## 1. Allowed AI Use Cases
AI diizinkan untuk membantu tugas-tugas administratif bertipe **Drafting** dan **Summarization**:
- **Prompt Drafting**: Membuat draf pertanyaan refleksi, pokok doa harian, dan ajakan bersyukur berdasarkan tema atau ayat tertentu.
- **Editorial Ideas**: Memberikan ide renungan singkat (Verse Reflection) untuk membantu editor.
- **Community Pulse**: Merangkum diskusi-diskusi paling hangat dalam satu minggu menjadi kartu "Rangkuman Komunitas" yang informatif.
- **Social Ignition Suggestion**: Mengusulkan komentar pembuka yang relevan untuk postingan resmi agar memancing diskusi jamaah.
- **Formatting**: Mengubah teks Alkitab mentah menjadi format snippet yang menarik untuk dashboard.

## 2. Disallowed AI Use Cases (The Red Lines)
AI dilarang keras untuk melakukan hal-hal berikut:
- ❌ **Impersonation**: Dilarang berpura-pura menjadi anggota jemaat asli (Fake Member).
- ❌ **Autonomous Posting**: Dilarang memposting konten opini teologis secara otomatis tanpa review manusia.
- ❌ **Direct Nudging**: Dilarang mengirimkan pesan pribadi (DM) ke anggota dengan menyamar sebagai persona tertentu untuk manipulasi keaktifan.
- ❌ **Ghost Interaction**: Dilarang memberikan reaksi (Like/Pray) otomatis pada postingan user hanya untuk meningkatkan angka metrik secara palsu.

## 3. Policy: Human-in-the-Loop (HITL)
Keamanan utama sistem ini adalah kolaborasi antara AI dan Admin:
- **Default = Draft**: Semua konten yang dihasilkan AI harus mendarat di field input sebagai "Draf" di Filament Admin.
- **Review Required**: Admin berkewajiban melakukan edit, kurasi, dan persetujuan (Approve) sebelum konten dipublikasikan.
- **Auto-Publish Exception**: Hanya diperbolehkan untuk konten teknis non-opini (misal: "Verse Hub" snippet harian) dengan pengawasan periodik.

## 4. Workflow Integration
1. **Trigger**: Admin menekan tombol "✨ AI Suggest" pada form di Filament.
2. **Context Delivery**: Sistem mengirimkan konteks minimal (Ayat hari ini, Tema minggu ini, atau post ID terkait) ke `AIContentAssistant`.
3. **Draft Generation**: AI menghasilkan 3-5 opsi atau langsung mengisi field dengan saran terbaik.
4. **Editorial Review**: Admin memilih/mengedit teks tersebut.
5. **Publishing**: Konten disimpan dan masuk dalam jadwal publikasi resmi.

## 5. Laravel Implementation Strategy
- **Service Layer**: Menggunakan `AIContentAssistant` sebagai orchestrator.
- **Driver Support**: Arsitektur mendukung pergantian provider (Template-based, OpenAI, Claude, atau Local Model).
- **Metadata Tagging**: Setiap konten yang berasal dari draf AI harus ditandai di kolom `metadata` (misal: `ai_assisted: true`) untuk keperluan audit internal.

## 6. Tone, Trust, and Language Rules
Setiap output AI harus mematuhi panduan gaya (Style Guide) TheChosenTalks:
- **Warm & Calm**: Gunakan bahasa yang tenang, teduh, dan menguatkan. Hindari bahasa yang terlalu formal/kaku atau bahasa "marketing" yang agresif.
- **Collective Language**: Gunakan kata ganti kolektif seperti *"Mari kita..."* atau *"Keluarga besar TCT..."* sebagai pengganti kata ganti personal *"Saya"* (kecuali dalam peran Shepherd).
- **Biblical Integrity**: Pastikan kutipan ayat atau referensi teologis akurat dan sesuai konteks.

---

## Technical Standards

```php
// Contoh penandaan internal di MemberPost metadata
'metadata' => [
    'ai_assisted' => true,
    'ai_model' => 'gpt-4o-mini',
    'editor_reviewed_by' => 1,
]
```

---

## Source: SAFE_Engagement_Architecture_Master_Blueprint.md

# Master Implementation Blueprint: SAFE Engagement Architecture

This document serves as the final technical guide for extending TheChosenTalks with a managed, safe, and vibrant engagement engine.

## 1. Architecture Summary

The architecture extends the existing ritual logic into a hybrid community feed. It utilizes **Transparent Automation**—where system-generated content is clearly labeled and human-moderated—to prevent the "empty room" feeling without resorting to deceptive bot behavior.

- **Orchestration**: `TodayFeedService` and `CommunityFeedService` manage the data flow.
- **Intelligence**: `FeedComposerService` applies ranking and variety guards.
- **Stewardship**: `SystemAccountService` manages official personas.
- **Automation**: `DailyAutomationService` bridges rituals and ignites discussions.

## 2. Product Behavior Summary

- **Natural Rituals**: Users start their day on `/today` with a Verse, Quote, and Reflection.
- **One-Tap Support**: The "Amin" interaction replaces generic "Likes", focusing on spiritual solidarity.
- **Guided Participation**: Official prompts (The Shepherd) and warmth (The Encourager) lower the barrier to entry.
- **Clean Interface**: Actions like "Save" (Bookmark) are context-sensitive, appearing only where they provide value.

---

## 3. Schema & Enum Extensions

### Core Tables
- **`users`**: Add `is_system` (bool) and `system_type` (string).
- **`daily_contents`**: Add `source_type` (Enum), `review_status` (Enum), `reviewed_by`, and `reviewed_at`.
- **`member_posts`**: Add `source_type` (Enum), `is_featured` (bool), and `daily_content_id`.

### New Enums
- **`SourceType`**: `HUMAN`, `OFFICIAL`, `AI_ASSISTED`.
- **`ReviewStatus`**: `PENDING`, `APPROVED`, `REJECTED`.

---

## 4. Service Layer Logic

| Service | Extension? | New Responsibility |
| :--- | :--- | :--- |
| **`FeedComposerService`** | Yes | Implement `is_featured` weight and `is_urgent` prayer boosts. |
| **`DailyAutomationService`**| **NEW** | Bridge `DailyContent` to `MemberPost` and trigger AI comments. |
| **`PostInteractionPolicyService`** | **NEW** | Enforce `allowedInteractions()` defined in the `PostType` enum. |
| **`AIContentAssistant`** | Yes | Generate contextual prompt drafts and social ignition comments. |

---

## 5. Scheduler & Command Plan

| Command | Frequency | Action |
| :--- | :--- | :--- |
| `app:daily-bridge` | Daily 04:00 | Bridges approved `DailyContent` rituals to the `/community` feed. |
| `app:social-ignition` | Hourly | Checks for new bridged content and adds "Encourager" comments if missing. |
| `app:community-pulse` | Every 48h | Generates a "Community Pulse" summary card for the feed. |
| `schedule:run` | Minutely | Standard Laravel pulse for all above commands. |

---

## 6. Filament Admin Workflow (HITL)

1. **AI Drafting**: System accounts generate pending drafts daily.
2. **Editor Review**: Humans refine the tone and click **"Approve & Schedule"**.
3. **Emergency Fallback**: Admin can toggle "Evergreen Mode" in `AppSettings` if content is late.

---

## 7. /community Interaction Rules

| Post Type | Actions Allowed | Logic |
| :--- | :--- | :--- |
| `REFLECTION` | Amin, Comment, Share | Standard conversation. |
| `PRAYER_REQUEST` | Amin (Pray), Comment, Share | Focus on support. |
| `VERSE_REFLECTION` | Amin, Comment, Save, Share | Focus on study/persistence. |
| `EDITORIAL` | Amin, Share | Focus on dissemination (Comments OFF). |

---

## 8. Rollout Phases

- **Phase A (Schema & Enums)**: Apply migrations and update models. (COMPLETED)
- **Phase B (Service Refinement)**: Implement `DailyAutomationService` and `InteractionPolicy`.
- **Phase C (Admin HITL)**: Update Filament resources with AI draft and approval actions.
- **Phase D (UI Sync)**: Update `ActionBar.tsx` and `MemberPostCard.tsx` with policy-driven visibility.
- **Phase E (Social Ignition)**: Activate automated official comments and pulse cards.

---

## 9. Risks & Mitigations

| Risk | Mitigation |
| :--- | :--- |
| **AI Hallucinations** | Mandatory **Human-in-the-Loop** approval; no auto-publishing. |
| **Bot Perception** | Transparent labeling (`Official` badge) and distinct personas. |
| **Redundant UI** | Centralized `allowedInteractions()` policy on the backend. |
| **Feed Stagnation** | `FeedComposerService` variety guard prevents repeat rituals from clogging the view. |

---

## Source: Safe_System_Accounts_Architecture.md

# Architecture: Safe System Accounts

Dokumen ini mendefinisikan standar arsitektur untuk akun sistem resmi di TheChosenTalks. Tujuannya adalah menjaga keaktifan platform secara transparan tanpa merusak kepercayaan pengguna.

## 1. Product Role
Akun sistem bukan untuk simulasi manusia, melainkan sebagai **Pemandu Digital** dan **Kurator Konten**.
- **The Shepherd (Editor)**: Bertanggung jawab atas konten hikmat, ayat harian, dan pengumuman resmi.
- **The Encourager (Guide)**: Bertanggung jawab atas moderasi positif, pemantik diskusi, dan pendampingan doa.

## 2. Distinction from Real Members
- **Ketersediaan**: Akun sistem aktif secara terjadwal/otomatis (24/7).
- **Otoritas**: Memiliki akses moderasi (Shepherd) dan prioritas feed.
- **Interaksi**: Tidak melakukan percabangan diskusi yang mendalam (hanya pemantik).

## 3. Implementation Strategy: Hybrid User Layer
Kita tetap menggunakan tabel `users` untuk mempermudah integrasi Eloquent, namun dengan penanda khusus:
- **Identifier**: Alamat email khusus (`editor@...`, `encourager@...`).
- **Database Flag**: Menambahkan kolom `is_system: boolean` pada tabel `users` untuk membedakan secara sistemik.
- **Service-Based**: Akses entitas ini harus melalui `SystemAccountService` (tidak boleh `User::first()`).

## 4. Allowed Content Types
- **Daily Rituals**: Ayat harian, kutipan rohani, dan refleksi harian.
- **Engagement Triggers**: Pertanyaan refleksi dan ajakan berdoa.
- **Announcements**: Highlight komunitas dan pemberitahuan sistem.
- **Summaries**: Rangkuman diskusi mingguan (AI-generated).

## 5. Forbidden Behaviors (The Safety Guardrails)
- ❌ **Impersonation**: Dilarang menggunakan foto profil yang menyerupai manusia asli atau nama yang menipu.
- ❌ **Fake Debate**: Dilarang berpura-pura berdebat dengan member untuk menaikkan metrik.
- ❌ **Deceptive Flattery**: Dilarang memberikan pujian kosong (spam) pada postingan member.
- ❌ **Hidden Automation**: Dilarang menyembunyikan status otomatisasi jika ditanya oleh user.

## 6. UI Labeling Rules
Agar transparan, UI harus menerapkan aturan berikut:
- **Official Badge**: Setiap postingan dari akun sistem harus memiliki badge "Official" atau "System" di samping nama.
- **Distinct Avatar**: Menggunakan avatar berbentuk ikon/ilustrasi abstrak (misal: Ikon Tongkat Gembala), bukan foto orang.
- **Profile Disclosure**: Di halaman profil akun ini, harus ada keterangan: *"Ini adalah akun resmi sistem TheChosenTalks untuk pendampingan harian."*

## 7. Governance & Moderation
- **Audit Log**: Setiap tindakan akun sistem (terutama yang dipicu AI) harus tercatat dalam `admin_audit_logs`.
- **Human-in-the-loop**: Admin manusia dapat melakukan *override* atau mematikan otomatisasi akun sistem kapan saja melalui Filament Dashboard.
- **Reporting**: User tetap bisa melaporkan (report) postingan sistem jika dianggap mengganggu (spam).

---

## Technical Integration Plan

```diff
// app/Models/User.php
+ public function isSystemAccount(): bool {
+     return $this->email === SystemAccountService::EMAIL_SHEPHERD || 
+            $this->email === SystemAccountService::EMAIL_ENCOURAGER;
+ }
```

```diff
// resources/js/Components/community/MemberPostCard.tsx
+ {isOfficial && <Badge variant="secondary" className="ml-2 uppercase text-[10px]">Official</Badge>}
```

---

## Source: Service_Layer_Design_Engagement_Engine.md

# Service Layer Design: Faith Community Engagement Engine

This document defines the service layer architecture for official accounts, daily automation, AI assistance, and feed composition.

## 1. Core Services & Responsibilities

| Service Name | Responsibility | Type | Key Dependencies |
| :--- | :--- | :--- | :--- |
| **`TodayFeedService`** | Orchestrates the primary dashboard (/today). Fetches rituals and hybrid feed items. | Extension | `DailyContentService`, `FeedComposerService` |
| **`CommunityFeedService`** | Orchestrates the community archive and live feed. Focuses on social categories. | **NEW** | `FeedComposerService` |
| **`FeedComposerService`** | The "Brain". Handles ranking scores, variety guards, and temporal decay. | Extension | - |
| **`SystemAccountService`** | Manages official personas (Shepherd, Encourager, Pulse). Logic for labeling and persona-specific interactions. | Extension | - |
| **`DailyAutomationService`**| The "Engine". Handles automated bridging of ritual content to community and triggers AI comments. | **NEW** | `SystemAccountService`, `AIContentAssistant` |
| **`AIContentAssistant`** | The "Helper". Generates prompt drafts and "Social Ignition" comments based on context. | Extension | AI API Client |
| **`PostInteractionPolicyService`** | The "Judge". Enforces which actions are allowed for each post type on the backend. | **NEW** | `PostType Enum` |

## 2. Feed Composition Logic

### /today Flow (Ritual-Centric)
1. **Ritual Layer**: Fetches daily verse, quote, and reflection from `DailyContentService`.
2. **Hybrid Layer**: Fetches top-ranked community posts from `MemberPost`.
3. **Composition**: `FeedComposerService` uses a **Balanced Preset**: high weight for official content + limited variety interleaving.

### /community Flow (Social-Centric)
1. **Archive/Live Layer**: Fetches all active `MemberPost` items.
2. **Filtering**: `CommunityFeedService` applies category filters (Prayers, Reflections).
3. **Composition**: `FeedComposerService` uses a **Recency Preset**: high weight for fresh member interaction + low weight for official repeats.

## 3. Automation & AI Workflows

### AI Prompt Workflow
1. `AIContentAssistant` generates a draft in Filament.
2. Admin reviews and sets `review_status` to `Approved`.
3. `DailyContentService` makes it available for the scheduled date.

### Social Ignition Workflow
1. `DailyAutomationService` detects a new bridged ritual post in `/community`.
2. Calls `AIContentAssistant` to generate a "warm starter" comment.
3. Posts comment using the `Encourager` system account identity.

## 4. Interaction Policy Enforcement

The `PostInteractionPolicyService` centralizes the logic for interaction availability:

```php
// Backend Check
public function isActionAllowed(MemberPost $post, string $action): bool {
    $allowed = $post->type->allowedInteractions();
    return in_array($action, $allowed);
}
```

This service ensures that even if a frontend hack attempts to "Like" an announcement or "Save" a prayer request, the backend will reject it based on the defined rules for that `PostType`.

## 5. Metadata vs explicit columns
- **Search & Filter**: Use explicit columns (`source_type`, `review_status`, `is_featured`).
- **Contextual Data**: Use the `metadata` JSON column for temporary or type-specific data (e.g., `reference_text` for verses).

---

## Source: service_layer_design.md

# Desain Service Layer Architecture: TheChosenTalks

Untuk menjaga agar Controller tetap "Skinny" dan logic bisnis tetap terpusat, Engagement Engine dibagi ke dalam beberapa Service Layer terspesialisasi di Laravel 12.

---

## 1. Daftar Service Utama

### `TodayFeedService` (The Orchestrator)
**Tanggung Jawab**: Merakit semua komponen untuk halaman `/today`.
- **Input**: `User $user`.
- **Output**: `Collection` (Hybrid Feed + Rituals).
- **Dependencies**: `DailyContentService`, `FeedComposerService`.
- **Flow**: Memanggil Ritual harian, memanggil Dynamic Feed, lalu menggabungkannya sesuai *Slotting Design*.

### `DailyContentService` (The Ritual Provider)
**Tanggung Jawab**: Manajemen konten harian (Verse, Quote, Prompt).
- **Input**: `Date $date`, `string $type`.
- **Output**: `DailyContent` model atau `array`.
- **Logic**: Menangani caching konten harian agar tidak membebani database setiap kali user refresh halaman.

### `FeedComposerService` (The Ranking Engine)
**Tanggung Jawab**: Menyusun urutan postingan jemaat di feed.
- **Input**: `Collection $rawPosts`.
- **Output**: `Collection $sortedPosts`.
- **Logic**: Mengimplementasikan *Variety Guard* dan *Score Ranking* (Urgency/Freshness).

### `SpiritualInteractionService` (The Engagement Loop)
**Tanggung Jawab**: Menangani reaksi "Amin" (Pray) dan "Terberkati" (Encouraged).
- **Input**: `User $user`, `MemberPost $post`, `string $type`.
- **Output**: `void` / `MemberPost` (updated state).
- **Logic**: Menjamin integritas data reaksi, mencegah duplikasi, dan memicu notifikasi (event-driven).

### `CommunityHighlightService` (The Pulse Reporter)
**Tanggung Jawab**: Membuat ringkasan aktivitas komunitas.
- **Output**: `array` (statistik hari ini).
- **Logic**: Menghitung "Berapa banyak doa yang dipanjatkan hari ini" untuk ditampilkan di widget highlight.

---

## 2. Request Flow: Membuka Halaman /Today

1.  **Request**: User mengakses route `/today`.
2.  **Controller**: `TodayController` memanggil `TodayFeedService->getDashboardData($user)`.
3.  **Orchestration**:
    -   `TodayFeedService` meminta ritual ke `DailyContentService`.
    -   `TodayFeedService` meminta postingan ke `FeedComposerService`.
    -   `TodayFeedService` meminta highlight ke `CommunityHighlightService`.
4.  **Composition**: Hasil digabungkan ke dalam satu array besar `hybridFeed`.
5.  **Response**: Inertia merender data tersebut ke React.

---

## 3. Struktur Folder (Clean Architecture)

```text
app/
├── Services/
│   ├── Engagement/
│   │   ├── TodayFeedService.php
│   │   ├── FeedComposerService.php
│   │   └── CommunityHighlightService.php
│   ├── Content/
│   │   └── DailyContentService.php
│   └── Interaction/
│       └── SpiritualInteractionService.php
```

---

## 4. Keuntungan Arsitektur Ini

1.  **Testability**: Setiap service bisa ditest secara unit (ex: Mengetest ranking logic di `FeedComposerService` tanpa menyentuh controller).
2.  **Maintainability**: Jika aturan "Variety Guard" berubah, Anda hanya perlu mengedit satu file `FeedComposerService`.
3.  **Reusability**: `DailyContentService` bisa digunakan kembali di mobile app API nantinya.
4.  **Slim Controllers**: Controller hanya bertugas menangani request/response, tidak ada logic bisnis di dalamnya.

---

## 5. Catatan Implementasi Laravel 12
- Gunakan **Dependency Injection** via Constructor.
- Manfaatkan **Laravel Collection** untuk manipulasi data feed yang elegan.
- Gunakan **Events & Listeners** untuk proses background (misal: saat `ReactionService` dipanggil, trigger event untuk mengirim notifikasi).

---

## Source: technical_implementation_plan.md

# Rencana Implementasi Teknis: Faith Community Engagement Engine

Dokumen ini mendetailkan langkah-langkah teknis konkret untuk mengubah Blueprint Strategis menjadi fungsionalitas nyata menggunakan stack Laravel 12 + React + Inertia.

---

## 1. Urutan Implementasi Paling Aman
1.  **Core Data Model**: Migrasi & Model (Fondasi Data).
2.  **Service Layer Logic**: Pemisahan logika bisnis dari controller (Encapsulation).
3.  **Admin Operational**: Filament Resource (Input & Moderasi).
4.  **Seeding & Testing Data**: Menghidupkan database dengan konten nyata.
5.  **Controller Orchestration**: Menghubungkan backend ke frontend via Inertia.
6.  **Frontend Atomic Components**: Membangun UI dari tingkat terkecil (Atoms) ke Pages.
7.  **Engagement Hooks**: Implementasi interaksi real-time & Optimistic UI.

---

## 2. Checklist Implementasi Teknis

### A. Backend Layer (Fondasi)
- [x] **Database Migrations**:
  - `daily_contents` (date, content_type, payload, published_at).
  - `member_posts` (user_id, type, title, text, image_path, metadata, expires_at).
  - `member_post_reactions` (user_id, member_post_id, type).
- [x] **Models & Enums**:
  - Model `DailyContent` dengan `json` casting pada payload.
  - Model `MemberPost` dengan scope per tipe (Prayer, Testimony).
- [x] **Service Layer** (Done/Implemented):
  - `DailyContentService` (Ritual Provider).
  - `FeedComposerService` (Ranking Logic).
  - `SpiritualInteractionService` (Interaction Logic).
  - `TodayFeedService` (Feed Orchestrator).
- [/] **Controller Integration**:
  - [x] `MemberPostReactionController` (Menggunakan service).
  - [/] `TodayController` (Pembersihan logic legacy agar 100% menggunakan `TodayFeedService`).

### B. Admin & Operational Layer (Filament)
- [x] **Ritual Management**:
  - `DailyContentResource` untuk input Verse & Quote terjadwal.
- [x] **Engagement Management**:
  - `MemberPostResource` untuk moderasi post user (Hapus/Sembunyikan).
- [ ] **Community Dashboard**:
  - Widget Filament untuk memantau post yang belum memiliki "Amin" (Prioritas editorial).

### C. Frontend Layer (React + Inertia)
- [/] **Atomic Directory Structure**:
  - [ ] Reorganisasi `resources/js/Pages/Today/components` ke folder `sections`, `cards`, dan `feed`.
- [ ] **Core Layout Components**:
  - `GreetingHeader`: Salam personal berbasis waktu.
  - `ActionShortcutBar`: Grid tombol aksi cepat.
- [ ] **Dynamic Feed Layer**:
  - `FeedItemRenderer`: Logic switch untuk berbagai `post.type`.
- [ ] **Component Atoms (Cards)**:
  - `PrayerRequestCard` (Tombol Amin interaktif).
  - `UserPostCard` (Tampilan general post).
  - `TestimonyCard` (Tampilan kesaksian).
  - `TodayVerseCard` (Visualisasi ayat utama).

### D. Seeding Layer (Data Awal)
- [x] **Initial Seeder Configuration**:
  - [x] `DailyContentSeeder` (14 Hari data ritual).
  - [x] `MemberPostSeeder` (Persona editorial + initial posts).
  - [x] Integration ke `DatabaseSeeder.php`.

---

## 3. Strategi Transisi (Safe Implementation)
1.  **Parallel Running**: Jalankan feed baru bersamaan dengan sistem lama di `TodayController` untuk verifikasi data (Sudah dilakukan di prop `hybridFeed`).
2.  **Hardcode vs Dynamic**:
    - **Hardcode**: Ikon kategori, label statis, dan layout grid utama.
    - **Dynamic**: Konten ritual, ranking item feed, stats interaksi (Amin count), dan nama user.
3.  **Soft-Launch Tooling**: Gunakan `PersonaSwitcher` sederhana di frontend (khusus admin/dev) untuk mempermudah tes interaksi antar-user.

---

## 4. Testing Checklist
- [ ] **Data Integrity**: Pastikan `expires_at` bekerja (Post menghilang otomatis dari feed).
- [ ] **Variety Guard**: Verifikasi tidak ada 3 postingan bertipe sama muncul berurutan di feed.
- [ ] **Optimistic UI**: Pastikan tombol "Amin" berubah warna seketika sebelum request backend selesai.
- [ ] **Admin Flow**: Pastikan ritual yang diinput di Filament muncul tepat pada tanggal yang ditentukan.

**Rencana ini siap dieksekusi langkah demi langkah untuk menjamin transisi yang mulus dari desain ke aplikasi yang hidup.**

---

## Source: verse_relationship_engine_design.md

# Verse Relationship Engine Design

The **Verse Relationship Engine** aims to make Scripture feel interconnected in a meaningful and text-centered way. It guides users from a single verse to related passages, parallel themes, and biblical context.

---

### 1. Relationship Types

| Relationship Type | Purpose | Example |
| :--- | :--- | :--- |
| **Direct Cross-Ref** | Literal scriptural cross-references (Treasury of Scripture Knowledge). | Psalm 23:1 -> John 10:11 (The Good Shepherd). |
| **Prophecy -> Fulfillment**| Connecting Messianic prophecies to their fulfillment in Christ. | Isaiah 53 -> Matthew 27. |
| **Thematic Parallel** | Connecting verses that share a common theological theme. | Faith (Hebrews 11) -> Justification (Romans 5). |
| **Contextual Pivot** | Highlighting how a verse relates to the preceding/following chapter logic. | Sermon on the Mount (Matt 5) -> Its application in Matt 7. |
| **Old -> New Harmony**| Showing how New Testament authors quote or allude to the Old Testament. | Psalm 110:1 -> Hebrews 1:13. |

---

### 2. UI Treatment & Discovery

- **Inline Markers**: Subtle "link" icons next to specific keywords in a verse (similar to Wikipedia but more sacred/minimal).
- **Relational Side Panel**: When a verse is clicked, a "Connections" tab appears in the mentor panel showing ranked relationships.
- **Deep Study Entry Point**: A "Follow the Thread" button that leads into a thematic **Study Path**.
- **Thematic Bubbles**: Small, floating keywords (e.g., "Faith," "Grace," "Covenant") that appear when active selection occurs.

---

### 3. Logic & Trust Rules

- **Scripture Interprets Scripture**: The engine must prioritize explicit cross-references over thematic AI guesses.
- **Source Labeling**: Distinguish between "Classical Cross-References" (Historical) and "Thematic Insights" (Mentor-assisted).
- **Non-Linear Navigation**: Allow users to "jump" between relationships while keeping a "breadcrumb" back to their original reading passage.

---

### 4. Implementation (MVP vs Future)

#### MVP (Phase 30g)
- Implement `VerseRelationship` model to store curated connections.
- Add "Compare Versions" side-by-side in Reader.
- Show "Related Verses" based on existing `cross_panels` data.

#### Future Expansion
- **Thematic Graph**: A visual map of how themes connect across the whole Bible.
- **AI-Discovery**: Automated suggestion of thematic parallels based on user reading habits (with human-in-the-loop review).
- **Community Context**: Show what other believers are cross-referencing for the same verse.

---

### 5. Data Requirements
- `relationships` table: `from_verse_ref`, `to_verse_ref`, `type`, `metadata` (contextual explanation).
- `VerseHubMentorService` extension: `suggestConnections($verseRef)`.

---

## Source: versehub_architecture_audit.md

# Architecture Audit: VerseHub Scripture-Centered Mentor System

This audit evaluates the current state of VerseHub and identifies the strategic extension points required to fully realize it as a Scripture-Centered Mentor System.

## Architecture Reading & Roles

| Component | Likely Role | Status |
|---|---|---|
| `VerseHubController` | **SEO & Social Orchestrator.** Handles the primary "display" routes and premium OG generation. | Foundation |
| `VerseHubReaderController` | **The Engine.** Data fetching layer across local DB (AYT) and external APIs (TB/WEB). | Foundation |
| `VerseHubLibraryController` | **The Directory.** Handles structured navigation (Book > Chapter > Verse) and full-text search. | Strong |
| `VersehubActionController` | **Personalization API.** Manages bookmarks, highlights, and personal notes. | Foundation |
| `VersehubCommentController` | **Social Layer.** Handles the public/private commentary on specific verses. | Extension Point|
| `BibleVerse` model | **Core Entity.** The definitive data model for scripture text and canonical metadata. | Foundation |
| `VerseHubMentorService` | **Synthesis Layer.** The "Brain" of the Scripture Guide, handling insights and Q&A. | **New (Crucial)** |
| `StudyPathController` | **Curated Journey.** Manages the progression of guided Bible study tracks. | **New (Crucial)** |
| `Reader.tsx` | **The Surface.** The primary React UI where 90% of user interaction occurs. | Strong |

## Reusable Foundations
- **The Reader Engine**: `VerseHubReaderController` is already highly robust, handling fallbacks between local and remote sources gracefully.
- **Atomic Components**: The components in `/versehub/` (Cards, Headers) already follow a consistent "Premium" design language that can be easily extended.
- **Search System**: The SQLite FTS5 search in `VerseHubLibraryController` provides a lightning-fast entry point for Mentor-suggested verses.

## Extension Points
1. **Action-to-Mentor Hook**: `VersehubActionController` should be extended to allow "Ask Guide about this Bookmark" — bridging saved verses to deep study.
2. **Dynamic OG Generator**: `VerseHubController@renderOgPng` can be refactored into a service to support theme-aware backgrounds (Peace, Hope, etc.).
3. **Activity-to-Relationship**: `VerseHubActivityService` can be used to infer "Trending Themes" among users to surface more relevant Study Paths.

## Likely Gaps
- **Theological High-Tension Markers**: The system currently treats all verses as structurally equal. A mentor system needs a metadata layer identifying verses with significant denominational differences.
- **Reflection Persistence**: While we have "Notes", we lack a structured "Reflection History" where users can see their spiritual growth through the lens of the Scripture Guide's questions.
- **Thematic Cross-Pollination**: We have "Themes", but they aren't yet deeply integrated into the search results or the library browsing experience.

## Risks to Avoid
- **Persona Creep**: Avoid giving the "Scripture Guide" a name, face, or distinct human personality. It must remain a "Text-Centric Service".
- **Interaction Fatigue**: Don't show the Mentor Panel on every single verse click. Keep it as a proactive "Opt-in" or "Featured" interaction to maintain the calmness of the Bible.
- **Data Fragmentation**: Ensure that "Study Path Progress" and "Personal Highlights" remain distinct but connected, so a user doesn't lose their data if a Path is updated.

---

## Source: versehub_data_model_design.md

# VerseHub Data Model Design

To support the Scripture-Centered Mentor System, we need to extend existing models and introduce a few targeted tables. This design follows the principle of "additive architecture" to minimize breaking changes.

---

### 1. New Models & Tables

| Model / Table | Purpose | Key Fields |
| :--- | :--- | :--- |
| **`VerseRelationship`** | Stores curated connections between verses (Prophecy, Theme, etc.). | `from_ref`, `to_ref`, `type`, `strength`, `context_note`. |
| **`StudyPath`** | Defines a structured learning journey. | `slug`, `title`, `description`, `level`, `estimated_days`, `is_premium`. |
| **`StudyPathLesson`** | individual steps within a study path. | `study_path_id`, `order`, `title`, `verse_refs` (JSON), `mentor_insight`. |
| **`ReflectionResponse`**| Stores user-written reflections (Already implemented). | `user_id`, `verse_ref`, `question_text`, `answer_text`, `is_private`. |
| **`MentorPrompt`** | Custom prompts for specific verses/chapters for the Mentor Layer. | `verse_ref`, `trigger_type`, `prompt_text`, `suggested_questions` (JSON). |

---

### 2. Model Extensions

- **`User`**:
    - `reflections()`: HasMany Relationship to `ReflectionResponse`.
    - `studyPaths()`: BelongsToMany Relationship to `StudyPath` (via `user_study_paths` pivot).
- **`BibleVerse`**:
    - `relationships()`: HasMany (derived) to `VerseRelationship`.
    - `mentorInsights()`: Scope to fetch relevant `MentorPrompt`.

---

### 3. Ask-the-Bible Logic (Topic Index)

Instead of a new table, we will use a **Thematic Index** (stored as JSON or a cached service layer) to map questions to Verse References.

- `topics`: `slug`, `name`, `core_verses` (JSON), `related_paths` (JSON).

---

### 4. Implementation Roadmap

1.  **Phase A**: Relationships & Reflection (Implemented).
2.  **Phase B**: Study Paths & Lessons (Implemented Foundation).
3.  **Phase C**: Mentor Triggers & Contextual Prompts (Upcoming).
4.  **Phase D**: Thematic Indexing for "Ask-the-Bible."

---

## Source: VERSEHUB_FEATURE_ARCHITECTURE_REPORT.md

# VerseHub Feature Architecture (/bible only)

Goal: turn VerseHub into a Scripture-Centered Mentor System with scalable feature layers, realistic for Laravel + Inertia + React.

## Feature Layers

| Feature layer | Purpose | User value | Likely technical home in existing project | MVP or future | Notes |
|---|---|---|---|---|---|
| Reader Layer | Core reading experience: passage view, translation switch, chapter navigation, clean reading UI | Fast and focused Bible reading | Backend: `VerseHubReaderController`, `BibleVerse`, `routes/web.php` (`versehub.*` / `/bible`). Frontend: `resources/js/Pages/VerseHub/*`, `resources/js/Components/versehub/*` | MVP | Foundation layer. Other layers must remain optional overlays. |
| Verse Relationship Layer | Surface related verses, cross references, and themes | Better context and interpretation support | Backend: `VerseRelationship`, `VerseTheme`, `VerseThemeMapping`, query service for related verses. Frontend: related panel in verse view | MVP (basic), Future (deeper graph) | MVP should cap output (e.g. top 3-5) to avoid overload. |
| Study Layer | Structured study plans and progress tracking | Helps consistency and spiritual growth cadence | Backend: `StudyPath`, `StudyPathStep`, `UserStudyPathProgress`, VerseHub study service/controller. Frontend: study tab/section in `/bible` | MVP (simple plans), Future (adaptive plans) | Start simple: daily step + completion. |
| Mentor Layer | Guided insights and reflective prompts from passage context | Mentored learning feel while staying Scripture-first | Backend: `VerseHubMentorService`, `UserMentorSession`, endpoint `versehub.mentor.insights`. Frontend: mentor drawer/sheet in reader | MVP (bounded), Future (personalized continuity) | Keep answers brief, anchored to verses, guardrailed. |
| Reflection Layer | Personal notes/journal linked to verse/passage | Internalization and memory reinforcement | Backend: `UserJournalDraft`, `UserVerseAction` metadata for note links. Frontend: inline note composer in `/bible` | MVP | Private by default, quick-save first. |
| Share Layer | Share verse cards/links externally and internally | Makes faith sharing easier and more attractive | Backend: share payload + reliable OG metadata for verse pages. Frontend: action bar share in verse cards | MVP (stable link/card), Future (template variants) | OG consistency is mandatory for WhatsApp previews. |
| Library / Save Layer | Bookmark, highlight, recent history | Personal scripture library and revisit flow | Backend: `UserVerseAction` for saved/recent/highlight + query endpoints. Frontend: saved state buttons + saved list | MVP (bookmark + recent), Future (folders/tags) | Avoid complex taxonomy in MVP. |

## Connection Model (Without Overwhelm)

1. Reader is always the primary screen.
2. Relationship, Mentor, Reflection, Save, and Share open contextually from selected verse or action row.
3. Use progressive disclosure: one compact action row, advanced options behind "More".
4. Keep default payload small and defer heavy modules until opened.
5. Prioritize mobile bottom-sheet interactions over deep page transitions.

## MVP Scope Recommendation (/bible)

1. Reader Layer
2. Verse Relationship (basic)
3. Mentor Layer (bounded prompt set)
4. Reflection Layer (private note)
5. Library/Save (bookmark + recent)
6. Share Layer (OG-safe link/card)

## Future Expansion

1. Adaptive study plans based on progress behavior.
2. Semantic relationship graph and topic clustering.
3. Mentor continuity memory across sessions.
4. Saved folders/tags with smarter retrieval and filters.


---

## Source: versehub_feature_architecture.md

# VerseHub Feature Architecture: Scripture-Centered Mentor System

This document defines the architectural layers that transform VerseHub from a standard Bible reader into a guided, Scripture-centered learning experience.

---

### 1. Reader Layer (Foundation)
- **Purpose**: To provide a "Sacred Canopy" for undistracted reading of the text.
- **User Value**: Extreme focus, visual calmness, and respect for the Word.
- **Likely Implementation Location**: `VerseHubReaderController`, `Reader.tsx`, `BibleVerse` model.
- **Notes**: Must prioritize performance and typography (Serif). All other layers must stay hidden until explicitly called or naturally triggered by reading progress.

---

### 2. Relational Layer (Context)
- **Purpose**: To provide immediate scriptural context through cross-references and version comparisons.
- **User Value**: Helps users understand how Scripture interprets Scripture without leaving the reader.
- **Likely Implementation Location**: `VerseHubLibraryController`, `Reader.tsx` (Side Panels).
- **Notes**: Uses the existing `cross_panels` logic. Transitions should be seamless, keeping the current reading position anchor.

---

### 3. Library Layer (Retention)
- **Purpose**: To allow users to aggregate and organize their personal interactions with Scripture.
- **User Value**: Turns reading from a fleeting moment into a persistent personal archive.
- **Likely Implementation Location**: `VerseHubLibraryController`, `UserVerseAction` model, `Activity.tsx`.
- **Notes**: Includes Search, Favorites, Bookmarks, and simple "Notes". This is the user's "Scripture Vault."

---

### 4. Reflective Layer (Interaction)
- **Purpose**: To close the "Active Reading Loop" by prompting and storing user reflections.
- **User Value**: Encourages deep thinking and tracks spiritual growth over time.
- **Likely Implementation Location**: `VerseHubReflectionController`, `ReflectionResponse` model, `EndOfChapterPrompt.tsx`, `MySpiritualJourney.tsx`.
- **Notes**: Recently implemented bridge between the Reader and the Library. Feeds into the "My Spiritual Journey" timeline.

---

### 5. Mentor Layer (Intelligence)
- **Purpose**: To provide "on-demand" guided study through AI-assisted insights and structured Q&A.
- **User Value**: Acts as a humble study companion that clarifies difficult passages or suggests deep-dive questions.
- **Likely Implementation Location**: `VerseHubMentorService`, `VerseHubController@mentorInsights`, `MentorPanel.tsx`.
- **Notes**: Scripture Guide should always be clearly labeled as non-human/non-theological-authority. Includes "Denominational Context" for high-tension verses.

---

### 6. Path Layer (Structure)
- **Purpose**: To provide thematic "Study Paths" that guide users through specific topics or book studies.
- **User Value**: Solves the "Where do I start?" problem by providing curated, progress-tracked maps.
- **Likely Implementation Location**: `StudyPathController`, `StudyPath` model, `/study` routes.
- **Notes**: Connects verses across books into a single learning narrative. Premium, progress-bar driven experience.

---

### 7. Share Layer (Outbound)
- **Purpose**: To bridge the personal study experience with the wider community (and social web).
- **User Value**: Enables users to testify or share insights through high-quality visual artifacts.
- **Likely Implementation Location**: `VerseHubController@ogImage`, `SharePanel.tsx`.
- **Notes**: Generates premium OG images. Supports the "Today Feed" through quote-seeding.

---

## Layer Connectivity Map

1.  **Bottom-Up**: User reads (**Reader**) -> selects verse -> saves or asks (**Library/Mentor**) -> reflects at end of chapter (**Reflective**).
2.  **Top-Down**: User joins a **Path** -> guided to specific chapters (**Reader**) -> interacts with insights (**Mentor**) -> shares a highlight (**Share**).
3.  **Cyclic**: **Reflections** and **Shares** feed into the user's **Library**, which can then be searched to find themes for future **Study Paths**.

---

## Source: versehub_file_implementation_plan.md

# VerseHub Mentor System: File-Level Implementation Plan

This plan outlines the specific code changes required to evolve VerseHub into a Scripture-Centered Mentor System, focusing on extending the existing Laravel/React codebase.

---

## 1. Files to Inspect First
- [ ] [VerseHubController.php](file:///e:/thechoosentalksbetaUpdate/app/Http/Controllers/VerseHubController.php): Main entry for verse-level logic.
- [ ] [VerseHubReaderController.php](file:///e:/thechoosentalksbetaUpdate/app/Http/Controllers/VerseHubReaderController.php): Chapter/Book reading orchestration.
- [ ] [VerseHubMentorService.php](file:///e:/thechoosentalksbetaUpdate/app/Services/VerseHubMentorService.php): Current AI/Study logic.
- [ ] [Reader.tsx](file:///e:/thechoosentalksbetaUpdate/resources/js/Pages/VerseHub/Reader.tsx): Main frontend interface.

---

## 2. Migrations to Add [NEW]
- [ ] `database/migrations/YYYY_MM_DD_create_verse_relationships_table.php`: Support for cross-book thematic links.
- [ ] `database/migrations/YYYY_MM_DD_create_study_paths_table.php`: Core container for journeys.
- [ ] `database/migrations/YYYY_MM_DD_create_study_path_lessons_table.php`: individual steps in paths.
- [ ] `database/migrations/YYYY_MM_DD_create_user_study_paths_table.php`: Pivot for progress tracking.

---

## 3. Model Updates [MODIFY]
- [ ] [BibleVerse.php](file:///e:/thechoosentalksbetaUpdate/app/Models/BibleVerse.php): Add helper methods for relationship discovery.
- [ ] [User.php](file:///e:/thechoosentalksbetaUpdate/app/Models/User.php): Add relationships for `studyPaths` and `reflections`.

---

## 4. Controller Updates [MODIFY/NEW]
- [ ] [VerseHubController.php](file:///e:/thechoosentalksbetaUpdate/app/Http/Controllers/VerseHubController.php): 
    - [MODIFY] Add `mentorInsights()` endpoint for contextual assistance.
    - [MODIFY] Add `shareView()` for public-facing premium landing pages.
- [ ] `app/Http/Controllers/StudyPathController.php` [NEW]: Manage discovery and progress of paths.
- [ ] `app/Http/Controllers/VerseHubOGController.php` [NEW]: Dedicated image rendering head.

---

## 5. Service Layer Updates [MODIFY/NEW]
- [ ] [VerseHubMentorService.php](file:///e:/thechoosentalksbetaUpdate/app/Services/VerseHubMentorService.php): 
    - [MODIFY] Implement `getGuidedInsights($verseRef)` for the Mentor Layer.
    - [MODIFY] Implement `suggestConnections($verseRef)` for the Relationship Engine.
- [ ] `app/Services/VerseHubStudyService.php` [NEW]: Business logic for path progression and thematic indexing.

---

## 6. Frontend View Updates [MODIFY/NEW]
- [ ] [Reader.tsx](file:///e:/thechoosentalksbetaUpdate/resources/js/Pages/VerseHub/Reader.tsx): 
    - [MODIFY] Integrate `MentorPanel` and `EndOfChapterPrompt`.
- [ ] `resources/js/Pages/VerseHub/Study/Paths.tsx` [NEW]: Catalog of available journeys.
- [ ] `resources/js/Pages/VerseHub/Study/PathDetail.tsx` [NEW]: Interactive path map and progress UI.

---

## 7. OG Image Generation Flow
1.  Route `GET /og/verse/{ref}` triggers `VerseHubOGController`.
2.  Controller returns `resources/views/og/versehub.blade.php`.
3.  Logic captures the view using `Browsershot`.
4.  Image is returned with Cache-Control headers.

---

## 8. Testing Checklist
- [ ] **Data Integrity**: Verify relationships and study progress save correctly.
- [ ] **Mentor Accuracy**: Ensure Scripture Guide results are grounded in the correct verse context.
- [ ] **UX Fluidity**: Verify side panels in Reader open/close without disrupting text flow.
- [ ] **OG Rendering**: Verify dynamic image generation looks premium on mobile mockups.
- [ ] **Privacy**: Ensure private reflections are NEVER visible on public share pages.

---

## Source: versehub_mentor_master_blueprint.md

# VerseHub Mentor System — Master Blueprint (Phase 30)

> **scope:** `/bible` area only. Additive to existing codebase. No rewrites of unrelated areas.

---

## Part 1: Product Strategy

### The Single Product Sentence
VerseHub is a Scripture-centered study companion that helps anyone — believer, doubter, or seeker — understand the Bible more deeply by keeping the text itself at the center of every interaction.

### The Five-Layer Architecture
```
Layer 1:  BIBLE TEXT          — The canonical source. Always visible.
Layer 2:  READING TOOLS       — Highlight, bookmark, note, navigate. (Exists ✅)
Layer 3:  VERSE RELATIONSHIPS — Cross-references, themes, thematic maps (Partially built)
Layer 4:  MENTOR SYSTEM       — Reflection, context, Q&A, study paths (Foundation ✅, Full system TBD)
Layer 5:  SHARE SYSTEM        — Premium OG cards, verse posters, study summaries (Partially built)
```

Every new feature must fit inside one of these layers. Nothing should sit *beside* the text — only *around* it.

---

## Part 2: Feature Architecture

### 2.1 Reader UX (Layer 2 → Extend)
**Current state:** Chapter reader with highlight/bookmark/favorite/note/cross-ref. Good SPA foundation in `Reader.tsx`.

**Extensions:**
- Extract `MentorPanel.tsx` from the 1,200-line `Reader.tsx` (risk: monolith growth)
- Add **Reading Progress Milestones** — when a user finishes a chapter for the first time, a subtle moment acknowledges it (no streaks/gamification)
- Add **inline context chips** per verse: hover/tap a verse number to see a small context popover — book, author, approximate date, literary genre (narrative, prophecy, epistle, poetry)
- **Mobile toolbar refinement**: condense tools into a swipe-up action sheet on mobile, keeping the reading surface clean
- **Focus Reading Mode**: fade sidebar nav completely, maximize verse canvas width, dim Mentor trigger

### 2.2 Verse Relationship System (Layer 3 — New)
**Current state:** Cross-reference navigation exists (search-based). No formal verse relationship data model.

**What to build:**
- `VerseRelationship` model: `from_ref`, `to_ref`, `relation_type` (cross_ref | theme | fulfillment | contrast | quote | parallel)
- `VerseTheme` model: `slug`, `title_id`, `title_en`, `description`, `color_key`
- `VerseThemeMapping`: `verse_ref` → `theme_slug` (many-to-many)
- **Seeder strategy**: Start with 50 curated themes (e.g. Grace, Fear of God, Redemption, Covenant, Justice) with 5–10 seed verses each. Expand through admin.
- **Theme Explorer UI**: `/bible/themes` — visual grid of themes, each leading to curated verses
- **Parallel passages**: Show NT fulfillment of OT prophecy inline in reader

### 2.3 Mentor System (Layer 4 — Expand from Phase 29)
**Current state:** `VerseHubMentorService` (template-based), `mentorInsights` API, `MentorPanel` overlay in `Reader.tsx`.

**What to build next:**

#### 2.3.1 `MentorPanel.tsx` extraction
- Extract the mentor overlay from `Reader.tsx` into its own component
- Props: `verseRef`, `lang`, `verseText`, `onClose`
- Internal tabs: **Reflect** | **Context** | **Ask**

#### 2.3.2 "Ask the Bible" Free-text Flow
- New tab inside `MentorPanel.tsx`: a simple text input "Ask about this passage..."
- `POST /versehub/{lang}/{ref}/mentor/ask` → `VerseHubController::mentorAsk`
- Request body: `{ question: string, verse_text: string }`
- `VerseHubMentorService::answerQuestion(string $question, array $verseContext): array`
- Response: `{ answer: string, related_refs: string[], mentor_label: 'Scripture Guide' }`
- Always includes the verse text in the answer context
- Rate-limited: 10 requests per user per hour

#### 2.3.3 LLM Driver Architecture
Replace template-based responses with a driver pattern:
```php
interface MentorDriverInterface {
    public function getInsights(string $bookCode, int $chapter, int $verse, string $text): array;
    public function answerQuestion(string $question, array $verseContext): array;
}

class TemplateMentorDriver implements MentorDriverInterface { ... }  // current
class OpenAIMentorDriver implements MentorDriverInterface { ... }    // LLM
```
Config: `config/versehub_mentor.php` → `driver: env('VERSEHUB_MENTOR_DRIVER', 'template')`

#### 2.3.4 Denominational Context Layer
- `getDenominationalContext()` — build a small curated JSON dataset for ~100 high-tension passages
- Store in `config/versehub_denominations.php` or a seeded DB table
- Always labeled "Perspektif Tradisi" — never "the correct interpretation"

#### 2.3.5 User Mentor Session History
- New model: `UserMentorSession` — `user_id`, `verse_ref`, `lang`, `question`, `answer_summary`, `created_at`
- Surface in `/bible/my-spiritual-journey` as "Pertanyaan yang pernah kamu tanyakan"

### 2.4 Study Paths (Layer 4 extension — New)
A study path is a curated, ordered sequence of passages on a topic or book.

**Data model:**
- `StudyPath`: `slug`, `title_id`, `title_en`, `description`, `cover_color`, `difficulty` (beginner/intermediate/deep), `estimated_minutes`
- `StudyPathStep`: `path_id`, `step_order`, `verse_ref`, `focus_question`, `mentor_note`
- `UserStudyPathProgress`: `user_id`, `path_id`, `last_step_order`, `completed_at`

**UI:**
- `/bible/study` — path browser (grid of cards)
- `/bible/study/{slug}` — path detail and progress
- Reading a study step uses the existing Reader UI with an overlaid step context card

**Admin (Filament):**
- `StudyPathResource` — CRUD with ordered steps, drag-to-reorder
- AI-drafted steps via `AIContentAssistant` → human review before publish

### 2.5 Ask-the-Bible Flow (Layer 4 — New page)
A dedicated entry point for users who start with a question, not a chapter.

**Route:** `GET /bible/ask`
- Input: free-text question ("What does the Bible say about forgiveness?")
- System: enriches query with semantic keywords, searches `VerseThemeMapping` and `BibleVerse` FTS
- Returns: 3–5 curated verse results with brief context + link to reader
- Clearly labeled: "Jawaban ini berdasarkan teks Alkitab, bukan pandangan teologis tunggal."
- No LLM required for v1 — keyword-based verse matching is sufficient and trustworthy

### 2.6 Share System + Premium OG Architecture (Layer 5)
#### 2.6.1 OG Template Types
| Template | Route | Content |
|---|---|---|
| `verse` | `/versehub/{lang}/{ref}/og.png` | Single verse — current ✅ |
| `insight` | `/versehub/{lang}/{ref}/og.png?tpl=insight` | Reflection question card |
| `study_step` | `/bible/study/{slug}/{step}/og.png` | Study path step |
| `theme` | `/bible/themes/{slug}/og.png` | Theme summary card |

#### 2.6.2 Premium OG Visual System
All templates share these design tokens:
- **Background**: deep navy gradient `#080E1E → #121628` 
- **Gold accent bar**: `#D2AF5F` — 5px left bar
- **Typography tier**: Label (12pt uppercase tracking) → Title (52pt warm white) → Separator — Text (28pt)
- **Watermark**: `thechoosentalks.org` bottom-left in muted white
- **Font**: Segoe UI (Windows) / Arial fallback. Optional: add Noto Serif for titles via TTF

#### 2.6.3 Share Entry Points
- Reader verse tools → **Bagikan** → native share OR WhatsApp
- Mentor insight card → **Bagikan Refleksi** → insight OG template
- Study step completion → auto-prompt to share a summary card
- Theme explorer → each theme card shareable

---

## Part 3: Backend / Data Extensions

### 3.1 New Migrations Required

```
[1] create_verse_relationships_table
    - id, from_ref (varchar), to_ref (varchar), relation_type (enum), created_at

[2] create_verse_themes_table
    - id, slug (unique), title_id, title_en, description, color_key, created_at

[3] create_verse_theme_mappings_table
    - id, theme_slug, verse_ref, lang, sort_order

[4] create_user_mentor_sessions_table
    - id, user_id (FK), verse_ref, lang, question, answer_summary, created_at

[5] create_study_paths_table
    - id, slug (unique), title_id, title_en, description, cover_color,
      difficulty (enum: beginner/intermediate/deep), estimated_minutes,
      is_published, sort_order, created_at

[6] create_study_path_steps_table
    - id, path_id (FK), step_order, verse_ref, lang, focus_question,
      mentor_note, created_at

[7] create_user_study_path_progress_table
    - id, user_id (FK), path_id (FK), last_step_order, completed_at,
      updated_at

[8] alter_bible_verses_add_testament
    - testament ENUM('ot', 'nt') NULLABLE
    - book_canonical_order TINYINT UNSIGNED NULLABLE
```

### 3.2 Config Files

```
config/versehub_mentor.php
    driver:   env('VERSEHUB_MENTOR_DRIVER', 'template')
    cache_ttl: 86400  # 24 hours

config/versehub_books.php  (already exists)
    extend with: testament map, canonical_order map
```

### 3.3 New Services

| Service | Responsibility |
|---|---|
| `VerseHubMentorService` | Insights, Q&A, denominational context (Foundation ✅) |
| `VerseHubThemeService` | Theme lookup, theme-verse mapping |
| `VerseHubStudyPathService` | Path progress, step resolution, completion tracking |
| `VerseHubSearchService` | Unified search: ref parse + keyword + theme + FTS |

### 3.4 New Controllers

| Controller | Route prefix | Notes |
|---|---|---|
| `VerseHubMentorController` | `/bible/*/mentor` | Split from `VerseHubController` |
| `VerseHubThemeController` | `/bible/themes` | Theme browser + OG |
| `VerseHubStudyController` | `/bible/study` | Path listing, step reader |
| `VerseHubAskController` | `/bible/ask` | Ask-the-Bible flow, results |

---

## Part 4: Frontend Architecture

### 4.1 New React Pages

| Page | Route | Framework |
|---|---|---|
| `VerseHub/Ask.tsx` | `/bible/ask` | React/Inertia |
| `VerseHub/Themes.tsx` | `/bible/themes` | React/Inertia |
| `VerseHub/ThemeDetail.tsx` | `/bible/themes/{slug}` | React/Inertia |
| `VerseHub/Study.tsx` | `/bible/study` | React/Inertia |
| `VerseHub/StudyDetail.tsx` | `/bible/study/{slug}` | React/Inertia |

### 4.2 New React Components

| Component | Purpose |
|---|---|
| `VerseHub/MentorPanel.tsx` | Extracted from Reader, tabbed: Reflect / Context / Ask |
| `VerseHub/VerseContextChip.tsx` | Inline popover with book/author/genre meta |
| `VerseHub/ThemeCard.tsx` | Reusable theme grid card with color accent |
| `VerseHub/StudyPathCard.tsx` | Study path card with progress ring |
| `VerseHub/StudyStepOverlay.tsx` | Overlay on Reader for active study step context |
| `VerseHub/AskInput.tsx` | Free-text question input with suggested questions |

---

## Part 5: File-Level Implementation Plan (Phases)

### Phase 30a: Data Foundation
- 8 migrations (see Part 3.1)
- `config/versehub_mentor.php`
- `MentorDriverInterface` + `TemplateMentorDriver` + wire in `VerseHubMentorService`
- Extend `config/versehub_books.php` with testament + order data

### Phase 30b: Mentor System — Q&A + Panel Extraction
- Extract `MentorPanel.tsx` from `Reader.tsx`
- `POST /bible/{lang}/{ref}/mentor/ask` route + `VerseHubMentorController::ask`
- Rate limiting (10/hour authenticated)
- `UserMentorSession` model + save on each ask

### Phase 30c: Verse Theme System
- `VerseTheme`, `VerseThemeMapping` models
- `VerseHubThemeService`
- `VerseHubThemeController::index` + `::show`
- Seed 20 starter themes with curated verse mappings
- `Themes.tsx` + `ThemeDetail.tsx` pages
- Theme OG template (`?tpl=theme`)

### Phase 30d: Study Paths
- `StudyPath`, `StudyPathStep`, `UserStudyPathProgress` models
- `VerseHubStudyPathService`
- `VerseHubStudyController::index` + `::show` + `::step`
- `Study.tsx` + `StudyDetail.tsx`
- `StudyStepOverlay.tsx` composited on Reader
- Filament `StudyPathResource`

### Phase 30e: Bible Interaction Loop & Reflection History
Bringing the "Reflect" pillar to life within the Reader.

**Backend:**
- `ReflectionResponse` model: `user_id`, `verse_ref`, `question_text`, `answer_text`, `is_private`.
- `VerseHubReflectionController` to handle saving and retrieving responses.
- `GET /bible/my-spiritual-journey/reflections` — history view.

**Frontend:**
- **EndOfChapterPrompt.tsx**: A beautiful, calm card appearing at the end of the scroll.
- **ReflectionComposer.tsx**: A simplified editor for answering Mentor prompts.
- **Inline Reflection Markers**: Faint margin dots indicating where a user has previously reflected.

### Phase 30f: Denominational & Historical Context Layer
Finalizing the "Inform" pillar with expert-curated metadata.

**Content & Data:**
- Seed `bible_verse_metadata` for 200 "High Tension" verses.
- Implement "Perspektif Tradisi" label system in `MentorPanel`.
- Build the `HistoricalContext` card (Map + Timeline) for relevant books.

**Verification:**
- Multi-step manual walkthrough: Seeker flow vs Believer flow.
- Lighthouse performance check on the now-modular `Reader.tsx`.

---

## Part 6: What to Avoid (Engineering Guardrails)

| Rule | Reason |
|---|---|
| Never skip the "Scripture Guide" / "Bukan Manusia" labels | Trust is the product |
| Never add LLM responses without rate limiting + fallback | Reliability + cost |
| Never put study path progress behind a paywall gate | Seekers must have access |
| Never add a leaderboard, streak, or XP system | Contradicts product principle |
| Never auto-post Mentor content to Community | AI-to-social without review is disallowed |
| Never make the Ask flow the primary UI | The reader is primary. Ask is a side door |
| Never ship MySQL FTS without testing | FTS5 is SQLite-only in current code |

---

## Source: VerseHub_Mentor_System_Blueprint.md

# Blueprint: VerseHub Scripture-Centered Mentor System

Transforming VerseHub into a guided, scripture-focused learning environment with a transparent "Study Companion" layer.

## 1. The Transparent Mentor: "Scripture Guide"

### core Principles
- **Bible-First**: Every interaction starts and ends with the text.
- **Transparency**: Clear identifying as "Scripture Guide" or "Study Companion". No human simulation.
- **Objective**: Guide seekers and believers through deep themes, doubts, and denominational context without being manipulative.

### Interaction Model
- **Contextual Inquiries**: Users can highlight verses in `Reader.tsx` and select "Ask Scripture Guide".
- **Guided Exploration**: Below chapters, the Mentor provides "Reflection Questions" or "Theme Connections".
- **denominational Context**: When asked, provide neutral, respectful context for how different traditions (Catholic, Protestant, etc.) view a text.

## 2. Technical Architecture

### backend: `VerseHubMentorService`
- **Responsibility**: Orchestrates the "Mentor" logic.
- **Tools**: Integration with an LLM (using the existing `Safe-AI` prompting patterns) to process verse context and user queries.
- **Constraints**: System prompts must enforce the "Study Companion" persona and prioritize biblical accuracy.

### Frontend: `MentorPanel` Component
- A refined, sliding panel in `Reader.tsx`.
- **States**:
    - *Suggestions*: "Explore this theme", "Historical Context".
    - *Chat*: Threaded conversation with the Scripture Guide.
    - *Deep Dive*: Expanded multi-verse study modes.

## 3. Premium OG Previews

### Design Vision
- **Luxurious Aesthetic**: Serif typography, paper-like textures, elegant gold/slate accents.
- **Dynamic Context**: Previews should differ for a single verse vs. a "Guided Insight" or "Study Summary".
- **Performance**: High-quality PNG generation using PHP GD or a dedicated node-based renderer if complex layering is needed.

### Implementation in `VerseHubController`
- Refactor `renderOgPng` to support multiple templates.
- Add support for brand-consistent watermark/logo.
- Ensure 1200x630 resolution with high-DPI clarity.

## 4. Security & Moderation
- Use existing `SafeEngage` guards for user queries.
- Rate limiting for Mentor interactions to prevent abuse.
- Transparent logging of AI responses for audit.

---

## Source: versehub_og_design_system.md

# VerseHub Premium OG Design System

Every shareable artifact in VerseHub must feel elegant, luxurious, and mobile-premium. This document defines the visual and technical rules for the OG preview system.

---

### 1. Visual Design Language

- **Atmosphere**: Minimalist, airy, and sacred.
- **Color Palette**: Deep slates, soft ivories, and subtle gold/amber accents.
- **Glassmorphism**: Use of subtle blurs and translucency for a modern iOS/Android feel.

---

### 2. Typography & Hierarchy

- **Main Text (Verse/Quote)**: DM Serif Display. Large, centered, with generous leading.
- **Scripture Reference**: DM Sans. Bold, uppercase, tracking: 0.1em.
- **Translation Label**: DM Sans. x-small, muted color.
- **Brand Signature**: "VerseHub | Scripture-Centered Mentor" at the bottom center.

---

### 3. OG Card Variations

| Card Type | Background Treatment | Content Focus |
| :--- | :--- | :--- |
| **Verse Card** | Dynamic gradient based on book theme. | The literal verse text. |
| **Chapter Card** | Clean ivory with a faint biblical watermark. | Chapter Title & 1-2 key verses. |
| **Study Path** | Progress bar graphic + Path Title. | "I'm studying [Topic] on VerseHub." |
| **Ask-the-Bible**| Elegant question card aesthetic. | The Question + 1 core Verse Answer. |
| **Journey Card** | Timeline-style graphic. | "Reflected on John 3:16 today." |

---

### 4. Technical Strategy (Laravel)

- **Rendering Engine**: Use a dedicated Laravel controller (`VerseHubOGController`) that renders a specialized Blade view into an image.
- **Image Generation**: Utilize `spatie/browsershot` or `intervention/image` (if simple) to convert HTML to PNG.
- **Dynamic CSS**: Tailwind CSS is used within the OG Blade templates to ensure consistency with the app UI.
- **Caching**: Images are cached by `verse_ref + lang + type` to ensure zero-latency on social platform crawls.

---

### 5. Premium Quality Checklist

- [ ] Is the padding balanced (min 40px)?
- [ ] Is the font rendered crisply (subpixel antialiasing)?
- [ ] Does it look good in both iMessage and WhatsApp previews?
- [ ] Is there clear branding without being intrusive?
- [ ] Is the text truncated gracefully if too long?

---

## Source: versehub_og_implementation_strategy.md

# VerseHub OG Implementation Strategy

This document provides a technical roadmap for implementing premium OpenGraph (OG) image generation, ensuring high-quality, zero-latency previews for every scriptural artifact shared from VerseHub.

---

### 1. Endpoint & Route Architecture

| Route Pattern | Controller Method | Purpose |
| :--- | :--- | :--- |
| `GET /og/v/{ref}` | `VerseHubOGController@verse` | Generate card for a single verse or range. |
| `GET /og/p/{path_slug}`| `VerseHubOGController@path` | Generate card for a study path. |
| `GET /og/a/{answer_id}`| `VerseHubOGController@answer` | Generate card for an Ask-the-Bible answer. |
| `GET /og/r/{reflector_id}`| `VerseHubOGController@reflection`| Generate card for a reflection journal entry. |

---

### 2. Image Rendering Strategy (HTML-to-Image)

We will use **HTML-to-Image** rendering because it allows for modern CSS (Tailwind, Gradients, Typography) which is difficult to achieve with raw GD/ImageMagick.

- **Primary Driver**: `spatie/browsershot` (Puppeteer wrapper).
- **Fallback Driver**: `intervention/image` for simple text-on-image templates if Puppeteer is unavailable.
- **Rendering Workflow**:
    1. Controller fetches data.
    2. Renders a dedicated `og.template` Blade view.
    3. Browsershot captures the view at 1200x630px.
    4. Returns PNG response.

---

### 3. Caching & Performance

High-quality image generation is resource-intensive. We must implement strict caching.

- **Filesystem Cache**: Generated PNGs are stored in `storage/app/public/og-cache/`.
- **Naming Convension**: `{type}_{slug/ref}_{lang}.png`.
- **Pre-generation**: When a user highlights a verse or saves a reflection, we trigger a background job to warm the OG cache for that specific item.

---

### 4. Typography & Layout Constraints

- **Dynamic Text Handling**: We use a "Scaling Font" approach. Short verses get larger fonts (`text-5xl`), while longer passages scale down to `text-2xl`.
- **Truncation**: Passages exceeding 400 characters are gracefully truncated with a "Read more on VerseHub" watermark.
- **Font Rendering**: Fonts are pre-loaded on the server to ensure Browsershot renders them identically to the web interface.

---

### 5. Reusable OG Templates (Blade)

We will create a base `layouts.og` and specific components:
- `og.verse`: Focus on the typography of a single verse.
- `og.path`: Focus on progress bars and thematic iconography.
- `og.journal`: Focus on the personal reflection aesthetic.

---

### 6. Fallback Behavior

If the image generation fails (e.g., Puppeteer timeout):
1. Serve a high-quality "Identity Card" (showing VerseHub logo + Ref text).
2. Set `Cache-Control: no-cache` to retry on next crawl.
3. Log the error for admin review.

---

## Source: versehub_product_definition.md

# VerseHub: Scripture-Centered Mentor System
## Technical & Product Vision

This document defines VerseHub’s transition from a standard Bible reader to a guided Bible-learning experience centered on Scripture itself.

---

## 1. Product Definition
In product terms, a **Scripture-Centered Mentor System** is a contextual intelligence layer that sits on top of biblical text, designed not to provide "all the answers," but to provide the **right context and questions** to help the user encounter the text directly.

It is **Scripture-Centered** because the Bible is the primary actor and final authority.
It is a **Mentor System** because it models the behavior of a wise, humble teacher who points back to the book rather than speaking for themselves.

---

## 2. Target Users

| User Persona | Their Posture | Primary Need |
|---|---|---|
| **Deep Seekers (Christians)** | "I want to go beyond a surface-level reading." | Thematic connections, historical context, and deep reflection prompts. |
| **Doctrinal Questioners** | "I'm confused by what my church says vs. what I read." | Neutral, multi-perspective context that respects denominational history. |
| **Faith Doubters** | "I'm struggling with this passage or faith in general." | A safe, non-judgmental space to explore hard texts without being "preached at." |
| **Seekers (Non-Christians)** | "I'm curious about the Bible but don't want to be converted." | Low-friction, terminology-safe entry points into the literal meaning of Scripture. |
| **Cross-Denominational Believers** | "I want to see how other traditions understand this." | Tradition-aware insights (Catholic, Orthodox, Evangelical, Adventist, etc.) presented objectively. |

---

## 3. Core User Problems
1. **Passive Reading**: Users read a passage but don't know how to engage with it beyond reading the words.
2. **Context Blindness**: Users miss the author's intent because they lack historical or literary context.
3. **Theological Friction**: Users encounter "hard verses" and feel stuck or judged if they ask for help.
4. **Information Overload**: Generic AI or massive commentaries provide too much noise; users need a "curated mentor" focus.
5. **Shallow Devotion**: Users want to reflect but "don't know what to think about."

---

## 4. Product Principles
- **Scripture First**: Every interaction must begin and end with the Bible text. If the Mentor speaks, it must cite.
- **Questions Over Conclusions**: The system is more successful if it leaves the user with a profound question than a pre-packaged answer.
- **Transparency of Agency**: The user must always know they are interacting with an AI-assisted tool (labelled as "Scripture Guide"), never a human authority.
- **Eirenic Tone**: Maintain a calm, peaceful, and respectful tone that honors the sacred nature of the text and the honesty of the user's struggle.
- **Neutrality by Default**: Present major perspectives on contested passages rather than advocating for a single position.

---

## 5. The Three-Way Distinction

| Characteristic | Normal Bible Reader | Bible Chatbot | Scripture-Centered Mentor System |
|---|---|---|---|
| **Authority** | The Text (Static) | The AI (Generative) | The Text (Framed by Context) |
| **Interaction** | Scroll and Bookmark | Prompt and Answer | Read, Reflect, and Inquire |
| **Goal** | Information Access | Instant Answers | Spiritual & Intellectual Growth |
| **Risk** | Passivity | Theological Hallucination | **Intellectual Honesty (Target State)** |
| **UI Persona** | None | Character/Persona (e.g. "Ask Moses") | Transparent "Scripture Guide" (Tool) |

---

## 6. What VerseHub Should Do ✅
- Surface **context-aware reflection questions** specific to the passage's genre.
- Provide **thematic cross-references** that link Old and New Testament fulfillment.
- Present **denominational insights** on high-tension verses without bias.
- Allow **free-text Q&A** that is strictly tethered to the biblical text.
- Enable **Study Paths** that guide users through complex themes step-by-step.
- Generate **Premium Visuals** (OG Images) that keep Scripture central and beautiful.

---

## 7. What VerseHub Should Avoid 🚫
- **Persona Characterization**: Never give the AI a name, face, or "human" personality.
- **Theological Advocacy**: Avoid taking sides in denominational disputes or declare a "winner."
- **Nudging/Gamification**: Avoid streaks, points, or notifications that distract from the text.
- **Conversion-Focussed UI**: Never pressure seekers or doubters; the text must be its own invitation.
- **Topic-Hopping**: Avoid being a general-purpose AI; if a user asks about the stock market, the system should politely return to the text.

---

## 8. Summary Goal
> **VerseHub exists to turn the "Black and White" of a digital reader into a "High Definition" conversation with the Word of God.**

---

## Source: versehub_sharing_architecture.md

# VerseHub Sharing Architecture & Premium OG System

This document outlines the architecture for sharing scriptural insights and study progress from VerseHub, ensuring every touchpoint generates a luxurious, mobile-premium OG preview.

---

### 1. Shareable Entities

| Entity | Purpose | User Value |
| :--- | :--- | :--- |
| **Single Verse** | Sharing a specific Word. | Aesthetic testimony / social posting. |
| **Verse Range** | Sharing a context or block. | Group study / deep-dive sharing. |
| **Chapter Reading** | Sharing what I'm reading. | Encouraging others to read along. |
| **Study Path** | Sharing progress in a journey. | Social accountability / inspiration. |
| **Ask-the-Bible Answer**| Sharing a scriptural answer. | Apologetics / helpful guidance. |
| **Reflection Note**| Sharing a personal insight. | Authentic spiritual sharing. |

---

### 2. OG Preview Strategy

We will replace generic social previews with **Custom-Generated Image Artifacts** that feel like high-end editorial cards.

- **Design Language**: DM Serif Display (Editorial), DM Sans (Clean Info), subtle glassmorphism, and sacred textures.
- **Mobile First**: Optimized for iMessage, WhatsApp, and Telegram previews (1200x630 and 1200x1200x aspect ratios).

---

### 3. Technical Implementation (Laravel)

#### Route Structure
```php
// Image Generation Endpoint
Route::get('/og/versehub/{ref}', [VerseHubOGController::class, 'generate'])->name('versehub.og');

// Share Landing Pages (Inertia-driven with Meta Tags)
Route::get('/v/{ref}', [VerseHubController::class, 'shareView']);
```

#### Controller Logic
1.  **Request**: `GET /og/versehub/gen-1-1-id`
2.  **Logic**: `VerseHubOGController` fetches verse data + translation.
3.  **Rendering**: Renders a dedicated **Blade-Tailwind Template** (`resources/views/og/versehub.blade.php`).
4.  **Generation**: Uses `spatie/browsershot` (Puppeteer) or a simpler SVG-to-PNG approach to capture the card.
5.  **Caching**: Store result in `storage/app/public/og_cache/` for 30 days.

---

### 4. Visual Components of an OG Card

1.  **The Background**: High-resolution, subtle biblical textures (e.g., parchment, modern stone, or soft gradients).
2.  **The Content**: The Verse text (using `DM Serif Display`) with a max char limit (300 chars) before graceful truncation.
3.  **The Metadata**: Reference (e.g., Kejadian 1:1), Translation (e.g., TB), and the user's name (optional).
4.  **The Signature**: Subtle VerseHub branding at the bottom.

---

### 5. Deployment Checklist
- [ ] Install `spatie/browsershot` and Puppeteer on the server.
- [ ] Ensure `DM Serif Display` and `DM Sans` are installed as system fonts or loaded via CSS.
- [ ] Implement Redis-based rate limiting for the OG generator.
- [ ] Verify previews on [OpenGraph.xyz](https://www.opengraph.xyz).

---

## Source: versehub_ux_experience_design.md

# VerseHub: Ideal Reader Experience Design

This blueprint defines the UX architecture for VerseHub, ensuring it remains a **Bible reader first**, while seamlessly hosting the **Scripture-Centered Mentor System**.

---

## 1. Reading Flow: The "Sacred Canopy"
The ideal reading experience should feel like a "Sacred Canopy" — an environment that protects focus and minimizes digital noise.

- **Entry**: Users arrive at a clean, serif-driven text view.
- **Atmosphere**: Minimal UI. No visible ads, banners, or suggested "related content" while reading.
- **Continuity**: Scrolling is seamless (infinite or chapter-by-chapter with smooth transitions).
- **Adaptive Surface**: High-contrast dark mode for night reading, warm sepia for daytime study, and a blindingly clean white for morning devotions.

---

## 2. Verse Interaction Model: "Focused Precision"
Verse actions must be **reactive**, not proactive. They should only manifest when the user is ready to engage with a specific part of the text.

- **The Tap**: Tapping a verse selects it (highlighting it subtly with a brand gold border or soft background).
- **The Options**: A floating action bar (FAB) or a compact bottom sheet appears ONLY upon selection.
- **The Hierarchy**:
    - **Primary Actions**: Highlight, Note, Bookmark. (Fast, personal)
    - **Secondary Actions**: Share, Cross-Reference. (Outward)
    - **Mentor Action**: "Ask Guide" / "Deep Insights". (The gateway to the system)

---

## 3. Mentor Touchpoints: "The Waiter, Not the Stage"
The Mentor should behave like a high-end waiter: present when looked for, invisible when not.

- **Inline Insights**: Subtle "insight dots" or faint underlines on verses with high-tension context or historical depth. These are non-intrusive.
- **Selection Drawer**: When a verse is selected, a "Mentor Summary" (1-2 lines) appears at the bottom of the verse tool menu, acting as a teaser to deeper study.
- **Active Inquiry**: The Mentor panel ONLY occupies the full screen or a large side drawer when the user explicitly clicks "Ask Guide" or a mentor-generated question.

---

## 4. Deep Study Entry Points
Transitioning from reading to study should feel like "opening a door" into a side room, not "leaving the house."

- **The "Reflection" Trigger**: At the end of every chapter, a single, beautifully styled "Reflection Prompt" from the Mentor appears.
- **Bookmark-to-Path**: If a user bookmarks 3 verses in a similar theme, the Mentor can subtly suggest a related "Study Path."
- **Term-Click**: Tapping a biblical term (e.g., "Covenant", "Grace") opens a compact Mentor dictionary view without losing the reading scroll position.

---

## 5. Information Architecture: "The Three Layers"

| Feature | Primary View (Inline) | Side Panel / Bottom Sheet | Secondary View (Full) |
|---|---|---|---|
| **Scripture Text** | Always visible, center stage. | N/A | N/A |
| **Personal Notes** | Indicator icon in margin. | Recent note preview. | Full Journal/History. |
| **Mentor Insights**| Faint underline (optional). | Reflection & Context. | Full Q&A / Historical maps. |
| **Cross-Refs** | N/A | Related verses list. | Full comparative view. |
| **Sharing** | N/A | OG Preview & Social CTAs. | Premium Personalization. |

---

## 6. UX Rules
1. **Rule of One**: Only one verse-level overlay can be open at a time.
2. **Serif Supremacy**: All biblical text MUST use the premium Serif typeface (`DM Serif Display` or `Inter` for body). Non-scripture UI remains San-Serif.
3. **Context Memory**: If a user leaves the reader and returns, they must land on the EXACT verse they were last reading.
4. **Calm Haptics**: Use very subtle haptic feedback for verse selection (on mobile).

---

## 7. Anti-Patterns to Avoid 🚫
- **Blocking Overlays**: Never cover the scripture text with a modal that requires a "Close" button just to keep reading.
- **Auto-Loading AI**: Never have the Mentor start typing or "talking" without user initiation.
- **Social Noise**: No "X number of people are reading this right now" counters inside the reader.
- **Feature Bloat**: If a tool isn't directly related to reading or understanding the current chapter, it doesn't belong in the Reader UI.

---

## 8. Summary UX Vision
> **"Read in the light. Study in the depths. Share in the beauty."**

---

## Source: walkthrough_versehub_mentor.md

# Walkthrough: VerseHub Mentor System (Phases 30a–30d)

This walkthrough documents the successful implementation of the core VerseHub Mentor System, transforming the Bible reader into a Scripture-Centered Study Companion.

**Build Status: ✅ Compiled clean (exit 0).**
**Database Status: ✅ Migrations applied, 3 curated Study Paths seeded.**

---

## Phase 30a: Data Foundation

Established the robust relational layer for mentored study.

### [Backend] Models & Migrations
- **BibleVerse Extensions**: Added `testament` and `book_canonical_order` for better sorting.
- **Verse Relationships**: New `verse_relationships` table to link fulfillment and thematic parallel verses.
- **Verse Themes**: New `verse_themes` and mappings to power the "Themes" discovery tab.
- **Mentor Sessions**: `user_mentor_sessions` to track and history-ize Q&A interactions.
- **Study Paths**: `study_paths` and `study_path_steps` for curated learning journeys.

---

## Phase 30b: Mentor Q&A + MentorPanel

Extracted the mentor UI into a premium, standalone component for enhanced focus.

### [Frontend] MentorPanel.tsx
- **Reflect Tab**: Surfaces genre-aware reflection questions (e.g., Narrative vs Poetry).
- **Context Tab**: Provides historical background and denominational context for high-tension verses.
- **Ask Tab**: Authenticated free-text Q&A with the "Scripture Guide".
- **Design**: Premium amber/gold accents with glassmorphism overlays and clear "Bukan Manusia" (Not Human) transparency labels.

### [Backend] Mentor API
- `POST /versehub/{lang}/{ref}/mentor/ask`: Authenticated, rate-limited endpoint that processes user questions through the swappable `MentorDriverInterface`.
- Defaulted to `TemplateMentorDriver` for safe, stable fallback behavior.

---

## Phase 30c: Study Paths & Progress Tracking

Introduced structured, guided learning within VerseHub.

### [Backend] StudyPathController
- Handles path listing, detailed step views, and enrollment.
- Implements `completeStep` logic to persist user progress in the `user_study_path_progress` table.

### [Frontend] Study Path UI
- **Index Page**: Premium grid layout showing difficulty, estimated time, and thematic colors.
- **Show Page**: Checklist-style UI for following a path, with real-time progress bars and links to the Reader for each specific verse.

### [Data] Starter Seeding
1. **Dasar Iman Kristen** (Foundations of Faith) - 4 steps.
2. **Mengenal Yesus Kristus** (Knowing Jesus) - 4 steps.
3. **Mengatasi Kecemasan** (Overcoming Anxiety) - 4 steps.

---

## Verification Results

### Build Verification
```bash
✓ built in 1m 12s
```

### Data Integrity
- Verified all 8 migrations applied successfully.
- Verified seeder populated `study_paths` with correct `beginner` and `intermediate` enum constraints.
- Verified `MentorPanel` import casing is consistent with the `resources/js/Components/versehub/` structure.

---

## Phase 30d: Premium Share System & OG Generator

Completed the social loop for the Scripture-Centered Mentor System.

### [Backend] Thematic OG Generator
- Refactored `VerseHubController@renderGenericPremiumOg` as a unified high-resolution engine.
- Implemented `renderStudyPathOg` with curated color palettes (Amber, Sky, Green, Rose) to match Path themes.
- Registered `/versehub/{lang}/study/{slug}/og.png` route.

### [Frontend] Unified Share Experience
- **SharePanel.tsx**: A premium, glassmorphism-enhanced modal with live OG preview and social CTAs.
- **Reader Integration**: Replaced standard share with the premium panel for every verse.
- **Study Path Integration**: Added "Share Path" to every guided journey, promoting curated spiritual growth on social media.

---

## Verification Results

### Build Verification (Phase 30d)
```bash
✓ built in 1m 24s
```

### Functional Check
- [x] Correct OG path mapped for verses: `/versehub/{lang}/{v.key}/og.png`
- [x] Correct OG path mapped for study paths: `/versehub/{lang}/study/{slug}/og.png`
- [x] SharePanel correctly provides WhatsApp, Telegram, and Copy Link options.
### Final Audit & Polish
- **Code Quality**: Fixed null pointer in `Reader.tsx` (`search_meta` chaining) and standardizing backend `abort_unless` calls.
- **Full Coverage**: Verified all prompts in `BIBLE ENGINE PROMPT.md` are implemented, including relationship rendering and follow-up paths.
- **Chapter OG**: Added a premium OG generation for shared Bible chapters via `VerseHubReaderController@chapterOg`.
- **Response Structure**: Enhanced Mentor Q&A responses to explicitly distinguish between Biblical Text, Interpretation, and Study Guidance.

---

## Phase 30e: Verse Relationship Engine & Study Discovery (Completed)

Successfully interconnected Scripture and discovery loops.

### [Backend] Relationship & Theme Engine
- **VerseHubMentorService**: Enhanced with `getRelationships`, `getThemes`, and `getActiveStudyPaths`.
- **Chapter Data**: `VerseHubReaderController` now delivers aggregated thematic/historical context for entire chapters.

### [Frontend] Discovery UI
- **MentorPanel "Connect" Tab**: Visualizes explicit cross-references and parallels (e.g., Prophecy -> Fulfillment).
- **EndOfChapterPrompt**: Dynamically suggests Study Paths (e.g., "Foundations of Faith") after a user finishes a chapter.
- **Study Path Banners**: Context-aware enrollment notifications at the top of the Scripture Guide.

### [Validation]
- **Type Checking**: Verified that the frontend correctly consumes the new nested `mentor_insights` structure from the Inertia page props.
- **Interconnectedness**: Verified that clicking a relationship in the MentorPanel correctly redirects the user to the target verse with full context.

## Final Status
VerseHub has been successfully transformed into a **Scripture-Centered Mentor System**. Every reading touchpoint now serves as a gateway to deeper biblical understanding through guided discovery, curated paths, and transparent mentorship.

---

