# Current Status

## Project State
Hybrid monorepo sedang berjalan dalam dua track:
1. parity migration domain lama
2. experience layer baru berbasis relevance, reflection, journeys, dan community response

## Closed Domains
- Profile lifecycle
- Inbox / DM
- VerseHub
- Community

## Active Domains
- Visual System & UI Architecture Reset

## Active Experience Features
- Core Navigation Restructuring (Completed Docs Base)
- Thematic Design Layout (Dawn Theme in globals.css)
- Screen Deprecation (merging redundant flows)

## Current Priority
1. Melakukan transisi bertahap untuk *Visual Patch & Arsitektur Layar* dengan melerai komponen statis. Pondasi Design Tokens (warna, kelengkungan p-6+, bayangan lapang) sudah diinjeksikan pada `globals.css`. Selanjutnya adalah menerapkannya ke `/today`.
2. selesaikan mitigasi local vs production parity yang masih berselimut status `NEEDS SERVER VALIDATION` (khususnya isu Env CORS dan CGIPassAuth cPanel).

## Non-Negotiable Constraints
- root repo harus clean
- docs hanya di `docs/`
- jangan membuat file acak
- jangan lanjut step baru tanpa status jelas
