# Next Actions

## Immediate
1. Eksekusi konfigurasi panel DNS / Tencent Edge untuk *Domain Redirect Matrix* (Canonical Host WWW & HTTPS Force).
2. Selesaikan mitigasi Auth Header cPanel (Patch `.htaccess` sudah siap, butuh uji *Server Validation* nyata).
3. URGENT: Eksekusi *Server-side Deploy Action Plan*. Re-Test GitHub Actions baru saja *GAGAL* di titik *Preflight TCP Check*. Admin VPS belum mengeksekusi *Server Execution Checklist* (me-meriksa `sshd` port, whitelist IP Github Actions/Tailscale proksi). Rilis kode tidak bisa naik.
4. URGENT: TLS SAN / Domain Binding untuk Host WWW. Status `www.thechoosentalks.org` saat ini terkunci di `ERR_CERT_COMMON_NAME_INVALID`. Admin Server / Registrar WAJIB mengeksekusi 3 lapisan pemeriksaan eksternal mutlak (DNS CNAME ke Edge, Edge Panel Domain Binding, & TLS SAN Certificate Re-issue ganda). Tidak ada sentuhan di dalam repositori kode yang bisa menambal ini. Rujuk checklist eksekusi murni pada Blocker #6.
5. Lakukan _cleanup_ kelayakan arsitektur `Today` domain sehabis merekam validasi sukses persistensi _Spiritual State_ ke backend, untuk mengunci status rilis akhir _experience layer_. 
## After Immediate
1. Verifikasi kelengkapan seluruh fitur _Relevance Engine_ dan kesesuaian _Journey_
2. Siapkan release-readiness report

## Execution Rule
Jangan buka step berikutnya sebelum step sekarang berstatus PASS atau BLOCKED.
