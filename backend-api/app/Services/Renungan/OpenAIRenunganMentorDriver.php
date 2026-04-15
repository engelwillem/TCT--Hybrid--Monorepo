<?php

namespace App\Services\Renungan;

use App\Services\AI\AIProviderInterface;
use App\Services\AI\PromptRegistry;
use Illuminate\Support\Str;

class OpenAIRenunganMentorDriver implements RenunganMentorDriverInterface
{
    public function __construct(
        private readonly AIProviderInterface $provider,
        private readonly PromptRegistry $prompts,
    ) {
    }

    public function generate(array $context): array
    {
        $reflectionText = trim((string) ($context['reflection_text'] ?? ''));
        $verseReference = trim((string) ($context['verse_reference'] ?? ''));
        $verseText = trim((string) ($context['verse_text'] ?? ''));
        $analysis = (array) ($context['analysis'] ?? []);
        $interpretation = (array) ($context['interpretation'] ?? []);
        $responseMode = (string) ($context['response_mode'] ?? 'calm_heart');

        $response = $this->provider->requestJson(
            [
                [
                    'role' => 'system',
                    'content' => $this->prompts->system('renungan.mentor').' Keluaran HARUS JSON valid sesuai skema.',
                ],
                [
                    'role' => 'user',
                    'content' => json_encode([
                        'reflection_text' => $reflectionText,
                        'verse' => [
                            'reference' => $verseReference,
                            'text' => $verseText,
                        ],
                        'analysis' => [
                            'primary_theme' => (string) ($analysis['primary_theme'] ?? ''),
                            'primary_emotion' => (string) ($analysis['primary_emotion'] ?? ''),
                            'intent' => (string) ($analysis['intent'] ?? ''),
                        ],
                        'interpretation' => [
                            'verse_main_message' => (string) ($interpretation['verse_main_message'] ?? ''),
                            'pastoral_application' => (string) ($interpretation['pastoral_application'] ?? ''),
                            'hope_direction' => (string) ($interpretation['hope_direction'] ?? ''),
                            'correction_direction' => (string) ($interpretation['correction_direction'] ?? ''),
                        ],
                        'response_mode' => $responseMode,
                        'instruction' => 'Kembalikan JSON dengan key mentor_opening, meditation, prayer_prompt, follow_up_question, confidence(low|medium|high), safety_notes(array string).',
                    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                ],
            ],
            [
                'model' => (string) config('renungan_mentor.openai.model', 'gpt-4o-mini'),
                'temperature' => (float) config('renungan_mentor.openai.temperature', 0.6),
                'max_output_tokens' => (int) config('renungan_mentor.openai.max_output_tokens', 700),
                'format' => [
                    'type' => 'json_schema',
                    'name' => 'renungan_mentor_response',
                    'schema' => [
                        'type' => 'object',
                        'additionalProperties' => false,
                        'required' => [
                            'mentor_opening',
                            'meditation',
                            'prayer_prompt',
                            'follow_up_question',
                            'confidence',
                            'safety_notes',
                        ],
                        'properties' => [
                            'mentor_opening' => ['type' => 'string'],
                            'meditation' => ['type' => 'string'],
                            'prayer_prompt' => ['type' => 'string'],
                            'follow_up_question' => ['type' => 'string'],
                            'confidence' => ['type' => 'string'],
                            'safety_notes' => [
                                'type' => 'array',
                                'items' => ['type' => 'string'],
                            ],
                        ],
                    ],
                ],
            ]
        );

        $parsed = (array) ($response['data'] ?? []);

        return [
            'mentor_opening' => trim((string) ($parsed['mentor_opening'] ?? '')),
            'meditation' => trim((string) ($parsed['meditation'] ?? '')),
            'prayer_prompt' => trim((string) ($parsed['prayer_prompt'] ?? '')),
            'follow_up_question' => trim((string) ($parsed['follow_up_question'] ?? '')),
            'confidence' => Str::lower(trim((string) ($parsed['confidence'] ?? 'medium'))),
            'safety_notes' => collect($parsed['safety_notes'] ?? [])
                ->filter(fn ($value) => is_string($value) && trim($value) !== '')
                ->values()
                ->all(),
            'request_id' => $response['request_id'] ?? null,
        ];
    }
}
