# Visual & Layout Architecture (The "Relevance Engine" Face)

## Misi Visual
Beralih dari produk web tradisional (berpusat-pada-dokumen) menuju *Native App-like Experience* dengan desain yang halus, reaktif, menenangkan, dan minim polusi visual.

## Concrete Visual System Rules ("Dawn Theme")

**1. Base Strategy & Mode**
- App operates strictly in Light/Dawn mode natively. No pure dark mode for V1 (avoiding double maintenance).
- **Background Strategy:** `bg-background` (which maps to a warm/bright base like `slate-50`). No more `#0f172a` wraps.

**2. Color Palette**
- **Primary Text:** `text-foreground` (Maps to slate-900).
- **Secondary Text:** `text-muted-foreground` (Maps to slate-500).
- **Brand/Accent:** `brand` (Maps to primary cyan/blue tones, used sparingly for interaction limits).
- **Surface Layering:** `bg-surface` (white/translucent) -> `bg-surface-elevated` -> `bg-surface-muted`.
- **Warning/Error:** `rose-500`.
- **Guidance/Insight:** `amber-500`/`orange-500`.

**3. Card & Shape Rules**
- **Radii:** Cards and wrappers use massive, smooth radii: `rounded-[32px]` or `rounded-[40px]`. Nested children match appropriately. No sharp `rounded-md` left exposed.
- **Glassmorphism:** Overlapping cards must utilize `bg-white/70`, `backdrop-blur-xl`.
- **Borders:** `border-border/50` (ultra-soft borders). Avoid high-contrast strokes.
- **Shadows:** Floating elements use `shadow-soft` or `shadow-card` (diffused, large spread, low opacity black). No more hard blocks.

**4. Typography Scale**
- **Typeface:** Inter/ui-sans-serif.
- **Headers (`h1`-`h3`):** Tight tracking (`tracking-tight`), `text-foreground`, high contrast.
- **Body (`p`):** Relaxed leading (`leading-relaxed`), `text-muted-foreground`, lower contrast to prevent reading fatigue.
- **Kick/Label:** Microcaps: `text-[10px] uppercase font-black tracking-widest`.

**5. Button & Action Hierarchy**
- **Primary:** `bg-brand text-background rounded-full` + bounce effect.
- **Secondary:** `bg-surface-elevated text-foreground rounded-full border border-border/50`.
- **Ghost/Tertiary:** `text-muted-foreground hover:bg-surface-muted rounded-full`.

**6. Section Composition & Spacing**
- Sections breathe heavily. Use `p-6` or `p-8` for outer container spacing.
- Gap intervals between major blocks must run `space-y-6` or `space-y-8`. Avoid clumped `space-y-2` on macro layouts.

## Layout System Shells
Pemisahan struktur _layout_ ke dalam 4 kerangka utama:
1. **The App Shell (`MobileAppLayout`):** Antarmuka bernavigasi menetap (_sticky bottom tab_), *safe-area* melengkung, khusus untuk `/today`, `/community`, `/paths`, `/profile`.
2. **The Reader Shell:** Format layar utuh (_full-immersive_) bebas distraksi menu utama, memprioritaskan tipografi mutlak untuk _VerseHub Reader Page_ (`/versehub/id/[ref]`).
3. **The Focus Action Shell:** Form layar tunggal untuk dialog dan komposisi (mis: `ReflectionComposer` atau `Private Chat`). Header sederhana bersanding tombol pembuka/tutup `X`.
4. **The Landing Shell:** Format promosi pemasaran publik tanpa otentikasi. Layar lebar yang merespons paralaks gulir dan penonjolan _scroll progress_.

