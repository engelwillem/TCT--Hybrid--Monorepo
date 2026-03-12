# SOP Stabilization (Single Branch Main)

Dokumen ini adalah standar release wajib. Semua batch kerja harus mengikuti urutan ini.

## 1. Pre-merge Local Gate (wajib)

Jalankan dari root repo:

1. `npm run typecheck`
2. `npm run build`
3. Jalankan dev smoke:
   - `npx next dev -p 9010`
   - pastikan server start tanpa error startup
4. Validasi backend yang diubah:
   - `php -l backend-api/routes/api.php`
   - `php -l backend-api/app/Http/Controllers/<ControllerYangDiubah>.php`
5. Tutup semua bug sampai semua langkah di atas hijau.

## 2. PR Gate (wajib)

1. Commit ke branch feature.
2. Buka PR ke `main`.
3. Pastikan checklist PR terisi:
   - `.github/pull_request_template.md`
4. Merge hanya jika semua status check hijau:
   - `Frontend Monorepo Checks / frontend-checks`
   - `Backend Monorepo Checks / backend-checks`

## 3. Post-merge Deploy Gate

1. Backend deploy cPanel berjalan otomatis jika ada perubahan `backend-api/**`.
2. Frontend deploy Tencent Edge ditrigger dari workflow frontend via secret:
   - `TENCENT_EDGE_DEPLOY_HOOK_URL`
3. Jika trigger frontend gagal, release dianggap belum selesai.

## 4. Referensi kebijakan

- [BRANCH_CI_MINIMUM_POLICY.md](/e:/thechoosentalksnext/docs/core/architecture/laravel-decoupled-hybrid/BRANCH_CI_MINIMUM_POLICY.md)
