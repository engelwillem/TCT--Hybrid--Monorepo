# Laravel Hybrid Progress Decouple

Last audit: 2026-03-12

Dokumen ini merekam status aktual repo saat ini, bukan rencana lama. Fokus audit: komunikasi Backend Laravel API, setup Firebase Auth, dan sinkronisasi data lanjutan.

## Ringkasan Status

Arsitektur decoupled sudah mulai terpasang dan bukan lagi sekadar wacana.

- Next.js sudah memiliki internal API proxy ke Laravel.
- Backend Laravel sudah memiliki API v1 untuk `today`, `community`, dan `auth/firebase/sync`.
- Firebase client config dan auth sync ke backend sudah ada.
- Community service frontend sudah API-first; fallback mock kini dibatasi pada alur baca.
- Firestore real-time dan sinkronisasi data lanjutan ke Laravel/MariaDB belum terlihat sebagai alur produksi yang lengkap.

## Yang Sudah Ada di Repo

### 1. Proxy API Next.js ke Laravel

Route proxy tersedia:

- [today route](/e:/thechoosentalksnext/src/app/api/today/route.ts)
- [community posts route](/e:/thechoosentalksnext/src/app/api/community/posts/route.ts)
- [comments route](/e:/thechoosentalksnext/src/app/api/community/posts/[postId]/comments/route.ts)
- [pray route](/e:/thechoosentalksnext/src/app/api/community/posts/[postId]/pray/route.ts)
- [bookmark route](/e:/thechoosentalksnext/src/app/api/community/posts/[postId]/bookmark/route.ts)
- [firebase sync route](/e:/thechoosentalksnext/src/app/api/auth/firebase/sync/route.ts)

Layer proxy yang dipakai:

- [proxy laravel helper](/e:/thechoosentalksnext/src/lib/proxy-laravel.ts)

Status:

- Request method dan body sudah diteruskan ke Laravel.
- Header `Authorization` dan `Content-Type` ikut diproxy.
- Error fallback untuk Laravel unreachable sudah ada.

### 2. Backend Laravel API v1

Laravel API route sudah ada:

- [api routes](/e:/thechoosentalksnext/backend-api/routes/api.php)

Controller yang tersedia:

- [TodayApiController](/e:/thechoosentalksnext/backend-api/app/Http/Controllers/Api/V1/TodayApiController.php)
- [CommunityApiController](/e:/thechoosentalksnext/backend-api/app/Http/Controllers/Api/V1/CommunityApiController.php)
- [FirebaseAuthSyncController](/e:/thechoosentalksnext/backend-api/app/Http/Controllers/Api/V1/FirebaseAuthSyncController.php)

Bootstrapping API sudah aktif:

- [bootstrap app](/e:/thechoosentalksnext/backend-api/bootstrap/app.php)

Status:

- `GET /api/v1/today` tersedia.
- `GET /api/v1/community/posts` tersedia.
- `GET /api/v1/community/posts/{memberPost}/comments` tersedia.
- `POST /api/v1/community/posts`, `comments`, `pray`, `bookmark` sudah diproteksi `auth:sanctum`.
- Struktur response backend sudah cukup konsisten untuk dipakai frontend saat ini.

### 3. Firebase Auth Client + Sync ke Laravel

File yang relevan:

- [firebase config](/e:/thechoosentalksnext/src/firebase/config.ts)
- [firebase client provider](/e:/thechoosentalksnext/src/firebase/client-provider.tsx)
- [firebase auth sync component](/e:/thechoosentalksnext/src/components/FirebaseAuthSync.tsx)
- [app token helper](/e:/thechoosentalksnext/src/services/app-auth-token.ts)
- [root layout integration](/e:/thechoosentalksnext/src/app/layout.tsx)
- [backend services config](/e:/thechoosentalksnext/backend-api/config/services.php)
- [firebase uid migration](/e:/thechoosentalksnext/backend-api/database/migrations/2026_03_10_160000_add_firebase_uid_to_users_table.php)
- [user model](/e:/thechoosentalksnext/backend-api/app/Models/User.php)

Status:

- Frontend membaca env `NEXT_PUBLIC_FIREBASE_*`.
- Provider Firebase diinisialisasi hanya jika config tersedia.
- Saat user login, frontend meminta Firebase ID token lalu mengirimkannya ke `/api/auth/firebase/sync`.
- Laravel memverifikasi token via Firebase Identity Toolkit API memakai `FIREBASE_WEB_API_KEY`.
- Laravel membuat atau mengupdate user lokal berdasarkan `firebase_uid`, lalu menerbitkan token Sanctum.
- Token Sanctum disimpan di `localStorage` dan dipakai oleh service frontend untuk request terproteksi.

Catatan:

