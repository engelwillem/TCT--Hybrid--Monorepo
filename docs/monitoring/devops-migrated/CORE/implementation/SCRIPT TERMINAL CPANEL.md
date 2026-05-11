Siap, pakai path production cPanel Anda ini:

`/home/thechoosentalks/deploy/apps/thechoosentalks/current`

Script bash siap pakai (idempotent, aman, tidak print API key):

```bash
#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/home/thechoosentalks/deploy/apps/thechoosentalks/current"
ENV_FILE=".env"

cd "$APP_DIR"

if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: $APP_DIR/$ENV_FILE tidak ditemukan"
  exit 1
fi

cp "$ENV_FILE" "${ENV_FILE}.bak.$(date +%Y%m%d-%H%M%S)"

read -rsp "Masukkan OPENAI_API_KEY (sk-...): " OPENAI_API_KEY
echo

upsert_env () {
  local key="$1"
  local val="$2"
  if grep -qE "^${key}=" "$ENV_FILE"; then
    sed -i "s|^${key}=.*|${key}=${val}|" "$ENV_FILE"
  else
    echo "${key}=${val}" >> "$ENV_FILE"
  fi
}

upsert_env "AI_PROVIDER" "openai"
upsert_env "AI_FAIL_SOFT" "true"
upsert_env "AI_TIMEOUT_SECONDS" "20"
upsert_env "AI_CACHE_ENABLED" "true"
upsert_env "AI_CACHE_TTL_SECONDS" "600"
upsert_env "OPENAI_API_KEY" "$OPENAI_API_KEY"
upsert_env "OPENAI_MODEL" "gpt-4o-mini"
upsert_env "OPENAI_TEMPERATURE" "0.5"
upsert_env "OPENAI_MAX_OUTPUT_TOKENS" "700"
upsert_env "AI_TELEMETRY_LOG_CHANNEL" ""
upsert_env "RENUNGAN_MENTOR_DRIVER" "template"
upsert_env "VERSEHUB_MENTOR_DRIVER" "template"
upsert_env "COMMUNITY_AI_DRIVER" "openai"
upsert_env "SHARE_ASSETS_AI_TEXT_ENABLED" "true"
upsert_env "SHARE_ASSETS_AI_IMAGE_ENABLED" "false"

php artisan optimize:clear
php artisan config:clear

php -r "require 'vendor/autoload.php'; \$app=require 'bootstrap/app.php'; \$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap(); echo trim((string)config('ai.openai.api_key'))!=='' ? 'OPENAI_KEY_OK' : 'OPENAI_KEY_EMPTY'; echo PHP_EOL;"
```

Kalau mau, saya bisa lanjut bikinkan versi **1 baris SSH command** dari laptop Anda langsung ke server juga.