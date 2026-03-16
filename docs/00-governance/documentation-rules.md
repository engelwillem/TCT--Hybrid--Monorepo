# Aturan Perilaku Dokumentasi (Documentation Governance)

Sistem dokumentasi repositori ini distrukturkan guna memastikan bahwa setiap perubahan *(patch)* atau penambahan arsitektur tercatat secara riil dan selalu sinkron dengan kode yang tertanam.

## Direktori Pokok
1. `03-architecture`: Konsep Arsitektur Inti Hibrida (Engine Relevance, Data Flow).
2. `04-domains/<domain-name>`: Rekam jejak fitur bawaan utama (Community, Inbox, Profile, dll). 
   - Wajib melampirkan file: `audit.md`, `parity-matrix.md`, `change-log.md`, `verification.md`, `stop-gate.md`.
3. `05-features/<feature-name>`: Rekam jejak komponen UX terbaru (Hook Cards, Path, dll).
4. `06-testing`: Dokumentasi strategi E2E (Plan, Suites, Smoke Matrix).
5. `07-decisions`: Log Keputusan Arsitektur Besar (ADR).
6. `08-changelog/daily`: Log per hari berbasis *markdown date format*.
7. `09-handover`: Tracker penugasan (*blockers, status, next actions*).

## Konvensi Format
- Penamaan file harus dalam *kebab-case*. Tidak boleh memuat *temp/draft*.
- Konten bersifat ringkas, teknikal, memuat rujukan fungsi aktual, tanpa hiperbola.
- Tidak dibenarkan menyegel (*pass*) tugas apa pun sebelum dokumen-dokumen terkait dalam ranting domain ini dimutakhirkan.
