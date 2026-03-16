# Changelog Domain (Profile Lifecycle)

## [Phase Core Migration] - 2026-03-12

### Ditambahkan
- Firebase sync token (Bearer) yang menjembatani UID Firebase dengan ID Database Laravel.
- `FirebaseAuthSync.tsx` state root provider.
- Playwright E2E bypass test spesifik `write.spec.ts` untuk memutasi nama profil (Dummy User).

### Diubah
- Komponen Profil membaca state dari *Hook* lokal Next.js yang disinkronisasi dengan balasan `/api/auth/me`.

### Dihapus
- Ketergantungan terhadap sesi standar Monolithic *Cookies/Session* PHP digantikan mutlak oleh *Token API*.
