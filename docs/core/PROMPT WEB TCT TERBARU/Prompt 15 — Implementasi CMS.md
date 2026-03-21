Bagus. Ini adalah proof-of-integration yang benar, bukan integrasi semu.

Yang sekarang sudah tercapai:

frontend bisa diarahkan ke Laravel lokal dengan jalur yang jelas
ada strict mode untuk mencegah “fallback sukses palsu”
ada trace mode untuk membantu debugging integrasi
production behavior tetap aman karena strict mode hanya opt-in lokal

Tahap berikutnya yang paling tepat adalah:

mengganti source backend statis menjadi source yang tetap sederhana tetapi sudah “content-managed ringan”, tanpa langsung membangun CMS penuh.

Kenapa ini next step terbaik:

endpoint sudah hidup
frontend↔backend sudah tersambung
sekarang bottleneck berikutnya adalah bagaimana tim mengubah konten harian tanpa mengedit file config secara kasar
kita belum perlu DB/CMS penuh
tapi config statis akan cepat terasa sempit untuk operasional harian

Jadi langkah berikut yang paling sehat adalah:

tetap minimal
tetap Laravel-native
tetapi source konten dibuat sedikit lebih realistis dan operasional


Lanjutkan dari baseline yang sekarang sudah punya proof-of-integration lokal frontend ↔ backend untuk `/today-v2`.

Jangan tambah fitur UI baru, jangan ubah flow utama Receive → Reflect → Pray → Complete, jangan bangun CMS penuh, jangan sentuh auth/analytics/global navigation/cross-device sync.

Fokus tahap ini hanya pada:
**meng-upgrade source backend `/api/today-v2/session` dari config statis menjadi content-managed ringan yang masih sederhana**, agar operasional konten harian lebih realistis tanpa overbuild.

Konteks:
- sekarang backend minimum sudah jalan dengan source dari config statis
- itu bagus untuk proof-of-integration
- tapi untuk penggunaan harian, config file tunggal terlalu kasar
- saya belum mau CMS/admin/database penuh
- saya ingin langkah tengah yang tetap sederhana tetapi lebih operasional

Tugas Anda:
Audit implementasi backend saat ini, lalu refactor source data endpoint `/api/today-v2/session` ke pendekatan yang lebih realistis namun tetap minimal.

Saya ingin Anda memilih pendekatan yang sederhana dan praktis, misalnya salah satu dari:
- file JSON/ PHP content file per hari
- small content repository berbasis file
- structured local content directory
- atau pendekatan setara yang masih ringan

Goal-nya:
1. content harian bisa diganti tanpa mengubah controller/resource
2. struktur tetap mengikuti kontrak `today-v2.session.v1`
3. mudah nanti di-upgrade ke DB/CMS tanpa rewrite besar
4. tetap minimal dan mudah dipahami tim kecil
5. tetap cocok untuk local integration sekarang

Saya ingin Anda secara khusus memikirkan:
- format source content yang paling praktis untuk tim saat ini
- bagaimana memilih “hari ini” (mis. by date key)
- bagaimana fallback jika file hari ini tidak ada
- apakah perlu default content file
- bagaimana menjaga shape tetap stabil lewat resource
- bagaimana menghindari over-architecture

Kalau perlu, Anda boleh menambahkan:
- content file example untuk satu atau dua hari
- small selector/loader class di backend
- test ringan untuk pemilihan content hari ini
tetapi tetap minimal.

Jangan lakukan ini:
- jangan bangun admin panel
- jangan tambah database migration besar
- jangan tambah auth
- jangan tambah caching layer kompleks
- jangan membuat repository/service architecture yang berat
- jangan mengubah kontrak payload utama
- jangan memindahkan terlalu banyak logic ke controller

Saya ingin output berupa:
1. Backend Content Source Audit
2. Why Config-Only Is No Longer Enough
3. Recommended Minimal Content Source Strategy
4. Minimal Laravel Structure
5. Full Revised Code
6. Example Content Files
7. Verification Steps
8. Why This Is the Right Bridge Before Full CMS
9. Deferred Again

