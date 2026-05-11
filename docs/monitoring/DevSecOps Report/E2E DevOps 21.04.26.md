Eksekusi DevOps E2E sudah saya jalankan sesuai role production-grade, mencakup local tools + GitHub + production, dan bug yang ketemu langsung saya perbaiki.

**Perbaikan yang dilakukan**
1. Fix hidden bug unit test (alias `@` tidak dikenali Vitest) di [vitest.config.ts](/e:/thechoosentalksnext/vitest.config.ts) dengan menambahkan `resolve.alias` ke `src`.
2. Fix security dependency hasil audit (`critical/high`) dengan `npm audit fix`, update lockfile di [package-lock.json](/e:/thechoosentalksnext/package-lock.json).

**Verifikasi E2E yang sudah dieksekusi**
1. Local gates:
- `scripts/ci-repo-hygiene.ps1` PASS
- `npm run typecheck` PASS
- `npm run test:unit` PASS (17 files, 54 tests)
- `npm run test:contracts:docker` PASS (4 files, 13 tests)
- `npm run build` PASS (Next.js build sukses)
- `composer --working-dir backend-api validate --strict` PASS
- `composer --working-dir backend-api today:ready` PASS
- `python scripts/ci-validate-release-artifact.py` PASS

2. Runtime local/staging:
- `docker compose ps`: frontend/backend/mariadb/observability containers up, healthcheck healthy
- `scripts/smoke-staging.ps1`: PASS (`/api/today/readiness`, `/api/v1/community/posts`)

3. GitHub:
- `gh run list --limit 5`: run terbaru `DevSecOps E2E Gate` dan `CodeQL Analysis` status `success`.

4. Production:
- `npm run smoke:prod` (`https://www.thechoosentalks.org`): semua endpoint target PASS (home, today, community, paths, versehub, profile, API today/community/versehub, favicon).

Perubahan kode yang saya buat di turn ini hanya 2 file: [vitest.config.ts](/e:/thechoosentalksnext/vitest.config.ts) dan [package-lock.json](/e:/thechoosentalksnext/package-lock.json).

