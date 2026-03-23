# Parity Matrix: Profile Lifecycle

Dokumen referensi persamaan perilaku/fungsi Profil Pengguna antara sistem *Legacy Laravel* dan *Next.js Hybrid Monorepo*.

## Auth & Account States
| Fitur / Skope | Legacy (Blade) | Hybrid (Next.js) | Status | Catatan |
| ------------- | -------------- | ---------------- | ------ | ------- |
| Firebase Sync | N/A | React Context | `PASS` | Sinkronisasi Firebase UID dengan Bearer Token via endpoint `/api/auth/firebase/sync`.
| Auto-Logout | N/A | Next Component | `PASS` | Pengecualian proteksi `e2e_bypass_token` telah berjalan.

## Profile Modifikasi
| Fitur / Skope | Legacy (Blade) | Hybrid (Next.js) | Status | Catatan |
| ------------- | -------------- | ---------------- | ------ | ------- |
| Avatar Upload | Web Form Data | API Call | `PASS` | Format File *png/jpg* dengan validasi di `ProfileController`.
| Display Name | Editable Form | React Form UI | `PASS` |
| Password Change| Standard Input | Firebase Context / API | `PASS` | Integrasi password update berhasil melalui proteksi token berjalan aman.
| E2E Write-Path | Dusk | Playwright E2E | `PASS` | `test/write.spec.ts` telah menangkap proses pembaruan secara utuh.
