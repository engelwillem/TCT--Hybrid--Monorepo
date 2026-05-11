Berikut **runbook drill siap eksekusi** yang bisa langsung dipakai tim.

Dasarnya mengikuti workflow dan script yang sudah kamu implementasikan:

* `migrate-staging.ps1`
* `deploy-staging.ps1`
* `check-observability.ps1`
* `staging-deploy.yml`
  dengan input `schema_strategy`, `run_backfill`, `backfill_command`, dan `auto_rollback`. 

---

# Runbook Staging Drill

**Expand → Backfill → Contract → Rollback**

## 1. Tujuan

Membuktikan bahwa lifecycle staging kamu benar-benar aman untuk:

* expand migration
* backfill eksplisit
* contract migration
* rollback
* partial failure handling
* observability gate blocking

## 2. Scope

Runbook ini hanya untuk **staging**.

Tidak dipakai untuk:

* production
* destructive cleanup langsung tanpa drill
* migration yang belum punya rollback plan

## 3. Prasyarat

Sebelum mulai, pastikan semua ini sudah benar:

### GitHub Variables

* `STAGING_BACKEND_ENV_FILE`
* `STAGING_FRONTEND_ENV_FILE`
* `STAGING_ALLOW_CONTRACT_MIGRATIONS`

### Kondisi sistem

* runner staging aktif
* Docker daemon di runner staging sehat
* Prometheus + Alertmanager staging aktif
* blackbox probes berjalan
* smoke test staging memang sudah valid

### Evidence baseline yang wajib diambil

* commit SHA yang akan diuji
* nama migration yang terlibat
* nama tabel/kolom yang diuji
* `php artisan migrate:status`
* observability report awal
* smoke test awal
* screenshot / curl flow utama yang terdampak

---

# 4. Aturan Operasional

## Jangan lanjut ke drill berikutnya jika:

* drill sebelumnya fail dan belum dianalisis
* observability merah dari awal
* staging sudah dalam keadaan tidak stabil
* tim belum tahu recovery path

## Evidence wajib untuk setiap drill

Simpan:

* workflow run link
* commit SHA
* input workflow
* artifact output
* hasil smoke
* hasil observability
* hasil rollback jika ada
* keputusan akhir: PASS / FAIL / PARTIAL

---

# 5. Format pencatatan hasil

Gunakan format ini per drill:

## Template hasil drill

**Drill ID:**
**Tanggal:**
**Operator:**
**Commit SHA:**
**Workflow Input:**
**Expected Result:**
**Actual Result:**
**Artifacts:**
**Verdict:** PASS / FAIL / PARTIAL
**Notes / tindakan lanjut:**

---

# 6. Drill 1 — Expand Happy Path

## Tujuan

Membuktikan additive migration aman dan tidak merusak flow lama.

## Setup

Gunakan migration yang:

* menambah kolom/tabel baru
* tidak drop/rename field lama
* tetap backward-compatible

## Langkah

1. Pastikan `STAGING_ALLOW_CONTRACT_MIGRATIONS` tidak relevan untuk drill ini.
2. Trigger workflow `Staging Deploy`.
3. Isi input berikut:

   * `schema_strategy=expand`
   * `run_backfill=false`
   * `backfill_command=""`
   * `auto_rollback=true`
4. Jalankan workflow.
5. Setelah migrate selesai, lanjut deploy otomatis.
6. Verifikasi UI/API flow lama yang menyentuh domain data tersebut.

## Input workflow

```text
schema_strategy: expand
run_backfill: false
backfill_command:
auto_rollback: true
```

## Expected output

* migrate job sukses
* deploy job sukses
* smoke test sukses
* observability report PASS
* flow lama tetap berjalan
* schema baru ada di DB

## Pass/fail checklist

* [ ] `migrate-staging` sukses
* [ ] `deploy-staging` sukses
* [ ] tidak ada critical alert baru
* [ ] tidak ada blackbox probe failure
* [ ] route utama tetap normal
* [ ] migration tercatat di `migrate:status`
* [ ] tidak ada error baru di log backend/frontend

**Verdict**

* PASS jika semua checklist terpenuhi
* FAIL jika ada regression user-visible atau deploy gagal
* PARTIAL jika migration sukses tapi evidence kurang lengkap

---

# 7. Drill 2 — Backfill Happy Path

## Tujuan

Membuktikan backfill eksplisit bisa dijalankan aman dan hasilnya benar.

