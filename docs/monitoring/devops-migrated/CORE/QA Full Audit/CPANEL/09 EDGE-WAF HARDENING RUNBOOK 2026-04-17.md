# Edge-WAF Hardening Runbook (2026-04-17)

Dokumen ini khusus untuk menutup residual `403 openresty` pada `api.thechoosentalks.org` sampai status akhir benar-benar `FULL PASS`.

## Scope
- Fokus: jalur `https://api.thechoosentalks.org/api/v1/community/posts`.
- Tujuan: `0` residual `403` dalam burst check.
- Non-scope: perubahan fitur aplikasi.

## Gejala Terverifikasi
- Burst check publik menunjukkan intermiten `403`.
- Sampel nyata insiden:
  - `HTTP/1.1 403 Forbidden`
  - `Server: cloudflare`
  - `CF-RAY: 9ed93a859802f920-SIN`
  - Body: `openresty/1.27.1.1`
- Origin access log tidak konsisten mencatat event 403 path tersebut.

Kesimpulan teknis: blok terjadi di layer edge/upstream webshield sebelum request mencapai Laravel.

## Data Uji Terakhir
- Burst 80 request: `200=76`, `403=4`.
- Uji disable ModSecurity domain utama: `200=158`, `403=2` dari 160 request.
- Burn-in pasca restore konfigurasi aman:
  - Batch 1 (80 req): `200=74`, `403=1`, network error `5`
  - Batch 2 (80 req): `200=74`, `403=6`
  - Batch 3 (80 req): `200=78`, `403=2`

Status saat ini: `BELUM FULL PASS`.

## Validasi Cepat (Operator)
```bash
for i in {1..80}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -H "Accept: application/json" \
    -H "User-Agent: Mozilla/5.0" \
    https://api.thechoosentalks.org/api/v1/community/posts
done | sort | uniq -c
```
Pass ketat: hanya `200`.

## Validasi Pembanding (Origin App Health)
```bash
curl -i -H "Host: api.thechoosentalks.org" http://209.42.27.90/api/v1/community/posts
```
Jika origin stabil `200` tapi publik intermiten `403 openresty`, fokus perbaikan harus di edge/webshield.

## Kontrol yang Tersedia dari Akun cPanel (Saat Ini)
```bash
uapi --output=jsonpretty ModSecurity list_domains
```
- Hanya tersedia toggle domain utama (`thechoosentalks.org`) beserta dependencies (`admin`, `api`).
- Tidak ada kontrol granular rule/subdomain via UAPI user-level.
- Uji disable/enable ModSecurity domain utama sudah dilakukan dan residual `403` tetap ada.

## Rencana Hardening yang Direkomendasikan
1. Provider edge/webshield:
   - whitelist traffic API untuk path `/api/v1/community/posts` (minimal read endpoint publik).
   - nonaktifkan challenge/bot-block untuk host `api.thechoosentalks.org` pada endpoint read-only yang aman.
2. Cloudflare rule tuning:
   - buat custom WAF rule host=`api.thechoosentalks.org` + path prefix `/api/v1/community/`.
   - mode `skip managed challenge` untuk read endpoint publik (tetap pertahankan proteksi endpoint auth/write).
3. Jalankan burn-in check:
   - 3 batch x 80 request di waktu berbeda.
   - target semua batch `0x 403`.

## Exit Criteria Full PASS
- Batch check `api.thechoosentalks.org`:
  - Batch 1: `0x 403`
  - Batch 2: `0x 403`
  - Batch 3: `0x 403`
- Endpoint AI utama tetap `200`:
  - `POST /api/v1/renungan/personalize`
  - `POST /api/v1/community/ai/assist` (auth)
  - `POST /api/v1/versehub/id/yoh-3-16/mentor/ask` (auth)

## Catatan Operasional
- Jangan menurunkan proteksi endpoint auth/write.
- Jangan menganggap deploy backend gagal jika hanya residual edge `403` yang terjadi.
- Setelah edge fix diterapkan, ulangi parity report dan ubah status dari `PARTIAL` ke `PASS`.
