
CI/CD via SSH sudah berhasil sampai deploy penuh.

Hasil akhir:
- Release aktif: `20260310144434`
- `current` mengarah ke: `/home/thechoosentalks/deploy/apps/thechoosentalks/releases/20260310144434`
- HTTP check:
  - `/` = `200`
  - `/today` = `302` (redirect valid)
  - `/versehub/id` = `200`

Yang saya verifikasi/perbaiki di server via SSH:
- Koreksi kredensial DB di `shared/.env` ke resource cPanel yang benar:
  - `DB_HOST=localhost`
  - `DB_PORT=3306`
  - `DB_DATABASE=thechoosentalks_laravel`
  - `DB_USERNAME=thechoosentalks_dbuser`
- Reset password MySQL user via `uapi Mysql set_password`, lalu sinkronkan `DB_PASSWORD` di `shared/.env`.
- Validasi koneksi DB berhasil sebelum deploy (`DB_CONNECT_OK`), lalu deploy sukses.

Perubahan file repo lokal:
- Perjelas error MySQL check di deploy script: [deploy.sh](e:/thechoosentalksbeta/deploy.sh:164)
- Healthcheck menerima redirect HTTP valid (301/302/303/307/308): [healthcheck.sh](e:/thechoosentalksbeta/healthcheck.sh:9), [healthcheck.sh](e:/thechoosentalksbeta/healthcheck.sh:74)

Catatan:
- SSH host sempat intermiten (`Permission denied`/timeout), tapi retry berhasil dan deploy final sukses.
- `git status` masih menunjukkan `.gitignore` sudah berubah dari sebelumnya (saya tidak ubah file itu).

