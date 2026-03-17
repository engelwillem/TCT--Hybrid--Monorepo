# Interface Architecture & Navigation

## Core Navigation (The "Bottom Bar")
Untuk mempertahankan fokus aplikasi dan mencegah fragmentasi (_cognitive overload_), struktur navigasi utama disederhanakan menjadi 5 pilar utama:

1. **Today (`/today`)**
   - Beranda personal (Context Router). Menyesuaikan diri dengan _Spiritual State_ pengguna hari ini.
2. **VerseHub (`/versehub`)**
   - Pusat interaksi Alkitab, perenungan (Refleksi), dan dialog bersama instruktur AI (Mentor).
3. **Paths (`/paths`)**
   - Mengelola rute perjalanan spiritual (Spiritual Journeys) dan progres belajar.
4. **Community (`/community`)**
   - Ruang komunal untuk _prayer requests_, kesaksian, dan interaksi sesama.
5. **Profile (`/profile`)**
   - Manajemen akun, preferensi, dan akses menuju Inbox/DMs.

## Final Navigation Model (V1 Lock)
**Primary Nav Items (Bottom Bar):**
1. **Today** (`/today`): Primary entry surface. Adapts statefully.
2. **VerseHub** (`/versehub`): Primary reading tool. 
3. **Paths** (`/paths`): Primary retention loop.
4. **Community** (`/community`): Primary social & prayer fabric.
5. **Profile** (`/profile`): Secondary access point for settings, merged with Inbox.

**Deep Surfaces (No direct Nav Bar button):**
- **Inbox** (`/inbox`): Accessed strictly through Profile or floating notifications.
- **Reading View** (`/versehub/*`): Full-screen reader.
- **Reflection Composer** (`/community?intent=...`): Full-screen writing focus.

## Final Screen Architecture Logic

| Screen / Route | Designation | Product Role & Justification | Action / Replacement |
| -------------- | ----------- | ---------------------------- | -------------------- |
| `/today`       | **KEEP**    | **Context Router.** Users need a landing space to ground themselves before diving into tools. | N/A |
| `/versehub`    | **KEEP**    | **Core Utility.** Reading and reflecting is the atomic unit of the application. | N/A |
| `/paths`       | **KEEP**    | **Retention Engine.** Structured journeys build long-term reading habits. | N/A |
| `/community`   | **KEEP**    | **Social Proof.** Keeps the app from feeling like a lonely utility; drives prayer and member support. | N/A |
| `/profile`     | **KEEP**    | **User Context.** Necessary for identity, settings, and linking to secondary private spaces. | N/A |
| `/inbox`       | **KEEP**    | **Private Loop.** DMs and approvals are necessary for 1on1 prayer logic. | Removed from main nav; accessed via Profile. |
| `/login`       | **KEEP**    | **Access Gate.** Core auth suite. | N/A |
| `/channels`    | **MERGE**   | Group chat/learning logic overlaps heavily with `Paths` (curriculum) and `Community` (discussion). | Migrate group curriculum logic into `Paths`. Migrate group chat into `Community` tags. |
| `/reflections` | **MERGE**   | Storing reflections in a vacuum is useless. Reflections are just community posts with a specific intent. | Merge into `Community` timeline via the Smart Composer intent. |
| `/library`     | **REMOVE**  | Content cataloging without reading context is redundant. | Search and indexing move purely into `VerseHub` tab. Delete `/library`. |
| `/visitors`    | **REMOVE**  | Marketing/events inside a spiritual app breaks focus. | Move announcements to `Community` tags. Delete `/visitors`. |
| `/gate-updates`| **PARK**    | Too niche for V1. | Disable route until V2. |

## Safe Deletion / Retirement Plan
1. **Immediate Deletion:** Delete the `/library`, `/visitors`, and `/gate-updates` directories entirely from `src/app/` to reduce routing bloat before any redesign code starts.
2. **Deprecation Pipeline:** `/channels` and `/reflections` will remain temporarily functional but heavily de-emphasized in the UI while data migration occurs. After the new `Community` and `Paths` screens are solid, they will be hard-deleted.

## Implementation Order (V1 Redesign Target)
The safest redesign sequence to lock the new product face:
1. **Globals & Shells:** `layout.tsx`, `MobileAppLayout`, and `globals.css`
2. **The Entry:** `/today`
3. **The Core Tool:** `/versehub/*`
4. **The Social Fabric:** `/community`
5. **The Retentive Loop:** `/paths/*`
6. **The User Shell:** `/profile` and `/inbox`
