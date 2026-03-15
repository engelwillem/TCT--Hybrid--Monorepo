# Legacy Purge Execution Report 🗑️✅

**Tanggal Eksekusi:** 2026-03-15  
**Fase:** Wave 1 (VerseHub & Community & Today)  
**Branch Git:** `chore/legacy-purge-phase-1`  
**Status Build (Vite/TSC):** SUCCESS / `Exit code 0`

Eksekusi penghapusan frontend legacy (Laravel Vue/Inertia) telah berhasil diselesaikan berdasarkan panduan aman (conservative) `CONTROLLED_LEGACY_PURGE_PLAN.md`.

---

## 1. Daftar Path yang Dihapus (Wave 1) ✅

Semua path berikut aman dihapus karena komponen terkait telah sukses diparitas/direplikasi sepenuhnya pada aplikasi Next.js:

- `backend-api/resources/js/Pages/VerseHub/*`
- `backend-api/resources/js/Pages/Community/*`
- `backend-api/resources/js/Pages/Today/*`
- `backend-api/resources/js/Components/VerseHub/*`
- `backend-api/resources/js/Components/Community/*`
- `backend-api/resources/js/Components/Today/*`
- *Dead Code Cleanup*: Menghapus referensi `PostComposer` lama dari `Channels/Weekly/Index.tsx`
- *Dead Styles Cleanup*: Menghapus lebih dari 50 baris CSS Tailwind `@apply` (`.reader-prose` dkk) di `app.css` yang pecah akibat komponen/HTML aslinya telah tiada (Tailwind Shake Optimization).

Serta memotong routing Inertia lawas di `backend-api/routes/web.php` menjadi Redirect 301 ke aplikasi tujuan (`NEXT_PUBLIC_APP_URL`).

---

## 2. Daftar Path yang Ditahan (Hold List) 🛡️

Sesuai aturan *conservative approach*, komponen/path di bawah tidak disentuh pada Wave 1 dan ditahan (Hold):

- `backend-api/resources/js/Pages/Auth/*`
- `backend-api/resources/js/Pages/Profile/*`
- `backend-api/resources/js/Pages/Inbox/*`
- Seluruh `backend-api/app/Http/Controllers/*`
- Seluruh infrastruktur Filament Admin Panel
- *Semua Database Models & Routing API*

**Alasan Penahanan:**
Masih terdapat kemungkinan fungsionalitas Auth / Reset Password terpakai sebagai fallback bagi Filament Admin. Selain itu, fitur Inbox Auth & Profile terkait CSRF state perlu monitoring (smoke test) lebih lama sebelum dideklarasikan terdekopling 100%.

---

## 3. Potensi Dampak (What Has Changed)
- **Ukuran Bundle Berkurang:** Asset JavaScript (build) kini lebih kecil dan manifest Vite (di Laravel) menjadi lebih ramping dan cepat di-compile.
- **Graceful Redirection:** Pengguna yang masih mengklik tautan bookmark lama seperti `domain.com/community` langsung diterbangkan ke `NEXT_PUBLIC_APP_URL/community`.
- Sistem Hybrid sekarang nyata: Laravel seutuhnya perlahan berubah murni menjadi "The Data API" + "The Filament Backoffice", sementara UI disajikan eksklusif via port 9002.

---

## 4. Known Risks (Risiko Pasca-Purge)
Berdasarkan temuan saat pembersihan:
- **Tailwind Utility Purge Risk:** Ada risiko beberapa CSS global patah (seperti margin/padding) yang digunakan di halaman yang bertahan (misalnya Auth/Filament) karena saya harus men-standarisasi beberapa layer CSS yang ditinggalkan fitur VerseHub (`.reader-prose`). *Mitigasi telah dilakukan dengan merubah ke plain CSS property.*
- **Cross-Component Bleed:** `Channels/Weekly/Index` sempat mencoba meload `PostComposer` dari `community` yang sudah dihapus. Masalah ini *telah terdeteksi via Vite build Error dan segera di-patch*.

---

## 5. Daftar Smoke Test Wajib (Manual QA)

Silakan nyalakan kembali terminal untuk `Next.js (Port 9002)` dan `Laravel API (Port 8000)`, dan segera ujikan skenario berikut:

1. **[ ] Today (Home):** Pemuatan data live di beranda berfungsi (tidak *Offline Error*).
2. **[ ] Community:** Scroll panjang, tidak 503, Like & Pray bisa dipencet (optimistic UI responsif).
3. **[ ] VerseHub Reader:** Buka `kej-1` / `Mazmur 23`, pastikan ayatnya merender (tanpa error `chapter_not_found`).
4. **[ ] Inbox Page:** Buka dalam status *Guest*, harus menampilkan *Belum Teridentifikasi*.
5. **[ ] Profile / Login:** Coba logout/login dan pastikan perpindahan halamannya bebas *White Screen*.
6. **[ ] Share Pages:** Buka VerseHub Share (misal: `flm 1:15`) dari aplikasi memastikan detailnya termuat.
7. **[ ] Backend Admin:** Buka `http://localhost:8000/admintalk` dan pastikan otentikasinya tidak nyangkut.

---

```
STATUS EKSEKUSI WAVE 1: SELESAI & TERCATAT (COMMIT 0 Error)
```
