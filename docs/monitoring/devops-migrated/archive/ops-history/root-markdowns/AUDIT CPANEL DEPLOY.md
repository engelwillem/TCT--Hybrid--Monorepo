```
bash -lc '
set -u
APP_DIR="/home/thechoosentalks/deploy/apps/thechoosentalks"
CURRENT_LINK="$APP_DIR/current"
SHARED_ENV="$APP_DIR/shared/.env"
ARTIFACT="$APP_DIR/build.tar.gz"

echo "== DEPLOY AUDIT START =="

echo
echo "[1] .env"
if [ -f "$SHARED_ENV" ]; then
  ls -l "$SHARED_ENV"
  grep -E "^(APP_ENV|APP_DEBUG|APP_URL|DB_CONNECTION|DB_HOST|DB_PORT|DB_DATABASE|DB_USERNAME)=" "$SHARED_ENV" | sed "s/=.*/=***hidden***/" || true
else
  echo "FAIL: missing $SHARED_ENV"
fi

echo
echo "[2] current symlink"
if [ -L "$CURRENT_LINK" ]; then
  ls -l "$CURRENT_LINK"
  CURRENT_REAL="$(readlink -f "$CURRENT_LINK" 2>/dev/null || true)"
  echo "resolved: ${CURRENT_REAL:-<empty>}"
  [ -n "${CURRENT_REAL:-}" ] && [ -d "$CURRENT_REAL" ] && echo "OK: current points to existing release" || echo "FAIL: current broken"
else
  echo "FAIL: current is not a symlink"
fi

echo
echo "[3] artisan availability"
if [ -n "${CURRENT_REAL:-}" ] && [ -f "$CURRENT_REAL/artisan" ]; then
  ls -l "$CURRENT_REAL/artisan"
  php "$CURRENT_REAL/artisan" --version 2>/dev/null || echo "FAIL: artisan exists but cannot run"
else
  echo "FAIL: artisan not found in current release"
fi

echo
echo "[4] storage and cache permissions"
for p in \
  "$APP_DIR/shared/storage" \
  "$APP_DIR/shared/storage/framework" \
  "$APP_DIR/shared/storage/framework/cache" \
  "$APP_DIR/shared/storage/framework/cache/data" \
  "$APP_DIR/shared/storage/framework/sessions" \
  "$APP_DIR/shared/storage/framework/views" \
  "$APP_DIR/shared/storage/logs"
do
  if [ -e "$p" ]; then
    ls -ld "$p"
  else
    echo "MISSING: $p"
  fi
done

echo
echo "[5] deploy artifact"
if [ -f "$ARTIFACT" ]; then
  ls -lh "$ARTIFACT"
  tar -tzf "$ARTIFACT" >/dev/null 2>&1 && echo "OK: tar.gz readable" || echo "FAIL: tar.gz unreadable"
  tar -tzf "$ARTIFACT" 2>/dev/null | grep -qx "artisan" && echo "OK: artisan in artifact" || echo "FAIL: artisan missing in artifact"
  tar -tzf "$ARTIFACT" 2>/dev/null | grep -qx "public/build/manifest.json" && echo "OK: Vite manifest in artifact" || echo "FAIL: public/build/manifest.json missing in artifact"
else
  echo "FAIL: missing $ARTIFACT"
fi

echo
echo "[6] database connection"
if [ -n "${CURRENT_REAL:-}" ] && [ -f "$CURRENT_REAL/artisan" ]; then
  (
    cd "$CURRENT_REAL" && \
    php artisan tinker --execute="try { DB::connection()->getPdo(); echo \"DB_OK\n\"; } catch (Throwable \$e) { echo \"DB_FAIL: \".\$e->getMessage().\"\n\"; exit(1); }"
  ) 2>/dev/null || echo "FAIL: artisan database check failed"
else
  echo "SKIP: no runnable current release"
fi

echo
echo "[7] app key visible to Laravel"
if [ -n "${CURRENT_REAL:-}" ] && [ -f "$CURRENT_REAL/artisan" ]; then
  (
    cd "$CURRENT_REAL" && \
    php artisan tinker --execute="echo config(\"app.key\") ? \"APP_KEY_OK\n\" : \"APP_KEY_MISSING\n\";"
  ) 2>/dev/null || echo "FAIL: unable to read app.key"
else
  echo "SKIP: no runnable current release"
fi

echo
echo "== DEPLOY AUDIT END =="
'
```
