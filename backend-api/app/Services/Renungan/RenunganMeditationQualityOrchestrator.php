<?php

namespace App\Services\Renungan;

class RenunganMeditationQualityOrchestrator
{
    /**
     * @param  callable(string): array<string, mixed>  $evaluateQuality
     * @param  callable(): string  $rewriteMeditation
     * @param  callable(): string  $composeFallbackMeditation
     * @return array{
     *   meditation: string,
     *   initial_quality: array<string, mixed>,
     *   quality: array<string, mixed>,
     *   rewrite_count: int,
     *   used_fallback_content: bool
     * }
     */
    public function resolve(
        string $initialMeditation,
        ?string $debugForceMode,
        callable $evaluateQuality,
        callable $rewriteMeditation,
        callable $composeFallbackMeditation
    ): array {
        $meditation = $initialMeditation;
        $initialQuality = (array) $evaluateQuality($meditation);

        if (in_array($debugForceMode, ['rewrite', 'fallback'], true)) {
            $initialReasons = array_values(array_unique(array_merge(
                (array) ($initialQuality['reasons'] ?? []),
                ['debug_force_quality_fail_initial']
            )));
            $initialQuality['passed'] = false;
            $initialQuality['reasons'] = $initialReasons;
        }

        $quality = $initialQuality;
        $rewriteCount = 0;
        $usedFallbackContent = false;

        if (! ($quality['passed'] ?? false)) {
            $rewriteCount = 1;
            $meditation = (string) $rewriteMeditation();
            $quality = (array) $evaluateQuality($meditation);

            if ($debugForceMode === 'fallback') {
                $quality['passed'] = false;
                $quality['reasons'] = array_values(array_unique(array_merge(
                    (array) ($quality['reasons'] ?? []),
                    ['debug_force_rewrite_failed']
                )));
            }
        }

        if (! ($quality['passed'] ?? false)) {
            $meditation = (string) $composeFallbackMeditation();
            $usedFallbackContent = true;
            $quality['reasons'] = array_values(array_unique(array_merge(
                (array) ($quality['reasons'] ?? []),
                ['rewrite_failed_to_improve'],
                ['fallback_due_to_invalid_output']
            )));
            $quality['passed'] = false;
        } elseif (! ($initialQuality['passed'] ?? false)) {
            $quality['reasons'] = array_values(array_unique(array_merge(
                (array) ($quality['reasons'] ?? []),
                ['rewrite_improved_output']
            )));
        }

        return [
            'meditation' => $meditation,
            'initial_quality' => $initialQuality,
            'quality' => $quality,
            'rewrite_count' => $rewriteCount,
            'used_fallback_content' => $usedFallbackContent,
        ];
    }
}
