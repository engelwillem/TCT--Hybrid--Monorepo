```bash
cd ~/deploy/apps/thechoosentalks || exit 1

echo "=== BEFORE ==="
readlink -f current
git ls-remote git@github.com:engelwillem/TCT--Hybrid--Monorepo.git HEAD

echo "=== RUN DEPLOY ==="
bash deploy.sh || { echo "DEPLOY FAILED"; exit 1; }

echo "=== AFTER ==="
readlink -f current

cd "$(readlink -f current)" || exit 1

echo "=== VERIFY TODAY CLEAN NAMING ==="
php artisan today:lint || exit 1
php artisan route:list | grep today || true
curl -I https://api.thechoosentalks.org/api/today/session
```
