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

- `/` -> Landing Page Premium (Hero & Sticky Features)
- `/today` -> Dashboard Harian (Quick Access & Inspiration)
- `/community` -> Feed Komunitas & Interaksi
- `/versehub` -> Bible Reader Modern
- `/channels` -> Program Pembinaan Iman (Sabbath School, dll.)

## Desain & Estetika

- **Theme**: Deep Space (Slate-950)
- **Visual**: Glassmorphism, Animated Glow Orbs, Radial Gradients.
- **Typography**: 
  - Headings: `Instrument Serif`
  - Body: `Inter`

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

## Firebase Studio

Agar tetap jalan di Firebase Studio (frontend-only), gunakan:

```bash
npm install
npm run dev:studio
```

Catatan:
- Jika `LARAVEL_API_BASE_URL` belum tersedia, UI tetap bisa render karena service layer memakai fallback mock saat API gagal.
- Untuk mode production decoupled penuh, backend Laravel harus aktif dan `LARAVEL_API_BASE_URL` harus mengarah ke backend tersebut.

## Deployment

- **Frontend Next.js**: Tencent Serverless Pages (atau platform serverless lain).
- **Backend Laravel**: cPanel (PHP/Apache + MariaDB).
- **Auth/Realtime**: Firebase.

## Lisensi

MIT
