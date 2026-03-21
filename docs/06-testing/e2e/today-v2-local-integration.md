# Today V2 Local Integration Check (Frontend <-> Laravel)

## 1) Backend (Laravel)
1. Open terminal in `backend-api`.
2. Ensure app key and deps are ready (`composer install`, `php artisan key:generate`) if first run.
3. Start server:
   - `php artisan serve --host=127.0.0.1 --port=8000`
4. Quick endpoint check:
   - `curl http://127.0.0.1:8000/api/today-v2/session`
   - Expected: root JSON includes `"contractVersion":"today-v2.session.v1"`.

## 2) Frontend (Next.js)
1. Create/adjust `.env.local` in repo root:
   - `LARAVEL_API_BASE_URL=http://127.0.0.1:8000`
   - `TODAY_V2_STRICT_INTEGRATION=true`
   - `TODAY_V2_INTEGRATION_TRACE=true`
2. Start frontend:
   - `npm run dev`
3. Open:
   - `http://localhost:9002/today-v2`

## 3) Expected behavior
- Page renders normally with ritual flow.
- Server logs contain `[today-v2] content diagnostics` with `sourceStatus: "external"`.
- No strict integration error should occur.

## 4) Debug signal meanings
- `sourceStatus: "fallback_only"`:
  frontend did not reach Laravel payload.
- strict integration error:
  fallback/mismatch/required missing detected while strict mode on.
- `warnCount > 0`:
  contract/content issue needs action before treating integration as ready.

## 5) Turn off strict mode after local proof
- Set:
  - `TODAY_V2_STRICT_INTEGRATION=false`
  - `TODAY_V2_INTEGRATION_TRACE=false`

## 6) Preview specific date content (content team workflow)
1. Make sure target file exists in backend:
   - `backend-api/content/today-v2/YYYY-MM-DD.php`
2. Open frontend URL with preview query:
   - `http://localhost:9002/today-v2?previewDate=2026-03-21`
3. Frontend will forward `previewDate` to backend endpoint:
   - `/api/today-v2/session?previewDate=2026-03-21`
4. Verify preview source via response header (optional):
   - `X-Today-V2-Preview-Date: 2026-03-21`
   - `X-Today-V2-Preview-Fallback: 0|1`

Notes:
- Preview query is allowed by default in local/testing runtime.
- Production behavior stays normal (today date + default fallback) unless backend env explicitly sets:
  - `TODAY_V2_ALLOW_PREVIEW_QUERY=true`
