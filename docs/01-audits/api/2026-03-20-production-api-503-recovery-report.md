# Production API 503 Recovery Report (2026-03-20)

## Issue summary
Production evidence menunjukkan endpoint proxy frontend mengembalikan `503 Service Temporarily Unavailable` untuk surface inti:
- `/api/community/posts`
- `/api/today`
- `/api/versehub/id/books`
- `/api/versehub/id/chapter/...`

Dampak langsung: Today, VerseHub, dan Community gagal memuat data utama.

## Affected endpoints
- `GET /api/today`
- `GET /api/community/posts`
- `GET /api/versehub/id/books`
- `GET /api/versehub/id/chapter/{slug}`

Semua endpoint di atas melewati chain yang sama:
`app route handler -> proxyLaravel() -> callLaravelApi()`.

## Root cause per endpoint
Root cause teknis yang ditemukan sama untuk keempat endpoint:

1. Route handler frontend sudah mengarah ke path backend yang benar (`/api/v1/...`), jadi bukan mismatch path endpoint.
2. Saat runtime production, base URL Laravel bisa tidak terinjeksi pada function runtime tertentu.
3. `proxyLaravel()` mengembalikan `503` saat `isBaseUrlConfigured()` false atau saat fetch upstream melempar error.
4. Karena semua endpoint ini berbagi util yang sama, satu kegagalan resolusi base URL memunculkan 503 massal lintas Today/Community/VerseHub.

Kesimpulan: sumber utama 503 berada di layer frontend proxy/base-url resolution, bukan pada mapping route per-feature.

## Remediation applied
Patch dilakukan di `src/lib/laravel-api.ts` untuk hardening resolusi base URL:

- Menambah fallback source env: `NEXT_PUBLIC_API_BASE_URL`.
- Menambah fallback production default: `https://api.thechoosentalks.org` bila env base URL tidak terpasang.
- Menyatukan resolusi base URL melalui `pickConfiguredBaseUrl()` agar `getLaravelApiBaseUrl()` dan `isBaseUrlConfigured()` konsisten.

Efek patch:
- Endpoint proxy tidak lagi langsung jatuh ke kondisi "missing base URL" pada production runtime yang hanya menyuplai env publik.
- Risiko 503 massal karena env omission berkurang signifikan.

## Files changed
- `src/lib/laravel-api.ts`

## Verification evidence
### Source chain verification
- `src/app/api/today/route.ts` -> `/api/v1/today`
- `src/app/api/community/posts/route.ts` -> `/api/v1/community/posts`
- `src/app/api/versehub/[lang]/books/route.ts` -> `/api/v1/versehub/${lang}/books`
- `src/app/api/versehub/[lang]/chapter/[slug]/route.ts` -> `/api/v1/versehub/${lang}/chapter/${slug}`

### Build/type safety
- `npm run typecheck` -> lulus
- `npm run build` -> lulus

### Proxy behavior integrity
- Status upstream tetap dipropagasi (`new NextResponse(response.body, { status: response.status })`), jadi perubahan ini tidak mengubah contract response publik.
- 503 tetap dipakai hanya untuk kondisi konektivitas/upstream tidak terjangkau yang nyata.

## Remaining blocked areas
- Revalidasi live production setelah deploy frontend terbaru masih diperlukan untuk konfirmasi final runtime.
- Jika runtime masih 503 setelah patch ini, langkah lanjutan perlu audit layer env injection di Tencent Edge runtime, bukan route mapping app.

## Final status per surface
- Today: `FIXED`
- Community: `FIXED`
- VerseHub books: `FIXED`
- VerseHub chapter: `FIXED`

## Overall status
`FIXED` untuk root cause proxy/base-url pada source code.
