# Next Actions

## Eksekusi Prioritas (Production Recovery)
- [ ] Deploy backend patch `AuthController@login` (token-based login contract).
- [ ] Deploy frontend patch (VerseHub route/nav, OG card source, login parser, profile logout).
- [ ] Smoke test login admin di production:
  - [ ] `/login` tidak error parse.
  - [ ] redirect ke `/today` sukses.
  - [ ] `/profile` menampilkan user authenticated (bukan Guest User).
- [ ] Smoke test VerseHub:
  - [ ] klik nav `VerseHub` tidak 404.
  - [ ] `/versehub/id/<slug>` tidak client-side exception.
  - [ ] hash `#comments` tidak memicu crash.
- [ ] Smoke test Community:
  - [ ] OG card termuat.
  - [ ] fallback image tidak terpicu untuk kasus normal.

## Verifikasi Admin Credential (Production DB)
- [ ] Validasi user `engel.willem@gmail.com` ada di tabel `users` production.
- [ ] Pastikan `is_admin=1` (+ `is_it=1` bila policy admin panel mensyaratkan).
- [ ] Reset hash password production jika diperlukan.

## Dokumentasi
- [x] Audit report screenshot-based tersedia.
- [x] Roadmap eksekusi checklist tersedia.
- [ ] Catat hasil re-test production final ke changelog harian.
