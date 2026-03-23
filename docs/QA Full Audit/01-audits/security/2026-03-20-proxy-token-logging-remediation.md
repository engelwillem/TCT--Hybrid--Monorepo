# Proxy Token Logging Remediation (2026-03-20)

## Issue Summary
Layer proxy Next.js ke Laravel masih memiliki debug log yang berpotensi membocorkan credential sensitif (Authorization header/token dan headers mentah).

## Root Cause
- `src/lib/proxy-laravel.ts` mencetak nilai `authorization` secara langsung (`PROXY_DEBUG_TOKEN`).
- `src/lib/laravel-api.ts` mencetak `fetchOptions.headers` mentah, yang dapat berisi bearer token/cookie/csrf pada alur proxy.

## Affected File
- `src/lib/proxy-laravel.ts`
- `src/lib/laravel-api.ts` (helper langsung pada alur proxy)

## Risk Level
`HIGH`  
Karena credential bisa terekspos ke log server/runtime dan berpotensi diakses pihak tidak berwenang.

## Exact Remediation Applied
1. Menghapus seluruh debug log yang menampilkan nilai sensitif:
   - `PROXY_DEBUG_TOKEN`
   - `FETCH_DEBUG_OPTIONS` (headers mentah)
2. Mengganti observability menjadi metadata aman:
   - request id (generated/forwarded)
   - HTTP method
   - source path / target path (tanpa query)
   - response status
   - boolean presence only (`hasAuth`, `hasCookie`, `hasXsrf`)
3. Men-sanitasi error log pada proxy:
   - hanya log `errorName` dan metadata aman
   - tidak lagi log object error mentah yang berisiko membawa context sensitif.

## Verification Evidence
Commands executed:
1. `rg --line-number "Authorization|Bearer|token|cookie|csrf|headers|console\\.log|logger" src -g "*.ts" -g "*.tsx"`
2. `rg --line-number "console\\.(log|info|warn|error)" src/lib/proxy-laravel.ts src/lib/laravel-api.ts`
3. `rg --line-number "PROXY_DEBUG_TOKEN|FETCH_DEBUG_OPTIONS|request\\.headers|cookieValue|Authorization:\\s*authorization|X-XSRF-TOKEN" src/lib/proxy-laravel.ts src/lib/laravel-api.ts`
4. `npm run typecheck`

Observed result summary:
- Tidak ada lagi log yang mencetak token/authorization/cookie/csrf mentah pada alur proxy Laravel.
- Log yang tersisa di dua file fokus hanya metadata aman.
- TypeScript compile check lulus.

## Residual Risk
- Masih ada penggunaan Authorization header di berbagai service/frontend call (normal dan diperlukan), namun bukan kebocoran logging.
- Scope ini tidak mengubah flow auth maupun transport headers (sesuai batasan task).

## Final Status
`PASS`