- Ini adalah alur sync auth berbasis Firebase token exchange, bukan verifikasi Admin SDK server-side.
- Untuk tahap sekarang alurnya cukup jalan, tetapi secara arsitektur masih bisa diperkuat nanti.

### 4. Frontend Community Sudah API-First

File utama:

- [community service](/e:/thechoosentalksnext/src/services/community.service.ts)
- [daily verse card](/e:/thechoosentalksnext/src/components/core/DailyVerseHeroCard.tsx)

Status:

- Feed komunitas membaca dari `/api/community/posts`.
- Create post, comment, pray, dan bookmark sudah diarahkan ke API proxy.
- Alur baca masih punya fallback lokal terbatas.
- Alur tulis sekarang ketat ke backend agar tidak menghasilkan state palsu yang tidak tersinkron.
- Daily verse card sudah fetch ke `/api/today`.

## Yang Belum Selesai atau Belum Terbukti

### 1. Firestore Belum Menjadi Source Real-Time yang Aktif untuk Community

Di repo memang ada fondasi Firebase:

- `use-collection`
- `use-doc`
- `use-user`
- provider Firebase

Tetapi dari audit ini belum terlihat:

- community feed yang benar-benar baca dari koleksi Firestore aktif
- comment stream real-time via `onSnapshot`
- write post/comment/reaction ke Firestore sebagai jalur utama UX instan
- sinkronisasi Firestore event ke Laravel/MariaDB

Kesimpulan:

- Firestore auth foundation ada.
- Firestore community real-time pipeline belum tampak sebagai implementasi utama.

### 2. Sinkronisasi Data Lanjutan Belum Ada

Belum ditemukan alur berikut:

- Cloud Function untuk back-sync engagement Firestore ke Laravel
- queue/job Laravel yang konsumsi event dari Firebase
- webhook sinkronisasi dua arah
- persistence metrics terjadwal dari Firestore ke MariaDB

Kesimpulan:

- Sinkronisasi data lanjutan masih tahap desain, belum tahap implementasi penuh.

### 3. Validasi End-to-End Belum Dicatat Sebagai Lolos

Status yang belum bisa dianggap selesai:

- login Firebase -> sync ke Laravel -> dapat token Sanctum -> create post
- post/comment/pray/bookmark dengan backend aktif penuh
- pengujian CORS dan env production
- pengujian SSR/Next runtime terhadap backend Laravel yang hidup

## Penilaian Tahap Saat Ini

Progress aktual paling tepat dibaca seperti ini:

- Tahap 1: komunikasi Next.js <-> Laravel API sudah mulai terimplementasi
- Tahap 2: Firebase Auth sync ke Laravel sudah mulai terimplementasi
- Tahap 3: frontend community sudah dipindah ke API-first
- Tahap 4: Firestore real-time dan data sync lanjutan belum selesai

Secara praktis, proyek ini sudah masuk fase integrasi backend dasar, tetapi belum masuk fase hybrid realtime yang matang.

## Audit Parity Produksi

Referensi dari repo `e:\thechoosentalksbeta` menunjukkan pola produksi cPanel yang harus dijaga paritasnya:

- release path `~/deploy/apps/thechoosentalks`
- shared env di `~/deploy/apps/thechoosentalks/shared/.env`
- backend Laravel menjadi origin data utama
- MariaDB cPanel adalah target database produksi
- deploy script lama memvalidasi `DB_CONNECTION`, `DB_DATABASE`, dan `DB_HOST` sebelum migrasi

Penyesuaian yang sudah dilakukan di repo ini:

- frontend `.env.example` sekarang menegaskan `LARAVEL_API_BASE_URL` harus menunjuk ke origin Laravel, bukan origin Tencent Pages
- backend `.env.example` sekarang memakai `APP_URL=http://127.0.0.1:8000` untuk parity lokal
- backend `.env.example` sekarang memberi contoh `CORS_ALLOWED_ORIGINS` untuk lokal dan produksi Tencent Pages
- catatan Firebase sekarang menegaskan frontend dan backend harus memakai project Firebase produksi yang sama

Implikasi teknis:

- parity lokal ke produksi harus dipikirkan sebagai parity origin, parity env, dan parity database boundary
- Tencent Pages hanya frontend host
- source of truth backend tetap Laravel + MariaDB
- Firestore harus memakai project yang sama antara lokal dan produksi agar auth/sync tidak pecah
- `DB_CONNECTION=mysql` tetap valid di Laravel karena itu adalah driver kompatibilitas untuk engine MariaDB

## Hardening Auth dan Community API

Perbaikan yang sudah diterapkan:

