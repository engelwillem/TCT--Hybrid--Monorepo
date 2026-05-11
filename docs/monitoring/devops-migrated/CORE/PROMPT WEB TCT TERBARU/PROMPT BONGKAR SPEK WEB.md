prompt untuk Codex yang tugasnya membongkar seluruh spek web kamu dan environment cPanel secara lengkap.

Saya ingin kamu melakukan AUDIT TOTAL terhadap stack web saya agar environment LOCAL bisa diparitykan sedekat mungkin dengan environment PRODUCTION di cPanel.

Tujuan audit ini:
1. Membongkar seluruh spesifikasi teknis aplikasi saya
2. Membongkar seluruh spesifikasi environment cPanel / hosting saya
3. Mengidentifikasi GAP antara local dan production
4. Menghasilkan data mentah yang lengkap agar ChatGPT bisa menyusun arsitektur Docker local yang parity dengan production
5. Fokus utamanya adalah mencegah kasus: “jalan di local, rusak / beda tampilan / beda perilaku di production”

Konteks aplikasi saya:
- Arsitektur: hybrid decoupled
- Backend: Laravel
- Frontend: Next.js
- Backend dan frontend terpisah
- Production saat ini di cPanel
- Saya ingin local memakai Docker
- Saya ingin hasil deploy ke cPanel semirip mungkin dengan local, minim perbedaan perilaku

TUGASMU:
Jangan langsung memberi solusi.
Jangan langsung membuat Dockerfile.
Jangan berasumsi.
Kamu hanya bertugas mengumpulkan, merapikan, dan melaporkan data teknis sedetail mungkin.

OUTPUT YANG SAYA MAU:
Buat laporan audit yang sangat terstruktur dengan heading dan tabel bila perlu.
Pisahkan dengan jelas:
- Fakta yang sudah terverifikasi
- Fakta yang belum terverifikasi
- Dugaan / asumsi
- Risiko parity

Kalau ada data yang tidak tersedia, tandai sebagai:
- MISSING
- NEED VERIFICATION
- UNKNOWN

==================================================
A. IDENTITAS DAN STRUKTUR PROYEK
==================================================

Kumpulkan dan laporkan:

1. Struktur repo / folder
- Root project
- Folder backend Laravel
- Folder frontend Next.js
- Apakah monorepo atau multi-repo
- File penting yang ada:
  - package.json
  - package-lock.json / yarn.lock / pnpm-lock.yaml
  - composer.json
  - composer.lock
  - artisan
  - next.config.js / next.config.mjs / next.config.ts
  - nginx/apache config bila ada
  - .htaccess bila ada
  - .env.example
  - ecosystem / pm2 config bila ada
  - Dockerfile / docker-compose bila sudah pernah ada
  - build script / deploy script / CI config

2. Jalur aplikasi
- bagaimana frontend memanggil backend
- domain production frontend
- domain production backend / api
- subdomain / subfolder / reverse proxy pattern
- endpoint healthcheck jika ada

3. Mode frontend
- Apakah Next.js pakai:
  - pages router atau app router
  - SSR
  - SSG
  - ISR
  - API routes
  - middleware
  - image optimization bawaan next/image
  - standalone output
  - static export
- Apakah frontend benar-benar butuh Node runtime terus hidup
- Apakah frontend sebenarnya bisa dijadikan static export atau tidak
- Apa command build dan command start yang digunakan

4. Mode backend Laravel
- Laravel version
- PHP version yang dibutuhkan
- Apakah pakai:
  - Sanctum
  - Passport
  - session auth
  - token auth
  - queues
  - scheduler
  - websockets
  - broadcasting
  - storage link
  - image manipulation
  - Redis
  - cron dependencies
- Entry point dan public path yang dipakai di cPanel

==================================================
B. SPESIFIKASI FRONTEND NEXT.JS
==================================================

Ambil dari source code, config, dan lockfile:

1. Runtime
- Node.js version yang diwajibkan / dianjurkan
- Package manager yang dipakai
- NPM/Yarn/PNPM version jika terdeteksi

2. Dependencies kritikal
- next
- react
- react-dom
- axios/fetch client
- styling system
- auth libs
- env validation libs
- build-related libs

3. Scripts package.json
Laporkan persis:
- dev
- build
- start
- export
- lint
- test
- custom deploy scripts

4. next.config
Laporkan dan jelaskan pengaruh parity dari:
- output
- images
- rewrites
- redirects
- headers
- basePath
- assetPrefix
- trailingSlash
- experimental options
- env injection
- distDir
- standalone mode
- transpilePackages

