<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\MemberPost;
use App\Models\ShareAsset;
use App\Services\ShareAssets\ShareAssetService;
use App\Services\ShareAssets\Revision\CommunityShareRevision;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

/**
 * Handles share asset preparation and single-post share payload for Community.
 *
 * ROUTES:
 *  GET  /api/v1/community/posts/{memberPost}/share          → single share payload (no full feed)
 *  POST /api/v1/community/posts/{memberPost}/share-assets/prepare → generate/retrieve share asset
 */
class CommunityShareAssetController extends Controller
{
    public function __construct(
        private readonly ShareAssetService $shareAssetService,
    ) {}

    /**
     * Return minimal single-post payload for share page / OG route.
     * Does NOT load the full feed.
     */
    public function show(Request $request, MemberPost $memberPost): JsonResponse
    {
        // Guard: don't expose private renungan posts
        if ($this->isPrivateRenungan($memberPost)) {
            if (! Auth::guard('sanctum')->check()) {
                return response()->json(['message' => 'Not found.'], 404);
            }
            $viewer = Auth::guard('sanctum')->user();
            if ((int) $memberPost->user_id !== (int) $viewer?->id && ! ($viewer?->is_admin ?? false)) {
                return response()->json(['message' => 'Not found.'], 404);
            }
        }

        // Compute revision for this post's current state
        $promptVersion = (string) config('share_assets.prompt_version', 'v1');
        $styleVersion  = (string) config('share_assets.style_version', 'v1');
        $revision = CommunityShareRevision::compute(
            postId:             (string) $memberPost->id,
            postText:           (string) ($memberPost->text ?? ''),
            previewMediaIndex:  isset($memberPost->metadata['preview_media_index'])
                                    ? (int) $memberPost->metadata['preview_media_index']
                                    : null,
            mediaPaths:         (array) ($memberPost->media_paths ?? []),
            promptVersion:      $promptVersion,
            styleVersion:       $styleVersion,
        );

        // Try to read an existing ready share asset for enriched copy
        $asset = ShareAsset::findReady('community', (string) $memberPost->id, $revision);

        $mediaPaths = collect((array) ($memberPost->media_paths ?? []))
            ->map(fn ($p) => $this->communityMediaUrl(is_string($p) ? $p : null))
            ->filter()
            ->values()
            ->all();

        $previewIndex = isset($memberPost->metadata['preview_media_index'])
            ? (int) $memberPost->metadata['preview_media_index']
            : 0;

        return response()->json([
            'data' => [
                'post' => [
                    'id'          => (string) $memberPost->id,
                    'type'        => (string) ($memberPost->type?->value ?? 'user_post'),
                    'text'        => (string) ($memberPost->text ?? ''),
                    'mediaPaths'  => $mediaPaths,
                    'metadata'    => $memberPost->metadata,
                    'createdAt'   => $memberPost->created_at?->toIso8601String(),
                    'author'      => [
                        'id'       => (string) ($memberPost->user?->id ?? ''),
                        'name'     => (string) ($memberPost->user?->name ?? 'Member'),
                        'avatarUrl' => $memberPost->user?->getFilamentAvatarUrl(),
                    ],
                ],
                'share_asset' => $asset ? [
                    'revision'          => $asset->revision,
                    'share_title'       => $asset->share_title,
                    'share_description' => $asset->share_description,
                    'share_eyebrow'     => $asset->share_eyebrow,
                    'final_og_image_url' => $asset->resolveOgImageUrl(),
                ] : null,
                'revision'    => $revision,
                'preview_media_url' => $mediaPaths[$previewIndex] ?? $mediaPaths[0] ?? null,
            ],
        ]);
    }

    /**
     * Prepare (generate + cache) a share asset for a community post.
     * Called when user intends to share — NOT called by crawlers.
     */
    public function prepare(Request $request, MemberPost $memberPost): JsonResponse
    {
        if ($response = $this->enforcePrepareRateLimit($request, 'community')) {
            return $response;
        }

        // Guard: don't expose private renungan posts
        if ($this->isPrivateRenungan($memberPost)) {
            $viewer = Auth::guard('sanctum')->user();
            if (! $viewer || ((int) $memberPost->user_id !== (int) $viewer->id && ! ($viewer->is_admin ?? false))) {
                return response()->json(['message' => 'Not found.'], 404);
            }
        }

        $promptVersion = (string) config('share_assets.prompt_version', 'v1');
        $styleVersion  = (string) config('share_assets.style_version', 'v1');

        $mediaPaths = (array) ($memberPost->media_paths ?? []);
        $previewIndex = isset($memberPost->metadata['preview_media_index'])
            ? (int) $memberPost->metadata['preview_media_index']
            : null;
        $sourceImagePath = $mediaPaths[$previewIndex ?? 0] ?? $mediaPaths[0] ?? null;
        $sourceImageUrl  = $sourceImagePath ? $this->communityMediaUrl(is_string($sourceImagePath) ? $sourceImagePath : null) : null;

        $revision = CommunityShareRevision::compute(
            postId:            (string) $memberPost->id,
            postText:          (string) ($memberPost->text ?? ''),
            previewMediaIndex: $previewIndex,
            mediaPaths:        $mediaPaths,
            promptVersion:     $promptVersion,
            styleVersion:      $styleVersion,
        );

        $result = $this->shareAssetService->prepare(
            surface:      'community',
            subjectId:    (string) $memberPost->id,
            revision:     $revision,
            sourceData:   [
                'post_text'    => (string) ($memberPost->text ?? ''),
                'post_type'    => (string) ($memberPost->type?->value ?? 'user_post'),
                'author_name'  => (string) ($memberPost->user?->name ?? 'Member'),
                'media_paths'  => $mediaPaths,
            ],
            sourceImageUrl: $sourceImageUrl,
            subjectType:   'community_post',
            lang:          'id',
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
                // Versioned share URL for frontend to use
                'share_url'         => url("/community/posts/{$memberPost->id}/share?v={$result['revision']}"),
            ],
        ]);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private function isPrivateRenungan(MemberPost $post): bool
    {
        $meta = (array) ($post->metadata ?? []);
        if (($meta['visibility'] ?? '') === 'private_renungan_archive') {
            return true;
        }
        if (($meta['bookmark_origin'] ?? '') === 'renungan') {
            return true;
        }
        return false;
    }

    private function communityMediaUrl(?string $value): ?string
    {
        $raw = trim((string) ($value ?? ''));
        if ($raw === '') {
            return null;
        }

        if (filter_var($raw, FILTER_VALIDATE_URL)) {
            return $raw;
        }

        if (str_starts_with($raw, '/storage/')) {
            $relative = ltrim(substr($raw, strlen('/storage/')), '/');
        } else {
            $relative = ltrim($raw, '/');
        }

        if ($relative === '' || str_contains($relative, '..')) {
            return null;
        }

        return url('/api/v1/community/media/'.implode('/', array_map('rawurlencode', explode('/', $relative))));
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
