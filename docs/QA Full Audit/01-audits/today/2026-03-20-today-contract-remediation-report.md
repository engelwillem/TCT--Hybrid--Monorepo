# Today Contract Remediation Report (2026-03-20)

## Issue Summary
Kontrak data Today mengalami drift: frontend masih membaca field yang tidak lagi dikirim backend (`pinnedLesson`, `welcomeVerse`), sehingga rendering bergantung pada field phantom.

## Root Cause
Evolusi backend Today sudah dipersempit ke payload inti (`dailyVerse`, `rituals`, `highlights`, `spiritual_state`), tetapi frontend belum menurunkan ekspektasi kontraknya.

## Previous Mismatch Fields
- `pinnedLesson` (dibaca frontend, tidak dikirim backend)
- `welcomeVerse` (dibaca frontend, tidak dikirim backend)

## Final Contract Decision
**A. Kontrak frontend diturunkan agar mengikuti backend nyata.**

Alasan:
- Backend saat ini sudah stabil dan realistis untuk production minimal.
- Perubahan paling kecil dan aman adalah menghapus ketergantungan frontend pada field phantom.
- Tidak menambah utang teknis baru di backend.

## Affected Files
- `src/app/today/page.tsx`
- `src/app/api/today/route.ts` (diaudit, tidak perlu perubahan)
- `backend-api/app/Http/Controllers/Api/V1/TodayApiController.php` (diaudit, tidak perlu perubahan)

## Remediation Applied
1. Menghapus field phantom dari tipe respons frontend Today:
   - `pinnedLesson`
   - `welcomeVerse`
2. Menghapus state frontend yang bergantung pada field phantom:
   - `apiPinnedLesson`
   - `apiWelcomeVerse`
3. Menghapus assignment dari payload yang tidak ada:
   - `setApiPinnedLesson(...)`
   - `setApiWelcomeVerse(...)`
4. Menghapus blok render `PinnedLessonCard` yang bergantung pada `apiPinnedLesson`.
5. Menjaga `DailyVerseHeroCard` tetap stabil dengan source yang jujur:
   - `welcomeVerse={normalizedRitualVerse ?? undefined}`
   - `fallbackVerse={dailyVerse}`

## Verification Evidence
- Route Next proxy tetap kompatibel:
  - `src/app/api/today/route.ts` tetap memproxy ke `/api/v1/today` tanpa perubahan kontrak.
- Backend controller tetap source-of-truth payload:
  - `dailyVerse`, `rituals`, `highlights`, `spiritual_state`.
- Frontend setelah patch hanya memakai field kontrak nyata tersebut.
- `npm run typecheck` ✅ lulus.

## Residual Risk
- Jika di masa depan `pinnedLesson` ingin diaktifkan lagi, harus melalui perubahan kontrak backend resmi (bukan implicit fallback frontend).
- Data minimal (`dailyVerse: null`, `rituals: []`, `highlights: []`) tetap menghasilkan mode fallback UI yang jujur.

## Final Status
`PASS`
