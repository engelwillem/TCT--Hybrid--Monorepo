<?php

namespace App\Services\AI;

use App\Services\Renungan\RenunganMentorService;
use Illuminate\Support\Str;

class RenunganAIService
{
    public function __construct(
        private readonly RenunganMentorService $mentorService,
        private readonly AISafetyService $safetyService,
        private readonly AITelemetryService $telemetryService,
    ) {
    }

    /**
     * @param  array<string, mixed>  $context
     * @return array<string, mixed>
     */
    public function generate(array $context): array
    {
        $reflection = (string) ($context['reflection_text'] ?? '');
        $responseMode = (string) ($context['response_mode'] ?? 'calm_heart');
        $storageMode = (string) ($context['storage_mode'] ?? 'standard');
        $verseReference = trim((string) ($context['verse_reference'] ?? ''));
        $safety = $this->safetyService->classify($reflection);

        $mentor = $this->mentorService->generate($context + [
            'response_mode' => $responseMode,
            'safety' => $safety,
        ]);

        $mentor['safety'] = $safety;
        $mentor['response_mode'] = $responseMode;
        $mentor['follow_up_prompts'] = $this->buildFollowUpPrompts($responseMode, $safety);
        $mentor['privacy'] = [
            'storage_mode' => $storageMode,
            'raw_input_persisted' => $storageMode !== 'no_raw_storage',
            // Keep deterministic anonymous trace without storing raw sensitive text.
            'input_hash' => sha1(Str::lower(trim($reflection))),
        ];
        $mentor['pipeline'] = [
            'steps' => [
                'input_analysis',
                'verse_grounding',
                'response_generation',
                'safety_pass',
            ],
            'grounding' => [
                'anchor_ref' => $verseReference !== '' ? $verseReference : null,
            ],
            'safety' => [
                'risk_level' => $safety['risk_level'],
                'urgency' => $safety['urgency'] ?? 'routine',
            ],
        ];

        $this->telemetryService->record('renungan.generated', [
            'driver' => data_get($mentor, 'meta.driver', 'template'),
            'used_fallback' => (bool) data_get($mentor, 'meta.used_fallback', true),
            'risk_level' => $safety['risk_level'],
            'response_mode' => $responseMode,
            'storage_mode' => $storageMode,
            'request_id' => $mentor['request_id'] ?? null,
        ]);

        return $mentor;
    }

    /**
     * @param  array{risk_level?: string}  $safety
     * @return array<int, string>
     */
    private function buildFollowUpPrompts(string $responseMode, array $safety): array
    {
        $base = match ($responseMode) {
            'practical_step' => [
                'Langkah terkecil apa yang paling realistis kamu lakukan hari ini?',
                'Mau saya bantu ubah ini jadi rencana 1 langkah, 1 doa, 1 tindakan?',
            ],
            'short_prayer' => [
                'Mau saya bantu ubah isi hati ini jadi doa singkat 2-3 kalimat?',
                'Bagian mana yang paling kamu ingin bawa dalam doa sekarang?',
            ],
            'deep_reflection' => [
                'Bagian mana dari ayat ini yang paling menegur sekaligus menguatkanmu?',
                'Mau saya bantu gali renungan lebih dalam dari sudut konteks ayatnya?',
            ],
            default => [
                'Apa yang paling berat dari situasi ini saat ini?',
                'Mau saya bantu ubah ini jadi doa singkat untuk malam ini?',
            ],
        };

        if (($safety['risk_level'] ?? 'low') === 'high') {
            $base[] = 'Kalau situasi terasa sangat berat, mau saya bantu susun langkah aman untuk mencari dukungan sekarang?';
        }

        return array_values(array_unique($base));
    }
}
