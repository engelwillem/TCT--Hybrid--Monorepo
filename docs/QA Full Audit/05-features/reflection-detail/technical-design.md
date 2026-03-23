# Reflection Templates (Detail Page)

## Concept
Mengubah halaman pembacaan statis menjadi *Spiritual Response Node*. Bukan sekadar menyuguhkan esai refleksi panjang, tetapi menuntun pengguna untuk berinteraksi di ruang publik (Komunitas) atau privat (Jurnal).

## Template Anatomi (`src/app/reflections/[slug]/page.tsx`)
1. **Relevance Intro:** Kata pembuka untuk mengaitkan perasaan (*hook* empati: "Kecemasan adalah...").
2. **Anchor Verse:** Fokus pada satu atau sedikit bait yang tebal.
3. **Reflection Body:** Ulasan mendalam dan ringkas.
4. **Practical Application:** 1-2 aksi nyata untuk hari ini.
5. **The Handoff CTA (Ruang Respons):** Memakai `<HookCard>` yang melempar payload intent langsung ke form composer komunitas.

## Dependencies
- URL query parameter intercept di `<PostComposer>` (Community).
- Kontrak schema backend (untuk CMS headless) harus memisahkan intro, verse, body, application, prompt diskusi secara *atomic block*.
