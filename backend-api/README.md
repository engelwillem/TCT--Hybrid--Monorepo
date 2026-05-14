# Backend API Workspace

This directory is the standalone Laravel backend for the Laravel Hybrid monorepo.

## Scope

- Laravel API and server-rendered/admin surfaces live here.
- Frontend Next.js does not boot this workspace automatically.
- CI/CD for cPanel should target this directory only.

## Local Commands

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --force
npm install
npm run build
php artisan serve
```

## Environment Notes

- This workspace is MariaDB-only for local parity and MariaDB-targeted for production parity.
- Laravel tetap memakai `DB_CONNECTION=mysql` karena konektor PDO/Laravel untuk MariaDB kompatibel lewat driver tersebut.
- Keep `.env` in the shared deploy path on cPanel, not in git.
- Set `CORS_ALLOWED_ORIGINS` to the frontend origins that call `/api/v1/*`.
- Set `FIREBASE_PROJECT_ID` and `FIREBASE_WEB_API_KEY` only when Firebase sync is enabled.

## CI/CD Notes

- Build artifact must include `vendor/` and `public/build/manifest.json`.
- Use [`deploy.sh`](./deploy.sh) for atomic release deploys on cPanel.
- Use [`healthcheck.sh`](./healthcheck.sh) after extract/migrate.
- Use [`rollback.sh`](./rollback.sh) if the post-switch healthcheck fails.
