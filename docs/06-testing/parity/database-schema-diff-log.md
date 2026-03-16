# Database Schema Diff Log

## Purpose
Mencatat drift schema database antara local dan production yang dapat memengaruhi parity aplikasi.

Dokumen ini bukan dump SQL. Fokus pada perbedaan yang relevan terhadap runtime aplikasi.

## Status Legend
- OPEN
- VERIFIED
- BLOCKED
- NEEDS SERVER VALIDATION
- CLOSED

## Entry Template

### Entry ID
`db-diff-000`

### Date
YYYY-MM-DD

### Domain
- auth
- profile-lifecycle
- inbox-dm
- community
- today
- versehub
- relevance-layer
- journeys
- shared

### Table
Nama tabel

### Column / Index / Constraint
- Column:
- Type:
- Nullable:
- Default:
- Index/Constraint:

### Expected Local Schema
- describe:

### Observed Production Schema
- describe:

### Runtime Impact
Contoh:
- 500 pada write flow
- validation lolos tapi insert gagal
- avatar URL tidak tersimpan
- inbox unread state drift
- comment reply gagal

### Evidence
- migration file:
- model/controller dependency:
- query/runtime surface:
- observed error:

### Resolution Path
- add migration
- adjust code
- align seed
- server migration pending
- manual remediation needed

### Verification Steps
1.
2.
3.

### Status
- OPEN
- VERIFIED
- BLOCKED
- NEEDS SERVER VALIDATION
- CLOSED

---

## Critical Tables Checklist
- [ ] users
- [ ] profiles / user meta related tables
- [ ] personal_access_tokens
- [ ] inbox / messages / approvals related tables
- [ ] community / comments / bookmarks / reactions related tables
- [ ] content / journey related tables bila aktif
- [ ] any upload/media table that affects UI

---

## Active Schema Drift Entries
Tambahkan entry baru di bawah bagian ini dengan urutan terbaru di atas.
