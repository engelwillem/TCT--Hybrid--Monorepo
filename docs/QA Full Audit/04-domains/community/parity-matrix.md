# Parity Matrix: Community

Refleksi keterpaduan (Parity) Fungsional Feed Publik/Grup antara Monorepo/Backend Laravel dengan UX React terkini.

## Composer (Alat Buat Post)
| Fitur / Skope | Legacy (Blade) | Hybrid (Next.js) | Status | Catatan |
| ------------- | -------------- | ---------------- | ------ | ------- |
| Teks Polos | Form Default | `PostComposer` | `PASS` | `store()` API dijamin masuk DB dengan status enum standar.
| Tangkap Parameter | N/A | React URL Inject | `PASS` | Komposer siap menerima parameter metadata (contoh `ref=...` dari *VerseHub*).
| Submit Feedback | Alert Box | State Reload | `PASS` | Data terefresh bila payload sukses.

## Feed Retrieval (Membaca Feed)
| Fitur / Skope | Legacy (Blade) | Hybrid (Next.js) | Status | Catatan |
| ------------- | -------------- | ---------------- | ------ | ------- |
| Feed List | `MemberPost::active()`| `CommunityPage` Array | `PASS` | Urutan didasarkan filter Active status tanpa filter arsip palsu.
| Archive Feed | Tab Terpisah | React Query Fetch | `PASS` | Memakai data server asli (bukan *fake filter* di klien).
| Interactions | Like/Komen | Reaction UI | `PASS` | Write-flow aman tersimpan pada *MemberPostComment* DB.
| Share Snippet| Share API | `ThrowingCard` API | `PASS` | Tombol bagikan sudah dites menyalin/link utuh via end-to-end `write.spec.ts`.
