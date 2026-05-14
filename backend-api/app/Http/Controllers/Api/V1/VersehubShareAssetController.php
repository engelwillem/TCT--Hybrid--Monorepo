<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BibleVerse;
use App\Models\ShareAsset;
use App\Services\ShareAssets\ShareAssetService;
use App\Services\ShareAssets\Revision\VersehubShareRevision;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

/**
 * ROUTE: POST /api/v1/versehub/{lang}/{slug}/share-assets/prepare
 * Called when user intends to share — NOT by crawlers.
 */
class VersehubShareAssetController extends Controller
{
    public function __construct(
        private readonly ShareAssetService $shareAssetService,
    ) {}

    public function prepare(Request $request, string $lang, string $slug): JsonResponse
    {
        if ($response = $this->enforcePrepareRateLimit($request, 'versehub')) {
            return $response;
        }

        // Fetch the verse data needed for revision + source content
        $verse = $this->fetchVerse($lang, $slug);

        if (! $verse) {
            return response()->json(['message' => 'Verse not found.'], 404);
        }

        $promptVersion = (string) config('share_assets.prompt_version', 'v1');
        $styleVersion  = (string) config('share_assets.style_version', 'v1');

        $revision = VersehubShareRevision::compute(
            lang:            $lang,
            slug:            $slug,
            verseText:       (string) ($verse['text'] ?? ''),
            translationName: $verse['translation_name'] ?? null,
            provider:        $verse['provider'] ?? null,
            promptVersion:   $promptVersion,
            styleVersion:    $styleVersion,
        );

        $result = $this->shareAssetService->prepare(
            surface:     'versehub',
            subjectId:   "{$lang}:{$slug}",
            revision:    $revision,
            sourceData:  [
                'verse_reference'  => (string) ($verse['reference'] ?? $slug),
                'verse_text'       => (string) ($verse['text'] ?? ''),
                'translation_name' => $verse['translation_name'] ?? null,
                'provider'         => $verse['provider'] ?? null,
            ],
            sourceImageUrl: $verse['og_image_url'] ?? null,
            subjectType:   'versehub_verse',
            lang:          $lang,
        );

        return response()->json([
            'data' => [
                'status'            => $result['status'],
                'revision'          => $result['revision'],
                'asset_id'          => $result['asset_id'],
                'share_title'       => $result['share_title'],
                'share_description' => $result['share_description'],
                'share_eyebrow'     => $result['share_eyebrow'],
                'final_og_image_url' => $result['final_og_image_url'],
                'from_cache'        => $result['from_cache'],
                // Versioned share URL for frontend
                'share_url'         => url("/versehub/{$lang}/share/{$slug}?v={$result['revision']}"),
            ],
        ]);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /**
     * Fetch minimal verse data needed for share asset generation.
     * Uses a short cache to avoid redundant DB hits when prepare is called
     * shortly after the reader loads.
     *
     * @return array<string, mixed>|null
     */
    private function fetchVerse(string $lang, string $slug): ?array
    {
        $cacheKey = "versehub:share_verse:{$lang}:{$slug}";

        return Cache::remember($cacheKey, 300, function () use ($lang, $slug): ?array {
            // Normalize slug to a reference like "yoh-3.16" → "yoh.3.16"
            $normalizedRef = str_replace(['-', '_'], '.', $slug);
            $parts = explode('.', $normalizedRef, 3);

            if (count($parts) < 3) {
                return null;
            }

            [$bookCode, $chapter, $verse] = $parts;

            $bibleVerse = BibleVerse::query()
                ->where('lang', $lang)
                ->where('book_code', $bookCode)
                ->where('chapter', (int) $chapter)
                ->where('verse', (int) $verse)
                ->first(['text', 'reference', 'book_code', 'chapter', 'verse', 'provider', 'translation_name']);

            if (! $bibleVerse) {
                return null;
            }

            return [
                'ref'             => $slug,
                'reference'       => (string) ($bibleVerse->reference ?? $slug),
                'text'            => (string) ($bibleVerse->text ?? ''),
                'translation_name' => $bibleVerse->translation_name,
                'provider'        => $bibleVerse->provider,
                'og_image_url'    => null,
            ];
        });
    }

    private function enforcePrepareRateLimit(Request $request, string $surface): ?JsonResponse
    {
        $userId = (string) ($request->user()?->getAuthIdentifier() ?? 'guest');
        $perMinute = max(1, (int) config("share_assets.rate_limit.{$surface}.per_minute", 30));
        $rateKey = "share_assets:prepare:{$surface}:{$userId}";

        if (RateLimiter::tooManyAttempts($rateKey, $perMinute)) {
            $retryAfter = max(1, (int) RateLimiter::availableIn($rateKey));

            return response()->json([
                'message' => 'Terlalu banyak permintaan prepare share asset. Coba lagi sebentar.',
                'code' => 'SHARE_PREPARE_RATE_LIMITED',
                'status' => 429,
                'retry_after' => $retryAfter,
                'request_id' => trim((string) $request->header('X-Request-Id')) ?: Str::uuid()->toString(),
            ], 429)->header('Retry-After', (string) $retryAfter);
        }

        RateLimiter::hit($rateKey, 60);

        return null;
    }
}
