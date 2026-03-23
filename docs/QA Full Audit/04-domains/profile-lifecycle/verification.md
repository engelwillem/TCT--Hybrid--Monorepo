# Verification: Profile Lifecycle

## Verification Steps
1. Eksekusi `npx playwright test tests/write.spec.ts`.
2. Validasi konsol: Output `Profile Update SUCCESS` dan `Avatar Upload SUCCESS` tertangkap oleh blok percabangan *response checking* *(Status 200/201)*.
3. Kunjungi halaman /profile dengan state logged-in.

## Status
- **PASS**: Fungsionalitas sesuai dan data berhasil memutasi *Database* (dibuktikan dari respons valid server di *Playwright logs*).
