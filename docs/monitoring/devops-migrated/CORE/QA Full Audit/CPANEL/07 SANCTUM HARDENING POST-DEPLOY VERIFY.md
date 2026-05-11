# Sanctum Hardening Post-Deploy Verify

Dokumen ini khusus verifikasi auth/session/cookie setelah deploy backend.

## Tujuan
- Pastikan Sanctum stateful domain valid untuk domain produksi.
- Pastikan auth flow tidak jatuh ke guest karena drift config.
- Pastikan perubahan deploy tidak merusak endpoint auth-protected.

## Baseline Expected
- `SESSION_DOMAIN=.thechoosentalks.org`
- `SESSION_SECURE_COOKIE=true`
- `SESSION_SAME_SITE=lax`
- `sanctum.stateful` memuat domain produksi utama

## Verifikasi Runtime Config
```bash
cd "$(readlink -f /home/thechoosentalks/deploy/apps/thechoosentalks/current)"
php artisan tinker --execute='echo implode(",", config("sanctum.stateful")).PHP_EOL;'
php artisan tinker --execute='echo "SESSION_DOMAIN=".config("session.domain").PHP_EOL; echo "SESSION_SECURE=".(config("session.secure")?"true":"false").PHP_EOL; echo "SESSION_SAME_SITE=".config("session.same_site").PHP_EOL;'
```

## Verifikasi Route dan Endpoint Auth
```bash
php artisan route:list | grep -E "api/v1/login|api/v1/register|api/v1/profile|api/v1/community/ai/assist|api/v1/versehub/.*/mentor/ask" || true
curl -i -X POST https://api.thechoosentalks.org/api/v1/login -H "Content-Type: application/json" -d '{"email":"invalid@example.com","password":"invalid"}' || true
```

## Watchlist
- `Unauthenticated` untuk endpoint auth-only tanpa token: expected.
- `419` intermiten: indikasi boundary cookie/csrf.
- `500` pada endpoint auth-only: cek schema dan log.

## Post-Deploy Rule
Jangan close deploy jika sanctum/session check belum pass.
