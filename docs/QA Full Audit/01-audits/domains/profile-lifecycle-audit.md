# Tencent Edge Pages Failure Differential Audit - 2026-03-20

## 1. Executive Summary
Audit ini bertujuan untuk mengidentifikasi penyebab kegagalan pembuildan (*deployment*) pada **Tencent Edge Pages** (Edge Functions) meskipun **GitHub Actions** memberikan status hijau (*PASS*). Berdasarkan analisis perbandingan konfigurasi, kemungkinan besar kegagalan disebabkan oleh perbedaan lingkungan runtime, ekspektasi struktur output (terkait `output: 'standalone'`), atau *silent errors* yang disamarkan oleh flag `ignoreBuildErrors` di `next.config.ts`.

## 2. Symptom Summary
| Environment | Status | Command Executed | Note |
| :--- | :---: | :--- | :--- |
| **Local Machine** | ✅ PASS | `npm run build` | Sukses menghasilkan `.next`. |
| **GitHub Actions**| ✅ PASS | `npm run build` | Lulus karena `ignoreBuildErrors: true`. |
| **Tencent Edge** | ❌ FAIL | Built-in build pipeline | Status: "Failed" pada commit `26ecb73` & `79c0d52`. |

## 3. Why GitHub Actions Passes but Tencent Deploy Fails
GitHub Actions dalam workflow saat ini berfungsi sebagai *sanity check* dasar, namun memiliki beberapa kelemahan yang membuatnya "terlalu permisif":
1.  **Node.js 20 Explicit:** GitHub menggunakan `node-version: '20'`, sementara Tencent mungkin menggunakan default yang lebih rendah (Node 16/18) jika tidak dikonfigurasi secara manual.
2.  **Ignore Errors:** Keberadaan `ignoreBuildErrors: true` di `next.config.ts` menyebabkan build di CI tetap sukses meskipun ada error TypeScript atau ESLint. Tencent mungkin memiliki pengecekan internal yang lebih ketat atau gagal saat proses pengunggahan aset yang rusak.
3.  **Agnostic Output:** GitHub hanya menjalankan script build, tidak memvalidasi apakah output tersebut kompatibel dengan target hosting tertentu.

## 4. Ranked Likely Causes

### Hypothesis 1: output: 'standalone' Incompatibility (HIGH)
- **Detail:** `next.config.ts` menggunakan `output: 'standalone'`. Banyak platform Edge Pages (seperti Cloudflare Pages atau Tencent Edge EO versi lama) mengharapkan output standar atau statis (`output: 'export'`) atau struktur `.next` yang dapat di-zip secara utuh.
- **Risk:** Struktur `standalone` memindahkan server core ke `.next/standalone`, yang mungkin tidak dikenali oleh Tencent Pages builder sebagai model runtime serverless yang valid.

### Hypothesis 2: Node.js Runtime Version Mismatch (HIGH)
- **Detail:** Next.js 15 memerlukan Node.js minimal 18.18+ atau 20.x+.
- **Risk:** Jika Tencent Edge Pages menggunakan runner default (misal Node 14 atau 16), build akan gagal di tahap awal dengan error syntax (ESM/Import) atau ketidakcocokan package.

### Hypothesis 3: Build Command & Pathing (MEDIUM)
- **Detail:** `package.json` memiliki script build kustom: `"next build && node scripts/mirror-encoded-next-chunks.mjs"`.
- **Risk:** Tencent mungkin hanya menjalankan `next build` saja atau gagal saat mengeksekusi script Node tambahan karena pembatasan akses tulis pada sistem file selama proses build di sandbox cloud.

### Hypothesis 4: Environment Variables (MEDIUM)
- **Detail:** Next.js sering melakukan *optimization* saat build-time yang membutuhkan variabel lingkungan tertentu (seperti API URLs).
- **Risk:** Jika Tencent tidak memiliki variabel lingkungan yang sama dengan GitHub/Lokal, build mungkin menghasilkan artefak yang rusak atau gagal memvalidasi routing statis.

## 5. Evidence by File / Config

### A. `next.config.ts`
- **Output:** `standalone`. Ini adalah pengoptimalan untuk Docker, namun sering kali bermasalah di platform jamak-fungsi (Edge Functions) jika platform tersebut memiliki logikanya sendiri untuk memaketkan Next.js.
- **Strictness:** `ignoreBuildErrors: true` adalah "silent killer" yang membuat CI terlihat sehat padahal ada bug tipedata yang mungkin fatal bagi Tencent builder.

### B. `package.json`
- **Next.js Version:** `^15.2.0` (Masa depan/sangat baru). Memerlukan runtime yang sangat mutakhir.
- **Custom Script:** Mirroring chunk secara manual (`mirror-encoded-next-chunks.mjs`) mengintervensi isi folder `.next`. Jika Tencent builder memiliki mekanisme *caching* atau *checksum* aset, intervensi ini bisa dianggap sebagai korupsi file.

### C. Repository Structure
- **Hybrid Monorepo:** Adanya folder `backend-api/` di root bisa membingungkan sistem deteksi otomatis Tencent (apakah ini Laravel atau Next.js?).

## 6. What to Verify in Tencent Dashboard
1.  **Build Logs:** Cek apakah kegagalan terjadi di tahap `npm install`, `next build`, atau di tahap *deployment/upload* (Post-build).
2.  **Node.js Settings:** Pastikan versi Node.js yang digunakan adalah **20.x**.
3.  **Framework Preset:** Pilih preset "Next.js" (App Router) secara eksplisit.
4.  **Output Directory:** Verisikasi apakah Tencent mengharapkan `.next` atau `standalone` folder.
5.  **Build Command:** Masukkan secara manual: `npm install && npm run build`.

## 7. Recommended Codex Patch Direction
1.  **Normalize Build:** Matikan `output: 'standalone'` untuk sementara untuk melihat apakah model build standar Next.js lebih diterima oleh Tencent.
2.  **Enforce Strictness:** Matikan `ignoreBuildErrors` di `next.config.ts` untuk memaksakan GitHub Actions gagal jika ada error nyata.
3.  **Check Engine Alignment:** Tambahkan `"engines": { "node": ">=20" }` di `package.json`.

## 8. Final Status
**PASS**
*Penyebab kegagalan paling mungkin (Inkompatibilitas Standalone & Node Version mismatch) telah didokumentasikan sebagai hipotesis utama.*

