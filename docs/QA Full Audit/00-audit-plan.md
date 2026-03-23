# Audit Plan (00)

## Objective
Melakukan verifikasi fungsionalitas, usabilitas, dan reliabilitas platform TCT sebelum rilis publik, dengan fokus khusus pada integrasi Today Ritual, VerseHub UX, dan manajemen sesi user.

## Current Deploy Reality
- Frontend production source comes from monorepo branch `main`.
- Frontend is auto-deployed by Tencent Edge from `main`.
- Backend Laravel is deployed manually by operator from cPanel / server terminal.
- Any older release-branch assumption such as `frontend-prod` should be treated as historical, not active.

## Audit Approach
1. **Reconnaissance:** Navigasi mandiri untuk memetakan rute dan elemen UI.
2. **Smoke Test:** Pengujian jalur utama (Happy Path) untuk fitur login dan fitur inti.
3. **Critical Path Analysis:** Deep dive pada flow Login -> Today -> VerseHub.
4. **Boundary & Negative Testing:** Pengujian validasi form, error handling, dan session timeout.
5. **UX/UI Audit:** Konsistensi desain, kejelasan tipografi, dan aksesibilitas dasar.

## Area Prioritas
1. **Auth & Session Persistence:** Menutup celah di mana user kehilangan status login saat navigasi.
2. **VerseHub UX Hierarchy:** Memperbaiki konflik antara Bottom Nav dan Verse Sheet.
3. **Profile Avatar:** Memastikan upload file tersimpan dan ditampilkan dengan benar.
4. **Today Ritual naming cleanup:** Memastikan rute legacy `today-v2` tidak lagi bocor ke UI/Client.

## Test Strategy
- **Manual Browsing:** Menggunakan tool `playwright` untuk interaksi nyata.
- **Inspector / DevTools Audit:** Memantau network calls dan console errors.
- **Role-based Testing:** Menguji sebagai Guest, User Biasa, dan Admin.

## Plan for Codex Handoff
Setiap temuan yang bersifat **Blocker** atau membutuhkan perubahan logika backend/API/routing akan dialokasikan sebagai item handoff di file `09-codex-handoff.md`. Gemini (QA) akan memberikan spesifikasi bug, sementara Codex akan melakukan eksekusi perbaikan. Validasi ulang akan dilakukan oleh Gemini setelah klaim perbaikan diterima.

## Out of Scope
- Stress testing / Load testing (Load > 100 concurrent users).
- Penetration testing mendalam (Hanya fokus pada security fungsional dasar).
