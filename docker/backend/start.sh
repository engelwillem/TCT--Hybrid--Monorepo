#!/usr/bin/env bash
set -euo pipefail

cd /workspace/backend-api

if [ ! -f vendor/autoload.php ]; then
  composer install --no-interaction --prefer-dist
fi

attempt=1
until php /workspace/docker/backend/wait-for-db.php >/dev/null 2>&1; do
  if [ "$attempt" -ge 20 ]; then
    echo "Database is still unavailable after $attempt attempts."
    exit 1
  fi

  attempt=$((attempt + 1))
  sleep 3
done

if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
  php artisan migrate --force
fi

php artisan optimize:clear
php artisan serve --host=0.0.0.0 --port=8000
