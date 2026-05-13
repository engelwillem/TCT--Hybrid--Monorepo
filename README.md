# TheChoosenTalks

Platform konten rohani premium berbasis arsitektur decoupled:
- Next.js sebagai frontend edge-ready.
- Laravel sebagai backend API + MariaDB.
- Firebase sebagai authentication dan real-time service.

## Tech Stack Utama

- **Framework**: Next.js 15 (App Router)
- **Backend API**: Laravel 12 (`backend-api`)
- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **UI Components**: Shadcn UI + Lucide Icons
- **Auth & Realtime**: Firebase Auth + Firestore

## Struktur Aplikasi

- `/` -> Landing Page utama
- `/renungan` -> Ritual renungan harian utama
- `/today` -> Legacy route yang me-redirect ke `/renungan`
- `/community` -> Feed komunitas dan interaksi
- `/versehub` -> Bible reader modern
- `/channels` -> Ruang belajar dan program pembinaan
- `/paths` -> Study paths / journey terstruktur

## Desain & Estetika

- **Theme aktif**: Light editorial spiritual
- **Visual**: Soft gradients, elevated cards, subtle texture
- **Typography**:
  - Headings: serif brand styles (`tct-serif`)
  - Body: sans UI stack proyek

## Pengembangan Lokal

```bash
npm install
npm run dev
```

Aplikasi akan berjalan di `http://localhost:9002`.

Sebelum menjalankan, siapkan env:
- Frontend: salin `.env.example` menjadi `.env.local`.
- Backend Laravel: salin `backend-api/.env.example` menjadi `backend-api/.env`.

Frontend akan memanggil endpoint Next.js `/api/*` yang diproxy ke Laravel (`LARAVEL_API_BASE_URL`).

### Troubleshooting Login Lokal (Laravel API unreachable / timeout)

1. Pastikan backend hidup:
```bash
php backend-api/artisan serve --host=127.0.0.1 --port=8000
```
2. Pastikan frontend env menunjuk backend lokal:
```env
LARAVEL_API_BASE_URL=http://127.0.0.1:8000
NEXT_PUBLIC_LARAVEL_API_BASE_URL=http://127.0.0.1:8000
```
3. Cek health endpoint:
```bash
curl http://127.0.0.1:8000/up
```
4. Jika login gagal:
- `422`: kredensial salah / input invalid
- `401`: unauthenticated/session invalid
- `503`: backend tidak terjangkau (offline/DNS/refused)
- `504`: backend timeout

### Bootstrap Admin Lokal

Gunakan command lokal (idempotent, update jika akun sudah ada):
```bash
php backend-api/artisan app:ensure-local-admin
```

Command ini hanya jalan di environment `local/testing` dan tidak mencetak password ke output.

## Firebase Studio

Agar tetap jalan di Firebase Studio (frontend-only), gunakan:

```bash
npm install
npm run dev:studio
```

Catatan:
- Jika `LARAVEL_API_BASE_URL` belum tersedia, beberapa surface tetap bisa render memakai fallback yang aman untuk pengembangan lokal.
- Untuk mode production decoupled penuh, backend Laravel harus aktif dan `LARAVEL_API_BASE_URL` harus mengarah ke backend tersebut.

## Deployment

- **Frontend Next.js**: Tencent Serverless Pages (atau platform serverless lain).
- **Backend Laravel**: cPanel (PHP/Apache + MariaDB).
- **Auth/Realtime**: Firebase.

## Lisensi

MIT
## E2E Acceptance Env (Auth + Privacy)

To run the acceptance suite (`tests/renungan-versehub-acceptance.spec.ts`) without skips:

```bash
npm run test:e2e:acceptance
```

Set these env vars (recommended):

```bash
E2E_ADMIN_EMAIL=
E2E_ADMIN_PASSWORD=
E2E_MEMBER_A_EMAIL=
E2E_MEMBER_A_PASSWORD=
E2E_MEMBER_B_EMAIL=
E2E_MEMBER_B_PASSWORD=
```

Supported aliases/fallbacks:
- `E2E_ADMIN_USER_EMAIL`, `E2E_ADMIN_USER_PASSWORD`
- `E2E_MEMBER_EMAIL`, `E2E_MEMBER_PASSWORD`
- `E2E_MEMBER_SECONDARY_EMAIL`, `E2E_MEMBER_SECONDARY_PASSWORD`
- Legacy fallback for member A: `E2E_AUTH_EMAIL`, `E2E_AUTH_PASSWORD`
