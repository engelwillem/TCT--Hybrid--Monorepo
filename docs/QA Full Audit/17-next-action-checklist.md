# Next Action Checklist (17)

## Purpose
Dokumen ini merinci 8 poin perbaikan strategis yang didefinisikan oleh Product Owner untuk menstabilkan dan mempercantik User Experience dan Data Integrity sebelum rilis final.

## Current Context
Setelah sinkronisasi domain selesai (Phase 1), fokus beralih pada perbaikan fungsionalitas kritis (Auth session, Community images) dan penyempurnaan UI/UX (Landing flow, Copywriting).

## Priority Legend
- **P0 (Critical):** Menghambat fungsi utama atau merusak data (Harus selesai sebelum rilis).
- **P1 (Serious):** Terkait flow pengguna utama atau kredibilitas konten.
- **P2 (Polish):** Penyempurnaan visual dan copywriting.

## Category Legend
- **Frontend-only:** Perubahan UI tanpa dependensi API baru.
- **Backend-dependent:** Perubahan Controller/Database/Config di cPanel.
- **Mixed:** Membutuhkan sinkronisasi antara Next.js dan Laravel API.

## Testing Gate Legend
- **READY-FE:** Siap diuji di localhost/EdgeOne.
- **READY-BE:** Siap diuji di Backend API.
- **READY-E2E:** Siap diuji secara menyeluruh di WWW.
- **BLOCKED-INVESTIGATION:** Membutuhkan audit mendalam sebelum fix dimulai.

---

## Master Checklist

| Item ID | Request | Category | Owner | Priority | Dependency | Testing Gate | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **ITEM-016** | Today Date & Greeting Fix | Mixed (BE Payload) | Codex | **P0** | None | BLOCKED-INVESTIGATION | Root Cause Confirmed: Mock drift (21 Mar) & String concatenation |
| **ITEM-017** | Sidebar Identity Guest vs Member | Mixed (Auth State) | Codex | **P0** | None | BLOCKED-INVESTIGATION | Root Cause Confirmed: Greeting Logic Separation |
| **ITEM-008** | Landing page entry (Guest/Login flow) | Frontend | Gemini | P1 | None | READY-FE | "Masuk" -> "Login" |
| **ITEM-009** | /today dynamic date & greeting | Frontend | Gemini | P2 | None | READY-FE | Add "Chosen People" |
| **ITEM-010** | /versehub/id noise cleanup | Frontend | Gemini | P2 | None | READY-FE | Clean noise items |
| **ITEM-011** | Action bar icons (Finger -> Love) | Frontend | Gemini | P2 | None | READY-FE | Global CSS/Component change |
| **ITEM-012** | Community media failure | Mixed | Codex | **P0** | Storage/API | BLOCKED-INVESTIGATION | Audit storage/API |
| **ITEM-014** | Too fast session logout | Mixed | Codex | **P0** | Session Config | BLOCKED-INVESTIGATION | Fix session persistence |
| **ITEM-015** | 2FA Server Error (Profile) | Backend | Codex | **P0** | Laravel Auth | BE-NOT-DEPLOYED | Fix Laravel Auth |
| **ITEM-013** | Cleanup Archive/Fake Data | Backend | User/Op | P1 | DB Access | BE-NOT-DEPLOYED | Data real user only |

---

## Detailed Breakdown

### ITEM-012: Community Image Failure (P0)
- **Summary:** Gambar gagal dimuat atau disimpan saat menggunakan composer community.
- **Why it matters:** Media adalah jantung dari interaksi komunitas. Tanpa ini, fitur community lumpuh.
- **Risk:** Pengguna tidak bisa berbagi perenungan visual.
- **Owner:** Codex (Investigation).
- **Dependencies:** `shared/storage` permissions, API route handling.
- **Suggested Validation:** Upload image -> Verifikasi di `shared/storage` -> Verifikasi URL di API response.

### ITEM-014: Fast Session Logout (P0)
- **Summary:** User ter-logout terlalu cepat (session expiry prematur).
- **Why it matters:** Mengurangi retensi dan membuat user frustrasi.
- **Risk:** User flow terputus saat baru mulai perenungan.
- **Owner:** Codex.
- **Dependencies:** `config/session.php`, `.env` (SESSION_LIFETIME), Cookie domain.
- **Suggested Validation:** Login -> Tunggu interval idle -> Cek Cookie persistence.

### ITEM-015: 2FA Server Error (P0)
- **Summary:** Error 500/Config error saat mengakses pengaturan 2FA di profile.
- **Why it matters:** Fitur keamanan dasar yang rusak merusak kepercayaan user.
- **Owner:** Codex.
- **Dependencies:** Fortify/Sanctum config, 2FA recovery code storage.
- **Suggested Validation:** Profile -> Security -> Toggle 2FA.

### ITEM-008: Landing Page Entry Flow (P1)
- **Summary:** Refactor landing page agar user eksplisit memilih Guest, Daftar, atau Login. Ganti teks "Masuk" ke "Login".
- **Why it matters:** Memperjelas onboarding untuk user baru.
- **Owner:** Gemini.
- **Category:** Frontend-only.
- **Suggested Validation:** Cek Visual link di hero section.

---

## Suggested Execution Order
1. **P0 (Codex):** Investigation ITEM-012, ITEM-014, ITEM-015 secara paralel.
2. **P1 (Gemini):** Refactor Landing Entry (ITEM-008).
3. **P1 (User/Op):** DB Data Cleanup (ITEM-013).
4. **P2 (Gemini):** Content/Icon Polish (ITEM-009, 010, 011).

## Ready Now
- ITEM-008, 009, 010, 011 (Frontend Polish).
- ITEM-013 (Data Cleanup).

## Blocked / Needs Investigation
- ITEM-012 (Image Failure).
- ITEM-014 (Fast Logout).
- ITEM-015 (2FA Error).

## Release-Critical Items
- ITEM-012 (Media)
- ITEM-014 (Session)
- ITEM-015 (Security)
