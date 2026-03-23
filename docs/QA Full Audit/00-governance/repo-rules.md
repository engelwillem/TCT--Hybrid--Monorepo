# Repo Rules
## Purpose
Repository ini dikelola untuk migrasi parity dan re-architecture experience pada hybrid monorepo Laravel + Next.js.

## Non-Negotiable Rules
1. Root repository harus tetap bersih.
2. Dilarang membuat report, log, dump, atau notes di root.
3. Semua dokumentasi wajib disimpan di `docs/`.
4. Semua perubahan harus mengikuti scope aktif. Jangan patch lintas domain tanpa keputusan eksplisit.
5. Jangan melakukan rewrite total jika targetnya bisa dicapai dengan patch sempit.
6. Source of truth untuk parity adalah kode legacy yang berjalan, bukan asumsi atau docs yang sudah usang.
7. Jangan menyatakan PASS jika masih ada mismatch nyata.
8. Gunakan status:
   - PASS
   - BLOCKED
   - CLOSED
9. Semua perubahan harus bisa ditelusuri melalui:
   - domain docs
   - changelog
   - handover
   - git history

## Root Cleanliness Policy
Tidak boleh ada file seperti:
- `*.txt` report
- `output.*`
- `dump.*`
- `notes.*`
- `debug.*`
- file eksperimen sementara

## Allowed Permanent Top-Level Directories
Hanya direktori yang memang bagian produk/tooling/proyek yang boleh ada di root. Dokumentasi wajib di `docs/`.

## Completion Rule
Sebuah step dianggap selesai hanya jika:
1. kode terpatch
2. verifikasi dilakukan
3. docs terkait diperbarui
4. git scope bersih