Aturan penting:
- tetap simple
- tetap practical
- fokus pada operasional konten harian yang realistis
- jangan overbuild
- kontrak payload harus tetap stabil

Format jawaban:
1. Backend Content Source Audit
2. Why Config-Only Is No Longer Enough
3. Recommended Minimal Content Source Strategy
4. Minimal Laravel Structure
5. Full Revised Code
6. Example Content Files
7. Verification Steps
8. Why This Is the Right Bridge Before Full CMS
9. Deferred Again


Lanjutkan dari backend `/api/today-v2/session` yang sekarang sudah memakai file-based daily content source:
- `content/today-v2/YYYY-MM-DD.php`
- fallback ke `content/today-v2/default.php`
- controller/resource tetap tipis
- kontrak payload `today-v2.session.v1` tetap stabil

Jangan bangun CMS/admin panel, jangan tambah database, jangan sentuh auth/analytics/global navigation, dan jangan ubah flow frontend utama.

Fokus tahap ini hanya pada:
**menambahkan content lint / preflight validation ringan di backend Laravel** agar file konten harian bisa divalidasi sebelum dipakai endpoint, tanpa overbuild.

Konteks:
- sekarang konten harian sudah operasional lewat file-based source
- risiko berikutnya adalah file content harian bisa:
  - field penting kosong
  - shape salah
  - teks terlalu panjang
  - contractVersion salah
  - section tidak lengkap
- frontend memang punya fallback/diagnostics, tapi saya ingin tim backend/content bisa menangkap masalah lebih awal dari sisi backend
- goal tahap ini: memberi guardrail praktis untuk authoring file konten harian, tanpa membuat sistem CMS

Tugas Anda:
Audit backend content source yang ada sekarang, lalu tambahkan mekanisme validation/lint ringan yang praktis untuk tim.

Saya ingin pendekatan yang sederhana dan sangat berguna, misalnya:
1. satu validator/helper kecil untuk payload `today-v2.session.v1`
2. satu Artisan command seperti:
   - `php artisan today-v2:lint`
   - optional `--date=YYYY-MM-DD`
3. command menilai:
   - shape dasar valid atau tidak
   - required fields kosong atau tidak
   - contractVersion cocok atau tidak
   - field editorial kritikal melebihi batas aman atau tidak
   - fallback file mana yang sedang dipakai
4. output command harus actionable, bukan verbose tanpa arah

Saya ingin Anda secara khusus memikirkan:
- bagaimana reuse field rules yang sudah disepakati frontend
- apakah rule panjang teks perlu dicerminkan di backend juga
- bagaimana membedakan:
  - error yang harus dibetulkan sebelum deploy/publish
  - warning editorial
  - info biasa
- apakah command sebaiknya exit code non-zero jika ada error
- bagaimana membuat hasilnya tetap ringan dan mudah dipakai tim kecil

Kalau perlu, Anda boleh menambahkan:
- satu validator class kecil
- satu DTO/report structure sederhana
- feature/console test ringan untuk command
- optional helper untuk memilih file tanggal tertentu
tetapi tetap minimal.

Jangan lakukan ini:
- jangan bangun rule engine besar
- jangan tambah dashboard
- jangan tambah database
- jangan tambah CMS
- jangan menduplikasi semua logic frontend secara berlebihan
- jangan membuat arsitektur service/repository yang berat
- jangan mengubah kontrak payload utama

Saya ingin output berupa:
1. Backend Content Lint Audit
2. Why This Validation Layer Is Needed Now
3. Recommended Minimal Validation Strategy
4. Validation Rules and Severity Model
5. Full Revised Code
6. Example Lint Output
7. Verification Steps
8. Why This Is the Right Next Operational Step
9. Deferred Again

