# Web Stack cPanel Parity Audit

Tanggal audit: 2026-04-03  
Scope: source code monorepo lokal + snapshot runtime production cPanel via SSH + HTTP header evidence  
Tujuan: membongkar fakta teknis agar parity local Docker dapat dirancang sedekat mungkin dengan production

## 1. Executive Summary

### Ringkasan cepat

- **Verified:** repo ini adalah **monorepo hybrid decoupled** dengan **frontend Next.js** di root dan **backend Laravel** di [`backend-api`](/e:/thechoosentalksnext/backend-api).
- **Verified:** production backend di cPanel **tidak menjalankan Node runtime**. `node` dan `npm` tidak tersedia di SSH shell production.
- **Verified:** production backend menggunakan **release-based deployment** dengan symlink `current` ke folder release aktif, bukan satu folder app statis di `public_html`.
- **Verified:** `~/public_html/index.php` hanya menjadi jembatan ke `~/deploy/apps/thechoosentalks/current/public/index.php`.
- **Verified:** production Laravel berjalan pada **PHP 8.3.30** dan **MariaDB 11.4.10**.
- **Verified:** frontend Next.js memakai **App Router** dan banyak **route handlers** (`src/app/api/**`) yang mem-proxy ke Laravel.
- **Verified:** frontend build dikonfigurasi `output: 'standalone'`, sehingga secara teknis ia mengarah ke runtime Node server, bukan static export murni.
- **Verified:** backend memakai **Sanctum**, session/cookie config, route API terpisah, storage publik, dan env-domain yang sensitif terhadap parity.
- **Verified:** production env backend saat ini memakai `SESSION_DRIVER=file`, `CACHE_STORE=file`, `QUEUE_CONNECTION=sync`, `DB_HOST=localhost`, `APP_URL=https://api.thechoosentalks.org`.
- **Verified:** public domain frontend `https://www.thechoosentalks.org` merespons dengan header `Server: edgeone-pages`; API production `https://api.thechoosentalks.org/api/v1/community/posts` merespons dengan header `Server: cloudflare`.

### Kesimpulan parity level tinggi

- **Kritikal:** topologi production adalah **frontend terpisah dari backend**, dengan CDN/edge di depan frontend dan reverse/public bridge untuk backend Laravel. Local parity yang hanya mengandalkan `next dev + php artisan serve` tidak cukup.
- **Kritikal:** frontend root saat ini adalah Next.js **serverful**, bukan purely static. Bila target hosting frontend tidak benar-benar menjaga runtime Node yang kompatibel, perilaku lokal vs production bisa berbeda.
- **Tinggi:** auth/cookie/CORS parity sangat sensitif karena backend production memakai domain lintas subdomain (`www`, apex, `api`) dan Sanctum stateful domains.
- **Tinggi:** local default backend `.env.example` memakai `database` untuk session/cache/queue, sedangkan production saat ini memakai `file` dan `sync`.
- **Sedang:** production cPanel tidak menunjukkan cron Laravel scheduler aktif dari user crontab yang terlihat; hanya cron Redis cPanel yang tampak.

## 2. Verified Facts

### 2.1 Identitas dan struktur proyek