## Setup

Pastikan expand dari Drill 1 sudah selesai.

Backfill command harus:

* idempotent
* chunked / batched
* aman dijalankan ulang

## Langkah

1. Trigger workflow `Staging Deploy`.
2. Isi input:

   * `schema_strategy=none`
   * `run_backfill=true`
   * `backfill_command=<command asli>`
   * `auto_rollback=true`
3. Jalankan workflow.
4. Verifikasi data lama sudah terisi ke kolom/struktur baru.
5. Jalankan workflow yang sama **sekali lagi** untuk membuktikan rerun aman.

## Input workflow

```text
schema_strategy: none
run_backfill: true
backfill_command: php artisan <backfill-command>
auto_rollback: true
```

## Expected output

* migrate job sukses
* backfill sukses
* deploy sukses
* tidak ada data corruption
* rerun kedua juga aman
* observability tetap PASS

## Pass/fail checklist

* [ ] backfill command selesai tanpa error
* [ ] data target terisi sesuai ekspektasi
* [ ] rerun kedua tidak merusak / menduplikasi
* [ ] smoke test tetap hijau
* [ ] observability PASS
* [ ] tidak ada lonjakan alert critical

**Verdict**

* PASS jika backfill sukses dan rerun aman
* FAIL jika data corrupt, duplicate, atau deploy terganggu
* PARTIAL jika backfill sukses tapi belum terbukti rerunnable

---

# 8. Drill 3 — Partial Failure Backfill

## Tujuan

Membuktikan sistem aman saat backfill gagal di tengah jalan.

## Setup

Gunakan command drill yang sengaja gagal setelah beberapa batch.

Contoh konsep:

* batch 1 dan 2 sukses
* batch 3 throw exception

Failure harus deterministic.

## Langkah

1. Siapkan backfill command versi drill yang memang fail di tengah.
2. Trigger workflow `Staging Deploy`.
3. Isi input:

   * `schema_strategy=none`
   * `run_backfill=true`
   * `backfill_command=<command-fail-midway>`
   * `auto_rollback=true`
4. Jalankan workflow.
5. Pastikan migrate job gagal.
6. Pastikan deploy job **tidak dijalankan**.
7. Verifikasi state data:

   * sebagian row sudah berubah
   * sebagian belum
   * state tetap konsisten
8. Perbaiki command atau ganti ke versi aman.
9. Jalankan ulang workflow dengan command backfill normal.
10. Verifikasi recovery berhasil.

## Input workflow

```text
schema_strategy: none
run_backfill: true
backfill_command: php artisan <drill-backfill-fail-midway>
auto_rollback: true
```

## Expected output

* migrate job gagal
* deploy job tidak jalan
* data parsial tetap valid
* rerun recovery sukses
* observability tetap stabil

## Pass/fail checklist

* [ ] failure terjadi di migrate stage, bukan deploy stage
* [ ] deploy tidak lanjut setelah migrate fail
* [ ] tidak ada data corruption
* [ ] rerun recovery berhasil
* [ ] smoke hijau setelah recovery
* [ ] observability hijau setelah recovery

**Verdict**

* PASS jika partial failure tertahan dan recovery aman
* FAIL jika deploy tetap jalan atau data rusak
* PARTIAL jika failure tertahan tapi recovery belum terbukti

---

# 9. Drill 4 — Observability Failure Blocking

## Tujuan

Membuktikan observability gate benar-benar blocking.

Script observability kamu sekarang memeriksa:

* Prometheus readiness
* Alertmanager readiness
* blackbox probe failures
* active critical alerts. 

## Opsi simulasi

Pilih salah satu:

* buat blackbox probe gagal
* munculkan active critical alert
* buat Prometheus/Alertmanager readiness gagal

## Langkah

1. Siapkan kondisi observability failure sementara.
2. Trigger workflow `Staging Deploy`.
3. Isi input normal:

   * `schema_strategy=expand` atau `none`
   * `run_backfill=false`
   * `auto_rollback=true`
4. Jalankan workflow.
5. Verifikasi deploy tertahan karena observability gate fail.
6. Kembalikan sistem monitoring ke kondisi sehat.
7. Ulangi workflow dan pastikan lolos.

## Input workflow

```text
schema_strategy: expand
run_backfill: false
backfill_command:
auto_rollback: true
```

## Expected output

