# Git Flow Recovery Audit

## 1. Ringkasan Masalah
State repository lokal sempat kacau karena perubahan bercampur antara dokumen aktif, artefak audit/log/debug, dan file sementara. Akibatnya `git status` penuh noise (`D`, `??`, `M`) yang menyulitkan commit terarah.

## 2. Gejala Git Flow Error
- Banyak file log/debug muncul sebagai `deleted` dari path lama, tetapi versi barunya `untracked`.
- File temp (`run_temp.*`, `temp_line.txt`) ikut mengotori working tree.
- Beberapa perubahan source/config bercampur dengan housekeeping docs sehingga rawan commit campur-besar.

## 3. Akar Masalah
1. Artefak audit dipindah manual tanpa normalisasi Git move, sehingga status berubah menjadi kombinasi `D + ??`.
2. Pola ignore belum menutup semua nama file output/debug yang berulang muncul.
3. Tidak ada pemisahan tegas antara perubahan hygiene dan perubahan lain saat eksekusi paralel.

## 4. File yang Terdampak
- Artefak backend test/deploy:
  - `backend-api/auth_test_output.txt`
  - `backend-api/full_test_output.txt`
  - `backend-api/step_failures.txt`
  - `backend-api/test_output.txt`
  - `deploy_log.txt`
  - `deploy_log_new.txt`
  - `failed_log3.txt`
  - `full_git_diff.txt`
- Temp/debug:
  - `run_temp.json`
  - `run_temp.txt`
  - `temp_line.txt`
- Dokumentasi kerja aktif yang ikut terbawa:
  - `docs/09-handover/*`
  - `docs/01-audits/overall/*`

## 5. File yang Dipindahkan
- `backend-api/auth_test_output.txt` -> `docs/01-audits/overall/artifacts/backend_auth_test_output.txt`
- `backend-api/full_test_output.txt` -> `docs/01-audits/overall/artifacts/backend_full_test_output.txt`
- `backend-api/step_failures.txt` -> `docs/01-audits/overall/artifacts/backend_step_failures.txt`
- `backend-api/test_output.txt` -> `docs/01-audits/overall/artifacts/backend_test_output.txt`
- `deploy_log.txt` -> `docs/01-audits/overall/artifacts/deploy_log.txt`
- `deploy_log_new.txt` -> `docs/01-audits/overall/artifacts/deploy_log_new.txt`
- `failed_log3.txt` -> `docs/01-audits/overall/artifacts/failed_log3.txt`
- `full_git_diff.txt` -> `docs/01-audits/overall/artifacts/full_git_diff.txt`
- `docs/10-report/log web.txt` -> `docs/01-audits/overall/artifacts/log-web.txt`

## 6. File yang Dihapus
- `run_temp.json`
- `run_temp.txt`
- `temp_line.txt`

## 7. Perubahan .gitignore
Ditambahkan guard agar artefak serupa tidak mengotori flow lagi:
- `run_temp*.txt`
- `run_temp*.json`
- `temp_line.txt`
- `deploy_log*.txt`
- `failed_log*.txt`
- `full_git_diff*.txt`
- `backend-api/auth_test_output.txt`
- `backend-api/full_test_output.txt`
- `backend-api/step_failures.txt`
- `backend-api/test_output.txt`

## 8. Status Akhir Repository State
- Source code feature tidak diubah untuk task ini.
- Noise artefak/log/temp sudah dinormalisasi ke folder audit artifacts.
- `.gitignore` sudah diperketat untuk kasus yang berulang.
- Repository siap kembali ke workflow commit yang terpisah dan aman.

## 9. Rekomendasi Workflow Git Berikutnya
1. Pisahkan commit menjadi tiga tipe: `source`, `docs`, `artifacts-hygiene`.
2. Jangan commit dari status campuran; jalankan `git status --short` sampai kategori perubahan jelas.
3. Untuk relokasi file lama -> arsip, selalu gunakan `git mv` agar histori tetap jelas.
4. Saat muncul file output baru, masukkan pattern ke `.gitignore` sebelum lanjut coding.
