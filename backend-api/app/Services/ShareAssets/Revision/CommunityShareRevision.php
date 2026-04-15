<?php

namespace App\Services\ShareAssets\Revision;

/**
 * Computes a deterministic revision hash for a community post share asset.
 *
 * Revision changes when:
 *  - post text changes
 *  - preview media index changes
 *  - media paths list changes
 *  - AI prompt version changes
 *  - OG style version changes
 */
class CommunityShareRevision
{
    public static function compute(
        string $postId,
        string $postText,
        ?int $previewMediaIndex,
        array $mediaPaths,
        string $promptVersion,
        string $styleVersion
    ): string {
        $normalized = mb_strtolower(trim($postText));
        $mediaSignature = implode('|', array_values(array_filter(array_map('trim', $mediaPaths))));

        $fingerprint = implode('::', [
            $postId,
            sha1($normalized),
            (string) ($previewMediaIndex ?? 0),
            sha1($mediaSignature),
            $promptVersion,
            $styleVersion,
        ]);

        return substr(sha1($fingerprint), 0, 16);
    }
}
