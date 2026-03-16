# Documentation Rules

## Purpose
Dokumentasi harus menjadi sistem operasi proyek, bukan arsip acak.

## Global Rules
1. Semua dokumen wajib berada di bawah `docs/`.
2. Nama file dan folder wajib `kebab-case`.
3. Dilarang membuat nama file acak seperti:
   - `final-final.md`
   - `notes2.md`
   - `temp.md`
   - `output.txt`
4. Isi dokumen harus faktual, ringkas, dan berbasis file kode nyata.
5. Jangan menulis narasi pemasaran atau spekulasi di dokumen teknis.
6. Setiap step kerja wajib meng-update dokumen yang relevan sebelum dinyatakan selesai.

## Domain Documentation Requirements
Setiap domain wajib memiliki:
- `audit.md`
- `parity-matrix.md`
- `change-log.md`
- `verification.md`
- `stop-gate.md`

## Feature Documentation Requirements
Setiap feature baru wajib memiliki:
- `brief.md`
- `implementation-log.md`
- `verification.md`

## Handover Requirements
Setiap selesai step kerja, wajib update:
- `docs/08-changelog/daily/<date>.md`
- `docs/09-handover/current-status.md`
- `docs/09-handover/next-actions.md`
- `docs/09-handover/open-blockers.md`

## Decision Records
Setiap keputusan arsitektur penting wajib ditulis sebagai ADR di `docs/07-decisions/`.
