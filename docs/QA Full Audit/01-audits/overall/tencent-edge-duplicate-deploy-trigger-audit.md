# Audit Isu Duplicate Deployment Trigger — Tencent Edge Pages

## 1. Ringkasan Masalah
Terdeteksi gejala "double triggering" pada proses deployment production harian. Satu buah push ke branch `main` memicu dua antrean pembangunan (*build queue*) yang berjalan secara paralel di dashboard Tencent Edge Pages. Hal ini menyebabkan pemborosan sumber daya build, potensi interferensi cache, dan kebingungan status rilis final.

## 2. Gejala yang Terlihat
- **Dua Build ID Per Commit:** Pada daftar riwayat deployment di Tencent, terlihat dua entri build dengan SHA commit yang identik tetapi dipicu oleh sumber berbeda.
- **Race Condition:** Kadang-kadang build lama selesai lebih lambat dari build baru, mengakibatkan versi rilis yang tidak konsisten sesaat setelah push.
- **Redundant Logs:** Log deployment menunjukkan satu dipicu oleh "Push Event" (Git Integration) dan satu lagi oleh "Webhook" (GitHub Actions).

## 3. Dugaan Akar Masalah
Terjadi konfigurasi **Ganda** pada jalur pemicu (*trigger path*):
1. **GitHub Action Hook (Manual/Explicit):** File `.github/workflows/frontend-monorepo-checks.yml` (Baris 51-62) secara eksplisit memanggil `curl` ke `TENCENT_EDGE_DEPLOY_HOOK_URL` setelah tahap build selesai.
2. **Git-Connect Auto Deploy (Implicit):** Dashboard Tencent Edge kemungkinan besar memiliki fitur "Auto Deployment on Push" yang diaktifkan saat repositori GitHub pertama kali dihubungkan.

Artinya:
- Git Push → Tencent mendeteksi push → **Build #1 Start (Auto)**
- Git Push → GitHub Actions Jalan → Build Pass → Trigger Hook → Tencent mendeteksi hook → **Build #2 Start (Webhook)**

## 4. Trigger Sources yang Harus Diperiksa
- [ ] **GitHub Workflows:** Dokumen `.github/workflows/frontend-monorepo-checks.yml` (Step: `Trigger Tencent Edge deploy`).
- [ ] **Tencent Edge Console:** Tab `Build Settings` atau `Deployment Settings` di project Tencent Edge Pages — periksa apakah "Automatic deployment from branch" dalam posisi *Enabled*.

## 5. Rekomendasi Operasional
Pilih **Salah Satu** metode saja. **Metode (B) di bawah adalah yang paling direkomendasikan** untuk alur kerja monorepo yang membutuhkan verifikasi (Lint/Typecheck) sebelum rilis.

### Opsi A: Menggunakan Auto-Deploy Tencent (Simple)
- **Kelebihan:** Cepat, tanpa config tambahan.
- **Kekurangan:** Tencent akan langsung build saat push, tanpa peduli apakah `lint` atau `typecheck` di GitHub gagal.
- **Tindakan:** Hapus step `Trigger Tencent Edge deploy` dari `.github/workflows/frontend-monorepo-checks.yml`.

### Opsi B: Menggunakan GitHub Actions Hook (Kontrol Penuh — REKOMENDASI)
- **Kelebihan:** Deployment hanya dipicu jika `lint`, `typecheck`, dan `build` lokal di GitHub Actions LULUS. Ini mencegah merilis kode yang rusak (*broken code*) ke server.
- **Tindakan:** **NONAKTIFKAN** fitur "Auto Deployment" di dashboard Tencent Cloud Console agar Tencent hanya membangun saat menerima instruksi dari Webhook GitHub Actions.

## 6. Risiko Jika Dibiarkan
- **Version Collision:** Rilis yang tampil di production bisa berbolak-balik antara status build #1 dan #2.
- **Quota Waste:** Menghabiskan menit build (build minutes) bulanan dua kali lebih cepat.
- **Deployment Loop:** Dalam kondisi ekstrem, trigger yang tidak terkontrol bisa menyebabkan build yang tidak pernah berhenti.

## 7. Status Akhir Audit
**Status:** ⚠️ **IDENTIFIED (Fix Required)**
Akar masalah telah divalidasi pada baris 51-62 `frontend-monorepo-checks.yml`. Rekomendasi final adalah menonaktifkan auto-deploy di sisi Tencent Console dan membiarkan GitHub Actions yang menjadi "konduktor" tunggal bagi rilis production.
