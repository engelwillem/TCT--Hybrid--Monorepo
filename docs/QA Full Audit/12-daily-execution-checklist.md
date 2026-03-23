# Daily Execution Checklist (12)

## Current Deploy Baseline
- Frontend Tencent production follows monorepo branch `main`.
- Backend Laravel changes still require manual cPanel deploy.
- Daily execution must separate frontend runtime sync from backend runtime deploy.

## Day 1 Checklist (2026-03-22 - Today)

### Gemini (QA Lead)
- [x] Lakukan retest terhadap klaim fix pendaftaran (HOF-2026-03-22-AUTH-REGISTER-001).
- [x] Konfirmasi status login API (BUG-002).
- [ ] Buat handoff teknis baru untuk Codex yang mencakup kegagalan retest (CH-2026-03-22-AUTH-RECON).
- [ ] Pastikan roadmap 3 hari sudah sinkron dengan Codex.

### Codex (Engineering)
- [ ] Investigasi kenapa klaim fix (HOF-2026-03-22-AUTH-REGISTER-001) tidak terdeteksi di production.
- [ ] Periksa endpoint `/api/auth/login` (404) dan pastikan proxy Next.js mengarah ke Laravel API yang benar.
- [ ] Selesaikan item pendaftaran (CH-001) dan Login (CH-002) agar statusnya `Ready for QA Retest`.

### Shared Validation Gates
- [ ] Form pendaftaran tampil pada `/login?intent=signup`.
- [ ] Login menggunakan dummy account berhasil masuk ke `/today`.

---

## Day 2 Checklist (TBD)

### Gemini
- [ ] Validasi fix VerseHub overlay conflict (BUG-003).
- [ ] Tes Session Persistence (Refresh, Navigasi lintas rute).
- [ ] Audit fitur Profil/Avatar.

### Codex
- [ ] Implementasi pengalihan Bottom Nav saat Verse Sheet aktif.
- [ ] Periksa retensi sesi (Cookie/Token handling logic).

### Shared Validation Gates
- [ ] Navigasi bawah tersembunyi saat baca ayat.
- [ ] User tetap login setelah refresh di halaman dashboard.

---

## Day 3 Checklist (TBD)

### Gemini
- [ ] Uji balik (Regression sweep) seluruh area terdampak fix.
- [ ] Final release readiness report.

### Codex
- [ ] Hardening fix (Edge cases/Mobile responsiveness fix).

### Shared Validation Gates
- [ ] Zero Blocker.
- [ ] Go-No/Go recommendation final.

## Rules of Execution
- Bug harus punya owner.
- Fix tidak boleh dianggap selesai tanpa QA retest.
- Setiap handoff harus punya acceptance target.
- Setiap retest harus update validation log status.
- Setiap blocker harus muncul di release readiness summary.
