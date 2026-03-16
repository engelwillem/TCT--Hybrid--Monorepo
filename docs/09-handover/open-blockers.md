# Open Blockers

## Active Blockers

### 1. Community Smart Composer Unlinked Parameters
- root cause: `CommunityComposer.tsx` belum diimplementasikan untuk menangkap React `useSearchParams` URL `?intent=xyz&ref=abc`.
- file terkait: `src/features/community/components/CommunityComposer.tsx`
- dampak: Komunitas tidak bisa dipakai untuk menyambung Refleksi atau Doa dari halaman Journey/VerseHub.
- langkah verifikasi: Patch parameter intent di Next.js form payload, lalu kirim Feed baru dan cek *Network request 201*.
- status: **BLOCKED**

### 2. Authorization Header cPanel Restriction Risk
- root cause: Apache di cPanel sering memangkas HTTP Header `Authorization: Bearer`.
- file terkait: `backend-api/public/.htaccess`
- dampak: Autentikasi lintas server (*hybrid*) patah (`401 Unauthenticated`) karena header JWT lenyap.
- langkah verifikasi: Patch `CGIPassAuth On` sudah ditambahkan. Lakukan deployment staging dan hit proxy dari UI terotentikasi.
- status: **NEEDS SERVER VALIDATION**

### 3. Stateful Sanctum / CORS Missing Server Origins
- root cause: Berkas `.env` (Legacy dan Local) belum mendefinisikan origin Tencent Edge (*app.thechoosentalks.com*) pada konfigurasi `SANCTUM_STATEFUL_DOMAINS` dan `CORS_ALLOWED_ORIGINS`.
- file terkait: `backend-api/.env`
- dampak: Form submit atau *Fetch API* dari sisi browser publik dipastikan terkena pemblokiran CORS policy *Failed to Fetch*.
- langkah verifikasi: Rilis Next.js UI ke sub-domain Tencent, coba masuk dengan akun lokal valid. Pastikan *Console logs* hijau.
- status: **NEEDS SERVER VALIDATION**

### 4. Canonical Host & SSL Force Routing
- root cause: Pengalihan apex *non-www* `thechoosentalks.org` ke `www.thechoosentalks.org` beserta validasi paksaan *HTTPS* harus ditangani oleh Panel Tencent Edge / CDN untuk mencegah *redirect loop* Node.js Edge. 
- file terkait: Panel Administrasi Tencent Edge / CDN / DNS registrar. (Lokal telah menambal root `next.config.ts` untuk `/` -> `/today`).
- instruksi panel server:
  1. Akses menu **Domain Settings / Page Rules** di konsol Tencent Edge/CDN.
  2. Buat **Rule 1 (HTTPS Enforce)**: Paksa asal skema origin "HTTP" (`http://thechoosentalks.org/` dan `http://www.thechoosentalks.org/`) ter-redirect ke "HTTPS" (Status 301).
  3. Buat **Rule 2 (Apex to WWW)**: Arahkan `https://thechoosentalks.org/*` ke `https://www.thechoosentalks.org/$1` dengan status 301 Permanent. Biarkan argumen rute tersalin utuh ($1/preserve path).
  4. Sangat krusial agar Urutan (*Priority*) dieksekusi dengan mendahulukan HTTPS Force agar rute tidak nyasar.
- dampak: Ketiadaan aturan peladen eksternal ini akan menjebol *Sanctum Session Domain* (sebab HTTP biasa dan apex non-www dinilai sebagai asal rentan oleh Laravel Middleware) yang berpenetrasi ke `419 Page Expired`.
- langkah verifikasi: Lakukan pengunjungan anonim (*incognito*):
  - [ ] `http://thechoosentalks.org` -> harus membelok ke `https://www.thechoosentalks.org/today`
  - [ ] `https://thechoosentalks.org` -> harus membelok ke `https://www.thechoosentalks.org/today`
  - [ ] `https://thechoosentalks.org/community` -> harus membelok ke `https://www.thechoosentalks.org/community`
  - [ ] `https://www.thechoosentalks.org/` -> harus membelok ke `https://www.thechoosentalks.org/today`
- status: **READY FOR SERVER CONFIG**

### 5. Deployment cPanel #21 GitHub Actions Timeout
- root cause: Alamat IP dari peladen *GitHub Actions runners* ditolak oleh *Firewall* (CSF/mod_security) cPanel milik penyedia *hosting*. Titik gagal (*Failure Point*) berada secara nyata pada baris `Upload artifact and deploy scripts`: `ssh: connect to host *** port ***: Connection timed out`.
- file terkait: `.github/workflows/backend-cpanel-deploy.yml` dan konfigurasi *Security Panel* di server cPanel.
- dampak: Pipeline CI/CD `main` menjadi rongsokan dan gagal mengeksekusi otomatisasi skrip `deploy.sh`. Seluruh rilis akan tertahan.
- langkah verifikasi: Setujui rancangan mitigasi jaringan:
  1. (Opsional A) Buka pelacakan IP dinamis GitHub Actions di *Whitelist* CSF Server secara makro.
  2. (Opsional B) Manfaatkan skrip `Action` perantara (*Tailscale/VPN*) jika panel mengizinkan koneksi simetris.
  3. Uji *run ulang* `backend-cpanel-deploy.yml` hingga stempel `scp` sukses merobek masuk.
- status: **BLOCKED**

## Notes
Setiap blocker harus terus dipantau dan statusnya harus dinaikkan dari BLOCKED/NV menjadi PASS/CLOSED pada lembar ini beserta `06-testing/parity/*-diff-log.md` terkait.
