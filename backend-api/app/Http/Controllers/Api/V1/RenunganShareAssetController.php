<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\RenunganShareSnapshot;
use App\Models\ShareAsset;
use App\Services\ShareAssets\ShareAssetService;
use App\Services\ShareAssets\Revision\RenunganShareRevision;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * ROUTE: POST /api/v1/renungan/share/{token}/prepare
 * Called when user intends to share — NOT by crawlers.
 */
class RenunganShareAssetController extends Controller
{
    public function __construct(
        private readonly ShareAssetService $shareAssetService,
    ) {}

    public function prepare(Request $request, string $token): JsonResponse
    {
        $snapshot = RenunganShareSnapshot::query()
            ->where('token', $token)
            ->first();

        if (! $snapshot || ! $snapshot->isActive()) {
            return response()->json(['message' => 'Share snapshot not found or expired.'], 404);
        }

        $promptVersion = (string) config('share_assets.prompt_version', 'v1');
        $styleVersion  = (string) config('share_assets.style_version', 'v1');

        $revision = RenunganShareRevision::compute(
            token:              $token,
            meditationExcerpt:  (string) $snapshot->meditation_excerpt,
            verseReference:     (string) $snapshot->verse_reference,
            promptVersion:      $promptVersion,
            styleVersion:       $styleVersion,
        );

        $result = $this->shareAssetService->prepare(
            surface:     'renungan',
            subjectId:   $token,
            revision:    $revision,
            sourceData:  [
                'verse_reference'    => (string) $snapshot->verse_reference,
                'verse_text'         => (string) $snapshot->verse_text,
                'meditation_excerpt' => (string) $snapshot->meditation_excerpt,
                'theme'              => (string) ($snapshot->theme ?? ''),
            ],
            sourceImageUrl: null,
            subjectType:   'renungan_snapshot',
            lang:          (string) ($snapshot->lang ?? 'id'),
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
                'share_url'         => url("/renungan/share/{$token}?v={$result['revision']}"),
            ],
        ]);
    }
}