**Risk Terbesar (Urutan Prioritas)**
1. **Runtime production masih pola development/mutable**  
Bukti: backend dijalankan dengan `php artisan serve`, auto-migrate default `true`, dan frontend bisa `npm ci` + `next build` saat container start ([docker/backend/start.sh#L21]( /e:/thechoosentalksnext/docker/backend/start.sh#L21 ), [docker/backend/start.sh#L26]( /e:/thechoosentalksnext/docker/backend/start.sh#L26 ), [docker/frontend/start.sh#L7]( /e:/thechoosentalksnext/docker/frontend/start.sh#L7 ), [docker/frontend/start.sh#L70]( /e:/thechoosentalksnext/docker/frontend/start.sh#L70 )).  
Dampak: startup tidak deterministik, downtime saat restart, drift antar deploy.

2. **Risk env/config drift + insecure default berpotensi kebawa ke production**  
Bukti: compose default ke file lokal/dev (`BACKEND_ENV_FILE`/`FRONTEND_ENV_FILE`) ([docker-compose.yml#L48]( /e:/thechoosentalksnext/docker-compose.yml#L48 ), [docker-compose.yml#L78]( /e:/thechoosentalksnext/docker-compose.yml#L78 )); backend env docker berisi `APP_ENV=local`, `APP_DEBUG=true` ([backend-api/.env.docker#L2]( /e:/thechoosentalksnext/backend-api/.env.docker#L2 ), [backend-api/.env.docker#L4]( /e:/thechoosentalksnext/backend-api/.env.docker#L4 )); port observability/db diexpose dan default credential ada (`MARIADB_ROOT_PASSWORD`, Grafana admin) ([docker-compose.yml#L10]( /e:/thechoosentalksnext/docker-compose.yml#L10 ), [docker-compose.yml#L12]( /e:/thechoosentalksnext/docker-compose.yml#L12 ), [docker-compose.yml#L118]( /e:/thechoosentalksnext/docker-compose.yml#L118 ), [docker-compose.yml#L143]( /e:/thechoosentalksnext/docker-compose.yml#L143 ), [docker-compose.yml#L157]( /e:/thechoosentalksnext/docker-compose.yml#L157 )).  
Dampak: salah konfigurasi production, surface attack lebih luas.

3. **Gate CI bisa “false green” untuk test dan sebagian security posture**  
Bukti: unit test non-blocking (`continue-on-error: true`) ([devsecops-e2e.yml#L103]( /e:/thechoosentalksnext/.github/workflows/devsecops-e2e.yml#L103 ), [devsecops-e2e.yml#L105]( /e:/thechoosentalksnext/.github/workflows/devsecops-e2e.yml#L105 )); blocking npm audit hanya `critical` ([devsecops-e2e.yml#L212]( /e:/thechoosentalksnext/.github/workflows/devsecops-e2e.yml#L212 )); trivy blocking hanya `CRITICAL` ([devsecops-e2e.yml#L260]( /e:/thechoosentalksnext/.github/workflows/devsecops-e2e.yml#L260 )).  
Dampak: regresi/high vuln bisa lolos ke `main`.

4. **Governance risk: branch protection/ruleset belum enforce**  
Bukti live GitHub: endpoint branch protection & rulesets return `403 Upgrade to GitHub Pro or make this repository public` untuk repo private.  
Dampak: tidak ada hard guardrail native untuk mencegah direct push/merge tanpa check wajib.

5. **Smoke test production masih shallow (HTTP 200-centric)**  
Bukti script hanya verifikasi status + preview, belum assert kontrak/semantik ([scripts/smoke-production.ps1#L27]( /e:/thechoosentalksnext/scripts/smoke-production.ps1#L27 ), [scripts/smoke-production.ps1#L54]( /e:/thechoosentalksnext/scripts/smoke-production.ps1#L54 ), [scripts/smoke-production.ps1#L125]( /e:/thechoosentalksnext/scripts/smoke-production.ps1#L125 )).  
Dampak: failure fungsional subtil (data kosong/salah shape) bisa lolos.

**Quick Wins (Paling Cepat, Paling Bernilai)**
1. Jadikan unit test blocking minimal untuk `push main` (tetap advisory di PR kalau perlu fase transisi).
2. Fail-fast di deploy script jika `BACKEND_ENV_FILE`/`FRONTEND_ENV_FILE` tidak explicitly diset ke file production.
3. Matikan auto migration default di startup container (`RUN_MIGRATIONS=false` default; migrate lewat step terpisah).
4. Harden compose production: jangan expose `3306/9090/9093/3000` publik, ganti default credential, dan split `docker-compose.prod.yml`.
5. Upgrade severity blocking bertahap ke `HIGH` (npm/trivy) untuk schedule + push `main`.

Jika kamu setuju, saya bisa langsung eksekusi **Top 3 quick wins** di repo sekarang (CI blocking test main, fail-fast env deploy, dan default `RUN_MIGRATIONS=false`).

Eksekusi 3 quick wins sudah selesai.

Perubahan yang saya terapkan:

1. CI test jadi blocking di `main/manual/schedule`  
- PR tetap advisory, tetapi selain PR sekarang blocking.
- File: [devsecops-e2e.yml](/e:/thechoosentalksnext/.github/workflows/devsecops-e2e.yml#L103)

2. Fail-fast env deploy untuk staging/production  
- `deploy-staging.ps1` dan `deploy-production.ps1` sekarang wajib `BACKEND_ENV_FILE` + `FRONTEND_ENV_FILE` terisi dan file-nya harus ada.
- Khusus production, default docker env ditolak (`backend-api/.env.docker` / `.env.docker`) agar tidak kebablasan pakai config non-production.
- Files:
  - [deploy-staging.ps1](/e:/thechoosentalksnext/scripts/deploy-staging.ps1#L19)
  - [deploy-production.ps1](/e:/thechoosentalksnext/scripts/deploy-production.ps1#L20)

3. Default runtime migration jadi aman (`false`)  
- `RUN_MIGRATIONS` default di backend container startup diubah dari `true` ke `false`.
- File: [start.sh](/e:/thechoosentalksnext/docker/backend/start.sh#L21)

Tambahan wiring workflow agar env file bisa dipasok dari GitHub Variables:
- Staging: `vars.STAGING_BACKEND_ENV_FILE`, `vars.STAGING_FRONTEND_ENV_FILE`  
  File: [staging-deploy.yml](/e:/thechoosentalksnext/.github/workflows/staging-deploy.yml#L34)
- Production: `vars.PRODUCTION_BACKEND_ENV_FILE`, `vars.PRODUCTION_FRONTEND_ENV_FILE`  
  File: [production-deploy.yml](/e:/thechoosentalksnext/.github/workflows/production-deploy.yml#L99)

Validasi yang sudah saya jalankan:
- Parse/syntax check PowerShell script:
  - `scripts/deploy-staging.ps1` OK
  - `scripts/deploy-production.ps1` OK

Next step yang perlu kamu set sekali di GitHub repo variables:
1. `STAGING_BACKEND_ENV_FILE`
2. `STAGING_FRONTEND_ENV_FILE`
3. `PRODUCTION_BACKEND_ENV_FILE`
4. `PRODUCTION_FRONTEND_ENV_FILE`

Bagus. Tiga quick wins itu tepat sasaran dan arahnya sudah jauh lebih production-safe.

## Penilaian singkat

### 1. CI test blocking di `main/manual/schedule`

**Ini improvement yang paling penting untuk release confidence.**

Dampak:

* menurunkan risiko merge “hijau semu”
* memaksa baseline quality di jalur release utama
* tetap menjaga PR flow tidak terlalu berat

Catatan:

* model ini masuk akal kalau tim masih butuh PR iteration cepat
* tapi dalam jangka menengah, ada kemungkinan sebagian test penting juga perlu blocking di PR untuk menurunkan biaya rework yang telat ketahuan

**Verdict:** strong quick win.

---

### 2. Fail-fast env deploy untuk staging/production

**Ini sangat bagus karena mengurangi human error yang mahal.**

Dampak:

* mencegah deploy jalan dengan env kosong atau salah file
* memperjelas contract deployment
* khusus penolakan default docker env di production: ini keputusan yang sangat benar

Yang paling saya suka:

* production explicit guard terhadap `.env.docker` sangat sehat
* ini langsung menyerang parity risk dan config drift, yang sering jadi sumber insiden “kok staging aman, prod rusak”

**Verdict:** high-value operational hardening.

---

### 3. `RUN_MIGRATIONS=false` sebagai default

**Ini keputusan aman dan matang.**

Dampak:

* mencegah side effect berbahaya saat container restart
* menghindari migration jalan tanpa kontrol eksplisit
* memisahkan startup app dari schema change lifecycle

Ini penting untuk:

* rollback safety
* deploy predictability
* menghindari accidental schema mutation di runtime

**Verdict:** sangat tepat. Default sebelumnya memang terlalu berisiko untuk production-minded flow.

---

## Kesimpulan arsitektural

Secara keseluruhan, tiga perubahan ini memperkuat 4 area penting sekaligus:

* **release safety**
* **config correctness**
* **environment parity discipline**
* **operational predictability**

Artinya, ini bukan cuma cleanup teknis. Ini benar-benar menaikkan:

* reliability
* maintainability
* trust terhadap deployment pipeline

---

## Yang perlu dilakukan sekarang

Next step yang kamu sebut memang **harus segera diset** di GitHub repository variables:

1. `STAGING_BACKEND_ENV_FILE`
2. `STAGING_FRONTEND_ENV_FILE`
3. `PRODUCTION_BACKEND_ENV_FILE`
4. `PRODUCTION_FRONTEND_ENV_FILE`

## Rekomendasi isi nilainya

Pastikan value variable ini adalah **path file yang eksplisit dan environment-specific**, misalnya pola seperti:

* staging backend: file env staging backend yang memang dipakai deploy
* staging frontend: file env staging frontend
* production backend: file env production backend
* production frontend: file env production frontend

Yang penting:

* jangan pakai path ambigu
* jangan pakai fallback path generik
* jangan reuse file docker default untuk production

---

## Saran validasi setelah variables di-set

Begitu variables sudah terpasang, lakukan 4 validasi ini:

### High impact / low effort

**1. Dry-run deploy staging**
Tujuan:

* memastikan workflow benar-benar membaca variables
* memastikan fail-fast tidak memblokir path yang valid
* memastikan file resolution sesuai runner path

### High impact / low effort

**2. Negative test sengaja**
Tes satu kali dengan variable salah / file tidak ada, lalu cek:

* workflow gagal cepat
* error message jelas
* tidak ada langkah deploy yang tetap jalan setelah validasi gagal

Ini penting karena fail-fast bagus hanya kalau failure mode-nya jelas dan cepat.

### High impact / medium effort

**3. Audit semua workflow lain yang masih mungkin memakai fallback env lama**
Cari apakah masih ada:

* script lain
* docker compose override
* manual deploy command
* docs internal
  yang masih mengasumsikan `.env.docker` atau env implicit

Kalau ada, nanti akan muncul “split brain deployment behavior”.

### High impact / medium effort

**4. Tambahkan smoke check pasca-deploy**
Minimal:

* frontend health / homepage reachable
* backend health endpoint
* auth-sensitive route atau API ping ringan
* optional: migration status check non-destructive

Karena sekarang pipeline makin strict, bagus kalau confidence pasca-deploy juga ikut naik.

---

## Risiko yang masih tersisa

### 1. PR masih advisory

Ini masih oke untuk sekarang, tapi ada trade-off:

* bug atau regression bisa baru tertahan saat merge/release path
* feedback loop jadi lebih mahal dibanding ketahuan di PR

Belum harus diubah sekarang, tapi saya sarankan nanti klasifikasikan test suite:

* **blocking on PR**: lint, typecheck, unit kritikal, build
* **blocking on main/deploy**: e2e lebih berat, security scan, extended checks

### 2. Env file path benar, tapi isi env belum tervalidasi

Fail-fast file existence itu bagus, tapi belum menjamin:

* key wajib ada
* value tidak kosong
* production host/url benar
* Sanctum/CORS/auth config sinkron

Langkah lanjutan yang kuat nanti adalah **env schema validation** sebelum deploy.

### 3. Migration sekarang aman, tapi perlu jalur resmi untuk migration

Karena default sudah `false`, bagus. Tapi tim harus punya satu cara yang jelas:

* kapan migration dijalankan
* oleh siapa / workflow mana
* apakah manual approval diperlukan untuk production

Kalau tidak, risikonya bergeser dari “migration kebablasan” menjadi “migration lupa dijalankan”.

---

## Prioritas berikutnya yang saya sarankan

### High impact / low effort

**A. Tambahkan preflight env validation**
Bukan cuma file ada, tapi juga cek key penting, misalnya:

* app env
* app url
* db connection target
* sanctum/cors related values
* frontend public api base URL

### High impact / medium effort

**B. Pisahkan workflow migration dari app deploy**
Production-grade pattern yang lebih aman:

* deploy app
* migration step eksplisit, terkontrol
* optional approval untuk production

### High impact / medium effort

**C. Tambahkan post-deploy smoke tests**
Supaya pipeline tidak hanya “berhasil menjalankan script”, tapi benar-benar memverifikasi service hidup.

### Lower priority

**D. Jadikan subset test blocking di PR**
Bagus, tapi bukan step paling mendesak dibanding env/migration/deploy safety.

---

## Keputusan saya

Perubahan yang kamu lakukan **layak dianggap selesai dan bernilai nyata**, bukan kosmetik.

Urutan prioritas sekarang:

1. set 4 GitHub variables
2. jalankan dry-run staging
3. lakukan negative test untuk fail-fast
4. definisikan jalur migration resmi
5. tambah preflight env schema validation

Kalau kamu mau, kirimkan isi terbaru dari:

* `deploy-staging.ps1`
* `deploy-production.ps1`
* `staging-deploy.yml`
* `production-deploy.yml`

Nanti saya review sebagai **release architecture audit** dan saya kasih:

* gap yang masih tersisa
* hardening lanjutan
* test checklist
* rollout notes yang paling aman.


Ini sudah masuk level **production-grade pipeline yang benar-benar sadar schema**, bukan sekadar CI/CD.

Saya akan review sebagai **production readiness audit (final layer sebelum real use)**.

---

# 🧠 Executive Verdict

👉 Ini **sudah layak dipakai di production dengan risiko terkontrol**, dengan satu syarat:

> kamu harus melakukan **1 staging drill penuh + 1 rollback drill** sebelum first real contract migration.

Secara arsitektur:

* ✔ migrate → deploy separation: solid
* ✔ expand/contract enforcement: solid
* ✔ observability gate: strong
* ✔ guardrail production: strong
* ✔ workflow orchestration: clean

Ini bukan lagi “pipeline bagus”
Ini sudah jadi **release system**.

---

# 🔍 Deep Audit (per bagian)

---

# 1. MIGRATION SCRIPTS

## 🟢 Strengths

### A. SchemaStrategy explicit

```powershell
[ValidateSet("none", "expand", "contract")]
```

👉 Ini bagus karena:

* memaksa operator sadar fase migrasi
* tidak bisa “accidentally destructive”

---

### B. Contract guard (production)

```powershell
if ($env:ALLOW_CONTRACT_MIGRATIONS -ne "true")
if ($Phrase -ne "APPROVE_CONTRACT_MIGRATION")
```

👉 Ini **excellent safety layer**

Double gate:

* config-level
* human-intent-level

---

### C. Backfill explicit + optional

```powershell
[switch]$RunBackfill
[string]$BackfillCommand
```

👉 Ini design yang benar:

* backfill bukan side effect
* bisa dikontrol per deploy

---

### D. DB health wait

```powershell
Wait-ServiceHealthy -ContainerName "tct-mariadb"
```

👉 Good, tapi ini masih container-level (nanti saya bahas gap-nya)

---

## ⚠️ Critical Gaps

---

### ❗ GAP #1 — Tidak ada visibility hasil migration

Saat ini:

```powershell
php artisan migrate --force
```

❌ Tidak ada:

* `migrate:status`
* log output capture
* failed migration context

---

### FIX (WAJIB)

Tambahkan setelah migrate:

```powershell
Write-Section "Migration status"
Invoke-BackendTask -Command "php artisan migrate:status"
```

Dan capture output ke file:

* staging-migration-report.md
* production-migration-report.md

---

### ❗ GAP #2 — Backfill tidak dipaksa aman

Saat ini:

```powershell
Invoke-BackendTask -Command $Command
```

❌ Tidak ada jaminan:

* idempotent
* chunked
* resumable

---

### FIX (HIGH IMPACT)

Tambahkan guard sederhana:

```powershell
if ($Command -notmatch "chunk|batch|cursor") {
    Write-Host "WARNING: Backfill command may not be chunked." -ForegroundColor Yellow
}
```

Dan di runbook:

* wajib chunk-based
* wajib idempotent

---

### ❗ GAP #3 — DB readiness ≠ DB usability

Saat ini:

```powershell
docker inspect health
```

Masalah:

* DB bisa healthy tapi:

  * schema lock
  * connection refused dari app
  * permission error

---

### FIX

Tambahkan check ringan:

```powershell
Invoke-BackendTask -Command "php artisan tinker --execute=\"DB::select('select 1');\""
```

---

# 2. OBSERVABILITY GATE

## 🟢 Strengths

### A. Multi-layer check

* Prometheus ready
* Alertmanager ready
* blackbox probe
* critical alerts

👉 Ini sangat kuat.

---

### B. Fail-fast behavior

```powershell
exit 1
```

👉 Ini benar — observability harus blocking.

---

### C. Report generation

```powershell
Set-Content -LiteralPath $OutFile
```

👉 Ini bagus untuk audit trail.

---

## ⚠️ Gap

### ❗ GAP #4 — Tidak ada correlation ke deploy context

Report tidak punya:

* commit SHA
* schema strategy
* env

---

### FIX

Tambahkan:

```powershell
- Commit: $env:GITHUB_SHA
- SchemaStrategy: $env:SCHEMA_STRATEGY
```

---

### ❗ GAP #5 — Probe failure terlalu strict untuk early rollout

```powershell
probe_success < 1 => fail
```

👉 Ini bagus untuk stability, tapi:

* bisa block deploy saat monitoring flapping
* bisa false positive

---

### FIX (optional)

Tambahkan tolerance:

```powershell
[int]$MaxProbeFailures = 0
```

---

# 3. WORKFLOW DESIGN

---

## 🟢 Strengths

### A. migrate → deploy dependency

```yaml
needs: migrate-staging
```

👉 Ini **exactly correct sequencing**

---

### B. Production guardrail (excellent)

* SHA validation
* must be on main
* must pass DevSecOps gate

👉 Ini enterprise-level.

---

### C. Artifact upload

```yaml
upload-artifact
```

👉 Ini bagus untuk debugging & audit

---

## ⚠️ Critical Gap

---

### ❗ GAP #6 — No post-migrate validation step BEFORE deploy

Flow sekarang:

```
migrate → deploy
```

Masalah:

* migration bisa “success” tapi broken secara semantic

---

### FIX (HIGH IMPACT)

Tambahkan step di migrate job:

```yaml
- name: Post-migrate verification
  run: |
    docker compose run --rm backend sh -lc "php artisan migrate:status"
```

Optional:

* sanity query
* row count check

---

# 4. PRODUCTION FLOW

---

## 🟢 Strengths

### A. Full guardrail pipeline

```yaml
preflight → migrate → deploy
```

👉 Ini clean & safe.

---

### B. Contract phrase separation

```yaml
contract_confirm_phrase
```

👉 Ini bagus — memisahkan intent destructive.

---

## ⚠️ Gap

---

### ❗ GAP #7 — Contract migration belum punya “cooldown policy”

Saat ini:

* bisa dijalankan kapan saja

Risiko:

* dilakukan terlalu cepat setelah expand
* dilakukan saat system unstable

---

### FIX (PROCESS, bukan code)

Tambahkan rule:

Contract hanya boleh jika:

* expand sudah ≥ 24–72 jam live
* no critical alert
* backfill 100%
* staging sudah contract-tested

---

# 5. SYSTEM-LEVEL ASSESSMENT

---

## 🔥 What you built (realistically)

Ini bukan:

* CI/CD pipeline biasa
* Dev deploy script

Ini adalah:

👉 **Schema-aware release orchestration system**

---

## Capability sekarang

✔ controlled migration lifecycle
✔ safe deploy sequencing
✔ rollbackable
✔ observable
✔ auditable
✔ production-guarded

---

## Yang masih missing untuk “elite level”

---

### 1. Release manifest (VERY HIGH VALUE)

File JSON/MD per deploy:

```json
{
  "sha": "...",
  "schema_strategy": "expand",
  "backfill": true,
  "env": "production",
  "observability": "PASS",
  "smoke": "PASS"
}
```

👉 Ini akan sangat membantu:

* incident debugging
* audit
* reproducibility

---

### 2. Migration classification refinement

Saat ini:

* none
* expand
* contract

Next level:

* expand
* backfill-only
* contract

---

### 3. Backfill job standardization

Define:

* chunk size
* retry logic
* progress log

---

# 🎯 PRIORITY LIST (FINAL)

## 🔥 WAJIB sebelum real production use

1. Tambahkan `migrate:status` output
2. Tambahkan post-migrate verification
3. Jalankan staging drill end-to-end
4. Jalankan rollback drill

---

## 🚀 HIGH IMPACT next

5. Release manifest
6. Backfill safety standard
7. Observability report enrichment

---

## 🧠 LATER

8. Contract migration window policy
9. SLO-based observability gate tuning

---

# 🧾 Final Decision

👉 Sistem ini **sudah cukup matang untuk dipakai**, dengan catatan:

> Belum “proven” sampai kamu lakukan **real drill + real failure simulation**

---

Kalau kamu mau, next step paling powerful:

👉 Saya bantu desain:
**“staging drill scenario (expand → backfill → contract → rollback)”**

yang benar-benar mensimulasikan:

* partial failure
* bad migration
* observability failure
* rollback edge case

Itu akan mengubah sistem ini dari “well-designed” menjadi **battle-tested**.

Berikut desain **staging drill scenario** yang benar-benar menguji lifecycle kamu, bukan sekadar happy path.

Semua ini diasumsikan berjalan di pipeline yang sekarang sudah kamu bangun: `migrate-staging` terpisah dari `deploy-staging`, ada `SchemaStrategy`, `RunBackfill`, contract guard, observability gate, dan auto rollback path. 

# Objective

Membuktikan bahwa sistem staging kamu kuat terhadap 4 kelas kegagalan:

1. **partial failure**
2. **bad migration**
3. **observability failure**
4. **rollback edge case**

Target akhirnya bukan cuma “script jalan”, tetapi:

* urutan migrate → deploy tetap benar
* expand/backfill/contract aman
* failure berhenti di titik yang tepat
* rollback tidak membuat state makin rusak
* tim punya bukti operasional bahwa proses ini siap dipakai di production

# Prinsip drill

Gunakan 1 domain data yang aman untuk eksperimen. Jangan langsung pakai tabel paling sensitif. Pilih satu entitas yang:

* cukup sering dipakai aplikasi
* punya read/write flow
* bisa diuji di UI/API
* tidak terlalu besar

Contoh mental model:

* tambahkan kolom baru nullable
* backfill isi kolom baru
* ubah app membaca kolom baru
* contract hapus kolom lama

Ini sesuai pola expand-contract yang memang kamu targetkan. 

# Success criteria global

Drill dianggap lulus kalau seluruh hal ini terbukti:

* `expand` bisa dijalankan tanpa memutus flow lama
* `backfill` bisa dijalankan terkontrol dan bisa diulang aman
* `contract` hanya lolos saat guardrail terpenuhi
* observability gate benar-benar bisa memblokir deploy
* rollback mengembalikan app ke state sehat
* ada evidence artifact untuk tiap fase:

  * migrate output
  * smoke output
  * observability report
  * rollback result
  * `migrate:status`

# Skenario drill end-to-end

## Phase 0 — Baseline capture

Sebelum drill, ambil baseline berikut:

* commit SHA
* schema strategy yang akan dipakai
* nama tabel/kolom yang diuji
* row count awal
* `php artisan migrate:status`
* smoke test result awal
* observability report awal
* screenshot / curl dari flow user yang menyentuh field itu

Tujuan:
kalau nanti ada masalah, kamu tahu titik awalnya.

## Phase 1 — Expand drill

### Objective

Buktikan migrasi additive aman.

### Contoh perubahan

* tambah kolom baru nullable, misalnya `new_field`
* jangan hapus / rename apa pun
* app masih membaca kolom lama
* optional: app mulai dual-write

### Jalankan

* `schema_strategy=expand`
* `run_backfill=false`

### Yang harus diverifikasi

* migrate sukses
* `migrate:status` sesuai
* flow lama tetap berjalan
* insert/update baru tidak error
* observability gate pass
* smoke test pass

### Evidence wajib

* report migrate
* output `migrate:status`
* smoke report
* observability report

### Pass condition

Tidak ada user-visible regression, dan schema baru sudah ada.

---

## Phase 2 — Backfill drill

### Objective

Buktikan backfill eksplisit aman, terukur, dan tidak mengganggu app.

### Jalankan

* `schema_strategy=none` atau tetap `expand` bila memang belum dijalankan
* `run_backfill=true`
* `backfill_command=<command backfill asli>`

### Yang harus diverifikasi

* backfill command jalan sukses
* data lama terisi ke kolom baru
* command bisa diulang tanpa merusak data
* flow read lama tetap aman
* flow write baru tetap aman
* observability tetap pass

### Yang harus dicatat

* durasi backfill
* jumlah row yang diproses
* pattern logging progress
* apakah ada spike query / latency

### Pass condition

Backfill selesai, data konsisten, tidak ada error operasional.

# Failure simulations

Sekarang empat simulasi yang kamu minta.

## 1. Partial failure simulation

### Objective

Membuktikan sistem tahan saat backfill berhenti di tengah.

### Cara simulasi

Buat backfill command versi drill yang sengaja gagal setelah sebagian batch, misalnya:

* proses 2 batch pertama
* lalu throw exception pada batch ke-3

Jangan buat failure random. Failure harus deterministic.

### Yang diuji

* migrate job gagal di fase backfill
* deploy tidak berjalan setelah migrate gagal
* data hasil batch awal tetap valid
* rerun backfill bisa lanjut / aman diulang
* observability tidak rusak karena proses setengah jalan

### Verifikasi

* row yang sudah dibackfill tetap benar
* row yang belum diproses masih aman dibaca app lama
* rerun command tidak menduplikasi / mengkorup data

### Pass condition

Failure tertahan di migrate stage, deploy tidak jalan, dan rerun aman.

### Ini yang sedang kamu buktikan

Bahwa backfill memang **idempotent / resumable**, bukan command sekali jalan yang rapuh.

---

## 2. Bad migration simulation

### Objective

Membuktikan guardrail dan workflow menahan migrasi yang buruk.

### Cara simulasi A — Contract terlalu cepat

Buat contract migration yang menghapus kolom lama saat app staging masih membaca kolom lama.

Jalankan:

* `schema_strategy=contract`

Uji dalam dua mode:

#### Mode 1: guardrail OFF

* `ALLOW_CONTRACT_MIGRATIONS=false`

Expected:

* migrasi ditolak cepat oleh script. Ini sesuai design `contract` yang butuh explicit allow. 

#### Mode 2: guardrail ON tapi app belum siap

* `ALLOW_CONTRACT_MIGRATIONS=true`
* contract phrase valid
* tapi app masih pakai kolom lama

Expected:

* migrate mungkin lolos
* deploy atau smoke harus gagal
* rollback path harus tersedia

### Cara simulasi B — Migration SQL buruk

Tambahkan migration drill yang:

* rename/drop field yang masih dipakai query lama
* atau membuat constraint yang mematahkan insert lama

### Yang diuji

* apakah smoke test benar-benar menangkap regression
* apakah rollback app cukup
* apakah kamu butuh DB rollback / forward-fix

### Pass condition

Sistem mendeteksi breakage dengan cepat, dan tim tahu dengan jelas:

* apakah cukup rollback image
* atau perlu rollback migration juga

### Insight terpenting

Ini drill untuk membuktikan bahwa **rollback image saja tidak selalu cukup** bila contract migration sudah mengubah schema secara destruktif.

---

## 3. Observability failure simulation

### Objective

Membuktikan observability gate benar-benar blocking.

Script kamu sekarang mengecek:

* readiness Prometheus
* readiness Alertmanager
* blackbox probe failures
* critical alerts. 

### Simulasi A — Active critical alert

Buat alert staging sementara, atau trigger kondisi yang memunculkan active critical alert.

Expected:

* `check-observability.ps1` gagal
* deploy tertahan

### Simulasi B — Probe failure

Matikan satu target blackbox staging sementara atau arahkan probe ke endpoint yang sengaja gagal.

Expected:

* observability gate fail karena `probe_success < 1`

### Simulasi C — Monitoring dependency unavailable

Matikan akses ke Prometheus atau Alertmanager staging sementara.

Expected:

* readiness fail
* deploy tertahan sebelum dianggap sukses

### Yang harus diverifikasi

* failure message jelas
* artifact report tertulis
* auto rollback behavior tidak melakukan hal aneh jika deploy belum benar-benar dimulai

### Pass condition

Observability gate benar-benar menjadi **release blocker**, bukan cuma report pasif.

---

## 4. Rollback edge case simulation

Ini yang paling penting.

### Objective

Membuktikan rollback aman pada beberapa kondisi yang paling berbahaya.

### Edge case A — Deploy gagal setelah migrate sukses

Flow:

* expand sukses
* backfill sukses
* deploy app baru sengaja dibuat gagal, misalnya bad env, endpoint smoke gagal, atau container unhealthy

Expected:

* rollback image berjalan
* app lama tetap bisa jalan di schema expanded
* smoke lama kembali hijau

Ini harus lulus, karena expand seharusnya backward-compatible. Itu inti pola expand-contract. 

### Edge case B — Contract sukses, deploy gagal

Flow:

* contract migration jalan
* deploy app baru gagal
* rollback image mencoba menghidupkan app lama

Expected:

* besar kemungkinan **rollback image lama tidak lagi kompatibel** dengan schema baru
* ini harus dianggap expected learning, bukan bug pipeline

Tujuannya justru untuk membuktikan:

* contract migration tidak boleh dianggap rollback-friendly
* sebelum contract, harus ada confidence yang jauh lebih tinggi

### Edge case C — Rollback script jalan, tapi observability tetap merah

Flow:

* deploy gagal
* rollback image jalan
* tetapi blackbox probe atau critical alert masih fail

Expected:

* sistem tidak menyatakan “selesai” hanya karena rollback script sukses
* rollback juga harus diverifikasi via smoke + observability

### Edge case D — Partial backfill + rollback

Flow:

* backfill gagal di tengah
* operator memutuskan rollback app image walau deploy belum jalan

Expected:

* rollback image mungkin tidak relevan
* recovery yang benar adalah rerun/fix backfill, bukan rollback app

Ini drill penting untuk melatih decision-making tim.

# Drill matrix

Berikut urutan drill yang saya sarankan.

## Drill 1 — Happy path expand

* expand only
* no backfill
* verify old app still works

## Drill 2 — Happy path backfill

* run backfill
* verify consistency
* rerun once to prove idempotency

## Drill 3 — Partial failure backfill

* backfill fails mid-run
* verify deploy blocked
* rerun recovery

## Drill 4 — Observability block

* trigger blackbox failure or critical alert
* verify deploy blocked

## Drill 5 — Bad contract blocked by guardrail

* contract with allow=false
* verify fast failure

## Drill 6 — Bad contract after guardrail

* allow contract
* intentionally keep app dependent on old field
* verify smoke/deploy failure
* determine rollback limitation

## Drill 7 — Rollback after failed deploy on expanded schema

* expand ok
* bad app deploy
* rollback image
* verify healthy recovery

## Drill 8 — Rollback edge case after contract

* contract ok
* bad app deploy
* rollback image fails or remains broken
* document that DB rollback / forward-fix is required

# Recommended run order

Jangan langsung campur semua. Jalankan bertahap:

1. Happy path expand
2. Happy path backfill
3. Partial failure backfill
4. Observability failure
5. Expand + failed deploy + rollback
6. Contract blocked by guardrail
7. Contract allowed + failed deploy
8. Contract rollback edge case

Urutan ini menjaga risiko sambil tetap menghasilkan pembelajaran maksimum.

# Artifact checklist per drill

Untuk setiap drill, simpan:

* drill ID
* commit SHA
* schema strategy
* backfill command
* start/end time
* migrate output
* `migrate:status`
* smoke result
* observability result
* rollback result
* decision taken
* final verdict: pass/fail/partial

# Exit criteria sebelum production contract pertama

Saya akan menganggap kamu siap melakukan first real contract migration kalau semua ini terpenuhi:

* expand drill pass
* backfill drill pass
* partial failure recovery pass
* observability blocking pass
* rollback after failed deploy on expanded schema pass
* team sudah mendokumentasikan bahwa contract rollback membutuhkan prosedur khusus
* ada runbook keputusan:

  * kapan cukup rollback image
  * kapan harus rollback DB
  * kapan harus forward-fix

# Rekomendasi implementasi praktis

Tambahkan satu dokumen drill sederhana, misalnya:

* `docs/monitoring/staging-drill-expand-contract.md`

Isi per drill:

* tujuan
* setup
* command workflow input
* expected result
* artifact path
* outcome

Dan saya sarankan kamu pakai label drill yang eksplisit:

* `DRILL-01-expand-happy`
* `DRILL-02-backfill-happy`
* `DRILL-03-backfill-partial-fail`
* `DRILL-04-observability-block`
* `DRILL-05-contract-guardrail`
* `DRILL-06-expand-deploy-rollback`
* `DRILL-07-contract-rollback-edge`

# Final recommendation

Langkah paling bernilai sekarang adalah menjalankan **2 drill pertama lebih dulu**:

* happy path expand
* partial failure backfill

Karena dua itu akan cepat menunjukkan apakah fondasi expand-contract kamu benar-benar sehat.