* observability report FAIL
* deploy dianggap gagal / tertahan
* error message jelas
* setelah monitoring pulih, workflow bisa hijau

## Pass/fail checklist

* [ ] observability gate benar-benar memblokir
* [ ] artifact observability report tersedia
* [ ] penyebab failure terlihat jelas
* [ ] setelah recovery monitoring, workflow bisa sukses

**Verdict**

* PASS jika observability benar-benar blocking
* FAIL jika deploy tetap lolos walau observability merah
* PARTIAL jika fail benar tapi evidence/report kurang

---

# 10. Drill 5 — Contract Guardrail Blocking

## Tujuan

Membuktikan contract migration tidak bisa jalan tanpa izin eksplisit.

## Setup

Pastikan ada migration contract yang siap diuji.

Set:

* `STAGING_ALLOW_CONTRACT_MIGRATIONS=false`

## Langkah

1. Trigger workflow `Staging Deploy`.
2. Isi input:

   * `schema_strategy=contract`
   * `run_backfill=false`
   * `auto_rollback=true`
3. Jalankan workflow.
4. Verifikasi migrate job gagal cepat dengan pesan guardrail.

## Input workflow

```text
schema_strategy: contract
run_backfill: false
backfill_command:
auto_rollback: true
```

## Expected output

* migrate gagal cepat
* deploy tidak berjalan
* pesan error menjelaskan `ALLOW_CONTRACT_MIGRATIONS=true` dibutuhkan

## Pass/fail checklist

* [ ] migrate gagal cepat
* [ ] deploy tidak jalan
* [ ] pesan error jelas
* [ ] tidak ada schema mutation yang terjadi

**Verdict**

* PASS jika contract memang tertahan
* FAIL jika contract lolos tanpa izin
* PARTIAL jika fail tapi error tidak jelas

---

# 11. Drill 6 — Contract Happy Path

## Tujuan

Membuktikan contract migration bisa jalan aman saat semua syarat terpenuhi.

## Setup

Pastikan:

* expand sudah live di staging
* backfill sudah selesai
* app staging sudah membaca struktur baru
* `STAGING_ALLOW_CONTRACT_MIGRATIONS=true`

## Langkah

1. Set GitHub variable staging contract allow menjadi true.
2. Trigger workflow `Staging Deploy`.
3. Isi input:

   * `schema_strategy=contract`
   * `run_backfill=false`
   * `auto_rollback=true`
4. Jalankan workflow.
5. Verifikasi migrate sukses.
6. Verifikasi deploy sukses.
7. Verifikasi app tetap normal di flow yang terkait.

## Input workflow

```text
schema_strategy: contract
run_backfill: false
backfill_command:
auto_rollback: true
```

## Expected output

* migrate sukses
* deploy sukses
* smoke sukses
* observability PASS
* app membaca schema baru tanpa error

## Pass/fail checklist

* [ ] contract migrate sukses
* [ ] deploy sukses
* [ ] flow terkait tetap normal
* [ ] tidak ada query error karena kolom lama hilang
* [ ] observability PASS

**Verdict**

* PASS jika contract aman end-to-end
* FAIL jika app masih tergantung schema lama
* PARTIAL jika migrate sukses tapi verification kurang lengkap

---

# 12. Drill 7 — Failed Deploy After Expand + Rollback

## Tujuan

Membuktikan rollback image aman pada expanded schema.

Ini drill rollback yang paling penting, karena pada fase expand seharusnya app lama masih kompatibel.

## Setup

* expand migration sudah aman
* buat commit app staging yang sengaja menyebabkan deploy/smoke gagal

  * misalnya endpoint smoke rusak
  * atau env dummy yang menyebabkan app unhealthy
* `auto_rollback=true`

## Langkah

1. Jalankan expand jika belum.
2. Siapkan versi app yang sengaja gagal saat deploy.
3. Trigger workflow `Staging Deploy`.
4. Isi input:

   * `schema_strategy=none`
   * `run_backfill=false`
   * `auto_rollback=true`
5. Jalankan workflow.
6. Biarkan deploy gagal.
7. Pastikan rollback script otomatis jalan.
8. Verifikasi app lama kembali sehat.

## Input workflow

```text
schema_strategy: none
run_backfill: false
backfill_command:
auto_rollback: true
```

## Expected output

* deploy gagal
* rollback otomatis jalan
* app kembali ke image sebelumnya
* smoke kembali hijau
* observability kembali PASS

