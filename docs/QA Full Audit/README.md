# Senior QA Audit - TCT Hybrid Monorepo

## Tujuan Folder

Folder ini menyimpan audit QA, handoff Gemini ↔ Codex, evidence testing, dan dokumen operasional untuk melanjutkan proyek web saat ini.

Masalah sebelumnya adalah root folder ini bercampur antara:

- dokumen operasional aktif
- arsip audit
- template
- catatan ad-hoc
- dump sensitif / sementara

Mulai sekarang, baca folder ini dengan hierarki yang jelas.

## Start Here

1. `00b-active-doc-map.md`
2. `00a-current-deploy-truth.md`
3. `07-release-readiness.md`
4. `09-handover/current-status.md`
5. `09-handover/open-blockers.md`
6. `09-codex-handoff.md`
7. `10-fix-validation-log.md`
8. `17-next-action-checklist.md`

## Source of Truth Sekarang

- `00a-current-deploy-truth.md`
  - model deploy aktif frontend vs backend
- `07-release-readiness.md`
  - gate GO / NO-GO saat ini
- `09-handover/current-status.md`
  - status operasional terbaru
- `09-handover/open-blockers.md`
  - blocker aktif yang belum selesai
- `10-fix-validation-log.md`
  - bukti validasi runtime / live

Jika ada konflik antar dokumen, prioritaskan:

1. `10-fix-validation-log.md` untuk kebenaran runtime
2. `00a-current-deploy-truth.md` untuk kebenaran deploy model
3. `07-release-readiness.md` untuk keputusan gate release
4. `09-handover/` untuk status operasional aktif

## Struktur Folder yang Disarankan

- `00-governance/`
  - aturan kerja dan kebijakan dokumentasi
- `01-audits/`
  - audit historis dan artifacts
- `02-roadmap/`
  - roadmap lama dan planning
- `02-uiux/`
  - audit UI/UX dan direction
- `03-architecture/`
  - referensi arsitektur
- `04-domains/`
  - domain-specific docs, termasuk EdgeOne/dashboard checklist
- `05-features/`
  - design brief dan implementation notes per fitur
- `06-testing/`
  - parity, e2e, manual QA
- `07-decisions/`
  - ADR / keputusan
- `08-changelog/`
  - changelog harian dan release notes
- `09-handover/`
  - handover aktif untuk continuation
- `10-report/`
  - report dan log lama
- `quarantine/`
  - dump sensitif, editor state, log sementara
- `reference/`
  - template dan catatan referensi yang tidak boleh dibaca sebagai status harian

## Aturan Baca

- Jangan baca `01-audits/`, `10-report/`, atau `reference/` sebagai status harian tanpa cross-check ke `09-handover/`.
- Jangan baca `quarantine/` sebagai sumber truth operasional.
- Dokumen di `reference/templates/` hanya template, bukan pekerjaan aktif.
- Dokumen di `reference/ad-hoc-notes/` adalah catatan tambahan, bukan gate operasional.

## Kolaborasi

- **Gemini**
  - audit browser/runtime
  - kumpulkan evidence
  - isi validation log
- **Codex**
  - analisa source
  - patch code / config
  - update handoff teknis
- **Operator**
  - dashboard EdgeOne
  - cPanel / deploy manual
  - cache purge / domain mapping / infra rule

## Checklist EdgeOne

Checklist operasional EdgeOne sekarang berada di:

- `04-domains/edgeone-dashboard-checklist.md`
