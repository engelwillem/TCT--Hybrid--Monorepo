# Changelog Domain (Community)

## [Composer Parameters] - 2026-03-17

### Ditambahkan
- Kemampuan membaca URL Param Query `intent`, `ref`, dan `text` via `next/navigation` `useSearchParams` pada `CommunityPage.tsx`.
- Properti inisialisasi awal (`initialText`, `initialType`, `initialExpanded`) kepada komponen `PostComposer.tsx` demi menangkap konteks kiriman otomatis fitur luaran (cth. Journey/VerseHub).
- Pembungkus khusus pola asinkron (`Suspense` + `SmartPostComposer`) untuk menetralisasi *hydration issues* / de-opt server component pelacakan parameter pencarian `useSearchParams`.

---

## [Phase Core Migration] - 2026-03-10

### Ditambahkan
- Endpoint API Backend Controller memfasilitasi parameter opsional baru.
- Antarmuka Next.js `CommunityPage` untuk *feed list* publik maupun grup privat.
- Composer komponen khusus pengiriman data form via *React state payload*.

### Diubah
- *Optimistic rendering* belum sempurna terimplementasi pada Reaction/Like; masih mengandalkan refresh paksa data (`mutate`).
