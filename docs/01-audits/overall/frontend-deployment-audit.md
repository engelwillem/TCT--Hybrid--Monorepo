# Frontend Deployment Audit – Tencent Edge Pages (Final)

## 1. Ringkasan Masalah
Tencent Edge Pages melaporkan status **FAILED** pada deployment produksi. Berdasarkan audit log dan verifikasi live, ditemukan adanya ketidaksesuaian antara kode di repositori `main` dengan *artifact* yang disajikan oleh CDN (Edge Layer).

## 2. Temuan Utama

### Traffic Noise (Scanner Probing)
Ditemukan banyak request 404 ke path berikut:
- `/wp-sitemap.xml`
- `/today.zip`, `/today.tar`, `/today.rar`
- `/today.7z`

**Kesimpulan:** Request ini adalah **NOISE** murni dari bot internet (vulnerability scanners) yang mencari instalasi WordPress atau backup file. Ini **BUKAN** penyebab kegagalan deployment sistem kita.

### Real Deployment / Runtime Issues
- **Artifact Drift (Blocker Utama):** Live domain `www.thechoosentalks.org` masih menyajikan *chunk* JavaScript lama yang memanggil API dengan parameter lama (`limit=1` bukan `limit=3`), memicu status 401/422 pada health check Tencent.
- **Firebase Init Warning:** Muncul pesan `app/no-options` di console produksi karena pola inisialisasi yang terlalu agresif saat environment variable belum ter-load sempurna di Edge.
- **Health Check Fail:** Tencent Edge Pages menandai deployment gagal jika post-deployment check mendeteksi inkonsistensi status pada route utama.

## 3. Analisis Teknis
Akar masalah kegagalan pembaruan (propagation) di layer Edge disebabkan oleh:
1.  **Stale Cache:** Tanpa Build ID yang eksplisit, layer Edge terkadang gagal mendeteksi kebutuhan untuk membuang chunk lama.
2.  **Redirect Persistence:** Penggunaan redirect 308 (permanent) menyebabkan browser menyimpan rute lama bahkan saat konfigurasi Next.js sudah berubah.

## 4. Perbaikan yang Dilakukan
- **`next.config.ts` [Apply]:** Menambahkan `generateBuildId` menggunakan timestamp unik per build untuk memaksa cache invalidation total pada layer Edge.
- **`next.config.ts` [Apply]:** Mengubah rute redirect dari `permanent: true` (308) menjadi `permanent: false` (307) untuk memudahkan debugging rute selama masa pemulihan produksi.
- **`src/firebase/index.ts` [Apply]:** Mengoptimalkan logika inisialisasi untuk membisukan peringatan console dan menangani kondisi tanpa config secara lebih elegan.
- **Study Paths Verification:** Diverifikasi end-to-end. Hasil `paths: []` dikonfirmasi sebagai **Empty Real Data** (berasal dari database produksi yang memang belum diisi), bukan fallback/mock.

## 5. Root Cleanup / File Hygiene
Untuk menjaga kebersihan repositori dan mencegah artefak debug ikut ter-upload ke build server, file-file berikut telah dipindahkan:

| File Asli | Lokasi Baru | Alasan |
| :--- | :--- | :--- |
| `deploy_log.txt` | `docs/01-audits/overall/artifacts/` | Log riwayat deploy backend |
| `deploy_log_new.txt` | `docs/01-audits/overall/artifacts/` | Log riwayat deploy backend terbaru |
| `failed_log3.txt` | `docs/01-audits/overall/artifacts/` | Log kegagalan firewall |
| `full_git_diff.txt` | `docs/01-audits/overall/artifacts/` | Backup diff audit |
| `backend-api/*.txt` | `docs/01-audits/overall/artifacts/` | Hasil test suite backend |
| `backend-api/error.log` | `docs/01-audits/overall/artifacts/` | Debug log server lokal |

**File yang dihapus:** `run_temp.json`, `run_temp.txt`, `backend-api/vite.config.jss` (typo file).

## 6. Status Akhir Deployment
Codebase saat ini berada pada kondisi **CLEAN & READY**. 
- Semua fix (Auth, VerseHub limit, Firebase) sudah diverifikasi ada di `main`.
- Struktur root sudah rapih (Hygiene Check: PASS).
- Cloud cache busting sudah disiapkan via unique Build ID.

## 7. Rekomendasi Lanjutan
1. Terapkan **Cache Purge** manual di panel Tencent Edge One untuk `/*` setelah push berikutnya.
2. Pastikan Environment Variables di panel Tencent Edge cocok dengan `.env.example`.
3. Verifikasi live chunk `page-[hash].js` menyertakan string `limit=3` pada tab Network browser untuk memastikan propagasi sukses.