| Item | Status | Evidence | Notes |
|---|---|---|---|
| Bentuk repo | VERIFIED | root punya `package.json`, `next.config.ts`, dan folder [`backend-api`](/e:/thechoosentalksnext/backend-api) | Monorepo |
| Frontend Next.js di root | VERIFIED | [`package.json`](/e:/thechoosentalksnext/package.json), [`src/app`](/e:/thechoosentalksnext/src/app) | Root app |
| Backend Laravel di `backend-api/` | VERIFIED | [`backend-api/artisan`](/e:/thechoosentalksnext/backend-api/artisan), [`backend-api/composer.json`](/e:/thechoosentalksnext/backend-api/composer.json) | Standalone workspace |
| Lockfile frontend | VERIFIED | [`package-lock.json`](/e:/thechoosentalksnext/package-lock.json) | Package manager: npm |
| Lockfile backend PHP | VERIFIED | [`backend-api/composer.lock`](/e:/thechoosentalksnext/backend-api/composer.lock) | Composer lock ada |
| Lockfile backend JS | VERIFIED | [`backend-api/package-lock.json`](/e:/thechoosentalksnext/backend-api/package-lock.json) | Backend punya Vite asset build sendiri |
| Docker config saat ini | VERIFIED | [`docker-compose.yml`](/e:/thechoosentalksnext/docker-compose.yml), Dockerfiles di [`docker/`](/e:/thechoosentalksnext/docker) | Ada, tetapi ini hasil setup lokal repo saat ini, bukan baseline production |
| PM2/ecosystem config | MISSING | pencarian file tidak menemukan `ecosystem*.config.*`/`pm2*.config.*` | Tidak terdeteksi |

### 2.2 Jalur aplikasi

| Item | Status | Evidence | Notes |
|---|---|---|---|
| Frontend memanggil backend via route handlers Next | VERIFIED | banyak file di `src/app/api/**/route.ts`, contoh [`src/app/api/community/posts/route.ts`](/e:/thechoosentalksnext/src/app/api/community/posts/route.ts) | Browser -> Next -> Laravel |
| Proxy Next ke Laravel | VERIFIED | [`src/lib/proxy-laravel.ts`](/e:/thechoosentalksnext/src/lib/proxy-laravel.ts) | Binary-safe proxy |
| Origin backend frontend-side | VERIFIED | [`src/lib/laravel-api.ts`](/e:/thechoosentalksnext/src/lib/laravel-api.ts) | `LARAVEL_API_BASE_URL` / `NEXT_PUBLIC_LARAVEL_API_BASE_URL` / fallback production |
| Domain frontend production | VERIFIED | HTTP HEAD `https://www.thechoosentalks.org` => `200`, `Server=edgeone-pages` | Frontend public |
| Domain backend production | VERIFIED | env `APP_URL=https://api.thechoosentalks.org`, HTTP HEAD `https://api.thechoosentalks.org/api/v1/community/posts` => `200` | API public |
| Healthcheck backend | VERIFIED | [`backend-api/healthcheck.sh`](/e:/thechoosentalksnext/backend-api/healthcheck.sh), deploy logs | Digunakan deploy script |
| Reverse proxy pattern production | NEED VERIFICATION | frontend `edgeone-pages`, backend `cloudflare`, `public_html/index.php` bridge ke Laravel | CDN/reverse stack penuh tidak terlihat dari user-level SSH |

### 2.3 Mode frontend Next.js

| Item | Status | Evidence | Notes |
|---|---|---|---|
| App Router | VERIFIED | `src/app/**` ada, `src/pages` tidak ada | App Router aktif |
| API routes via App Router route handlers | VERIFIED | banyak `src/app/api/**/route.ts` | Butuh runtime server |
| SSR/server features | VERIFIED | `generateMetadata()` di [`src/app/layout.tsx`](/e:/thechoosentalksnext/src/app/layout.tsx), route handlers, env server-only di [`src/lib/laravel-api.ts`](/e:/thechoosentalksnext/src/lib/laravel-api.ts) | Bukan static-only |
| ISR/revalidate | VERIFIED | [`src/app/renungan/page.tsx`](/e:/thechoosentalksnext/src/app/renungan/page.tsx) `revalidate = 300` | ISR dipakai setidaknya di satu route |
| Middleware Next | MISSING | pencarian `middleware.ts/js/mjs` tidak menemukan file | Tidak terdeteksi |
| `next/image` usage | NEED VERIFICATION | `next-env.d.ts` ada, config `images.remotePatterns` ada, tetapi pencarian import di `src` tidak menemukan bukti langsung | Config ada, penggunaan komponen belum terbukti |
| Standalone output | VERIFIED | [`next.config.ts`](/e:/thechoosentalksnext/next.config.ts) | `output: 'standalone'` |
| Static export | MISSING | tidak ada script `next export`, tidak ada `output: 'export'` | Tidak terdeteksi |
| Butuh Node runtime terus hidup | VERIFIED | route handlers + standalone output + `next start` script | Tidak realistis sebagai pure static site tanpa adaptasi |
| Build command | VERIFIED | `npm run build` | [`package.json`](/e:/thechoosentalksnext/package.json) |
| Start command | VERIFIED | `npm run start` -> `next start` | [`package.json`](/e:/thechoosentalksnext/package.json) |

