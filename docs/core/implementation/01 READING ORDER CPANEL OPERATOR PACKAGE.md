# Reading Order cPanel Operator Package

Dokumen ini membantu operator pemula membaca paket dokumentasi cPanel dengan urutan yang benar.

Tujuan:
- supaya tidak langsung tenggelam di blueprint yang terlalu detail
- supaya tahu dokumen mana dibaca dulu, mana dibuka hanya saat perlu

## 1. Kalau Anda Benar-Benar Baru

Baca dengan urutan ini:

1. [02 QUICK START 5 MENIT CPANEL OPERATOR.md](e:/thechoosentalksnext/docs/CORE/implementation/02%20QUICK%20START%205%20MENIT%20CPANEL%20OPERATOR.md)
2. [03 PULL & DEPLOY GIT CPANEL.MD](e:/thechoosentalksnext/docs/CORE/implementation/03%20PULL%20%26%20DEPLOY%20GIT%20CPANEL.MD)
3. [05 GUIDE BOOK FULL END-TO-END CPANEL MAPPING.md](e:/thechoosentalksnext/docs/CORE/implementation/05%20GUIDE%20BOOK%20FULL%20END-TO-END%20CPANEL%20MAPPING.md)
4. [04 SCRIPT PULL & DEPLOY GIT CPANEL.MD](e:/thechoosentalksnext/docs/CORE/implementation/04%20SCRIPT%20PULL%20%26%20DEPLOY%20GIT%20CPANEL.MD)
5. [06 CPANEL SERVER FULL MAIN BLUEPRINT MAP.md](e:/thechoosentalksnext/docs/CORE/implementation/06%20CPANEL%20SERVER%20FULL%20MAIN%20BLUEPRINT%20MAP.md)

## 2. Fungsi Tiap Dokumen

### Quick Start

- fungsi:
  - jalan tercepat untuk operator baru
- kapan dibuka:
  - saat Anda hanya butuh orientasi 5 menit

### Pull & Deploy

- fungsi:
  - menjelaskan workflow operator backend
- kapan dibuka:
  - saat Anda ingin tahu kapan harus deploy backend dan kapan tidak

### Guide Book

- fungsi:
  - mengajari cara memetakan server dari nol
- kapan dibuka:
  - saat Anda sedang belajar atau sedang audit manual

### Script Pack

- fungsi:
  - command siap copy-paste
- kapan dibuka:
  - saat Anda sudah tahu konteks dan ingin langsung eksekusi

### Full Blueprint

- fungsi:
  - bukti forensik dan runtime map paling detail
- kapan dibuka:
  - saat Anda butuh investigasi mendalam atau memastikan detail server live

## 3. Kalau Anda Cuma Mau Deploy Backend

Urutan baca:

1. [02 QUICK START 5 MENIT CPANEL OPERATOR.md](e:/thechoosentalksnext/docs/CORE/implementation/02%20QUICK%20START%205%20MENIT%20CPANEL%20OPERATOR.md)
2. [03 PULL & DEPLOY GIT CPANEL.MD](e:/thechoosentalksnext/docs/CORE/implementation/03%20PULL%20%26%20DEPLOY%20GIT%20CPANEL.MD)
3. [04 SCRIPT PULL & DEPLOY GIT CPANEL.MD](e:/thechoosentalksnext/docs/CORE/implementation/04%20SCRIPT%20PULL%20%26%20DEPLOY%20GIT%20CPANEL.MD)

## 4. Kalau Anda Cuma Mau Audit Struktur Server

Urutan baca:

1. [05 GUIDE BOOK FULL END-TO-END CPANEL MAPPING.md](e:/thechoosentalksnext/docs/CORE/implementation/05%20GUIDE%20BOOK%20FULL%20END-TO-END%20CPANEL%20MAPPING.md)
2. [06 CPANEL SERVER FULL MAIN BLUEPRINT MAP.md](e:/thechoosentalksnext/docs/CORE/implementation/06%20CPANEL%20SERVER%20FULL%20MAIN%20BLUEPRINT%20MAP.md)

## 5. Kalau Anda Sedang Debug Bug Runtime

Urutan baca:

1. [06 CPANEL SERVER FULL MAIN BLUEPRINT MAP.md](e:/thechoosentalksnext/docs/CORE/implementation/06%20CPANEL%20SERVER%20FULL%20MAIN%20BLUEPRINT%20MAP.md)
2. [05 GUIDE BOOK FULL END-TO-END CPANEL MAPPING.md](e:/thechoosentalksnext/docs/CORE/implementation/05%20GUIDE%20BOOK%20FULL%20END-TO-END%20CPANEL%20MAPPING.md)
3. [04 SCRIPT PULL & DEPLOY GIT CPANEL.MD](e:/thechoosentalksnext/docs/CORE/implementation/04%20SCRIPT%20PULL%20%26%20DEPLOY%20GIT%20CPANEL.MD)

## 6. Saran Operator Pemula

- jangan mulai dari blueprint penuh
- mulai dari Quick Start
- baru naik ke Guide Book
- gunakan Script Pack hanya saat Anda paham command yang dijalankan
