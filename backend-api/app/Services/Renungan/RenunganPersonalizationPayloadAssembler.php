<?php

namespace App\Services\Renungan;

use App\Models\BibleVerse;

class RenunganPersonalizationPayloadAssembler
{
    /**
     * @param  array<int, mixed>  $selectedVerses
     * @param  array<string, mixed>  $analysis
     * @param  array<string, mixed>  $interpretation
     * @param  array<string, mixed>  $generationPlan
     * @param  array<string, mixed>  $quality
     * @return array<string, mixed>
     */
    public function buildInitialPayload(
        string $meditation,
        array $selectedVerses,
        ?BibleVerse $primaryVerse,
        array $analysis,
        array $interpretation,
        array $generationPlan,
        array $quality
    ): array {
        $relatedVerses = [];
        foreach ($selectedVerses as $verse) {
            if (! $verse instanceof BibleVerse) {
                continue;
            }
            $relatedVerses[] = [
                'reference' => (string) ($verse->reference ?? ''),
                'text' => (string) ($verse->text ?? ''),
            ];
        }

        return [
            'data' => [
                'meditation' => $meditation,
                'verse' => [
                    'reference' => (string) ($primaryVerse?->reference ?? 'Mazmur 55:23'),
                    'text' => (string) ($primaryVerse?->text ?? 'Serahkanlah kuatirmu kepada TUHAN, maka Ia akan memelihara engkau.'),
                ],
                'related_verses' => $relatedVerses,
                'analysis' => $analysis,
                'interpretation' => $interpretation,
                'generation' => [
                    'intent_summary' => (string) ($generationPlan['intent_summary'] ?? ''),
                    'heart_diagnosis' => (string) ($generationPlan['heart_diagnosis'] ?? ''),
                    'pastoral_angle' => (string) ($generationPlan['pastoral_angle'] ?? ''),
                    'outline' => [
                        'opening' => (string) ($generationPlan['outline']['opening'] ?? ''),
                        'body' => (string) ($generationPlan['outline']['body'] ?? ''),
                        'closing' => (string) ($generationPlan['outline']['closing'] ?? ''),
                    ],
                    'quality' => $quality,
                ],
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $payload
     * @param  array<string, mixed>  $mentorResult
     * @return array<string, mixed>
     */
    public function withMentorResult(
        array $payload,
        array $mentorResult,
        string $defaultMeditation,
        string $requestId,
        string $responseMode
    ): array {
        $payload['data']['mentor_opening'] = (string) ($mentorResult['mentor_opening'] ?? '');
        $payload['data']['meditation'] = (string) ($mentorResult['meditation'] ?? $defaultMeditation);
        $payload['data']['prayer_prompt'] = (string) ($mentorResult['prayer_prompt'] ?? '');
        $payload['data']['follow_up_question'] = (string) ($mentorResult['follow_up_question'] ?? '');
        $payload['data']['follow_up_prompts'] = (array) ($mentorResult['follow_up_prompts'] ?? []);
        $payload['data']['confidence'] = (string) ($mentorResult['confidence'] ?? 'medium');
        $payload['data']['safety_notes'] = (array) ($mentorResult['safety_notes'] ?? []);
        $payload['data']['request_id'] = (string) ($mentorResult['request_id'] ?? $requestId);
        $payload['data']['driver'] = (string) data_get($mentorResult, 'meta.driver', 'template');
        $payload['data']['used_fallback'] = (bool) data_get($mentorResult, 'meta.used_fallback', true);
        $payload['data']['response_mode'] = (string) ($mentorResult['response_mode'] ?? $responseMode);
        $payload['data']['safety'] = (array) ($mentorResult['safety'] ?? []);
        $payload['data']['privacy'] = (array) ($mentorResult['privacy'] ?? []);
        $payload['data']['ai_pipeline'] = (array) ($mentorResult['pipeline'] ?? []);

        return $payload;
    }
}