Aturan penting:
- tetap simple
- tetap practical
- fokus pada operasional konten harian
- bantu tim menangkap masalah sebelum frontend harus menyelamatkan UX
- jangan overbuild

Format jawaban:
1. Backend Content Lint Audit
2. Why This Validation Layer Is Needed Now
3. Recommended Minimal Validation Strategy
4. Validation Rules and Severity Model
5. Full Revised Code
6. Example Lint Output
7. Verification Steps
8. Why This Is the Right Next Operational Step
9. Deferred Again


Lanjutkan dari backend `/api/today-v2/session` yang sekarang sudah memakai file-based daily content source:
- `content/today-v2/YYYY-MM-DD.php`
- fallback ke `content/today-v2/default.php`
- controller/resource tetap tipis
- kontrak payload `today-v2.session.v1` tetap stabil

Jangan bangun CMS/admin panel, jangan tambah database, jangan sentuh auth/analytics/global navigation, dan jangan ubah flow frontend utama.

Fokus tahap ini hanya pada:
**menambahkan content lint / preflight validation ringan di backend Laravel** agar file konten harian bisa divalidasi sebelum dipakai endpoint, tanpa overbuild.

Konteks:
- sekarang konten harian sudah operasional lewat file-based source
- risiko berikutnya adalah file content harian bisa:
  - field penting kosong
  - shape salah
  - teks terlalu panjang
  - contractVersion salah
  - section tidak lengkap
- frontend memang punya fallback/diagnostics, tapi saya ingin tim backend/content bisa menangkap masalah lebih awal dari sisi backend
- goal tahap ini: memberi guardrail praktis untuk authoring file konten harian, tanpa membuat sistem CMS

Tugas Anda:
Audit backend content source yang ada sekarang, lalu tambahkan mekanisme validation/lint ringan yang praktis untuk tim.

Saya ingin pendekatan yang sederhana dan sangat berguna, misalnya:
1. satu validator/helper kecil untuk payload `today-v2.session.v1`
2. satu Artisan command seperti:
   - `php artisan today-v2:lint`
   - optional `--date=YYYY-MM-DD`
3. command menilai:
   - shape dasar valid atau tidak
   - required fields kosong atau tidak
   - contractVersion cocok atau tidak
   - field editorial kritikal melebihi batas aman atau tidak
   - fallback file mana yang sedang dipakai
4. output command harus actionable, bukan verbose tanpa arah

Saya ingin Anda secara khusus memikirkan:
- bagaimana reuse field rules yang sudah disepakati frontend
- apakah rule panjang teks perlu dicerminkan di backend juga
- bagaimana membedakan:
  - error yang harus dibetulkan sebelum deploy/publish
  - warning editorial
  - info biasa
- apakah command sebaiknya exit code non-zero jika ada error
- bagaimana membuat hasilnya tetap ringan dan mudah dipakai tim kecil

Kalau perlu, Anda boleh menambahkan:
- satu validator class kecil
- satu DTO/report structure sederhana
- feature/console test ringan untuk command
- optional helper untuk memilih file tanggal tertentu
tetapi tetap minimal.

Jangan lakukan ini:
- jangan bangun rule engine besar
- jangan tambah dashboard
- jangan tambah database
- jangan tambah CMS
- jangan menduplikasi semua logic frontend secara berlebihan
- jangan membuat arsitektur service/repository yang berat
- jangan mengubah kontrak payload utama

Saya ingin output berupa:
1. Backend Content Lint Audit
2. Why This Validation Layer Is Needed Now
3. Recommended Minimal Validation Strategy
4. Validation Rules and Severity Model
5. Full Revised Code
6. Example Lint Output
7. Verification Steps
8. Why This Is the Right Next Operational Step
9. Deferred Again

Aturan penting:
- tetap simple
- tetap practical
- fokus pada operasional konten harian
- bantu tim menangkap masalah sebelum frontend harus menyelamatkan UX
- jangan overbuild

