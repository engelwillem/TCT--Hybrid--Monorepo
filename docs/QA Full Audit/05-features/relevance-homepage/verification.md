# Verification: Relevance Homepage

## Verification Steps
1. Saat komponen ter-mount, pastikan state "Fresh" menjadi default, urutan adalah *Daily Verse* di atas.
2. Klik *chips* "Weary" atau "Anxious".
3. Validsasi UI: komponen `HookCard` ("Tuhan itu dekat kepada...") merangsek masuk ke layar atas.
4. Validasi navigasi: tombol *Primary CTA* di Hook Card memicu navigasi rute lokal ke `/community?intent=pray`.

## Status
- **PASS**: Fungsionalitas sesuai di level frontend (belum direkonsiliasi e2e dengan state persisten di backend/database).