### 2.4 Mode backend Laravel

| Item | Status | Evidence | Notes |
|---|---|---|---|
| Laravel version | VERIFIED | [`backend-api/composer.json`](/e:/thechoosentalksnext/backend-api/composer.json) `laravel/framework:^12.0` | Laravel 12 line |
| PHP requirement | VERIFIED | [`backend-api/composer.json`](/e:/thechoosentalksnext/backend-api/composer.json) `php:^8.2` | |
| Sanctum | VERIFIED | composer require + [`backend-api/config/sanctum.php`](/e:/thechoosentalksnext/backend-api/config/sanctum.php) | Auth stack |
| Session auth present | VERIFIED | [`backend-api/config/session.php`](/e:/thechoosentalksnext/backend-api/config/session.php) | |
| Token auth present | VERIFIED | Firebase sync returns Sanctum token routes under `/api/v1/auth/firebase/sync` | Hybrid token/session behavior |
| Queues configured | VERIFIED | [`backend-api/config/queue.php`](/e:/thechoosentalksnext/backend-api/config/queue.php) | Production env currently `sync` |
| Scheduler dependency | NEED VERIFICATION | cron user-level tidak menunjukkan `artisan schedule:run` | Bisa ada panel-level cron yang tidak terlihat |
| Redis support | VERIFIED | composer `predis/predis`, prod PHP module `redis`, env snapshot has `REDIS_*` placeholders | |
| Storage link dependency | VERIFIED | [`backend-api/config/filesystems.php`](/e:/thechoosentalksnext/backend-api/config/filesystems.php) `links` includes `public/storage` | |
| Image manipulation | VERIFIED | production PHP modules include `gd`, `imagick`, app generates OG images | |
| Public path production | VERIFIED | `~/public_html/index.php` requires `../deploy/apps/thechoosentalks/current/public/index.php` | Webroot bridge |

## 3. Missing Information

| Item | Status | Why missing |
|---|---|---|
| Versi web server pasti di production | UNKNOWN | user-level SSH + HTTP headers tidak menampilkan Apache/LiteSpeed version yang definitive |
| Apakah ada Nginx/LiteSpeed/Apache layering penuh di belakang Cloudflare/Edge | NEED VERIFICATION | header publik menunjukkan CDN edge, bukan origin server detail |
| Apakah cPanel menyediakan Node.js selector / Passenger UI | NEED VERIFICATION | dari SSH `node` tidak tersedia, tetapi fitur panel UI tidak bisa disimpulkan 100% tanpa screenshot panel |
| Apakah ada cron `artisan schedule:run` di level panel lain | NEED VERIFICATION | `crontab -l` user hanya menunjukkan cron Redis |
| Nilai penuh env production frontend | MISSING | tidak ada akses ke dashboard Edge/Tencent env |
| Apakah frontend production menjalankan runtime Node atau dibangun oleh platform edge adapter tertentu | NEED VERIFICATION | hanya terlihat domain `edgeone-pages`, bukan proses runtime internal platform |
| Document root config detail subdomain `api` | NEED VERIFICATION | app URL diketahui, tetapi mapping panel subdomain tidak terlihat langsung |
| Trusted proxies config eksplisit | UNKNOWN | belum ada bukti langsung file konfigurasi spesifik yang diubah |
| SQL mode, collation, timezone DB production | NEED VERIFICATION | versi MariaDB terverifikasi, tetapi session variables belum diambil |