Format jawaban:
1. Backend Content Lint Audit
2. Why This Validation Layer Is Needed Now
3. Recommended Minimal Validation Strategy
4. Validation Rules and Severity Model
5. Full Revised Code
6. Example Lint Output
7. Verification Steps
8. Why This Is the Right Next Operational Step
9. Deferred Again


Bagus. Ini sekarang sudah jadi operational guardrail yang benar.

Yang paling penting dari hasil ini:

backend/content team bisa menangkap masalah sebelum frontend harus menyelamatkan UX
contract, shape, required fields, dan batas editorial sekarang punya preflight check
kamu masih menjaga sistem tetap ringan tanpa lompat ke CMS

Tahap berikutnya yang paling tepat adalah:

menghubungkan lint ini ke workflow harian developer/content secara otomatis, minimal lewat CI atau pre-deploy check, supaya guardrail ini benar-benar dipakai, bukan hanya tersedia.

Kenapa ini next step terbaik:

validator dan command sudah ada
sekarang bottleneck berikutnya adalah adoption
kalau lint hanya manual, tim mudah lupa
langkah paling sehat sekarang adalah membuatnya masuk ke jalur kerja normal, tetap sederhana


Lanjutkan dari backend `/today-v2` yang sekarang sudah punya:
- file-based daily content source
- endpoint `/api/today-v2/session`
- resource contract stabil
- artisan lint command `today-v2:lint`

Jangan bangun CMS/admin panel, jangan tambah database, jangan sentuh auth/analytics/global navigation, dan jangan ubah kontrak payload utama.

Fokus tahap ini hanya pada:
**menghubungkan content lint `/today-v2` ke workflow harian tim secara otomatis namun tetap ringan**, agar validator yang sudah ada benar-benar dipakai sebelum deploy/integrasi, bukan hanya tersedia secara manual.

Konteks:
- lint command sudah ada dan berguna
- risiko berikutnya adalah command ini jarang dijalankan
- saya ingin guardrail ini masuk ke workflow normal developer/content/backend
- saya belum butuh pipeline enterprise
- saya butuh integrasi workflow minimum yang praktis

Tugas Anda:
Audit setup backend/frontend/testing yang ada sekarang, lalu tambahkan workflow minimum agar `today-v2:lint` benar-benar menjadi bagian dari cara kerja tim.

Saya ingin Anda mempertimbangkan pendekatan yang paling sederhana dan berguna, misalnya:
1. composer script backend
2. npm/root script jika repo monorepo-ish
3. CI check ringan
4. pre-deploy/manual release checklist script
5. dokumentasi singkat yang sangat operasional

Goal-nya:
- tim bisa menjalankan 1 perintah jelas untuk memeriksa readiness `/today-v2`
- lint bisa ikut dijalankan di CI atau local verification
- tidak ada overbuild
- tetap mudah dipahami tim kecil

Saya ingin Anda secara khusus memikirkan:
- command mana yang paling masuk akal untuk developer sehari-hari
- apakah perlu script gabungan seperti:
  - backend lint
  - backend feature test minimal
  - frontend unit/smoke minimal
- bagaimana menjaga supaya workflow tetap cepat
- bagaimana membedakan “required before merge/deploy” vs “optional deeper checks”
- apakah perlu dokumen singkat “today-v2 readiness check”

Kalau perlu, Anda boleh menambahkan:
- composer script
- root package script
- GitHub Actions / CI snippet kecil
- docs singkat untuk tim
tetapi tetap minimal.

Jangan lakukan ini:
- jangan bangun pipeline CI/CD besar
- jangan tambah dashboard
- jangan tambah bot/notifier
- jangan membuat release system yang rumit
- jangan mengubah fitur aplikasi
- jangan membuat checklist terlalu panjang dan birokratis

