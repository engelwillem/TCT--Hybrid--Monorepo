# Local <-> cPanel MySQL Parity

This project is configured so local development mirrors cPanel production behavior as closely as possible.

## 1) Environment Parity

Use these key values in local `.env`:

- `DB_CONNECTION=mysql`
- `DB_HOST=127.0.0.1`
- `DB_PORT=3306`
- `DB_DATABASE=tct_localserver` (or your local db name)
- `DB_USERNAME=tct_local` (or your local db user)
- `SESSION_DRIVER=file`
- `SESSION_DOMAIN=` (must be empty, do not use literal `null`)
- `SESSION_SECURE_COOKIE=false` for local HTTP
- `CACHE_STORE=file`
- `QUEUE_CONNECTION=sync`

Use matching admin identity in both local and cPanel:

- `ADMIN_LOGIN_EMAIL=engel.willem@gmail.com`
- `ADMIN_LOGIN_PASSWORD=<same-password-on-both-environments>`
- `ADMIN_LOGIN_NAME=TCT Admin`

## 2) Admin Account Sync

Run this command after migration (local or server):

```bash
php artisan app:sync-admin-account
```

This command ensures:

- Admin user exists by `ADMIN_LOGIN_EMAIL`
- `is_admin=1`, `is_it=1`
- `email_verified_at` is set
- Password is updated if `ADMIN_LOGIN_PASSWORD` is not empty

## 3) Deploy Safety

`deploy.sh` runs:

```bash
php artisan app:sync-admin-account
```

after `php artisan migrate --force`, so cPanel keeps admin parity automatically on each deploy.

