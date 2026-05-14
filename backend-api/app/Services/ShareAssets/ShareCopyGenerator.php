<?php

namespace App\Services\ShareAssets;

use App\Services\AI\AIProviderInterface;
use Throwable;

/**
 * Generates AI-crafted share copy (title, description, eyebrow) per surface.
 *
 * Rules applied per surface:
 *  - renungan:  restrained, private, no verbatim meditation text exposed
 *  - versehub:  grounded in scripture, no reinterpretation
 *  - community: preserves user voice, only enhances readability for share
 */
class ShareCopyGenerator
{
    public function __construct(
        private readonly AIProviderInterface $provider,
    ) {}

    /**
     * @param  array<string, mixed>  $context
     * @return array{title: string, description: string, eyebrow: string}
     */
    public function generate(string $surface, array $context): array
    {
        if (! $this->isEnabled()) {
            return $this->fallback($surface, $context);
        }

        $systemPrompt = $this->buildSystemPrompt($surface);
        $userPayload  = $this->buildUserPayload($surface, $context);

        if ($systemPrompt === null || $userPayload === null) {
            return $this->fallback($surface, $context);
        }

        try {
            $response = $this->provider->requestJson(
                [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user',   'content' => json_encode($userPayload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)],
                ],
                [
                    'format' => [
                        'type'   => 'json_schema',
                        'name'   => 'share_copy',
                        'schema' => [
                            'type'                 => 'object',
                            'additionalProperties' => false,
                            'required'             => ['title', 'description', 'eyebrow'],
                            'properties'           => [
                                'title'       => ['type' => 'string'],
                                'description' => ['type' => 'string'],
                                'eyebrow'     => ['type' => 'string'],
                            ],
                        ],
                    ],
                ]
            );

            $data = (array) ($response['data'] ?? []);
            if (empty($data['title'])) {
                return $this->fallback($surface, $context);
            }

            return [
                'title'       => $this->clean((string) ($data['title'] ?? ''), 180),
                'description' => $this->clean((string) ($data['description'] ?? ''), 440),
                'eyebrow'     => $this->clean((string) ($data['eyebrow'] ?? ''), 60),
            ];
        } catch (Throwable) {
            return $this->fallback($surface, $context);
        }
    }

    // -------------------------------------------------------------------------
    // Prompts
    // -------------------------------------------------------------------------

    private function buildSystemPrompt(string $surface): ?string
    {
        return match ($surface) {
            'renungan' => <<<'PROMPT'
Kamu adalah penulis share copy untuk kartu doa pribadi yang premium dan restrained.
Tugasmu: tulis 3 bagian pendek untuk sharing WhatsApp / OG card.
  - title: 4-8 kata, introspektif, hangat, tidak clickbait
  - description: 1-2 kalimat, menyentuh perasaan, JANGAN menyebut detail isi renungan secara verbatim
  - eyebrow: 2-3 kata, contoh "Renungan Hari Ini" atau "Satu Firman Untukmu"
Tone: tenang, spiritual, premium. Bahasa Indonesia. Tidak lebai.
PROMPT,
            'versehub' => <<<'PROMPT'
Kamu adalah penulis share copy untuk share kartu ayat Alkitab yang premium.
Tugasmu: tulis 3 bagian singkat untuk sharing WhatsApp / OG card.
  - title: referensi ayat atau headline 4-7 kata yang grounded pada teks asli
  - description: 1-2 kalimat menyimpulkan pesan firman, TANPA mengubah makna teologis
  - eyebrow: 2-3 kata, contoh "Firman Hari Ini" atau "VerseHub"
Tone: grounded, faktual, spiritual. Bahasa Indonesia. Tidak melebih-lebihkan.
PROMPT,
            'community' => <<<'PROMPT'
Kamu adalah penulis share copy untuk kartu berbagi komunitas Kristiani.
Tugasmu: tulis 3 bagian pendek untuk sharing WhatsApp / OG card.
  - title: 4-8 kata yang mewakili tema utama posting user, jangan ubah maknanya
  - description: 1-2 kalimat ringkasan yang menghormati suara asli user
  - eyebrow: 2-3 kata, contoh "Dari Komunitas" atau "Sharing Iman"
Tone: hangat, komunitas, menghormati suara user. Bahasa Indonesia. Tidak patronizing.
PROMPT,
            default => null,
        };
    }

    /**
     * @param  array<string, mixed>  $context
     * @return array<string, mixed>|null
     */
    private function buildUserPayload(string $surface, array $context): ?array
    {
        return match ($surface) {
            'renungan' => [
                'verse_reference'    => $context['verse_reference'] ?? '',
                'theme'              => $context['theme'] ?? null,
                'instruction'       => 'Generate share_copy JSON untuk Renungan card.',
            ],
            'versehub' => [
                'verse_reference'    => $context['verse_reference'] ?? '',
                'verse_text_excerpt' => mb_substr((string) ($context['verse_text'] ?? ''), 0, 200),
                'translation_name'  => $context['translation_name'] ?? null,
                'instruction'       => 'Generate share_copy JSON untuk VerseHub card.',
            ],
            'community' => [
                'post_text_excerpt'  => mb_substr((string) ($context['post_text'] ?? ''), 0, 300),
                'post_type'          => $context['post_type'] ?? 'user_post',
                'author_name'        => $context['author_name'] ?? 'Member',
                'instruction'       => 'Generate share_copy JSON untuk Community share card.',
            ],
            default => null,
        };
    }

    // -------------------------------------------------------------------------
    // Fallback
    // -------------------------------------------------------------------------

    /**
     * @param  array<string, mixed>  $context
     * @return array{title: string, description: string, eyebrow: string}
     */
    private function fallback(string $surface, array $context): array
    {
        return match ($surface) {
            'renungan' => [
                'title'       => (string) ($context['verse_reference'] ?? 'Renungan Pribadi'),
                'description' => 'Satu firman yang menemani hari ini dari The Chosen Talks.',
                'eyebrow'     => 'Renungan Hari Ini',
            ],
            'versehub' => [
                'title'       => (string) ($context['verse_reference'] ?? 'VerseHub'),
                'description' => 'Firman yang dibagikan dari The Chosen Talks.',
                'eyebrow'     => 'Firman Hari Ini',
            ],
            'community' => [
                'title'       => 'Dari Komunitas',
                'description' => 'Cerita dan refleksi yang menguatkan dari anggota komunitas.',
                'eyebrow'     => 'Community Share',
            ],
            default => [
                'title'       => 'The Chosen Talks',
                'description' => 'Komunitas iman digital yang hangat dan relevan.',
                'eyebrow'     => 'The Chosen Talks',
            ],
        };
    }

    private function clean(string $value, int $max): string
    {
        $cleaned = trim(preg_replace('/\s+/u', ' ', $value) ?? $value);
        if (mb_strlen($cleaned) <= $max) {
            return $cleaned;
        }

        return rtrim(mb_substr($cleaned, 0, $max - 1)) . '…';
    }

    private function isEnabled(): bool
    {
        if (! (bool) config('share_assets.enabled', true)) {
            return false;
        }

        if (! (bool) config('share_assets.ai.text_enabled', true)) {
            return false;
        }

        return trim((string) config('ai.openai.api_key', '')) !== '';
    }
}
