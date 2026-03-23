# Roadmap Eksekusi Stabilitas Produksi (V1)

## Objective
Menutup gap runtime yang terlihat pada screenshot produksi: 404 nav, OG broken, auth drift, crash VerseHub.

## Phase 1 - Runtime Hotfix (Executed)
- [x] Normalisasi route VerseHub dari surface aktif (`/versehub` -> `/versehub/id`).
- [x] Tambahkan redirect root route VerseHub agar link lama tetap aman.
- [x] Standarkan source OG image Community ke API proxy.
- [x] Tambahkan fallback visual untuk OG image failure.
- [x] Harden login response parser terhadap HTML/non-JSON response.
- [x] Simpan app access token dari response login sukses.
- [x] Refactor logout profile: revoke token backend + clear local token + redirect aman.
- [x] Refactor backend login ke kontrak token-based (`data.token`).
- [x] Stabilkan handler params pada halaman dynamic VerseHub.
- [x] Jalankan validasi syntax/typecheck lokal.

## Phase 2 - Production Revalidation Checklist
- [ ] Deploy backend terbaru (controller auth) ke production cPanel.
- [ ] Deploy frontend terbaru (route/nav/OG/login/profile) ke edge production.
- [ ] Uji ulang login admin: `engel.willem@gmail.com`.
- [ ] Uji ulang logout dari UI profile (bukan endpoint raw API).
- [ ] Uji ulang nav `VerseHub` dari semua surface aktif.
- [ ] Uji ulang OG image pada Community card.
- [ ] Uji ulang detail verse + hash comments agar tidak ada client-side exception.

## Exit Criteria
- [ ] Semua path screenshot sebelumnya tidak lagi menghasilkan 404/crash/broken image.
- [ ] Login admin menghasilkan authenticated profile (bukan guest).
- [ ] Tidak ada fallback error parser (`Unexpected token '<'`) pada login flow.

