# Laporan Validasi Hosting Backend
**Project:** TCT Hybrid Monorepo  
**Tanggal:** 2026-03-18

## Ringkasan
Host backend telah **valid di level hosting** untuk kedua endpoint berikut:

- `api.thechoosentalks.org`
- `admin.thechoosentalks.org`

Keduanya sudah dibuat di cPanel, diarahkan ke docroot yang sama (`/home/thechoosentalks/public_html`), dan berhasil memproses request ke Laravel release aktif melalui bridge `public_html/index.php`.

## Temuan Utama
Validasi yang sudah terbukti:

1. **Virtual host aktif**
   - `api.thechoosentalks.org` aktif di hosting
   - `admin.thechoosentalks.org` aktif di hosting

2. **Docroot benar**
   - Kedua host menggunakan:
     - `/home/thechoosentalks/public_html`

3. **Bridge Laravel aktif**
   - `public_html/index.php` me-load:
     - `/home/thechoosentalks/deploy/apps/thechoosentalks/current/public/index.php`

4. **Route backend merespons benar**
   - `/` → `200 OK`
   - `/api/v1/today` → `200 OK`
   - `/admintalk/login` → `200 OK`

5. **HTTPS listener aktif di level host**
   - Probe ke host header `api.thechoosentalks.org` dan `admin.thechoosentalks.org` melalui HTTPS berhasil memberi respons `200`

## Bukti Validasi
### API host
Hasil probe host header ke IP backend `209.42.27.90` dengan `Host: api.thechoosentalks.org` menunjukkan:

- `http://209.42.27.90/` → `200 OK`
- `http://209.42.27.90/api/v1/today` → `200 OK`
- `http://209.42.27.90/admintalk/login` → `200 OK`
- `https://209.42.27.90/` → `200 OK`
- `https://209.42.27.90/api/v1/today` → `200 OK`
- `https://209.42.27.90/admintalk/login` → `200 OK`

### Admin host
Hasil probe host header ke IP backend `209.42.27.90` dengan `Host: admin.thechoosentalks.org` menunjukkan:

- `http://209.42.27.90/` → `200 OK`
- `http://209.42.27.90/api/v1/today` → `200 OK`
- `http://209.42.27.90/admintalk/login` → `200 OK`
- `https://209.42.27.90/` → `200 OK`
- `https://209.42.27.90/api/v1/today` → `200 OK`
- `https://209.42.27.90/admintalk/login` → `200 OK`

## Status DNS
### Sudah benar secara authoritative
Record DNS berikut sudah dibuat:

- `api.thechoosentalks.org -> 209.42.27.90`
- `admin.thechoosentalks.org -> 209.42.27.90`

### Catatan
Pada saat audit, resolver lokal server masih sempat membaca `NXDOMAIN` untuk subdomain baru. Namun authoritative nameserver sudah mengembalikan record yang benar. Ini berarti masalahnya ada pada **cache/propagation resolver**, bukan pada konfigurasi zone.

## Kesimpulan Arsitektur
Susunan hosting backend saat ini sudah sejalan dengan arah repo hybrid decoupled:

- `www.thechoosentalks.org` → frontend public (Tencent Edge One Pages)
- `api.thechoosentalks.org` → backend Laravel API (cPanel)
- `admin.thechoosentalks.org` → backend admin Filament (cPanel)

Ini sesuai pola arsitektur decoupled yang paling aman untuk project ini, karena memisahkan:

- frontend public
- API backend
- admin backend

## Kesimpulan Final
**Backend host valid di level hosting** untuk:

- `api.thechoosentalks.org`
- `admin.thechoosentalks.org`

Kedua host sudah:

- terdaftar di cPanel
- diarahkan ke docroot yang benar
- mencapai Laravel release aktif
- merespons endpoint API dan admin dengan benar
- siap untuk tahap berikutnya: finalisasi DNS propagation publik, SSL final host-based, dan sinkronisasi `.env` production

## Next Step yang logis setelah laporan ini
1. verifikasi resolusi publik penuh untuk `api.` dan `admin.`
2. finalisasi SSL/HTTPS real-host
3. update `.env` backend agar memakai topology final:
   - `APP_URL`
   - `FRONTEND_URL`
   - `CORS_ALLOWED_ORIGINS`
   - `SANCTUM_STATEFUL_DOMAINS`
4. validasi integrasi frontend Tencent → backend cPanel
