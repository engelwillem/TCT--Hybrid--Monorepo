# Parity Matrix: Today (Homepage)

Sistem migrasi fungsi beranda dan orientasi *first-look*.

## Homepage Elements
| Fitur / Skope | Legacy (Blade) | Hybrid (Next.js) | Status | Catatan |
| ------------- | -------------- | ---------------- | ------ | ------- |
| Daily Verse Deck | Card Klasik | `DailyVerseHeroCard` | `PASS` | *Parallax animation* diaplikasikan memperkaya desain.
| Community Feed | API `/feed` | Filtered Array Map | `PASS` |
| Greeting & Date | PHP `Carbon` | JS `Date/Greeting` | `PASS` | Menyesuaikan sapaan hari (pagi, sore) sesuai zona waktu browser.
| State Sorter    | N/A | `StateChips` / Client | `PASS` | Ini spesifik *Relevance Engine* yang absen di versi lawas.