5. Environment variables frontend
Daftar semua variabel yang dipakai:
- NEXT_PUBLIC_*
- server-only env
- API base URL
- auth-related env
- image/domain env
- build-time vs runtime env

Untuk setiap env, jelaskan:
- nama
- dipakai di file mana
- mandatory / optional
- hanya build-time atau runtime juga
- risiko jika beda antara local dan production

==================================================
C. SPESIFIKASI BACKEND LARAVEL
==================================================

Ambil dari composer, .env example, config, dan source:

1. Runtime
- PHP version requirement
- Composer version requirement bila ada
- Extensions PHP yang dibutuhkan
- System package yang kemungkinan dibutuhkan:
  - zip
  - gd
  - exif
  - intl
  - imagick
  - bcmath
  - pdo_mysql
  - pdo_pgsql
  - redis
  - pcntl
  - sodium
  - opcache
  - dll

2. Composer packages penting
- laravel/framework
- sanctum/passport
- spatie packages
- inertia bila ada
- image package
- queues/cache packages
- logging/monitoring packages

3. Konfigurasi Laravel yang kritikal untuk parity
- APP_ENV
- APP_DEBUG
- APP_URL
- ASSET_URL
- LOG_CHANNEL
- SESSION_DRIVER
- SESSION_DOMAIN
- SANCTUM_STATEFUL_DOMAINS
- CACHE_DRIVER
- QUEUE_CONNECTION
- FILESYSTEM_DISK
- DB_*
- REDIS_*
- MAIL_*
- CORS config
- trusted proxies
- config/session.php
- config/cors.php
- config/filesystems.php
- config/cache.php
- config/queue.php

4. Route dan delivery model
- Laravel murni API atau mixed web + API
- Prefix /api atau tidak
- apakah ada route yang juga merender frontend
- apakah ada dependency ke Apache rewrite tertentu
- apakah ada storage/public dependency

5. Build assets backend
- apakah backend juga build Vite/Mix
- bagaimana asset backend dihasilkan
- apakah frontend asset backend bentrok dengan Next.js

==================================================
D. SPESIFIKASI DATABASE, CACHE, SESSION, STORAGE
==================================================

1. Database
- Engine: MySQL / MariaDB / PostgreSQL
- Versi di production jika tersedia
- Charset
- Collation
- strict mode
- timezone
- sql_mode
- engine default
- size limit atau shared hosting limit
- apakah ada procedure / trigger / event

2. Cache / session / queue
- file / database / redis
- mana yang dipakai di local
- mana yang dipakai di production
- gap yang berpotensi bikin bug

3. Storage
- local disk / public disk
- symbolic link status
- upload path
- permission dependency
- apakah cPanel punya constraint tertentu
- apakah ada asset generated yang harus persistent

==================================================
E. AUDIT CPANEL / HOSTING PRODUCTION
==================================================

Bongkar sedetail mungkin environment production.

1. Tipe hosting
- shared hosting / VPS cPanel / dedicated
- akses SSH ada atau tidak
- akses root ada atau tidak
- terminal cPanel ada atau tidak
- Node.js selector / Setup Node.js App tersedia atau tidak
- Python App / Ruby App irrelevant kecuali mempengaruhi

2. Web server stack
- Apache saja?
- Apache + Nginx reverse proxy?
- LiteSpeed?
- OpenLiteSpeed?
- Versi jika diketahui
- PHP handler:
  - lsapi
  - php-fpm
  - cgi
  - suphp
  - ea-php
- bagaimana request diproses

3. PHP production
- versi PHP aktif
- extension aktif
- memory_limit
- max_execution_time
- upload_max_filesize
- post_max_size
- opcache status
- disable_functions bila ada

4. Node.js support di cPanel
- apakah Node app bisa dijalankan
- versi Node yang tersedia
- apakah process persistent diizinkan
- bagaimana app di-start
- apakah startup file bisa ditentukan
- apakah SSR Next.js secara realistis bisa berjalan
- apakah hanya build step yang mungkin
- apakah ada passenger / application manager

5. Domain & routing production
- domain utama
- subdomain frontend
- subdomain backend
- document root masing-masing
- public_html mapping
- addon domain / subdomain config
- reverse proxy rules
- rewrite rules
- .htaccess contents
- apakah /api diarahkan ke folder lain
- apakah ada proxy ke node process
- SSL / force https
- www/non-www canonical rules

6. Cron / queue / scheduler
- apakah cron tersedia
- cron apa saja yang sudah aktif
- apakah queue worker berjalan terus atau hanya cron-triggered
- apakah ada supervisor (kemungkinan besar tidak di shared hosting)
- konsekuensi ke parity

