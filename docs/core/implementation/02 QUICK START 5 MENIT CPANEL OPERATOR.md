# Quick Start 5 Menit cPanel Operator

Dokumen ini adalah versi paling singkat untuk operator yang butuh orientasi cepat.

Kalau setelah membaca ini Anda masih bingung, lanjut ke:
- [01 READING ORDER CPANEL OPERATOR PACKAGE.md](e:/thechoosentalksnext/docs/CORE/implementation/01%20READING%20ORDER%20CPANEL%20OPERATOR%20PACKAGE.md)
- [05 GUIDE BOOK FULL END-TO-END CPANEL MAPPING.md](e:/thechoosentalksnext/docs/CORE/implementation/05%20GUIDE%20BOOK%20FULL%20END-TO-END%20CPANEL%20MAPPING.md)

## 1. Yang Wajib Anda Tahu

Project ini punya dua flow berbeda:

- frontend:
  - auto-redeploy dari `main`
- backend:
  - tidak auto-deploy
  - harus dideploy manual via cPanel / SSH

Artinya:

- push ke GitHub belum otomatis mengubah runtime Laravel
- Anda tetap harus menjalankan deploy backend di server

## 2. Lokasi Penting Server

- deploy root:
  - `/home/thechoosentalks/deploy/apps/thechoosentalks`
- public root:
  - `/home/thechoosentalks/public_html`
- runtime aktif:
  - `/home/thechoosentalks/deploy/apps/thechoosentalks/current`
- state bersama:
  - `/home/thechoosentalks/deploy/apps/thechoosentalks/shared/.env`
  - `/home/thechoosentalks/deploy/apps/thechoosentalks/shared/storage`

## 3. Command Audit Paling Dasar

```bash
whoami
pwd
cd /home/thechoosentalks/deploy/apps/thechoosentalks || exit 1
readlink -f current
ls -la shared
```

## 4. Command Deploy Backend Paling Penting

```bash
set -euo pipefail

cd /home/thechoosentalks/deploy/apps/thechoosentalks || exit 1
bash -n deploy.sh
bash -n rollback.sh
HEALTHCHECK_BASE_URL="https://api.thechoosentalks.org" bash deploy.sh
readlink -f current
```

## 5. Command Rollback Paling Penting

```bash
set -euo pipefail

cd /home/thechoosentalks/deploy/apps/thechoosentalks || exit 1
bash rollback.sh
readlink -f current
```

## 6. Verifikasi Setelah Deploy

```bash
cd "$(readlink -f /home/thechoosentalks/deploy/apps/thechoosentalks/current)" || exit 1
php artisan route:list | grep -E "api/today/session|api/v1/login|api/v1/register|api/v1/profile" || true
curl -I https://api.thechoosentalks.org/api/today/session
```

## 7. Kalau Anda Mau Belajar Serius

Baca urutan ini:

1. [03 PULL & DEPLOY GIT CPANEL.MD](e:/thechoosentalksnext/docs/CORE/implementation/03%20PULL%20%26%20DEPLOY%20GIT%20CPANEL.MD)
2. [05 GUIDE BOOK FULL END-TO-END CPANEL MAPPING.md](e:/thechoosentalksnext/docs/CORE/implementation/05%20GUIDE%20BOOK%20FULL%20END-TO-END%20CPANEL%20MAPPING.md)
3. [04 SCRIPT PULL & DEPLOY GIT CPANEL.MD](e:/thechoosentalksnext/docs/CORE/implementation/04%20SCRIPT%20PULL%20%26%20DEPLOY%20GIT%20CPANEL.MD)
4. [06 CPANEL SERVER FULL MAIN BLUEPRINT MAP.md](e:/thechoosentalksnext/docs/CORE/implementation/06%20CPANEL%20SERVER%20FULL%20MAIN%20BLUEPRINT%20MAP.md)
