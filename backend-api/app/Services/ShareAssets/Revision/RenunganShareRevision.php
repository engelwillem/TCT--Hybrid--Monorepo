<?php

namespace App\Services\ShareAssets\Revision;

/**
 * Computes a deterministic revision hash for a Renungan share asset.
 *
 * Revision changes when:
 *  - meditation excerpt changes (snapshot content changed)
 *  - verse reference changes
 *  - AI prompt version changes
 *  - OG style version changes
 */
class RenunganShareRevision
{
    public static function compute(
        string $token,
        string $meditationExcerpt,
        string $verseReference,
        string $promptVersion,
        string $styleVersion
    ): string {
        $fingerprint = implode('::', [
            $token,
            sha1(mb_strtolower(trim($meditationExcerpt))),
            sha1(mb_strtolower(trim($verseReference))),
            $promptVersion,
            $styleVersion,
        ]);

        return substr(sha1($fingerprint), 0, 16);
    }
}