## 4. Full Stack Inventory

### 4.1 Frontend inventory

| Category | Value | Evidence |
|---|---|---|
| Framework | Next.js `^15.2.0` | [`package.json`](/e:/thechoosentalksnext/package.json) |
| React | `^19.0.0` | [`package.json`](/e:/thechoosentalksnext/package.json) |
| React DOM | `^19.0.0` | [`package.json`](/e:/thechoosentalksnext/package.json) |
| Package manager | npm | `package-lock.json` present |
| TS | `^5.7.3` | [`package.json`](/e:/thechoosentalksnext/package.json) |
| Styling | Tailwind CSS 4 + Radix UI + CVA + `tailwind-merge` | [`package.json`](/e:/thechoosentalksnext/package.json) |
| Auth client | Firebase web SDK | [`package.json`](/e:/thechoosentalksnext/package.json) |
| Motion | `framer-motion` | [`package.json`](/e:/thechoosentalksnext/package.json) |
| OG/image | `@vercel/og` | [`package.json`](/e:/thechoosentalksnext/package.json) |
| Test | Vitest + Playwright | [`package.json`](/e:/thechoosentalksnext/package.json) |

### 4.2 Frontend scripts

| Script | Value |
|---|---|
| `dev` | `next dev --turbopack -p 9002` |
| `build` | `next build` |
| `start` | `next start` |
| `lint` | `next lint` |
| `test:e2e` | `playwright test` |
| `typecheck` | `tsc --noEmit` |
| custom parity scripts | `today:ready`, `smoke:prod`, Docker scripts |

### 4.3 Frontend next.config parity notes

| Config | Value | Parity impact |
|---|---|---|
| `output` | `standalone` | Mengarah ke server runtime packaging, bukan static export |
| `experimental.webpackBuildWorker` | `false` | Windows build workaround lokal, bukan bukti production |
| `experimental.cpus` | `1` | Build behavior bisa beda dari server multi-core |
| `typescript.ignoreBuildErrors` | `true` | **Risiko tinggi**: build production frontend bisa lolos meski ada type errors |
| `eslint.ignoreDuringBuilds` | `true` | **Risiko sedang**: lint mismatch tidak menghentikan build |
| `images.remotePatterns` | placehold, unsplash, picsum | image domain whitelist build/runtime |
| `redirects` | `/library`, `/visitors`, `/gate-updates`, `/reflections/*` | behavior URL perlu parity di hosting frontend |

### 4.4 Frontend env inventory

| Env | Layer | Evidence | Mandatory | Build-time / Runtime | Risk |
|---|---|---|---|---|---|
| `NEXT_PUBLIC_APP_URL` | frontend | `.env.example`, `src/lib/seo.ts`, `src/app/profile/page.tsx` | High | build + runtime | canonical/SEO/domain mismatch |
| `LARAVEL_API_BASE_URL` | frontend server | `.env.example`, `src/lib/laravel-api.ts` | High | runtime server | proxy target mismatch |
| `NEXT_PUBLIC_LARAVEL_API_BASE_URL` | frontend public | `.env.example`, `src/lib/laravel-api.ts`, `community.service.ts` | High | build + browser runtime | asset/api URL mismatch |
| `NEXT_PUBLIC_API_BASE_URL` | frontend public/server fallback | `src/lib/laravel-api.ts`, `community.service.ts` | Optional | build + runtime | fallback ambiguity |
| `TODAY_SESSION_ENDPOINT` / `TODAY_*` | frontend server | `src/features/today-ritual/data/*` | Optional | runtime server | `/today` data divergence |
| `NEXT_PUBLIC_FIREBASE_*` | frontend public | `.env.example` | High if Firebase flow active | build + runtime | login/auth parity failure |
| `NEXT_PUBLIC_ADMIN_BASE_URL` | frontend public | `src/app/profile/page.tsx` | Optional | build + runtime | admin link mismatch |
| `VERCEL_*` | frontend platform env | `src/lib/seo.ts` | Optional | runtime/build platform | SEO host inference changes by platform |

