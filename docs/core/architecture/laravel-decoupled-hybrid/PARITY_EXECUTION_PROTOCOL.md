# Parity Execution Protocol (100% Replication)

**Tujuan:** Memastikan transisi dari Laravel Legacy Monolith ke Next.js Hybrid Monorepo mencapai paritas fungsional, visual, dan perilaku 100%.  
**Source of Truth:** `/home/user/studio/docs/TCT--Laravel--Legacy-main`

---

## 1. Definisi Parity 100%

Sebuah komponen atau halaman dianggap mencapai paritas 100% hanya jika memenuhi kriteria berikut:

### A. Route Parity
- Struktur URL di Next.js harus identik atau memiliki pemetaan 1:1 yang valid dengan Laravel `web.php`.
- Parameter dinamis (`[slug]`, `[lang]`) harus menangani pola regex yang sama dengan backend.

### B. Data Parity
- Seluruh data yang ditampilkan harus berasal dari **Laravel API (backend-api)**, bukan mock lokal.
- Struktur JSON response API harus konsisten dengan kebutuhan view di Next.js untuk menghindari manipulasi data berlebih di frontend.

### C. Visual Parity
- Token desain (warna, radius, shadow, spacing) harus identik dengan `app.css` legacy.
- Tipografi (font-family, weight, line-height) tidak boleh menyimpang.
- Efek premium (glassmorphism, grain texture, mesh gradients) harus direplikasi dengan presisi pixel.

### D. Interaction Parity
- Efek transisi (Framer Motion) harus meniru kecepatan dan kurva easing asli.
- Feedback pengguna (haptic buttons, toast, loading states) harus identik.
- State management (tab aktif, filter, scroll position) harus berperilaku sama.

### E. Auth & Session Parity
- Lifecycle login/logout harus sinkron antara Firebase Auth (Frontend) dan Laravel Sanctum (Backend).
- Pengecekan izin (Admin/User) harus dilakukan secara konsisten di kedua sisi.

### F. SEO & Meta Parity
- Tag Open Graph (WhatsApp/FB/Twitter) harus dihasilkan secara dinamis dan identik dengan logika `app.blade.php`.
- Canonical URL harus menunjuk ke origin utama yang disepakati.

---

## 2. Definition of Done (DoD) per Halaman

Halaman **TIDAK BOLEH** ditandai sebagai `PARITY DONE` jika:
1. Masih ada data statis yang seharusnya dinamis dari API.
2. Alur tulis (Write Actions seperti *Pray*, *Comment*, *Bookmark*) hanya mencetak log ke konsol tanpa persistensi ke MySQL.
3. Pesan error (validasi input, kegagalan koneksi) belum identik atau belum ditangani.
4. Logika redirect setelah aksi (misal: setelah post atau login) berbeda dari legacy.

---

## 3. Aturan Batch Migration

1. **Sequential Domain Locking**: Migrasi dilakukan per domain (misal: VerseHub dulu, lalu Inbox).
2. **Hard Gate**: Dilarang memulai batch domain baru jika batch domain saat ini belum berstatus `PARITY DONE`.
3. **Legacy Priority**: Jika ada perbedaan antara "ide desain baru" dan "legacy behavior", **pilih legacy behavior**. Redesign bukan bagian dari scope ini.

---

## 4. Acceptance Checklist (Manual Verification)

Lakukan pengecekan ini sebelum menandai status selesai:

- [ ] Apakah data sudah ditarik dari `/api/v1/*`?
- [ ] Apakah tombol sudah memiliki efek `.tct-pressable`?
- [ ] Apakah warna `brand` menggunakan variabel HSL yang benar?
- [ ] Apakah halaman mobile (≤ 430px) terlihat identik dengan legacy?
- [ ] Apakah alur "Unauthorized" (user belum login mencoba klik like) sudah benar?
- [ ] Apakah loading skeleton muncul di tempat yang sama dengan legacy?
- [ ] Apakah metadata (title & description) sudah berubah sesuai konten halaman?

---

## 5. Global Blockers (Prioritas P0)

Blokir ini harus diselesaikan sebelum migrasi halaman skala besar dimulai:

1. **Write Logic Bridge**: Membangun endpoint Laravel API untuk semua aksi POST/PATCH/DELETE yang saat ini masih bersifat web-only.
2. **Mentor Data Engine**: Memastikan `VerseHubMentorService` Laravel bisa diakses secara API-first oleh Next.js.
3. **Auth Sync Hardening**: Menyempurnakan alur pertukaran token Firebase ke Sanctum agar tidak ada "session gap" saat pengguna berpindah halaman.
4. **Purge Strategy**: Identifikasi file mana di `backend-api/resources/js` yang sudah bisa dihapus total untuk menghindari redundansi.

---
*Protokol ini bersifat mengikat dan menjadi standar QA untuk setiap Pull Request migrasi.*
