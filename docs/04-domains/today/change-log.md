# Changelog Domain (Today / The Anchor)

## [Phase 1: Architecture Rewrite] - 2026-03-16

### Ditambahkan
- State chips `SpiritualState` switcher ke `MobileAppLayout`.
- Indikator responsif di posisi Feed Utama, yang menarik tipe Post khusus (e.g. `prayer_request`) ke area pandang teratas, jika state berstatus `weary` atau `anxious`.
- Komponen `<HookCard>` yang bertindak sebagai *Prayer Injection Widget* disisipkan khusus untuk menyisipkan CTA "Minta Dukungan Doa" bila berstatus cemas.

### Diubah
- Komponen pendaratan (`src/app/today/page.tsx`) direstrukturisasi dari daftar index kaku menggunakan `ThrowingCard` ke *conditional rendering array filtering*.
- Elemen *Learning Path* diletakkan dinamis; bergeser indeksnya dari indeks `5` ke indeks `-1` (bagian punjuk utama layar) jika berstatus `on-fire`.

### Dihapus
- Ketergantungan statis pembacaan komponen *hard-coded* di posisi `ThrowingCard index={0}`.

## [Phase 2: Persistensi Spiritual State] - 2026-03-17

### Ditambahkan
- Endpoint `POST /api/v1/today/state` pada backend Laravel untuk merekam `SpiritualState` ke dalam parameter database tabel `users.spiritual_state`.
- Layanan integrasi baru `src/services/today.service.ts` untuk memfasilitasi _fetch mutation_ ke proksi.
- Re-hidrasi UI dari pasokan Payload Proksi (`payload.data.spiritual_state`) menggantikan inisiasi bawaan gampangan `'fresh'`.
