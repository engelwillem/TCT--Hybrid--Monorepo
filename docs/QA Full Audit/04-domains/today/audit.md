# Audit: Today (Homepage)

## Domain Overview
Sektor beranda utama (The Anchor) yang mendikte ke mana user pertama kali jatuh pasca-Otentikasi. Arsitektur semula hanya *content-loader* berurut (Verse, Bài, Lesson, Posts). Misi baru menjadikannya *Context Router*.

## Temuan Reality Drift (Fixed 2026-03-20)
- ✅ **Contract Mismatch**: **FIXED**. Frontend sekarang secara jujur hanya memanggil `dailyVerse`, `rituals`, `highlights`, dan `spiritual_state`.
- ✅ **Security Blocker**: **FIXED**. Logging token di proxy telah dihapus.

## Target Parity (Verified)
- Payload Today sudah sinkron dengan backend `TodayApiController`.
- Tidak ada lagi ketergantungan pada field phantom `pinnedLesson`.
