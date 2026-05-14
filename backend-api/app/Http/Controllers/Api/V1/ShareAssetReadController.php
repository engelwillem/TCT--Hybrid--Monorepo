<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ShareAsset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Exposes a ready share asset by surface + subjectId + revision.
 * Called by frontend OG routes (Next.js edge runtime) to read the snapshot.
 *
 * RULES:
 *  - Only returns 'ready' assets
 *  - Returns 404 if revision not found → caller must use fallback, NOT call AI
 *  - This endpoint is deliberately read-only and cheap
 */
class ShareAssetReadController extends Controller
{
    /**
     * GET /api/v1/share-assets/{surface}/{subject}/snapshot?v={revision}
     *
     * {subject} is URL-encoded (community post id, "lang:slug" for versehub, token for renungan)
     */
    public function snapshot(Request $request, string $surface, string $subject): JsonResponse
    {
        $revision = trim((string) $request->query('v', ''));

        if (! in_array($surface, ['community', 'versehub', 'renungan'], true)) {
            return response()->json(['message' => 'Invalid surface.'], 400);
        }

        $subjectId = urldecode($subject);

        // If no revision provided, look for the most recent ready asset for this subject
        if ($revision === '') {
            $asset = ShareAsset::query()
                ->where('surface', $surface)
                ->where('subject_id', $subjectId)
                ->where('status', 'ready')
                ->latest()
                ->first();
        } else {
            $asset = ShareAsset::findReady($surface, $subjectId, $revision);
        }

        if (! $asset) {
            return response()->json(['message' => 'Share asset not found.'], 404);
        }

        return response()->json([
            'data' => [
                'revision'          => $asset->revision,
                'surface'           => $asset->surface,
                'status'            => $asset->status,
                'share_title'       => $asset->share_title,
                'share_description' => $asset->share_description,
                'share_eyebrow'     => $asset->share_eyebrow,
                'og_style'          => $asset->og_style,
                'final_og_image_url' => $asset->resolveOgImageUrl(),
                'source_image_url'  => $asset->source_image_url,
                'share_meta'        => $asset->share_meta,
            ],
        ]);
    }
}
