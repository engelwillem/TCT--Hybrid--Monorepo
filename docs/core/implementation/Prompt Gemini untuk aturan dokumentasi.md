Mulai sekarang, setiap aktivitas wajib terdokumentasi rapi di folder `docs/` dan harus mengikuti struktur dokumentasi repo yang sudah ditetapkan. Jangan membuat file docs secara acak.

Aturan dokumentasi:
1. Semua audit domain disimpan di `docs/04-domains/<domain>/audit.md`
2. Semua parity matrix domain disimpan di `docs/04-domains/<domain>/parity-matrix.md`
3. Semua patch log domain disimpan di `docs/04-domains/<domain>/change-log.md`
4. Semua verifikasi domain disimpan di `docs/04-domains/<domain>/verification.md`
5. Semua keputusan akhir domain disimpan di `docs/04-domains/<domain>/stop-gate.md`
6. Semua hasil arsitektur produk/teknis disimpan di `docs/03-architecture/...`
7. Semua hasil feature baru experience layer disimpan di `docs/05-features/<feature>/...`
8. Semua hasil testing dan E2E disimpan di `docs/06-testing/...`
9. Semua keputusan besar harus dibuat sebagai ADR di `docs/07-decisions/`
10. Setiap selesai satu langkah kerja, update juga:
   - `docs/08-changelog/daily/<tanggal>.md`
   - `docs/09-handover/current-status.md`
   - `docs/09-handover/next-actions.md`
   - `docs/09-handover/open-blockers.md`

Aturan file:
- pakai kebab-case
- jangan pakai nama file acak seperti `notes2`, `final-final`, `temp`
- isi docs harus ringkas, faktual, dan berbasis file kode nyata

Output kerja harus tetap:
TEMUAN -> PATCH PLAN -> PATCH -> VERIFIKASI -> STATUS

Tetapi selain output itu, kamu wajib membuat/update file docs yang relevan sebelum menyatakan step selesai.