Saya ingin output berupa:
1. Workflow Guardrail Audit
2. Why Manual Lint Alone Is Not Enough
3. Recommended Minimal Workflow Strategy
4. Required vs Optional Checks
5. Full Revised Code
6. Example Team Commands
7. Why This Improves Operational Discipline Without Overhead
8. Deferred Again

Aturan penting:
- tetap simple
- tetap practical
- fokus pada adoption workflow, bukan teknologi berlebihan
- bantu tim kecil menjalankan guardrail secara konsisten
- jangan overbuild

Format jawaban:
1. Workflow Guardrail Audit
2. Why Manual Lint Alone Is Not Enough
3. Recommended Minimal Workflow Strategy
4. Required vs Optional Checks
5. Full Revised Code
6. Example Team Commands
7. Why This Improves Operational Discipline Without Overhead
8. Deferred Again


Bagus. Ini sekarang sudah jadi guardrail operasional yang benar-benar dipakai, bukan cuma alat yang tersedia.

Yang sekarang sudah kuat:

ada command readiness yang jelas
ada jalur required vs optional checks
CI ikut menjaga baseline
tim kecil bisa menjalankan guardrail tanpa birokrasi berat

Tahap berikutnya yang paling tepat adalah:

membuat preview workflow harian untuk content team, supaya mereka bisa melihat konten hari tertentu di frontend /today-v2 sebelum dipakai sungguhan.

Kenapa ini next step terbaik:

source konten sudah file-based per tanggal
lint dan readiness sudah ada
sekarang bottleneck berikutnya adalah preview experience untuk editor/content team
tanpa preview, tim hanya tahu “valid”, tapi belum tahu “terasa benar”
ini masih jauh lebih ringan daripada CMS, tapi sangat berguna secara operasional


Lanjutkan dari baseline yang sekarang sudah punya:
- backend file-based daily content source untuk `/api/today-v2/session`
- lint command `today-v2:lint`
- readiness workflow (`today-v2:ready`)
- frontend `/today-v2` yang sudah matang dan terintegrasi ke backend lokal

Jangan bangun CMS/admin panel, jangan tambah database, jangan sentuh auth/analytics/global navigation/cross-device sync, dan jangan ubah flow utama Receive → Reflect → Pray → Complete.

Fokus tahap ini hanya pada:
**membuat preview workflow harian yang ringan untuk content team**, agar tim bisa melihat konten tanggal tertentu langsung di frontend `/today-v2` sebelum dianggap siap.

Konteks:
- backend sekarang memilih content file berdasarkan tanggal hari ini atau override env
- itu bagus untuk operasional dasar
- tetapi tim content/editor perlu cara yang lebih praktis untuk preview tanggal tertentu tanpa harus terus mengubah env global atau mengganggu flow normal developer
- saya belum mau CMS
- saya ingin preview workflow yang simpel, aman, dan realistis untuk tim kecil

Tugas Anda:
Audit backend file-based source, frontend integration path, dan readiness workflow yang ada sekarang, lalu tambahkan preview-by-date workflow yang minimal namun sangat berguna.

Saya ingin Anda mempertimbangkan pendekatan yang paling sederhana dan aman, misalnya:
1. backend endpoint menerima query param preview date di local/dev mode
2. frontend `/today-v2` bisa diarahkan ke preview tanggal tertentu secara eksplisit
3. atau pendekatan setara yang tetap ringan

Goal-nya:
1. content team bisa preview tanggal tertentu tanpa mengubah source code
2. preview tidak merusak production/default behavior
3. kontrak payload tetap sama
4. alur preview mudah dijelaskan dan dijalankan
5. tetap minimal, tanpa CMS

Saya ingin Anda secara khusus memikirkan:
- apakah preview date sebaiknya lewat query param backend, env lokal, atau keduanya
- bagaimana membatasi agar preview override hanya aman dipakai di local/dev, bukan jadi celah production behavior
- bagaimana frontend dev bisa membuka sesuatu seperti `/today-v2?previewDate=2026-03-22` atau mekanisme setara
- bagaimana memastikan preview benar-benar memakai file tanggal yang dimaksud
- apakah perlu satu indikator kecil non-intrusif untuk developer/editor bahwa mereka sedang di mode preview
- bagaimana menjaga agar preview workflow tetap sederhana dan tidak mengacaukan baseline normal

