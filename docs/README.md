# Documentation Index

Folder `docs/` adalah pusat dokumentasi proyek. Untuk kebutuhan web saat ini, gunakan folder bernomor sebagai sumber kebenaran utama. Semua material historis, legacy, dan referensi kerja lama dipusatkan ke `docs/archive/`.

## Source of Truth
- `docs/09-handover/`: status proyek, blocker aktif, dan urutan aksi terbaru.
- `docs/06-testing/`: parity checklist, hasil verifikasi, dan release gate.
- `docs/04-domains/`: status tiap domain produk yang sudah/masih dimigrasikan.
- `docs/05-features/`: brief, implementation log, dan verification untuk experience layer baru.
- `docs/07-decisions/`: keputusan arsitektur penting.

## Working Structure
- `docs/00-governance/`: aturan dokumentasi, workflow, dan governance repo.
- `docs/01-audits/`: audit ringkas yang merangkum kondisi lintas domain atau lintas track.
- `docs/02-roadmap/`: roadmap lintas fase. Saat ini beberapa file masih placeholder dan perlu diisi bila roadmap aktif dipakai lagi.
- `docs/03-architecture/`: arsitektur produk, data, dan teknis untuk target web aktif.
- `docs/04-domains/`: audit domain, parity matrix, verification, change log, dan stop gate.
- `docs/05-features/`: dokumen fitur experience layer seperti relevance homepage, journeys, dan reflection.
- `docs/06-testing/`: parity, E2E, dan manual QA.
- `docs/07-decisions/`: ADR dan keputusan desain sistem.
- `docs/08-changelog/`: catatan perubahan harian dan release notes.
- `docs/09-handover/`: pegangan eksekusi terbaru untuk melanjutkan pekerjaan.

## Historical / Non-Primary Areas
- `docs/archive/`: arsip historis, visual audits, bundle, dan snapshot lama.
- `docs/quarantine/`: dump sensitif atau artefak sementara yang tidak boleh dijadikan rujukan kerja harian.
- `docs/archive/core-legacy/`: dokumen kerja lama yang dipertahankan hanya untuk jejak historis.
- `docs/archive/TCT--Laravel--Legacy-main/`: snapshot legacy repo untuk referensi, bukan area dokumentasi aktif.

## Current Reality
- Migrasi domain inti sudah kuat di `profile lifecycle`, `inbox / dm`, `versehub`, dan `community`, tetapi readiness production masih tertahan faktor server.
- Experience layer web baru aktif di `today`, `relevance homepage`, `hook cards`, `reflection`, dan `spiritual journeys`.
- Blocker terbesar saat ini bukan desain dokumen atau UI lokal, melainkan parity production: DNS/TLS/canonical redirect, CORS/Sanctum, dan akses deploy cPanel.

## Documentation Rules
- Tambahkan dokumen kerja baru ke folder bernomor yang relevan.
- Jangan menaruh dokumen aktif baru di `archive/` atau `quarantine/`.
- Jika status feature/domain berubah, update minimal `04-domains/*`, `06-testing/*`, dan `09-handover/*` agar tidak terjadi drift status.
