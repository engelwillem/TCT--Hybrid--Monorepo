# SOP Stabilization (Single Branch Main)

Urutan kerja wajib sebelum merge:

1. Jalankan validasi frontend:
   - `npm run typecheck`
   - `npm run build`
2. Jalankan validasi backend:
   - lint/syntax check PHP
   - validasi route/API contract yang diubah
3. Tutup bug yang muncul sampai hijau.
4. Commit ke branch feature, buka PR ke `main`.
5. Merge hanya jika status checks GitHub hijau.

Referensi kebijakan branch+CI:

- [BRANCH_CI_MINIMUM_POLICY.md](/e:/thechoosentalksnext/docs/core/architecture/laravel-decoupled-hybrid/BRANCH_CI_MINIMUM_POLICY.md)