Kalau perlu, Anda boleh menambahkan:
- query param support di backend
- conditional preview support di frontend loader
- docs singkat untuk content preview workflow
- satu test ringan untuk memastikan preview date benar-benar dipakai
tetapi tetap minimal.

Jangan lakukan ini:
- jangan bangun admin preview UI besar
- jangan tambah database
- jangan tambah auth
- jangan tambah dashboard
- jangan mengubah payload contract utama
- jangan membuat preview mode memengaruhi production default behavior
- jangan over-engineer permission system

Saya ingin output berupa:
1. Preview Workflow Audit
2. Why Readiness Alone Is Not Enough for Content Team
3. Recommended Minimal Preview Strategy
4. Safe Preview Rules
5. Full Revised Code
6. Example Preview URLs / Commands
7. Verification Steps
8. Why This Is the Right Step Before Full CMS
9. Deferred Again

Aturan penting:
- tetap simple
- tetap practical
- fokus pada content preview operasional
- bantu content team melihat “terasa benar”, bukan hanya “valid”
- jangan overbuild

Format jawaban:
1. Preview Workflow Audit
2. Why Readiness Alone Is Not Enough for Content Team
3. Recommended Minimal Preview Strategy
4. Safe Preview Rules
5. Full Revised Code
6. Example Preview URLs / Commands
7. Verification Steps
8. Why This Is the Right Step Before Full CMS
9. Deferred Again



1. **Preview Workflow Audit**
- Backend sudah siap operasional (`file-based + lint + readiness`), tapi preview tanggal spesifik belum bisa dipakai langsung dari frontend URL.
- Frontend `/today-v2` belum meneruskan `previewDate` ke source boundary.
- Content team masih bergantung ke override env global, kurang praktis untuk review harian.

2. **Why Readiness Alone Is Not Enough for Content Team**
- `today-v2:ready` menjawab “valid atau tidak”, tapi belum menjawab “terasa benar atau tidak” untuk tanggal tertentu di UI nyata.
- Tim editorial butuh melihat langsung flow ritual dengan copy tanggal target sebelum dianggap siap.

3. **Recommended Minimal Preview Strategy**
- Tambah `previewDate` query support end-to-end:
1. Frontend URL: `/today-v2?previewDate=YYYY-MM-DD`
2. Frontend loader meneruskan ke backend endpoint: `/api/today-v2/session?previewDate=...`
3. Backend hanya mengizinkan preview query di `local/testing` (atau explicit opt-in env non-local).
4. Contract payload tetap sama (`today-v2.session.v1`), hanya source selection yang berubah.

4. **Safe Preview Rules**
1. Preview query hanya aktif default di local/testing.
2. Production tidak berubah kecuali backend explicit set `TODAY_V2_ALLOW_PREVIEW_QUERY=true`.
3. Format date wajib `YYYY-MM-DD`; format invalid diabaikan (kembali ke flow normal).
4. Verifikasi preview disediakan via header ringan:
   - `X-Today-V2-Preview-Date`
   - `X-Today-V2-Preview-Fallback`

