<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Log;

class AITelemetryService
{
    /**
     * @param  array<string, mixed>  $context
     */
    public function record(string $event, array $context = []): void
    {
        $payload = $context;
        unset($payload['raw_text'], $payload['raw_reflection'], $payload['raw_question']);

        $channel = trim((string) config('ai.telemetry.log_channel', ''));
        if ($channel !== '') {
            Log::channel($channel)->info('ai.'.$event, $payload);
            return;
        }

        Log::info('ai.'.$event, $payload);
    }
}

