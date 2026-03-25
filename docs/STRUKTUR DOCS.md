Struktur `docs` yang saya sarankan:

**Tujuan**
- `docs` tetap berguna untuk development aktif
- repo git tetap ringan
- arsip besar dan file sensitif tidak ikut membebani repo

**Struktur Final**
```text
docs/
  core/
    architecture/
    implementation/
    operations/
    product/
  reference/
    config-snapshots/
    server-config/
  archive/
    legacy-references/
    laravel-root-orphans/
    ops-history/
    visual-audits/
    reports/
    release-bundles/
  quarantine/
    sensitive-dumps/
    editor-state/
    tooling-installs/
```

**Aturan Isi**
- `docs/core`
  - Masuk git
  - Isi: dokumen aktif yang benar-benar dipakai tim sekarang
  - Contoh:
    - `implementation_plan.md`
    - `parity_analysis.md`
    - `routing_analysis.md`
    - `walkthrough.md`
    - folder `LARAVEL HYBRID MASTER PLAN`
- `docs/reference`
  - Masuk git, tapi tetap kecil
  - Isi: snapshot config, referensi server/config lokal, catatan teknis yang sesekali dibutuhkan
  - Contoh:
    - `backend.schema.snapshot.json`
    - `php.windows.local.ini`
- `docs/archive`
  - Sebaiknya tidak masuk git penuh, atau minimal hanya sebagian kecil
  - Isi: arsip historis, referensi lama, visual audit, bundle release
- `docs/quarantine`
  - Jangan masuk git
  - Isi: dump sensitif, editor state, installer/tooling sementara

**Yang Sebaiknya Masuk Git**
- `docs/core/**`
- `docs/reference/**`
- file README/index kecil di `docs/`

**Yang Sebaiknya Tidak Masuk Git**
- `docs/archive/**`
- `docs/quarantine/**`

**Pemetaan dari kondisi sekarang**
- `docs/LARAVEL HYBRID MASTER PLAN` -> pindah ke `docs/core/architecture/laravel-hybrid/`
- `docs/implementation_plan.md` -> `docs/core/implementation/implementation_plan.md`
- `docs/parity_analysis.md` -> `docs/core/architecture/parity_analysis.md`
- `docs/routing_analysis.md` -> `docs/core/architecture/routing_analysis.md`
- `docs/task.md` -> `docs/core/implementation/task.md`
- `docs/walkthrough.md` -> `docs/core/product/walkthrough.md`
- `docs/reference/*` tetap di `reference`
- `docs/archive/*` tetap di `archive`
- `docs/quarantine/*` tetap di `quarantine`

**Saran `.gitignore`**
```gitignore
docs/archive/
docs/quarantine/
```

Kalau ingin lebih aman dan tetap rapi:
```gitignore
docs/archive/**
!docs/archive/README.md
docs/quarantine/**
!docs/quarantine/README.md
```

**Keputusan Praktis**
- `.idx` tetap di root
- `docs` jangan di-ignore total
- yang di-track git hanya `docs/core` dan `docs/reference`
- `docs/archive` dan `docs/quarantine` tidak perlu masuk git

Kalau Anda mau, saya bisa lanjut langsung menata struktur `docs` ini di repo dan menyesuaikan `.gitignore` sesuai model tersebut.