5. **Full Revised Code**
- [TodayV2SessionController.php](e:/thechoosentalksnext/backend-api/app/Http/Controllers/Api/V1/TodayV2SessionController.php)
```php
<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\TodayV2SessionResource;
use App\Support\TodayV2SessionContentSource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TodayV2SessionController extends Controller
{
    public function show(Request $request, TodayV2SessionContentSource $contentSource): JsonResponse
    {
        $previewDate = $this->resolvePreviewDate($request);
        $resolved = $contentSource->resolveWithMeta($previewDate);

        $response = response()->json(
            TodayV2SessionResource::make($resolved['payload'])->resolve()
        );

        if ($previewDate !== null) {
            $response->headers->set('X-Today-V2-Preview-Date', $resolved['dateKey']);
            $response->headers->set('X-Today-V2-Preview-Fallback', $resolved['fallbackUsed'] ? '1' : '0');
        }

        return $response;
    }

    private function resolvePreviewDate(Request $request): ?string
    {
        if (! $this->isPreviewQueryAllowed()) {
            return null;
        }

        $value = trim((string) $request->query('previewDate', ''));
        if ($value === '') {
            return null;
        }

        return preg_match('/^\d{4}-\d{2}-\d{2}$/', $value) === 1 ? $value : null;
    }

    private function isPreviewQueryAllowed(): bool
    {
        return app()->isLocal()
            || app()->environment('testing')
            || (bool) config('today_v2.allow_preview_query', false);
    }
}
```

- [today_v2.php](e:/thechoosentalksnext/backend-api/config/today_v2.php)
```php
<?php

return [
    'content_path' => env('TODAY_V2_CONTENT_PATH', 'content/today-v2'),
    'timezone' => env('TODAY_V2_CONTENT_TIMEZONE', 'Asia/Jakarta'),
    'default_file' => env('TODAY_V2_CONTENT_DEFAULT_FILE', 'default.php'),
    'date_override' => env('TODAY_V2_CONTENT_DATE'),
    'allow_preview_query' => env('TODAY_V2_ALLOW_PREVIEW_QUERY', false),
];
```

- [.env.example](e:/thechoosentalksnext/backend-api/.env.example)
```env
TODAY_V2_ALLOW_PREVIEW_QUERY=false
```

- [TodayV2SessionApiTest.php](e:/thechoosentalksnext/backend-api/tests/Feature/TodayV2SessionApiTest.php)
```php
public function test_today_v2_session_uses_preview_date_query_when_allowed(): void
{
    config()->set('today_v2.content_path', 'content/today-v2');
    config()->set('today_v2.default_file', 'default.php');
    config()->set('today_v2.date_override', '2099-12-31');

    $response = $this->getJson('/api/today-v2/session?previewDate=2026-03-21');

    $response->assertOk();
    $response->assertHeader('X-Today-V2-Preview-Date', '2026-03-21');
    $response->assertHeader('X-Today-V2-Preview-Fallback', '0');
    $response->assertJsonPath('openingLine', 'Hari ini baru dimulai. Mari melangkah dengan hati yang teduh.');
}

public function test_today_v2_session_ignores_invalid_preview_date_format(): void
{
    config()->set('today_v2.content_path', 'content/today-v2');
    config()->set('today_v2.default_file', 'default.php');
    config()->set('today_v2.date_override', '2099-12-31');

    $response = $this->getJson('/api/today-v2/session?previewDate=20260321');

    $response->assertOk();
    $response->assertHeaderMissing('X-Today-V2-Preview-Date');
    $response->assertJsonPath('openingLine', 'Tarik napas perlahan. Tuhan hadir menemani ritmemu hari ini.');
}
```

- [page.tsx](e:/thechoosentalksnext/src/app/today-v2/page.tsx)
```tsx
import TodayDailyRitualScreen from './components/TodayDailyRitualScreen';
import { loadTodaySessionContent } from './data/today-session.loader';

export const revalidate = 300;

type TodayPageV2Props = {
  searchParams?:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
};

function normalizePreviewDate(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;
  const trimmed = raw.trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : null;
}

export default async function TodayPageV2({ searchParams }: TodayPageV2Props) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const previewDate = normalizePreviewDate(resolvedSearchParams?.previewDate);

  const sessionContent = await loadTodaySessionContent({ previewDate });

  return <TodayDailyRitualScreen sessionContent={sessionContent} />;
}
```