### 4.5 Backend inventory

| Category | Value | Evidence |
|---|---|---|
| PHP requirement | `^8.2` | [`backend-api/composer.json`](/e:/thechoosentalksnext/backend-api/composer.json) |
| Framework | Laravel `^12.0` | [`backend-api/composer.json`](/e:/thechoosentalksnext/backend-api/composer.json) |
| Auth | Sanctum | composer + [`backend-api/config/sanctum.php`](/e:/thechoosentalksnext/backend-api/config/sanctum.php) |
| Queue/cache package | `predis/predis` | composer |
| Admin/server rendered surface | Filament `^5.2` | composer |
| Dev runtime helper | `laravel/pail` | composer dev |
| Local build assets | Vite + React + Inertia | [`backend-api/package.json`](/e:/thechoosentalksnext/backend-api/package.json) |

### 4.6 Backend JS asset build

| Item | Value | Notes |
|---|---|---|
| Build command | `tsc -p tsconfig.laravel.json && vite build` | Backend also has frontend assets |
| Dev command | `vite` | separate from Next |
| UI stack | Inertia + React + Tailwind 3 | Potential divergence vs root Next stack |
| Asset overlap risk | PRESENT | Backend has `public/build`, root frontend has Next build artifacts |

## 5. cPanel Production Inventory

### 5.1 Hosting/runtime facts

| Item | Value | Status |
|---|---|---|
| SSH access | available | VERIFIED |
| root access | not observed | UNKNOWN |
| user | `thechoosentalks` | VERIFIED |
| hostname | `s8255.sgp1.stableserver.net` | VERIFIED |
| PHP CLI | `8.3.30` | VERIFIED |
| DB engine | `MariaDB 11.4.10` | VERIFIED |
| Node on SSH path | not installed / not available | VERIFIED |
| npm on SSH path | not available | VERIFIED |
| Python | `3.9.25` | VERIFIED |

### 5.2 PHP module facts

Verified active modules include:

- `bcmath`
- `exif`
- `gd`
- `imagick`
- `intl`
- `mbstring`
- `pdo_mysql`
- `pdo_pgsql`
- `pdo_sqlite`
- `redis`
- `pcntl`
- `sodium`
- `zip`
- `Zend OPcache`

### 5.3 PHP ini snapshot

| Setting | Value | Status |
|---|---|---|
| `memory_limit` | `512M` | VERIFIED |
| `max_execution_time` | `0` | VERIFIED |
| `upload_max_filesize` | `128M` | VERIFIED |
| `post_max_size` | `128M` | VERIFIED |
| `opcache.enable` | `On` | VERIFIED |
| `disable_functions` | none shown | VERIFIED |

### 5.4 Domain and routing production

| Item | Value | Status |
|---|---|---|
| Frontend domain | `https://www.thechoosentalks.org` | VERIFIED |
| Frontend server header | `edgeone-pages` | VERIFIED |
| Backend domain | `https://api.thechoosentalks.org` | VERIFIED |
| Backend API server header | `cloudflare` | VERIFIED |
| `public_html/index.php` | requires `../deploy/apps/thechoosentalks/current/public/index.php` | VERIFIED |
| `public_html/.htaccess` | Apache rewrite to `index.php`, passes `Authorization`, excludes `/storage/` | VERIFIED |
| SSL | HTTPS active on frontend and API URLs tested | VERIFIED |
| www/non-www canonical | NEED VERIFICATION | no explicit redirect matrix gathered |

### 5.5 Deployment process production

