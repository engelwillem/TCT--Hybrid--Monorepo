# TheChosenTalks

Platform konten rohani berbasis Laravel + Inertia + React, dengan 4 area utama:
- Today feed
- Channels (termasuk Sabbath School)
- Community
- VerseHub Bible Reader

## Tech Stack

- Backend: Laravel 12 (PHP 8.2+)
- Frontend: Inertia.js + React 18 + TypeScript
- Styling: Tailwind CSS + komponen internal
- Auth: Laravel Breeze
- Admin Panel: Filament

## Status Fitur Saat Ini

### User App
- `/today`
  - Welcome verse card
  - Activity quote card
  - Feed komunitas aktif
- `/channels`
  - Daftar channel utama
  - Sabbath School index + lesson/day view
- `/community`
  - Feed diskusi + archive
  - Reaction/comment/bookmark flow
- `/profile`
  - Edit profil, avatar, password
  - Shortcut ke VerseHub activity

### VerseHub
- Reader home: `/versehub/id`
- Chapter reader: `/versehub/id/{book_code}-{chapter}`
- Verse detail: `/versehub/{lang}/{book_code}-{chapter}-{verse}`
- OG image: `/versehub/{lang}/{ref}/og.png`
- My Activity: `/versehub/id/my-activity`
- Aksi ayat tersimpan (favorite/bookmark/note) + summary card “My Spiritual Journey”

### Admin (Filament)
- Login: `/admintalk/login`
- Dashboard: `/admintalk`
- Resources:
  - Channels
  - Posts
  - Sabbath School: `ss-quarters`, `ss-lessons`, `ss-days`
  - Community moderation:
    - `member-posts`
    - `member-post-comments`
  - Today legacy data:
    - `legacy-quarters`
    - `legacy-lessons`

> Backward-compat route:
> `/admin` dan `/admin/login` diarahkan ke `/admintalk/login`.

## Struktur Penting

- `app/Http/Controllers` -> backend logic per domain
- `app/Filament/Resources` -> admin CRUD & moderasi
- `resources/js` -> halaman Inertia React
- `resources/views/versehub` -> Blade untuk VerseHub reader/show
- `config/versehub_books.php` -> single source of truth `book_code`
- `routes/web.php` -> route utama aplikasi

## Setup Lokal

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate
```

Jalankan dev:
```bash
composer dev
```

Atau terpisah:
```bash
php artisan serve
npm run dev
```

## Build & Verification

```bash
npm run build
php artisan test
```

## Catatan Deploy (Git/cPanel)

- Jangan commit:
  - `.env`, `vendor/`, `node_modules/`
  - `public/build/*` (artefak build)
  - runtime `storage/*` (kecuali `.gitignore`)
  - file tmp/audit lokal
- Build asset di server deploy (`npm run build`) atau upload artefak build terpisah sesuai strategi Anda.
- sudah pasang deploy.sh tahap konfigurasi sudah mendekati stabil

## Roadmap Internal (Ringkas)

- Konsolidasi penuh sumber data Today (legacy vs non-legacy)
- Panel audit admin untuk data completeness lintas halaman
- Hardening performa & observability untuk shared hosting

## License

MIT
# TCT--Laravel
