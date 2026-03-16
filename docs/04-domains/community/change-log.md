# Changelog Domain (Community)

## [Phase Core Migration] - 2026-03-10

### Ditambahkan
- Endpoint API Backend Controller memfasilitasi parameter opsional baru.
- Antarmuka Next.js `CommunityPage` untuk *feed list* publik maupun grup privat.
- Composer komponen khusus pengiriman data form via *React state payload*.

### Diubah
- *Optimistic rendering* belum sempurna terimplementasi pada Reaction/Like; masih mengandalkan refresh paksa data (`mutate`).