| Step | Verified behavior |
|---|---|
| Source fetch | sparse checkout from Git monorepo, `backend-api/*` only |
| Deploy style | release-based, timestamped releases |
| Shared resources | symlink `.env` and `storage` from `shared/` |
| Composer | `composer install --no-interaction --prefer-dist --optimize-autoloader` |
| Cache steps | `optimize:clear`, `config:cache`, `view:cache`, `event:cache` |
| Migrations | conditional via `RUN_MIGRATIONS`, default false |
| Switch traffic | atomic symlink swap `current -> new release` |
| Old releases | pruned, keep last 5 |

### 5.6 Production env snapshot

| Env | Production value | Status |
|---|---|---|
| `APP_ENV` | `production` | VERIFIED |
| `APP_DEBUG` | `false` | VERIFIED |
| `APP_URL` | `https://api.thechoosentalks.org` | VERIFIED |
| `DB_CONNECTION` | `mysql` | VERIFIED |
| `DB_HOST` | `localhost` | VERIFIED |
| `DB_PORT` | `3306` | VERIFIED |
| `DB_DATABASE` | `thechoosentalks_laravel` | VERIFIED |
| `CACHE_STORE` | `file` | VERIFIED |
| `SESSION_DRIVER` | `file` | VERIFIED |
| `QUEUE_CONNECTION` | `sync` | VERIFIED |
| `SESSION_DOMAIN` | `.thechoosentalks.org` | VERIFIED |
| `SESSION_SECURE_COOKIE` | `true` | VERIFIED |
| `SESSION_SAME_SITE` | `lax` | VERIFIED |
| `CORS_ALLOWED_ORIGINS` | `https://thechoosentalks.org,https://www.thechoosentalks.org` | VERIFIED |
| `SANCTUM_STATEFUL_DOMAINS` | `thechoosentalks.org,www.thechoosentalks.org,api.thechoosentalks.org` | VERIFIED |

## 6. Local vs Production Gap Matrix

| Area | Local source/default | Production verified | Severity | Notes |
|---|---|---|---|---|
| PHP version | requires `^8.2` | PHP `8.3.30` | Medium | local may run lower 8.2.x |
| Node availability on backend host | local frontend expects Node | production backend host has no `node` | Critical | proves backend cPanel cannot run Next server there as-is |
| Frontend runtime type | Next standalone + route handlers | frontend hosted separately on edge platform | Critical | local/cPanel backend alone cannot mimic frontend hosting behavior |
| DB engine | MariaDB `11.4` target | MariaDB `11.4.10` | Medium | local SQLite or MySQL-specific assumptions would be wrong |
| Session driver | backend `.env.example` => `database` | production `file` | High | auth/session behavior can differ |
| Cache store | backend `.env.example` => `database` | production `file` | High | cache invalidation/perf behavior can differ |
| Queue connection | backend `.env.example` => `database` | production `sync` | High | async vs sync side effects differ |
| Filesystem disk | backend `.env.example` => `local` | production not fully captured, config supports `public` and app uses media routes | High | uploads/media behavior sensitive |
| `APP_URL` | local `http://127.0.0.1:8000` | prod `https://api.thechoosentalks.org` | High | storage URL, OG, cookies |
| CORS allowlist | empty by default | explicit production allowlist | High | local can silently fail if unset |
| Sanctum domains | local default helper includes localhost + prod | production explicit env set | High | cookie auth parity |
| Session cookie security | local false in example | prod true | High | HTTP local vs HTTPS prod mismatch |
| Build gate | `ignoreBuildErrors` and `ignoreDuringBuilds` true | production frontend behavior unknown | High | local build may hide issues |
| Backend asset build | Vite/React/Inertia backend assets exist | cPanel deploy script currently deploys backend only | Medium | backend asset freshness depends on artifact/source state |
| Cron/scheduler | local none by default | prod user crontab shows no scheduler | Medium | scheduled jobs may not run |
| Web server origin | local often `artisan serve` | prod behind CDN + Apache rewrite bridge | High | request headers/path/proxy behavior differ |

## 7. Parity Risk List

