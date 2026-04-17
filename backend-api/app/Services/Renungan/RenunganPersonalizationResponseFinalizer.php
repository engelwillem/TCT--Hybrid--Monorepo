<?php

namespace App\Services\Renungan;

use App\Services\SpiritualSessionMemoryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class RenunganPersonalizationResponseFinalizer
{
    public function __construct(
        private SpiritualSessionMemoryService $spiritualSessionMemoryService,
    ) {
    }

    /**
     * @param  array<string, mixed>  $analysis
     * @param  array<string, mixed>  $responsePayload
     * @param  array<string, mixed>  $telemetry
     * @return array<string, mixed>
     */
    public function finalize(
        Request $request,
        array $analysis,
        array $responsePayload,
        array $telemetry,
        bool $includeDebugTelemetry,
        string $pipelineVersion
    ): array {
        $this->logRenunganTelemetry($telemetry);

        if ($includeDebugTelemetry) {
            $responsePayload['data']['generation']['telemetry_debug'] = $telemetry;
        }

        $this->persistSessionMemory($request, $analysis, $responsePayload, $pipelineVersion);

        return $responsePayload;
    }

    /**
     * @param  array<string, mixed>  $telemetry
     */
    private function logRenunganTelemetry(array $telemetry): void
    {
        $safeTelemetry = $telemetry;
        unset($safeTelemetry['reflection_text'], $safeTelemetry['input_text'], $safeTelemetry['raw_text']);
        $safeTelemetry['contains_raw_reflection'] = false;

        Log::info('renungan.personalization.telemetry', $safeTelemetry);
    }

    /**
     * @param  array<string, mixed>  $analysis
     * @param  array<string, mixed>  $responsePayload
     */
    private function persistSessionMemory(
        Request $request,
        array $analysis,
        array $responsePayload,
        string $pipelineVersion
    ): void {
        $user = $request->user();
        if (! $user) {
            return;
        }

        $data = (array) ($responsePayload['data'] ?? []);
        $verse = (array) ($data['verse'] ?? []);
        $generation = (array) ($data['generation'] ?? []);

        try {
            $this->spiritualSessionMemoryService->rememberFromRenungan($user, [
                'dominant_emotion' => $analysis['primary_emotion'] ?? null,
                'reflection_theme' => $analysis['primary_theme'] ?? null,
                'primary_verse_reference' => $verse['reference'] ?? null,
                'primary_verse_text' => $verse['text'] ?? null,
                'interpretation_focus' => data_get($generation, 'pastoral_angle')
                    ?? data_get($data, 'interpretation.pastoral_application'),
                'pipeline_version' => $pipelineVersion,
                'meta' => [
                    'request_id' => $data['request_id'] ?? null,
                    'driver' => $data['driver'] ?? null,
                    'used_fallback' => $data['used_fallback'] ?? null,
                    'response_mode' => $data['response_mode'] ?? null,
                ],
            ]);
        } catch (\Throwable $exception) {
            Log::warning('renungan.session_memory.persist_failed', [
                'user_id' => $user->id,
                'request_id' => $data['request_id'] ?? null,
                'pipeline_version' => $pipelineVersion,
                'error' => $exception->getMessage(),
            ]);
        }
    }
}