- `FirebaseAuthSync` sekarang memakai `onIdTokenChanged`, bukan hanya `onAuthStateChanged`
- token aplikasi dibersihkan jika backend mengembalikan `401`, `403`, atau `422`
- `CommunityService.listPosts()` sekarang ikut mengirim bearer token jika tersedia
- akibatnya, payload feed sekarang bisa menghormati status user seperti `isLiked` dan `isBookmarked`
- operasi tulis community tidak lagi diam-diam fallback ke mock lokal saat gagal
- toggle like dan bookmark sekarang merekonsiliasi state UI dengan post hasil response backend
- migrasi Sanctum untuk `personal_access_tokens` sudah ditambahkan agar parity lokal tidak patah di tahap token issuance

## Hasil Uji Nyata

### 1. Produksi Publik

- `https://thechoosentalks.org/` merespons `200 OK`
- `https://thechoosentalks.org/api/v1/today` merespons `404 Not Found`

Makna:

- origin web produksi hidup
- API v1 decoupled belum diekspos di origin publik yang diuji, atau berada di host/origin lain

### 2. SSH cPanel

- percobaan SSH ke `thechoosentalks@thechoosentalks.org:22` gagal dengan `Connection reset`

Makna:

- host SSH cPanel kemungkinan bukan domain publik utama, atau port SSH dibatasi
- untuk audit server langsung masih dibutuhkan hostname SSH cPanel yang benar

### 3. Backend Lokal

Uji melalui Laravel kernel lokal berhasil:

- `GET /api/v1/today` -> `200`
- `GET /api/v1/community/posts` -> `200`
- `POST /api/v1/community/posts` dengan bearer token Sanctum -> `201`
- `GET /api/v1/community/posts` dengan bearer token Sanctum -> `200`

Temuan penting:

- sebelum migrasi tambahan, flow token gagal karena tabel `personal_access_tokens` belum ada
- setelah migrasi Sanctum ditambahkan, alur `Sanctum -> Community API` berjalan normal di lokal

Catatan parity:

- backend lokal sekarang diarahkan ke engine MariaDB dengan `DB_CONNECTION=mysql`
- koneksi aktif memakai database lokal `tct_localserver`
- verifikasi data MariaDB lokal:
  - `users=22`
  - `member_posts=10`
  - `bible_verses(provider=ayt, lang=id)=31102`
- migrasi repo ini juga sudah menempel di MariaDB lokal, termasuk:
  - `add_firebase_uid_to_users_table`
  - `create_personal_access_tokens_table`

Kesimpulan parity:

- parity backend engine terhadap produksi sekarang jauh lebih dekat karena lokal sudah memakai MariaDB, bukan SQLite
- parity data juga lebih baik karena backend ini sudah membaca dataset lokal yang sama dengan hasil migrasi repo beta

## Stabilisasi Frontend Next.js

Status verifikasi terbaru:

- `npm run typecheck` -> lolos
- `next build` di sandbox ini masih gagal `spawn EPERM`

Makna:

- secara type-level, frontend saat ini stabil
- kegagalan build yang tersisa di environment ini terlihat sebagai batasan sandbox/process spawn, bukan error TypeScript aplikasi

Perapihan yang sudah dilakukan:

- `DesktopSidebar` sekarang memakai tipe ikon yang lebih ketat, tidak lagi `any`
- halaman `/today` sekarang mulai membaca `/api/today` untuk `dailyVerse` dan `highlights`, dengan fallback visual lokal saat backend gagal atau kosong
- route `src/app/community/page.tsx` sekarang tidak lagi mock penuh dan sudah diarahkan ke feature page yang memakai `CommunityService`
- `AppShell` tidak lagi memaksa `isAuthenticated=true`; status auth sekarang mengikuti user Firebase yang benar jika tersedia
- `AppShell` juga tidak lagi melempar `navItems` sebagai `any` ke desktop sidebar dan mobile bottom nav
- halaman profile sekarang memakai fallback dari hook `useUser`, `activeNavId="profile"`, dan form profile tidak lagi submit penuh ke browser

## Prioritas Implementasi Berikutnya

Urutan kerja yang paling masuk akal dari kondisi repo sekarang:

1. Verifikasi end-to-end flow Laravel API + Sanctum token dari Firebase sync.
2. Rapikan kontrak API frontend/backend jika masih ada mismatch payload.
3. Tentukan boundary final:
   Laravel-only untuk community, atau Firestore-first untuk realtime community.
4. Jika tetap hybrid:
   implementasikan write/read Firestore untuk entitas realtime.
5. Tambahkan mekanisme sinkronisasi terukur dari Firestore ke Laravel/MariaDB.

## Keputusan Kerja Saat Ini

Berdasarkan audit ini, tahap implementasi berikutnya sebaiknya dimulai dari:

- hardening komunikasi Backend Laravel API
- verifikasi flow Firebase Auth sync
- baru setelah itu implementasi sinkronisasi data lanjutan

Bukan mulai dari Firestore sync terlebih dahulu.
