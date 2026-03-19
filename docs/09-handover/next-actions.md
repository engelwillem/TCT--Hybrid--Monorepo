# Next Actions

## Eksekusi Prioritas (CI/Build Pipeline Recovery)
- [x] Identifikasi masalah source code pada `Frontend Monorepo Checks`: `lucide-center` (Root Cause Found).
- [/] Sedang berjalan: Pantau status repositori commit untuk memastikan Action CI kembali menjadi **Hijau (Passing)**.
- [ ] Verifikasi hasil eksekusi CI: `lint` -> `typecheck` -> `build` (Pasca-fix).
- [ ] Lanjutkan deploy ke production (Tencent Edge) apabila *green build* terkonfirmasi.

## Eksekusi Prioritas (Production Recovery)
- [x] Selesaikan blocker Edge artifact drift: Implementasi `generateBuildId` unik untuk memaksa update bundle.
- [x] Lakukan root cleanup & hygiene: Memindahkan log/debug files ke `docs/`.
- [x] Audit log deployment (Tencent Edge): Membedakan scanner noise vs error sistem nyata.
- [x] Recovery admin login production (`/admintalk/login`) sampai pulih dan terverifikasi live.
- [x] Closed blocker `Route [register] not defined` pada login-links.
- [x] Closed blocker CSP admin runtime dengan scoped `unsafe-eval` untuk area `admintalk/*`.
- [x] Verifikasi header live admin login memuat `script-src 'self' 'unsafe-inline' 'unsafe-eval' https:`.
- [ ] Stabilisasi Data: Mengisi konten utama (Daily Verse, Rituals, Study Paths) di database produksi via Filament.
- [/] Sedang berjalan: Audit & Patch `/profile` (Readability & Avatar issue).
- [ ] Hardening observability: tambah smoke script otomatis (login, today, community, versehub) pasca deploy.
- [x] Deploy frontend patch (VerseHub route/nav, OG card source, login parser, profile logout).
- [x] Verifikasi perbaikan VerseHub Desktop pasca CI Hijau (Staging Pass).

## Verifikasi Admin Credential (Production DB)
- [x] Validasi user `engel.willem@gmail.com` bisa login di production.
- [x] Konfirmasi status admin via `/api/profile` (`is_admin=True`).
- [x] Logout API untuk sesi admin tervalidasi.

## Operasional Deploy
- [ ] Nonaktifkan "Automatic Deployment" di Tencent Console untuk project Edge Pages (Penerapan Opsi B - One-Way Webhook).
- [ ] Verifikasi rilis berikutnya hanya dipicu sekali oleh GitHub Actions.

## Dokumentasi
- [x] Audit report screenshot-based tersedia.
- [x] Roadmap eksekusi checklist tersedia.
- [x] Catat hasil re-test production final ke checklist parity + current status.
- [x] Sinkronisasi dokumen final recovery admin login production (`audit`, `current-status`, `next-actions`, `open-blockers`).
