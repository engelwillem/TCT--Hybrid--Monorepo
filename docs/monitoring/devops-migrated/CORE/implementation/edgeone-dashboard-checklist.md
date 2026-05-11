# EdgeOne Dashboard Checklist

Checklist ini khusus untuk operator yang memegang dashboard EdgeOne/Tencent Pages. Scope-nya hanya:

- domain mapping
- apex redirect ke `www`
- `robots.txt`
- `sitemap.xml`
- staging / non-primary `noindex`

Jangan gunakan checklist ini untuk deploy backend cPanel, auth, atau perubahan UI.

## 1. Identifikasi Domain

- Domain utama yang harus dilayani aplikasi: `www.thechoosentalks.org`
- Apex domain yang harus hanya redirect: `thechoosentalks.org`
- Host staging / preview:
  - isi nama host staging yang aktif di dashboard
  - isi nama host preview bawaan EdgeOne jika ada

## 2. Domain Mapping

- Buka project frontend di EdgeOne Pages.
- Masuk ke `Custom Domains` atau menu setara.
- Pastikan `www.thechoosentalks.org` statusnya `Active`.
- Pastikan `thechoosentalks.org` juga terdaftar.
- Jika ada opsi `Primary Domain`, pilih `www.thechoosentalks.org`.
- Jangan jadikan apex sebagai primary domain.

## 3. Redirect Apex ke WWW

- Buka `Rules`, `Redirect Rules`, atau `Edge Rules`.
- Buat rule baru dengan nama: `Apex to WWW`
- Condition:
  - `Host equals thechoosentalks.org`
- Action:
  - `Redirect`
- Status code:
  - `301` atau `308`
- Target:
  - `https://www.thechoosentalks.org$uri$is_args$args`

### Yang wajib dipastikan

- path dipertahankan
- query string dipertahankan
- rule ini hanya match apex
- rule ini tidak match `www.thechoosentalks.org`

## 4. Cek Redirect Conflict

- Cari semua rule wildcard yang menyentuh host/domain:
  - `/*`
  - `*.txt`
  - `*.xml`
  - redirect global ke host yang sama
- Pastikan tidak ada rule yang bisa membuat self-redirect untuk:
  - `https://www.thechoosentalks.org/robots.txt`
  - `https://www.thechoosentalks.org/sitemap.xml`

### Jika ada rule seperti ini

- redirect semua request ke `https://www.thechoosentalks.org$uri`
- redirect semua `.txt`
- redirect semua `.xml`

maka rule itu harus:

- dibatasi hanya untuk host apex
- atau diberi pengecualian eksplisit untuk `/robots.txt` dan `/sitemap.xml`

## 5. Robots dan Sitemap Tidak Boleh Ditimpa Edge Rule

- Cari rule khusus untuk path:
  - `/robots.txt`
  - `/sitemap.xml`
- Expected:
  - host `www` harus melayani file apa adanya tanpa redirect loop
  - host staging/non-primary boleh ditimpa untuk noindex protection

## 6. Cache Rule

- Buka `Cache Rules`.
- Cari rule `Cache Everything` atau rule path-based cache.
- Pastikan `/robots.txt` dan `/sitemap.xml` tidak terkena redirect/cache aneh.

### Jika perlu buat bypass rule

- Condition:
  - `Path equals /robots.txt`
  - OR `Path equals /sitemap.xml`
- Action:
  - `Bypass Cache`
  - atau `Do not rewrite / redirect`

## 7. Header Rule untuk Staging / Non-Primary

- Buka `Response Header Rules`, `Transform Rules`, atau menu setara.
- Buat rule baru dengan nama: `Staging Noindex`
- Condition:
  - `Host does not equal www.thechoosentalks.org`
  - AND `Host does not equal thechoosentalks.org`
- Action:
  - set header `X-Robots-Tag`
- Value:
  - `noindex, nofollow, noarchive`

### Expected result

- semua host non-primary mengirim header:
  - `X-Robots-Tag: noindex, nofollow, noarchive`

## 8. Jika Staging Bisa Diproteksi

- Jika dashboard menyediakan access protection / password protection:
  - aktifkan untuk host staging
- Jika fitur itu aktif:
  - tetap pertahankan `X-Robots-Tag`

## 9. Purge Cache Setelah Save

- Setelah rule dan domain mapping disimpan, lakukan purge cache:
  - `/`
  - `/robots.txt`
  - `/sitemap.xml`
- Jika hanya tersedia full purge:
  - lakukan full purge sekali

## 10. Verifikasi Manual Pasca-Fix

### Domain utama

- `https://www.thechoosentalks.org/robots.txt`
  - harus `200`
  - tidak boleh loop `308`
- `https://www.thechoosentalks.org/sitemap.xml`
  - harus `200`
  - tidak boleh loop `308`

### Apex

- `https://thechoosentalks.org/`
  - harus redirect ke `https://www.thechoosentalks.org/`
- `https://thechoosentalks.org/community?x=1`
  - harus redirect ke `https://www.thechoosentalks.org/community?x=1`

### Staging

- host staging `/`
  - harus punya `X-Robots-Tag: noindex, nofollow, noarchive`
- host staging `/robots.txt`
  - minimal harus non-indexable
- host staging `/sitemap.xml`
  - tidak boleh berisi URL indexable production

## 11. Failure Guide

### Jika `robots.txt` atau `sitemap.xml` masih loop

- cek rule wildcard host redirect
- cek rule `.txt` / `.xml`
- cek cache rule
- purge cache lagi setelah rule dibersihkan

### Jika apex masih `200`

- cek apakah apex benar-benar masuk project/domain mapping
- cek apakah redirect rule match host apex
- cek apakah ada rule lain yang override redirect

### Jika staging header tidak muncul

- cek condition host rule
- cek urutan rule
- cek apakah ada proxy/header overwrite di edge