- [today-session.loader.ts](e:/thechoosentalksnext/src/app/today-v2/data/today-session.loader.ts)
```ts
type LoadTodaySessionContentOptions = {
  previewDate?: string | null;
};

export async function loadTodaySessionContent(
  options: LoadTodaySessionContentOptions = {}
): Promise<TodaySessionContent> {
  ...
  rawSession = await fetchTodaySessionRaw({ previewDate: options.previewDate });
  ...
  method('[today-v2] content diagnostics', {
    sourceStatus: diagnostics.sourceStatus,
    previewDateRequested: options.previewDate ?? null,
    ...
  });
  ...
}
```

- [today-session.source.ts](e:/thechoosentalksnext/src/app/today-v2/data/today-session.source.ts)
```ts
export type FetchTodaySessionRawOptions = {
  previewDate?: string | null;
};

function normalizePreviewDate(previewDate?: string | null): string | null {
  if (!previewDate) return null;
  const trimmed = previewDate.trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : null;
}

function appendPreviewDate(endpoint: string, previewDate: string): string {
  const [base, hash] = endpoint.split('#', 2);
  const separator = base.includes('?') ? '&' : '?';
  const withQuery = `${base}${separator}previewDate=${encodeURIComponent(previewDate)}`;
  return hash ? `${withQuery}#${hash}` : withQuery;
}

export async function fetchTodaySessionRaw(
  options: FetchTodaySessionRawOptions = {}
): Promise<RawTodaySessionPayload | null> {
  ...
  const previewDate = normalizePreviewDate(options.previewDate);
  const url = previewDate ? appendPreviewDate(endpoint, previewDate) : endpoint;
  const payload = await fetchJsonObjectWithTimeout(url, ...);
  return payload as RawTodaySessionPayload;
}
```

- [today-session.loader.test.ts](e:/thechoosentalksnext/src/app/today-v2/data/today-session.loader.test.ts)
```ts
it('passes previewDate option through to source boundary', async () => {
  mockedFetchTodaySessionRaw.mockResolvedValueOnce(null);

  await loadTodaySessionContent({ previewDate: '2026-03-22' });

  expect(mockedFetchTodaySessionRaw).toHaveBeenCalledWith({ previewDate: '2026-03-22' });
});
```

- [today-v2-local-integration.md](e:/thechoosentalksnext/docs/06-testing/e2e/today-v2-local-integration.md) (added section 6 preview workflow)
- [today-v2-content-preview.md](e:/thechoosentalksnext/docs/06-testing/manual-qa/today-v2-content-preview.md) (new concise preview SOP)

6. **Example Preview URLs / Commands**
1. Frontend preview URL:
   - `http://localhost:9002/today-v2?previewDate=2026-03-21`
2. Direct backend preview check:
   - `http://127.0.0.1:8000/api/today-v2/session?previewDate=2026-03-21`
3. Check headers:
   - `X-Today-V2-Preview-Date: 2026-03-21`
   - `X-Today-V2-Preview-Fallback: 0`
4. Keep quality gate:
   - `npm run today-v2:ready`

7. **Verification Steps**
1. `php artisan test tests/Feature/TodayV2SessionApiTest.php` passed (5 tests).
2. `npm run test:unit -- src/app/today-v2/data/today-session.loader.test.ts` passed (3 tests).
3. `npm run today-v2:ready` passed (lint + backend readiness tests).
4. Open `/today-v2?previewDate=YYYY-MM-DD` and verify content shift matches target file.

8. **Why This Is the Right Step Before Full CMS**
- Memberi preview operasional nyata untuk content team sekarang.
- Tetap menjaga baseline: no CMS, no DB, no contract change.
- Aman: preview tidak mengubah production default behavior.
- Minimal: satu query param flow + test + docs, tanpa arsitektur berat.

9. **Deferred Again**
- CMS/admin authoring UI.
- Database-backed content scheduling.
- Auth/analytics/global navigation/cross-device sync.
- Advanced preview permission system.


