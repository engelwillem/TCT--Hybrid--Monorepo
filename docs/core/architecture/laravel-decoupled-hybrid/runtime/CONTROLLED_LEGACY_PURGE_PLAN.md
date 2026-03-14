# Controlled Legacy Purge Plan (Safe Delete) 🛠️ 🗑️

**Tanggal:** 2026-03-15  
**Tahap:** Eksekusi Transisi Final (`v3.0` dari `RUNTIME_DEFECT_TRIAGE_9002.md`)  
**Dasar Audit:** `FINAL_PURGE_READINESS_DECISION.md` (Status: PURGE READY)

Rencana ini difokuskan pada pembersihan aman terhadap komponen frontend Laravel Legacy (Vue/Inertia/Blade) yang sukses direplikasi oleh Next.js Decoupled Hybrid, dengan penerapan Standar Konservatif.

---

## 1. Scope Eksekusi (Wave 1 Purge)

Komponen pada `Wave 1` adalah file-file yang sudah terbukti 100% tumpang tindih dengan Next.js dan tidak lagi memiliki *dependency* tersembunyi dengan fungsi-fungsi utama backend:

### A. Frontend Layer (Vue/Inertia)
Hapus direktori berikut di dalam proyek Laravel (`backend-api/resources/js`):
- 🗑️ `Pages/VerseHub` (Semua file Reader Legacy)
- 🗑️ `Pages/Community` (Semua file Feed Legacy)
- 🗑️ `Pages/Today` (Semua file Today Highlights Legacy)
- 🗑️ `Components/VerseHub` 
- 🗑️ `Components/Community`
- 🗑️ `Components/Today`

### B. Routing Transition (`routes/web.php`)
Ubah/potong *web routes* yang lama agar me-redirect ke host Next.js, guna mencegah *dead-ends* jika ada user yang mengakses URL lama.
- ✂️ Ubah `Route::get('/versehub', ...)` menjadi `Redirect::to(...)`
- ✂️ Ubah `Route::get('/community', ...)` menjadi `Redirect::to(...)`
- ✂️ Ubah `Route::get('/today', ...)` menjadi `Redirect::to(...)`

---

## 2. Komponen yang DITAHAN Sementara (Hold List)

Untuk memitigasi risiko *dependency* yang belum 100% dipahami, item berikut **DILARANG DIHAPUS** pada Wave 1:

| Komponen | Alasan Ditahan |
| :--- | :--- |
| `resources/js/Pages/Auth/*` | Kemungkinan masih dipakai oleh sistem internal Laravel Sanctum atau Filament Admin fallback. |
| `resources/js/Pages/Profile/*` | Alur profil (avatar/settings) mungkin belum sepenuhnya didekopling dari Sanctum CSRF state. |
| `resources/js/Pages/Inbox/*` | Walau UI Inbox siap, utang UX "Compose P3" mungkin butuh mengacu pada kode legacy suatu waktu nanti. |
| Seluruh folder `app/Http/Controllers/*` | API dan Controller web (sebagian yang merender halaman legacy) ditahan hingga monitoring seminggu untuk memastikan tidak ada logika cron/event yang nyangkut. |
| `resources/views/app.blade.php` | Basis Inertia ini dipertahankan karena bagian Authentication dan Filament mungkin menumpang di sini. |

---

## 3. Rollback Strategy (Strategi Pemulihan)

Jika setelah *Wave 1 Purge* terjadi kerusakan (*Blank Screen*, *500 Error*, *API Timeout*), ikuti langkah ini dalam waktu kurang dari **5 menit**:

1. **Abort Route Changes:** Kembalikan pengeditan di `routes/web.php` menjadi routing Inertia `Inertia::render(...)` seperti sedia kala (Git Revert/Restore).
2. **Restore Vue Files:** Eksekusi `git checkout HEAD -- backend-api/resources/js/Pages backend-api/resources/js/Components`.
3. **Re-build Asset:** Karena file Vue telah pulih, jalankan ulang kompilasi manifest frontend Laravel: `cd backend-api && npm run build`.
4. **Flush Cache:** Jalankan `php artisan route:clear` dan `php artisan cache:clear`.

---

## 4. Wajib Smoke Test (Pasca-Purge)

Setelah Wave 1 selesai dihapus dan di-commit, **WAJIB** melakukan pengecekan ini di port `9002` (Next.js) dan `8000` (Laravel):

- [ ] **Today (Home):** Pemuatan data *live* Daily Verse dan Highlight berfungsi.
- [ ] **Community:** Feed panjang 7 hari muncul tanpa *Offline 503 error*.
- [ ] **VerseHub Reader:** Buka `kej-1` via search/picker, pastikan tidak `chapter_not_found` dan *tidak loading lama*.
- [ ] **Inbox:** State khusus *Unauthenticated / Guest* tidak rusak (menampilkan "Masuk Sekarang").
- [ ] **Profile:** Navigasi ke `/profile` menampilkan status gracefully (terutama fallback 401).
- [ ] **Share / Detail Pages:** Fitur Share dari Mentor Panel di Versehub dan Comment Modal di Community Feed berfungsi tanpa API error.
- [ ] **Auth / Security minimum:** Laravel Filament (`/admintalk`) bisa dilogin oleh user Admin, session cookie berfungsi.

---

## 5. Risk Notes (Catatan Risiko)

1. **Manifest Mix/Vite Patah:** Menghapus banyak komponen `resources/js` sekaligus seringkali membuat file konfigurasi *build* bawaan Laravel gagal mengompilasi.
   *Mitigasi:* Seluruh page yang dihapus harus dicabut dari array impor di `backend-api/resources/js/app.js` (atau entri poin sejenis) sebelum `npm run build` ulang.
2. **Hidden Blade Injection:** Ada kemungkinan `Route::redirect()` gagal karena ada middleware lama (`auth`, `verified`) yang terlanjur membajak eksekusi di `web.php` sebelum redirect direspons.
   *Mitigasi:* Tempatkan rute redirect sebelum group middleware yang ketat di file route.

---

## 6. Kriteria Sukses Purge

Agenda The *Controlled Purge Wave 1* dianggap sukses 100% apabila:
1. `backend-api` berhasil dikompilasi ulang (`npm run build`) tanpa peringatan *missing dependency*.
2. Ukuran repositori/bundle `backend-api` berkurang.
3. Smoke Test nomor 4 berjalan semuanya PASS (0 Error/500).
4. Tidak diperlukan Rollback Script dalam 24 jam pertama.

```
Status File Plan: Disetujui (Konservatif & Termitigasi)
```