| Risk | Severity | Gejala mungkin muncul | Evidence | Confidence |
|---|---|---|---|---|
| Next runtime dianggap static padahal butuh server | Critical | jalan lokal, rusak di hosting yang hanya cocok untuk static publish | `output: standalone`, route handlers, `next start` | High |
| cPanel backend tidak bisa menjalankan Node SSR frontend | Critical | asumsi “deploy Next ke cPanel backend host” gagal | `node: command not found` di production SSH | High |
| Session/cache/queue local berbeda dari production | High | auth aneh, cache beda, job side effect beda | local `.env.example` vs prod env snapshot | High |
| HTTPS cookie parity mismatch | High | login/cookie works local lalu gagal lintas subdomain di prod | `SESSION_SECURE_COOKIE`, `SESSION_DOMAIN`, `SANCTUM_STATEFUL_DOMAINS` | High |
| Build errors tersembunyi karena Next ignore flags | High | build hijau tetapi runtime pecah di production | [`next.config.ts`](/e:/thechoosentalksnext/next.config.ts) | High |
| Media/storage path behavior beda | High | upload tampil lokal tapi 404/500 di production | filesystems config + prior production incidents | High |
| CDN/fronting layer tidak parity dengan local | Medium | header, cache, redirect, origin path beda | `edgeone-pages`, `cloudflare`, Apache `.htaccess` bridge | Medium |
| Scheduler tidak jalan | Medium | tugas harian/maintenance tidak dieksekusi | user crontab tidak menunjukkan `artisan schedule:run` | Medium |
| Backend JS assets bentrok atau stale | Medium | panel/admin asset rusak atau tidak ter-update | backend has separate Vite build | Medium |
| DB flavor/version mismatch | Medium | SQL behavior beda, collation/strict mode beda | prod MariaDB 11.4.10, local unspecified | Medium |

## 8. Questions/Data Still Needed

### Untuk menutup parity audit menjadi level lebih presisi

1. Apakah platform frontend production `edgeone-pages` menjalankan Node SSR, adapter edge, atau static + functions?
2. Apakah ada env production frontend untuk:
   - `NEXT_PUBLIC_APP_URL`
   - `NEXT_PUBLIC_LARAVEL_API_BASE_URL`
   - `NEXT_PUBLIC_FIREBASE_*`
3. Apakah panel cPanel menyediakan:
   - Setup Node.js App
   - Passenger
   - Application Manager
4. Apakah ada cron panel-level untuk:
   - `php artisan schedule:run`
   - queue worker trigger
5. Berapa nilai production:
   - DB collation
   - `sql_mode`
   - timezone
6. Apakah ada origin server Apache/LiteSpeed version yang bisa dilihat dari panel/server info?
7. Apakah frontend production punya rewrite/canonical rules tambahan di platform edge yang tidak ada di repo?

### Command/check tambahan yang bisa diambil bila diperlukan

```bash
# DB settings snapshot
php artisan tinker --execute="dump(DB::select('select @@version as version, @@sql_mode as sql_mode, @@time_zone as time_zone, @@character_set_database as charset, @@collation_database as collation'));"

# Laravel schedule visibility
php artisan schedule:list

# Storage/public linkage check
ls -lah /home/thechoosentalks/deploy/apps/thechoosentalks/current/public
ls -lah /home/thechoosentalks/deploy/apps/thechoosentalks/shared/storage/app/public

# Panel/server clues if available
apachectl -v
httpd -v
lsphp -v
```

## 9. Raw Evidence Appendix

### Repo evidence

- Frontend root scripts and dependencies:
  - [`package.json`](/e:/thechoosentalksnext/package.json)
- Next config:
  - [`next.config.ts`](/e:/thechoosentalksnext/next.config.ts)