7. Deployment process saat ini
- cara deploy backend
- cara deploy frontend
- apakah pakai git versioning di cPanel
- apakah upload zip/manual
- apakah build di local lalu upload artifact
- apakah build di server
- langkah-langkah deploy aktual
- bagian mana yang paling sering bikin perbedaan/cacat

==================================================
F. ENVIRONMENT VARIABLES PRODUCTION VS LOCAL
==================================================

Buat matriks perbandingan.

Untuk setiap env variable yang ditemukan:
- Nama env
- Dipakai oleh backend atau frontend
- Nilai/placeholder local
- Nilai/placeholder production
- Sifat:
  - build-time
  - runtime
  - secret
  - public
- Risiko mismatch
- Dampak jika salah

Sorot khusus:
- APP_URL
- FRONTEND_URL
- NEXT_PUBLIC_API_URL
- SESSION_DOMAIN
- SANCTUM_STATEFUL_DOMAINS
- CORS origins
- cookie secure / same_site
- filesystem path
- public path
- asset URL
- base path
- image host/domain

==================================================
G. AUTH, COOKIE, CORS, DOMAIN BEHAVIOR
==================================================

Audit semua hal yang sering menyebabkan local ≠ cPanel:

1. Auth model
- JWT / Sanctum / session / token / custom
- frontend login flow
- backend auth guard
- apakah pakai cookie lintas subdomain

2. Cookie settings
- domain
- secure
- same_site
- http_only
- path
- apakah behavior berubah antara http local dan https production

3. CORS
- allowed origins
- credentials
- methods
- headers
- wildcard yang berbahaya
- gap local vs production

4. CSRF
- endpoint csrf-cookie jika pakai Sanctum
- urutan request login
- dependency terhadap domain yang sama / subdomain

==================================================
H. BUILD DAN ARTIFACT PARITY
==================================================

Audit detail proses build:

1. Frontend
- file/folder hasil build
- apakah ada dependency pada env saat build
- apakah build output beda antara local dan production
- asset path absolut/relatif
- apakah source map, minify, image optimizer beda

2. Backend
- composer install flags
- optimize commands
- config:cache
- route:cache
- view:cache
- migrate behavior
- apakah ada file generated setelah deploy

3. Dependency locking
- apakah lockfile konsisten
- apakah ada dependency floating version
- apakah engine versions dikunci
- apakah ada script postinstall/postbuild yang riskan

==================================================
I. RISIKO PARITY: TEMUKAN SEMUA GAP
==================================================

Buat daftar gap aktual atau potensial antara local dan production, misalnya:
- beda versi PHP
- beda versi Node
- beda web server
- beda session driver
- beda DB engine/version
- beda env build-time
- Next.js SSR tidak kompatibel dengan shared cPanel
- rewrite Apache tidak sama dengan reverse proxy local
- beda cookie domain
- beda public path
- storage symlink tidak ada
- queue tidak jalan terus
- cron tidak parity
- image optimizer Next tidak parity
- LiteSpeed/Apache behavior beda
- case-sensitive path difference
- permission issue
- filesystem layout beda
- composer platform mismatch
- npm install vs npm ci mismatch

Untuk setiap gap:
- severity: rendah / sedang / tinggi / kritikal
- gejala yang mungkin muncul
- file / config yang terlibat
- level keyakinan

==================================================
J. BUKTI DAN SUMBER DATA
==================================================

Untuk setiap kesimpulan, tunjukkan dari mana datanya berasal:
- nama file
- potongan konfigurasi
- command output
- screenshot info jika ada
- atau tulis “belum ada bukti langsung”

==================================================
K. FORMAT OUTPUT FINAL
==================================================

Susun jawaban final dengan format ini:

1. Executive Summary
2. Verified Facts
3. Missing Information
4. Full Stack Inventory
5. cPanel Production Inventory
6. Local vs Production Gap Matrix
7. Parity Risk List
8. Questions/Data Still Needed
9. Raw Evidence Appendix

ATURAN KERJA:
- Jangan menyederhanakan
- Jangan kasih saran generik
- Jangan bikin Dockerfile dulu
- Jangan bilang “semuanya bisa parity” kalau faktanya belum tentu
- Kalau ada batasan cPanel, tulis terang-terangan
- Kalau ada data tidak tersedia, jangan tebak seolah pasti benar
- Kalau perlu, buat command/cek yang harus dijalankan user untuk mengambil data tambahan

Kalau akses ke source code tersedia, prioritaskan fakta dari source code.
Kalau akses ke cPanel tidak langsung tersedia, buat daftar data/command/checklist yang harus saya ambil dari cPanel.

Hasilmu harus dibuat agar bisa langsung saya kirim ke ChatGPT untuk tahap berikutnya: desain parity dan setup Docker.