# Verification: Inbox & DM

## Verification Steps
1. Pastikan user memiliki pesan yang tidak terbaca di *seeder DB*.
2. Jalankan `test/write.spec.ts`.
3. Verifikasi apakah klik URL `mark_read` memicu balasan *SUCCESS* (status 200).

## Status
- **PASS**: Verifikasi *Headless Playwright* membuktikan komunikasi DB & API rute Inbox berstatus lancar.
