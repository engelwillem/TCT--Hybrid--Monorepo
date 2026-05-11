# Parity Report Prod-Local (2026-04-17)

Dokumen ini merangkum hasil verifikasi parity antara local repo dan production cPanel setelah sinkronisasi terbaru.

## Ringkasan Eksekutif
- Status umum: `DEPLOY-READY` untuk backend + AI OpenAI.
- OpenAI key production: `ACTIVE`.
- Runtime mentor driver binding: `App\Services\Mentor\OpenAIMentorDriver`.
- Migration parity: `PASS` (semua migration terbaru status Ran).
- Endpoint API utama: `PASS`.
- Catatan residual: masih teramati intermiten `403 openresty` pada `api.thechoosentalks.org` saat burst check tertentu.

## Bukti Parity

### 1. Code/Migration Parity
- Local migration latest cocok dengan production release aktif.
- Production active release: `20260417040747`.
- `php artisan migrate:status` production: migration terbaru 2026-04-16 status `Ran`.

Hasil: `PASS`.

### 2. AI Runtime Parity
- `renungan_mentor.driver = auto`
- `versehub_mentor.driver = auto`
- `renungan_mentor.openai.api_key present = true`
- Binding mentor driver = `OpenAIMentorDriver`

Hasil: `PASS`.

### 3. Smoke Test Backend Origin
- `POST /api/v1/renungan/personalize` -> `200`, `driver=openai`, `used_fallback=false`
- `POST /api/v1/community/ai/assist` (auth) -> `200`, `used_fallback=false`
- `POST /api/v1/versehub/id/yoh-3-16/mentor/ask` (auth) -> `200`, jawaban valid
- `GET /api/v1/community/posts` -> `200`

Hasil: `PASS`.

### 4. Smoke Test Public Domain
- `https://www.thechoosentalks.org/api/community/posts` -> `200`
- `https://www.thechoosentalks.org/api/renungan/personalize` -> `200`
- `https://www.thechoosentalks.org/api/versehub/id/yoh-3-16/mentor` -> `200`

Hasil: `PASS`.

### 5. Edge Stability Note
- Loop check `https://api.thechoosentalks.org/api/v1/community/posts` mayoritas `200`.
- Masih sempat muncul `403 Forbidden openresty` secara intermiten.

Hasil: `PARTIAL` (non-blocking untuk deploy backend saat ini, tapi perlu penanganan edge/WAF agar benar-benar stabil 100%).

### 6. Forensic Tambahan (2026-04-17)
- Burst check 80 request: `200=76`, `403=4` (tanpa perubahan aplikasi).
- Event 403 capture:
  - Status: `HTTP/1.1 403 Forbidden`
  - Header: `Server: cloudflare`
  - Header: `CF-RAY: 9ed93a859802f920-SIN`
  - Body signature: `openresty/1.27.1.1`
- Uji toggle `ModSecurity` domain utama (`thechoosentalks.org`) tidak menghilangkan masalah:
  - Saat disable: burst 160 request -> `200=158`, `403=2`
  - Kesimpulan: residual `403` bukan semata dari toggle ModSecurity cPanel.
- Burn-in 3 batch (masing-masing 80 request) pasca restore konfigurasi aman:
  - Batch 1: `200=74`, `403=1`, `error koneksi=5`
  - Batch 2: `200=74`, `403=6`
  - Batch 3: `200=78`, `403=2`

Hasil: `PARTIAL-CONFIRMED` (root cause berada di upstream edge/webshield path, bukan runtime Laravel).

## Keputusan Operasional
- Backend API dan OpenAI key **sudah bisa dianggap siap deploy operasional**.
- Untuk target "pass semua" secara ketat di layer edge, perlu tindak lanjut konfigurasi WAF/CDN pada host `api.thechoosentalks.org`.

## Next Action (Prioritas)
1. Jalankan runbook `09 EDGE-WAF HARDENING RUNBOOK 2026-04-17.md`.
2. Eskalasi ke provider edge/webshield untuk whitelist/tuning pada host `api.thechoosentalks.org`.
3. Lock checklist post-deploy wajib: `deploy.sh -> migrate --force -> config clear/cache -> smoke test`.
4. Pantau 24 jam log akses + error untuk memastikan tidak ada fallback AI kembali.
