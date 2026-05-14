<?php

namespace App\Services\ShareAssets\Revision;

/**
 * Computes a deterministic revision hash for a VerseHub verse share asset.
 *
 * Revision changes when:
 *  - verse reference changes (shouldn't happen, but guards)
 *  - verse translation/provider changes
 *  - AI prompt version changes
 *  - OG style version changes
 */
class VersehubShareRevision
{
    public static function compute(
        string $lang,
        string $slug,
        string $verseText,
        ?string $translationName,
        ?string $provider,
        string $promptVersion,
        string $styleVersion
    ): string {
        $fingerprint = implode('::', [
            $lang,
            $slug,
            sha1(mb_strtolower(trim($verseText))),
            (string) ($translationName ?? 'default'),
            (string) ($provider ?? 'default'),
            $promptVersion,
            $styleVersion,
        ]);

        return substr(sha1($fingerprint), 0, 16);
    }
}
