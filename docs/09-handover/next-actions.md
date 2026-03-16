# Next Actions

## Immediate
1. Eksekusi konfigurasi panel DNS / Tencent Edge untuk *Domain Redirect Matrix* (Canonical Host WWW & HTTPS Force).
2. Selesaikan mitigasi Auth Header cPanel (Patch `.htaccess` sudah siap, butuh uji *Server Validation* nyata).
3. URGENT: Eksekusi *Server-side Deploy Action Plan*. Re-Test GitHub Actions baru saja *GAGAL* di titik *Preflight TCP Check*. Admin VPS belum mengeksekusi *Server Execution Checklist* (me-meriksa `sshd` port, whitelist IP Github Actions/Tailscale proksi). Rilis kode tidak bisa naik.
4. URGENT: Pemulihan sertifikat SSL Host WWW. Akses `www.thechoosentalks.org` berstatus invalid (`ERR_CERT_COMMON_NAME_INVALID`). Admin Edge/DNS wajib menyematkan sertifikat dengan subjek DNS alternatif (*SAN*) `www.` dan mengikatnya (*domain bind*) di Control Panel.
5. Selesaikan *Community Smart Composer* unlinked parameters.
6. Siapkan E2E inventory (dengan host *production* kelak).

## After Immediate
1. Verifikasi Today dan VerseHub sebagai bagian dari experience layer baru
2. Siapkan release-readiness report

## Execution Rule
Jangan buka step berikutnya sebelum step sekarang berstatus PASS atau BLOCKED.
