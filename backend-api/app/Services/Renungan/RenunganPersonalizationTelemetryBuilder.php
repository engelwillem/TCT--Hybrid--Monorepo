<?php

namespace App\Services\Renungan;

class RenunganPersonalizationTelemetryBuilder
{
    /**
     * @param  array<string, mixed>  $context
     * @return array<string, mixed>
     */
    public function build(array $context): array
    {
        $analysis = (array) ($context['analysis'] ?? []);
        $initialQuality = (array) ($context['initial_quality'] ?? []);
        $quality = (array) ($context['quality'] ?? []);
        $mentorResult = (array) ($context['mentor_result'] ?? []);
        $reflectionText = (string) ($context['reflection_text'] ?? '');
        $requestDurationMs = (int) ($context['total_duration_ms'] ?? 0);

        $initialQualityReasons = array_values(array_unique((array) ($initialQuality['reasons'] ?? [])));
        $qualityReasons = array_values(array_unique((array) ($quality['reasons'] ?? [])));

        return [
            'request_id' => (string) ($context['request_id'] ?? ''),
            'timestamp' => now()->toIso8601String(),
            'pipeline_version' => (string) ($context['pipeline_version'] ?? ''),
            'environment' => app()->environment(),
            'input_length_bucket' => $this->bucketInputLength($reflectionText),
            'word_count_bucket' => $this->bucketWordCount($reflectionText),
            'ambiguity_bucket' => $this->bucketAmbiguity((array) ($analysis['theme_scores'] ?? []), (array) ($analysis['emotion_scores'] ?? [])),
            'emotional_intensity_bucket' => $this->bucketIntensity((int) ($analysis['intensity'] ?? 1)),
            'analysis_duration_ms' => (int) ($context['analysis_duration_ms'] ?? 0),
            'verse_query_duration_ms' => (int) ($context['verse_query_duration_ms'] ?? 0),
            'verse_selection_duration_ms' => (int) ($context['verse_selection_duration_ms'] ?? 0),
            'interpretation_duration_ms' => (int) ($context['interpretation_duration_ms'] ?? 0),
            'generation_duration_ms' => (int) ($context['generation_duration_ms'] ?? 0),
            'evaluation_duration_ms' => (int) ($context['evaluation_duration_ms'] ?? 0),
            'mentor_duration_ms' => (int) ($context['mentor_duration_ms'] ?? 0),
            'total_duration_ms' => $requestDurationMs,
            'backend_latency_bucket' => $this->bucketBackendLatency($requestDurationMs),
            'candidate_count' => (int) ($context['candidate_count'] ?? 0),
            'selected_verse_count' => (int) ($context['selected_verse_count'] ?? 0),
            'fallback_verse_used' => (bool) ($context['fallback_verse_used'] ?? false),
            'fallback_meditation_used' => (bool) ($context['used_fallback_content'] ?? false),
            'rewrite_triggered' => (int) ($context['rewrite_count'] ?? 0) > 0,
            'quality_rewrite_triggered' => (int) ($context['rewrite_count'] ?? 0) > 0,
            'rewrite_count' => (int) ($context['rewrite_count'] ?? 0),
            'quality_passed_initial' => (bool) ($initialQuality['passed'] ?? false),
            'quality_passed_final' => (bool) ($quality['passed'] ?? false),
            'initial_evaluation_reasons' => $initialQualityReasons,
            'evaluation_reasons' => $qualityReasons,
            'failure_reasons' => array_values(array_filter(
                $qualityReasons,
                fn (string $reason): bool => ! in_array($reason, ['rewrite_improved_output'], true)
            )),
            'used_fallback_content' => (bool) ($context['used_fallback_content'] ?? false),
            'verse_reference' => (string) ($context['verse_reference'] ?? ''),
            'primary_theme' => (string) ($analysis['primary_theme'] ?? ''),
            'intent' => (string) ($analysis['intent'] ?? ''),
            'debug_force_mode' => $context['debug_force_mode'] ?? null,
            'contains_raw_reflection' => false,
            'mentor_driver' => (string) data_get($mentorResult, 'meta.driver', 'template'),
            'mentor_provider' => (string) data_get($mentorResult, 'meta.driver', 'template'),
            'mentor_model' => data_get($mentorResult, 'meta.model'),
            'mentor_success' => ! (bool) data_get($mentorResult, 'meta.used_fallback', true),
            'mentor_fallback' => (bool) data_get($mentorResult, 'meta.used_fallback', true),
            'mentor_used_fallback' => (bool) data_get($mentorResult, 'meta.used_fallback', true),
            'mentor_fallback_reason' => data_get($mentorResult, 'meta.fallback_reason'),
            'mentor_latency_ms' => (int) data_get($mentorResult, 'meta.latency_ms', 0),
            'mentor_request_id' => (string) ($mentorResult['request_id'] ?? ''),
        ];
    }

    private function bucketInputLength(string $reflectionText): string
    {
        $length = strlen(trim($reflectionText));
        return match (true) {
            $length <= 20 => 'xs_0_20',
            $length <= 60 => 's_21_60',
            $length <= 140 => 'm_61_140',
            $length <= 280 => 'l_141_280',
            default => 'xl_281_plus',
        };
    }

    private function bucketWordCount(string $reflectionText): string
    {
        $count = str_word_count($reflectionText);
        return match (true) {
            $count <= 3 => 'w_0_3',
            $count <= 8 => 'w_4_8',
            $count <= 16 => 'w_9_16',
            $count <= 32 => 'w_17_32',
            default => 'w_33_plus',
        };
    }

    /**
     * @param  array<string, mixed>  $themeScores
     * @param  array<string, mixed>  $emotionScores
     */
    private function bucketAmbiguity(array $themeScores, array $emotionScores): string
    {
        $themeSpread = count($themeScores);
        $emotionSpread = count($emotionScores);
        $topTheme = (float) (reset($themeScores) ?: 0.0);
        $secondTheme = (float) (array_values($themeScores)[1] ?? 0.0);
        $themeGap = $topTheme - $secondTheme;

        if ($themeSpread >= 4 || $emotionSpread >= 4) {
            return 'high';
        }
        if ($themeGap <= 0.6) {
            return 'medium';
        }

        return 'low';
    }

    private function bucketIntensity(int $intensity): string
    {
        return match (true) {
            $intensity <= 2 => 'low',
            $intensity === 3 => 'medium',
            default => 'high',
        };
    }

    private function bucketBackendLatency(int $durationMs): string
    {
        return match (true) {
            $durationMs < 400 => 'fast',
            $durationMs < 1000 => 'normal',
            $durationMs < 2200 => 'slow',
            default => 'very_slow',
        };
    }
}