- Frontend app router and route handlers:
  - [`src/app/layout.tsx`](/e:/thechoosentalksnext/src/app/layout.tsx)
  - [`src/app/api/community/posts/route.ts`](/e:/thechoosentalksnext/src/app/api/community/posts/route.ts)
  - [`src/lib/proxy-laravel.ts`](/e:/thechoosentalksnext/src/lib/proxy-laravel.ts)
  - [`src/lib/laravel-api.ts`](/e:/thechoosentalksnext/src/lib/laravel-api.ts)
- Backend runtime and env config:
  - [`backend-api/composer.json`](/e:/thechoosentalksnext/backend-api/composer.json)
  - [`backend-api/.env.example`](/e:/thechoosentalksnext/backend-api/.env.example)
  - [`backend-api/config/sanctum.php`](/e:/thechoosentalksnext/backend-api/config/sanctum.php)
  - [`backend-api/config/session.php`](/e:/thechoosentalksnext/backend-api/config/session.php)
  - [`backend-api/config/cors.php`](/e:/thechoosentalksnext/backend-api/config/cors.php)
  - [`backend-api/config/filesystems.php`](/e:/thechoosentalksnext/backend-api/config/filesystems.php)
  - [`backend-api/config/cache.php`](/e:/thechoosentalksnext/backend-api/config/cache.php)
  - [`backend-api/config/queue.php`](/e:/thechoosentalksnext/backend-api/config/queue.php)
  - [`backend-api/routes/api.php`](/e:/thechoosentalksnext/backend-api/routes/api.php)
  - [`backend-api/routes/web.php`](/e:/thechoosentalksnext/backend-api/routes/web.php)
  - [`backend-api/deploy.sh`](/e:/thechoosentalksnext/backend-api/deploy.sh)
  - [`backend-api/package.json`](/e:/thechoosentalksnext/backend-api/package.json)

### Production SSH evidence

- `whoami` => `thechoosentalks`
- `hostname` => `s8255.sgp1.stableserver.net`
- `php -v` => `PHP 8.3.30`
- `php -m` includes `gd`, `imagick`, `intl`, `pdo_mysql`, `redis`, `zip`, `pcntl`, `sodium`
- `php -i` snapshot:
  - `memory_limit=512M`
  - `upload_max_filesize=128M`
  - `post_max_size=128M`
  - `opcache.enable=On`
- `node -v` => command not found
- `npm -v` => command not found
- `python3 --version` => `3.9.25`
- `~/public_html/index.php`:

```php
<?php
declare(strict_types=1);
require __DIR__ . '/../deploy/apps/thechoosentalks/current/public/index.php';
```

- `~/public_html/.htaccess`:

```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>
    CGIPassAuth On
    RewriteEngine On
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
    RewriteCond %{REQUEST_URI} !^/storage/
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

- Current release symlink:

```text
/home/thechoosentalks/deploy/apps/thechoosentalks/current
-> /home/thechoosentalks/deploy/apps/thechoosentalks/releases/20260325090952
```

- Production env snapshot:

```text
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.thechoosentalks.org
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=thechoosentalks_laravel
CACHE_STORE=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync
SESSION_DOMAIN=.thechoosentalks.org
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax
CORS_ALLOWED_ORIGINS=https://thechoosentalks.org,https://www.thechoosentalks.org
SANCTUM_STATEFUL_DOMAINS=thechoosentalks.org,www.thechoosentalks.org,api.thechoosentalks.org
```

- DB version:

```text
11.4.10-MariaDB
```

- User crontab:

```text
MAILTO=""
SHELL="/bin/bash"
* * * * * /usr/bin/flock -n /home/thechoosentalks/.cpanel/redis/redis.lock /usr/bin/redis-server /home/thechoosentalks/.cpanel/redis/redis.conf >> /dev/null 2>&1
```

### HTTP evidence

```text
HEAD https://www.thechoosentalks.org           => 200, Server: edgeone-pages
HEAD https://www.thechoosentalks.org/community => 200, Server: edgeone-pages
HEAD https://api.thechoosentalks.org/api/v1/community/posts => 200, Server: cloudflare, Content-Type: application/json
```
