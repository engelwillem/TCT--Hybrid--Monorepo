# Audit: Today (Homepage)

## Domain Overview
Sektor beranda utama (The Anchor) yang mendikte ke mana user pertama kali jatuh pasca-Otentikasi. Arsitektur semula hanya *content-loader* berurut (Verse, Bài, Lesson, Posts). Misi baru menjadikannya *Context Router*.

## Temuan Inti
- Terdapat komponen blok masif statis `<ThrowingCard>` dalam kode *page* yang mengikat urutan indeks tanpa hierarki kondisi.
- *API `TodayApiController`* mengalirkan metadata *Highlights* (Featured verse/lessons) murni tanpa diskriminasi berdasar profil *user*.

## Target Parity
Mengesahkan UI beranda (*Today*) untuk tidak sekadar "tampil", melainkan memiliki pemicu dinamis (StateChips) yang merombak ulang (*re-order*) balasan data yang disajikan, agar sesuai dengan status kalbu hari ini (`anxious/weary/grateful`).
