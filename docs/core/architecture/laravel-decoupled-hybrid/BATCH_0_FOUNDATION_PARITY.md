# Batch 0 - Foundation Parity

**Tujuan:** Membangun fondasi integrasi teknis yang stabil dan nyata antara Next.js (Frontend) dan Laravel (Backend API) untuk menghilangkan ketergantungan pada data palsu (*mock*) dan memastikan keamanan sesi pengguna.

---

## 1. Scope Batch 0

Fokus utama adalah pada jalur komunikasi data (Data Plumbing) dan Keamanan:

### A. Auth & Session Hardening
- Sinkronisasi siklus hidup antara Firebase Auth (Client) dan Laravel Sanctum (Server).
- Mekanisme *auto-refresh* token dan penanganan error 401/403 yang elegan.
- Pembersihan sisa-sisa sesi lama saat logout atau token expired.

### B. Write Logic API Bridge
- Ekspos endpoint API Laravel untuk aksi mutasi data: *Pray/Like*, *Bookmark*, dan *Comment*.
- Implementasi sistem proxy Next.js untuk menangani request `POST/PATCH/DELETE` ke backend.
- Penghapusan seluruh `console.log` yang selama ini menjadi pengganti logika simpan data.

### C. Mentor Data Contract (Scripture Guide)
- Standarisasi JSON contract untuk data kaya dari `VerseHubMentorService`.
- Pembuatan endpoint tunggal yang mengembalikan `insights`, `themes`, dan `relationships` untuk sebuah referensi ayat.

### D. Critical Mock Removal
- Penghapusan data statis pada `CommunityService` dan `VerseHub` reader-actions.
- Penggantian fallback visual statis dengan loading state yang nyata saat menunggu data API.

---

## 2. Out of Scope (Bukan Bagian Batch 0)

- **Redesign UI**: Dilarang mengubah radius, warna, atau layout kecuali untuk memperbaiki bug tampilan.
- **Refactor Arsitektur**: Jangan mengganti framework atau library yang sudah ada.
- **Migrasi Domain Besar**: Halaman penuh seperti *VerseHub Reader* atau *Inbox* adalah bagian dari Batch 1+. Batch 0 hanya mengurus "mesin" di belakangnya.

---

## 3. Work Breakdown

| Item Pekerjaan | Output | Dependency | Acceptance Criteria |
|---|---|---|---|
| **Hardening Auth Sync** | `FirebaseAuthSync.tsx` yang stabil & `X-Auth` middleware | N/A | Login Firebase menghasilkan token Sanctum valid tanpa intervensi user. |
| **API Mutation Bridge** | Endpoint `POST` di Laravel & Proxy di Next.js | Auth Sync | Klik *Like/Bookmark* di Next.js mengubah data di database MySQL. |
| **Mentor API Contract** | `GET /api/v1/versehub/{ref}/mentor` | N/A | Next.js menerima payload JSON lengkap dari service mentor asli. |
| **Persistence Clean-up** | Hapus `MOCK_POSTS` & `MOCK_COMMENTS` | API Bridge | Tidak ada lagi data palsu di feed Community saat API gagal. |

---

## 4. Exit Criteria (Gerbang Menuju Batch 1)

Batch 0 dianggap selesai dan proyek boleh lanjut ke migrasi halaman besar jika:

1.  **Zero Persistence Mocks**: Seluruh aksi "Tulis" (Write) di Community dan VerseHub (yang sudah ada) wajib masuk ke database MySQL.
2.  **Session Integrity**: Tidak terjadi "Session Drift" (user login di satu sisi tapi tidak di sisi lain).
3.  **Data Fidelity**: Output Mentor Panel di Next.js identik dengan output dari service Laravel asli.
4.  **No Poisonous Logs**: Tidak ada lagi `console.log("Mock saved")` di dalam service layer.

---

## 5. Rekomendasi Urutan Pengerjaan

1.  **Urutan 1 (Keamanan)**: Hardening Auth Sync. Ini adalah kunci pembuka untuk semua request API terproteksi.
2.  **Urutan 2 (Interaksi)**: Implementasi API mutasi (Pray/Bookmark). Ini membuktikan bahwa Next.js sudah bisa "menulis" ke backend.
3.  **Urutan 3 (Konten)**: Pemetaan API Mentor. Menutup gap kedalaman data Alkitab.
4.  **Urutan 4 (Pembersihan)**: Menghapus mock data dan merapikan type safety.

---
*Dokumen ini adalah standar instruksi untuk pengerjaan teknis tahap awal.*
