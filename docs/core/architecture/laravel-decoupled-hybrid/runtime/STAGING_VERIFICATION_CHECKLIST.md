# Staging Verification Checklist 🚧

**Konteks**: Checklist wajib ini dieksekusi oleh tim DevOps / QA tepat **sebelum** dan **sesudah** proses _push_ branch `main` (pasca-Wave 1 Purge) dinaikkan ke environment Staging atau Production. Tujuannya adalah memastikan lingkungan hosting asli tidak suffer dari *miss-configuration* port.

---

## Tahap 1: Persiapan Environment Variables (ENV)

Sebelum melakukan `git pull` atau deploy pada server Staging/Production, ubah/konfirmasi pengaturan `.env` pada Root Dir (Next.js) dan direktori Backend API (Laravel).

### 1-A. Backend API (`backend-api/.env`)
Pastikan variabel baru penunjuk host Frontend (Next.js) terisi secara mutlak.
- [ ] `NEXT_PUBLIC_APP_URL` telah diisi valid (Contoh: `NEXT_PUBLIC_APP_URL=https://thechoosentalks.org`).

### 1-B. Frontend Next.js (`.env.local` atau `.env.production`)
Pastikan variabel *proxy bridge* menunjuk kepada base Laravel yang *live*.
- [ ] `NEXT_PUBLIC_APP_URL` sesuai domain.
- [ ] `LARAVEL_API_BASE_URL` dan `NEXT_PUBLIC_LARAVEL_API_BASE_URL` tidak terkunci ke `127.0.0.1:8000` (Ganti dengan *IP Server API* atau sub-domain `api.thechoosentalks.org`).

---

## Tahap 2: Build & Booting

Jalankan perintah build pada server Staging.
- [ ] Eksekusi `npm run build` di root proyek berjalan tanpa *Type error*.
- [ ] Eksekusi `npm run build` di dalam folder `backend-api` (Vite) berjalan tanpa *Tailwind/PostCSS Error* (Kode keluar 0).
- [ ] Proses PM2 (atau Daemon Node) berstatus *online* tanpa crash loop.
- [ ] PHP FPM/Nginx melayani Laravel dengan *HTTP 200/302* tanpa error logs yang baru pada `storage/logs/laravel.log`.

---

## Tahap 3: Post-Deploy Smoke Test (Live URL)

Navigasikan ke domain/sub-domain live Anda menggunakan jendela samaran (Incognito Mode). Uji jalur migrasi fital ini:

### Redirect Test (Lolos Middlewares)
- [ ] Test Akses URL: `https://<DOMAIN-BE-ANDA>/community`
  *Harapan:* Ter-_redirect_ otomatis (HTTP 302/301) ke domain utama versi Next.js tanpa nyangkut di halaman Login Laravel.
- [ ] Test Akses URL: `https://<DOMAIN-BE-ANDA>/today`
  *Harapan:* Diteruskan spontan ke platform Next.js.
  
### Render Test (Konektivitas Proxy)
- [ ] Kunjungi *VerseHub Reader* (Misalnya chapter populer `kej-1`). Pastikan narasi Alkitab ter-render penuh untuk mencegah regresi *Backend Unavailable* seperti kejadian pada uji port lokal.

### Admin Protection
- [ ] Buka `https://<DOMAIN-BE-ANDA>/admintalk` atau `/admintalk/login`. Pastikan masih melayani dashboard *Filament* dan login flow murni 100% responsif dengan styling tailwind dasar tidak pecah.

---

Jika seluruh centang di atas **PASS**, maka aplikasi Anda tervalidasi siap menerima lonjakan traffic SEO murni sebagai ekosistem _Hybrid Decoupled_.
