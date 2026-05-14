<?php

namespace App\Services\AI;

use RuntimeException;

class CommunityAIService
{
    public function __construct(
        private readonly AIProviderInterface $provider,
        private readonly PromptRegistry $prompts,
        private readonly AISafetyService $safety,
        private readonly AITelemetryService $telemetry,
        private readonly AIResultCacheService $cache,
    ) {
    }

    /**
     * @param  array<string, mixed>  $context
     * @return array<string, mixed>
     */
    public function assist(string $mode, string $text, array $context = []): array
    {
        $trimmed = trim($text);
        $safety = $this->safety->classify($trimmed);
        $moderationSignals = $this->classifyModerationSignals($trimmed, $context);
        $driver = strtolower((string) config('ai.drivers.community', 'openai'));

        if ($trimmed === '') {
            throw new RuntimeException('Input text is required.');
        }

        $fingerprint = [
            'mode' => $mode,
            'text' => mb_strtolower($trimmed),
            'context' => $context,
            'driver' => $driver,
        ];

        $result = $this->cache->remember('community.assist', $fingerprint, function () use ($mode, $trimmed, $context): array {
            if (! $this->shouldUseModel()) {
                return [
                    'data' => $this->fallback($mode, $trimmed),
                    'request_id' => null,
                    'fallback' => true,
                ];
            }

            try {
                $response = $this->provider->requestJson(
                    [
                        ['role' => 'system', 'content' => $this->prompts->system('community.assist')],
                        ['role' => 'user', 'content' => json_encode([
                            'mode' => $mode,
                            'text' => $trimmed,
                            'context' => $context,
                            'instruction' => 'Balas JSON dengan keys: output_text, tone, suggestions(array), moderation(array), tags(array), summary(string|null), verse_refs(array).',
                        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)],
                    ],
                    [
                        'format' => [
                            'type' => 'json_schema',
                            'name' => 'community_ai_assist',
                            'schema' => [
                                'type' => 'object',
                                'additionalProperties' => false,
                                'required' => ['output_text', 'tone', 'suggestions', 'moderation', 'tags', 'summary', 'verse_refs'],
                                'properties' => [
                                    'output_text' => ['type' => 'string'],
                                    'tone' => ['type' => 'string'],
                                    'suggestions' => ['type' => 'array', 'items' => ['type' => 'string']],
                                    'moderation' => ['type' => 'array', 'items' => ['type' => 'string']],
                                    'tags' => ['type' => 'array', 'items' => ['type' => 'string']],
                                    'summary' => ['type' => ['string', 'null']],
                                    'verse_refs' => ['type' => 'array', 'items' => ['type' => 'string']],
                                ],
                            ],
                        ],
                    ]
                );

                return $response + ['fallback' => false];
            } catch (\Throwable) {
                return [
                    'data' => $this->fallback($mode, $trimmed),
                    'request_id' => null,
                    'fallback' => true,
                ];
            }
        }, 300);

        $payload = (array) ($result['data'] ?? []);
        $modelModeration = array_values(array_filter((array) ($payload['moderation'] ?? []), fn ($v) => is_string($v) && trim($v) !== ''));
        $mergedModeration = array_values(array_unique(array_merge(
            $modelModeration,
            $moderationSignals
        )));

        $this->telemetry->record('community.assist', [
            'mode' => $mode,
            'driver' => $driver,
            'risk_level' => $safety['risk_level'],
            'moderation_flags' => $mergedModeration,
            'used_fallback' => (bool) ($result['fallback'] ?? false),
            'request_id' => $result['request_id'] ?? null,
        ]);

        return [
            'output_text' => (string) ($payload['output_text'] ?? ''),
            'tone' => (string) ($payload['tone'] ?? 'pastoral'),
            'suggestions' => array_values(array_filter((array) ($payload['suggestions'] ?? []), fn ($v) => is_string($v) && trim($v) !== '')),
            'moderation' => $mergedModeration,
            'tags' => array_values(array_filter((array) ($payload['tags'] ?? []), fn ($v) => is_string($v) && trim($v) !== '')),
            'summary' => is_string($payload['summary'] ?? null) ? trim((string) $payload['summary']) : null,
            'verse_refs' => array_values(array_filter((array) ($payload['verse_refs'] ?? []), fn ($v) => is_string($v) && trim($v) !== '')),
            'safety' => $safety,
            'request_id' => $result['request_id'] ?? null,
            'used_fallback' => (bool) ($result['fallback'] ?? false),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function fallback(string $mode, string $text): array
    {
        return match ($mode) {
            'compose_prayer_request' => [
                'output_text' => 'Mohon dukungan doa untuk pergumulan ini. Saya ingin tetap setia dan tenang dalam tuntunan Tuhan.',
                'tone' => 'pastoral',
                'suggestions' => ['Tambahkan konteks singkat agar teman komunitas lebih mudah mendoakan.', 'Tutup dengan harapan atau langkah iman yang sedang kamu pegang.'],
                'moderation' => [],
                'tags' => ['prayer-request'],
                'summary' => null,
                'verse_refs' => [],
            ],
            'compose_title_caption' => [
                'output_text' => 'Judul: Tetap Tenang di Tengah Pergumulan',
                'tone' => 'pastoral',
                'suggestions' => ['Gunakan judul 4-8 kata.', 'Tambahkan caption singkat 1 kalimat yang jujur.'],
                'moderation' => [],
                'tags' => ['caption'],
                'summary' => null,
                'verse_refs' => [],
            ],
            'compose_verse_suggestions' => [
                'output_text' => 'Pertimbangkan ayat penguatan yang relevan dengan isi tulisanmu.',
                'tone' => 'supportive',
                'suggestions' => ['Pilih 1 ayat utama agar tetap fokus.', 'Sertakan konteks singkat kenapa ayat itu relevan.'],
                'moderation' => [],
                'tags' => ['verse-suggestion'],
                'summary' => null,
                'verse_refs' => ['mzm-55-23'],
            ],
            'summarize' => [
                'output_text' => $text,
                'tone' => 'neutral',
                'suggestions' => ['Ringkas jadi 1-2 kalimat inti.'],
                'moderation' => [],
                'tags' => ['summary'],
                'summary' => 'Ringkasan singkat tersedia.',
                'verse_refs' => [],
            ],
            'reply_empathy' => [
                'output_text' => 'Terima kasih sudah berbagi dengan jujur. Kamu tidak berjalan sendiri, semoga Tuhan menguatkanmu hari ini.',
                'tone' => 'empathetic',
                'suggestions' => ['Gunakan kalimat pendek yang hangat.', 'Hindari memberi nasihat yang menghakimi.'],
                'moderation' => [],
                'tags' => ['reply'],
                'summary' => null,
                'verse_refs' => [],
            ],
            'moderate' => [
                'output_text' => $text,
                'tone' => 'neutral',
                'suggestions' => [],
                'moderation' => [],
                'tags' => ['moderation'],
                'summary' => null,
                'verse_refs' => [],
            ],
            default => [
                'output_text' => 'Terima kasih sudah menulis. Berikut versi yang lebih ringkas dan jelas untuk komunitas.',
                'tone' => 'pastoral',
                'suggestions' => ['Sebutkan inti pergumulanmu dalam 1-2 kalimat.', 'Akhiri dengan doa singkat atau ajakan dukungan doa.'],
                'moderation' => [],
                'tags' => ['compose'],
                'summary' => null,
                'verse_refs' => [],
            ],
        };
    }

    private function shouldUseModel(): bool
    {
        $driver = strtolower((string) config('ai.drivers.community', 'openai'));
        if ($driver !== 'openai') {
            return false;
        }

        return trim((string) config('ai.openai.api_key', '')) !== '';
    }

    /**
     * @param  array<string, mixed>  $context
     * @return array<int, string>
     */
    private function classifyModerationSignals(string $text, array $context = []): array
    {
        $normalized = mb_strtolower(trim($text));
        if ($normalized === '') {
            return [];
        }

        $rules = [
            'toxicity' => ['bodoh', 'tolol', 'anjing', 'goblok', 'idiot'],
            'harassment' => ['benci kamu', 'serang dia', 'hancurkan dia', 'bully'],
            'spam' => ['http://', 'https://', 'promo', 'diskon besar', 'wa.me/'],
            'self_harm_risk' => ['bunuh diri', 'self harm', 'akhiri hidup', 'tidak mau hidup'],
            'oversharing_sensitive' => ['nomor ktp', 'password', 'pin atm', 'nomor rekening', 'alamat rumah'],
            'sexual_unsafe' => ['konten seksual', 'porn', 'porno', 'nude', 'telanjang'],
        ];

        $flags = [];
        foreach ($rules as $flag => $needles) {
            foreach ($needles as $needle) {
                if (str_contains($normalized, $needle)) {
                    $flags[] = $flag;
                    break;
                }
            }
        }

        if (($context['surface'] ?? null) === 'community' && str_word_count($normalized) <= 3) {
            $flags[] = 'low_context_post';
        }

        return array_values(array_unique($flags));
    }
}
