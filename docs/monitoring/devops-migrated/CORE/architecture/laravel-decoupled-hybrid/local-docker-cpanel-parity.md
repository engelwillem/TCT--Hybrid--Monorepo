# Local Docker cPanel Parity

Status: historical working note. Untuk acuan resmi parity terbaru, gunakan:
- [blueprint.md](/e:/thechoosentalksnext/docs/core/architecture/laravel-decoupled-hybrid/blueprint.md)
- [USING DOCKER.md](/e:/thechoosentalksnext/docs/core/architecture/laravel-decoupled-hybrid/USING%20DOCKER.md)

Tujuan setup ini adalah membuat lokal lebih dekat ke runtime production yang sekarang:

- Next.js jalan di container sendiri pada `9002`
- Laravel jalan di container sendiri pada `8000`
- MariaDB, Redis, dan Mailpit ikut aktif
- Next proxy ke Laravel memakai jalur internal container, tetapi browser tetap menerima URL lokal yang benar

## File baru

- [`docker-compose.yml`](/e:/thechoosentalksnext/docker-compose.yml)
- [`docker/backend/Dockerfile`](/e:/thechoosentalksnext/docker/backend/Dockerfile)
- [`docker/backend/start.sh`](/e:/thechoosentalksnext/docker/backend/start.sh)
- [`docker/frontend/Dockerfile`](/e:/thechoosentalksnext/docker/frontend/Dockerfile)
- [`docker/frontend/start.sh`](/e:/thechoosentalksnext/docker/frontend/start.sh)
- [`.env.docker.example`](/e:/thechoosentalksnext/.env.docker.example)
- [`backend-api/.env.docker.example`](/e:/thechoosentalksnext/backend-api/.env.docker.example)

## Kenapa ini lebih parity

- Laravel lokal diarahkan ke engine MariaDB seperti production
- media, Sanctum, dan proxy Next -> Laravel berjalan lewat origin yang dipisah
- browser mengakses `localhost`, sementara server-to-server di Docker mengakses nama service container
- backend tidak lagi bergantung pada `php artisan serve` host machine

## Cara pakai

1. Opsi cepat:
   - `docker compose up --build`
2. Opsi parity yang lebih rapi dengan env lokal terpisah:
   - `Copy-Item .env.docker.example .env.docker`
   - `Copy-Item backend-api/.env.docker.example backend-api/.env.docker`
   - PowerShell:
     `$env:FRONTEND_ENV_FILE='.env.docker'`
     `$env:BACKEND_ENV_FILE='backend-api/.env.docker'`
   - lalu jalankan:
     `docker compose up --build`
3. Buka:
   - Frontend: `http://localhost:9002`
   - Backend: `http://localhost:8000`
   - MariaDB host access: `localhost:3307`
   - Mailpit: `http://localhost:8025`

## Catatan penting

- Compose default membaca file example agar setup bisa langsung hidup, tetapi bisa diarahkan ke `.env.docker` dan `backend-api/.env.docker` lewat `FRONTEND_ENV_FILE` dan `BACKEND_ENV_FILE`.
- Setup ini meniru runtime app dan dependency stack, bukan panel cPanel UI-nya.
- Release-based symlink deploy cPanel tetap khas server, jadi yang diparity-kan di lokal adalah service topology dan environment contract-nya.
