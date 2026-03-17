# Visual & Layout Architecture (The "Relevance Engine" Face)

## Misi Visual
Beralih dari produk web tradisional (berpusat-pada-dokumen) menuju *Native App-like Experience* dengan desain yang halus, reaktif, menenangkan, dan minim polusi visual.

## Visual System Direction
1. **Thematic Tone:** "Dawn / Twilight". Mewujudkan kedamaian spiritual melampaui warna putih statis biasa. Surface berwarna _slate_ hangat ultra-cerah (`bg-slate-50` / `bg-[#fcfdfd]`), sementara elemen kartu yang melayang membawa elevasi bayangan tebal namun amat lembut (`shadow-soft` ke `shadow-xl`, `ring-1 ring-black/[0.03]`).
2. **Typography Hierarchy:** Fokus pada Sans-Serif modern yang elegan (semisal `Inter`, `Plus Jakarta Sans`, atau bawaan sistem `ui-sans-serif`).
   - _Display/Headers:_ *Tracking* sangat merapat (_tight_) untuk menciptakan sensasi impresif dan solid.
   - _Body/Paragraphs:_ *Leading* lapang (_relaxed_) untuk meningkatkan rasionalitas dan pernafasan membaca kontemplatif.
   - _Meta/Caps:_ Teks tambahan memakai kapital `text-[10px] tracking-widest uppercase` layaknya label desain kontemporer.
3. **Card & Surface Logic:** Ujung sudut dipulas super-mulus (`rounded-[32px]` atau `rounded-[40px]`). Kartu harus bernapas melalui padding (`p-6`, `p-8`) ekstra lega sebelum konten menyapa tepi pembungkus.
4. **Interaction (Micro-Animations):** Tombol (_Button_), Kartu (_ThrowingCard_), dan Lencana (_StateChips_) merespons melalui _Framer Motion_ menggunakan pantulan karet terukur (`spring`, `stiffness: 400`, `damping: 30`) agar terasa "hidup".
5. **Color & Hierarchy:** Rona yang menandakan bahaya pakai `rose-500`, kearifan/nasehat memakai `amber-500`/`orange-500`, pencerahan memakai pendaran `cyan-400`. Sisa warna antarmuka didominasi skala kelabu dalam (`slate-900`, `slate-400`).

## Layout System Shells
Pemisahan struktur _layout_ ke dalam 4 kerangka utama:
1. **The App Shell (`MobileAppLayout`):** Antarmuka bernavigasi menetap (_sticky bottom tab_), *safe-area* melengkung, khusus untuk `/today`, `/community`, `/paths`, `/profile`.
2. **The Reader Shell:** Format layar utuh (_full-immersive_) bebas distraksi menu utama, memprioritaskan tipografi mutlak untuk _VerseHub Reader Page_ (`/versehub/id/[ref]`).
3. **The Focus Action Shell:** Form layar tunggal untuk dialog dan komposisi (mis: `ReflectionComposer` atau `Private Chat`). Header sederhana bersanding tombol pembuka/tutup `X`.
4. **The Landing Shell:** Format promosi pemasaran publik tanpa otentikasi. Layar lebar yang merespons paralaks gulir dan penonjolan _scroll progress_.