## Pass/fail checklist

* [ ] deploy benar-benar gagal
* [ ] rollback otomatis dipicu
* [ ] app lama kembali healthy
* [ ] smoke test pasca rollback hijau
* [ ] observability pasca rollback hijau

**Verdict**

* PASS jika rollback memulihkan service
* FAIL jika rollback tidak memulihkan app
* PARTIAL jika rollback jalan tapi verifikasi pasca rollback belum lengkap

---

# 13. Drill 8 — Contract Rollback Edge Case

## Tujuan

Membuktikan dan mendokumentasikan bahwa rollback image **tidak selalu cukup** setelah contract migration.

Ini drill pembelajaran yang sangat penting.

## Setup

* contract migration siap
* app baru adalah satu-satunya versi yang kompatibel dengan schema hasil contract
* siapkan deploy app baru yang sengaja gagal setelah contract

## Langkah

1. Pastikan staging sudah pada state siap contract.
2. Set `STAGING_ALLOW_CONTRACT_MIGRATIONS=true`.
3. Trigger workflow contract:

   * `schema_strategy=contract`
   * `run_backfill=false`
4. Setelah migrate selesai, biarkan deploy app baru gagal.
5. Biarkan rollback image otomatis mencoba memulihkan app lama.
6. Verifikasi apakah app lama memang incompatibel dengan schema baru.
7. Dokumentasikan hasilnya.
8. Lakukan recovery dengan salah satu:

   * forward-fix deploy
   * DB rollback
   * hotfix app compatibility

## Input workflow

```text
schema_strategy: contract
run_backfill: false
backfill_command:
auto_rollback: true
```

## Expected output

* contract sukses
* deploy baru gagal
* rollback image lama kemungkinan tidak cukup
* tim memperoleh bukti operasional bahwa contract perlu prosedur khusus

## Pass/fail checklist

* [ ] edge case berhasil direproduksi
* [ ] tim bisa menjelaskan kenapa rollback image tidak cukup
* [ ] recovery path terdokumentasi
* [ ] final state staging kembali sehat

**Verdict**

* PASS jika edge case terbukti dan recovery path jelas
* FAIL jika staging dibiarkan rusak tanpa recovery plan
* PARTIAL jika edge case terjadi tapi belum terdokumentasi baik

---

# 14. Urutan eksekusi yang direkomendasikan

Jalankan dalam urutan ini:

1. Drill 1 — Expand Happy Path
2. Drill 2 — Backfill Happy Path
3. Drill 3 — Partial Failure Backfill
4. Drill 4 — Observability Failure Blocking
5. Drill 5 — Contract Guardrail Blocking
6. Drill 7 — Failed Deploy After Expand + Rollback
7. Drill 6 — Contract Happy Path
8. Drill 8 — Contract Rollback Edge Case

Kenapa urutannya seperti ini:

* mulai dari aman
* uji recovery di expanded schema dulu
* contract baru diuji setelah fondasi terbukti

---

# 15. Exit criteria sebelum first real production contract

Tim baru boleh lanjut ke production contract pertama jika seluruh syarat ini terpenuhi:

* [ ] Drill 1 PASS
* [ ] Drill 2 PASS
* [ ] Drill 3 PASS
* [ ] Drill 4 PASS
* [ ] Drill 5 PASS
* [ ] Drill 7 PASS
* [ ] Drill 6 PASS
* [ ] Drill 8 PASS atau setidaknya menghasilkan recovery SOP yang jelas
* [ ] runbook recovery sudah ditulis
* [ ] tim tahu kapan rollback image cukup dan kapan tidak cukup

---

# 16. Rekomendasi operasional tambahan

Sebelum mulai drill, saya sangat menyarankan tim menambahkan dua evidence tambahan ke artifact workflow:

1. `php artisan migrate:status`
2. ringkasan metadata run:

   * commit SHA
   * schema strategy
   * run_backfill
   * backfill command
   * waktu mulai/selesai

Ini akan membuat hasil drill jauh lebih audit-friendly. Struktur migrate dan workflow kamu sudah cukup siap untuk itu. 

Kalau kamu mau, langkah berikutnya saya bisa ubah runbook ini menjadi **versi markdown final siap tempel ke repo** dengan format:

* judul dokumen
* scope
* responsibilities
* per-drill sections
* sign-off section untuk operator dan reviewer.
