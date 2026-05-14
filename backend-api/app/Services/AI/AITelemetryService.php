<?php

namespace App\Services\AI;

use App\Enums\AiActivityStatus;
use App\Enums\SystemSeverity;
use App\Models\AiActivityLog;
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

        $this->persist($event, $payload);

        $channel = trim((string) config('ai.telemetry.log_channel', ''));
        if ($channel !== '') {
            Log::channel($channel)->info('ai.'.$event, $payload);
            return;
        }

        Log::info('ai.'.$event, $payload);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function persist(string $event, array $payload): void
    {
        if (! (bool) config('ai.telemetry.persist', false)) {
            return;
        }

        try {
            AiActivityLog::query()->create([
                'user_id' => $this->nullableInt($payload['user_id'] ?? null),
                'event' => $event,
                'surface' => $this->nullableString($payload['surface'] ?? $payload['assist_mode'] ?? null, 60),
                'workflow_key' => $this->nullableString($payload['workflow_key'] ?? null, 100),
                'provider' => $this->nullableString($payload['provider'] ?? $payload['driver'] ?? null, 40),
                'model' => $this->nullableString($payload['model'] ?? null, 80),
                'status' => $this->resolveStatus($payload),
                'severity' => $this->resolveSeverity($payload),
                'request_id' => $this->nullableString($payload['request_id'] ?? null, 120),
                'duration_ms' => $this->nullableInt($payload['duration_ms'] ?? $payload['latency_ms'] ?? null),
                'input_tokens' => $this->nullableInt($payload['input_tokens'] ?? null),
                'output_tokens' => $this->nullableInt($payload['output_tokens'] ?? null),
                'total_tokens' => $this->nullableInt($payload['total_tokens'] ?? null),
                'error_code' => $this->nullableString($payload['error_code'] ?? null, 80),
                'error_message' => $this->nullableString($payload['error_message'] ?? $payload['error'] ?? null, 1200),
                'context' => $payload,
                'occurred_at' => now(),
            ]);
        } catch (\Throwable $throwable) {
            Log::warning('ai.telemetry.persist_failed', [
                'event' => $event,
                'error' => $throwable->getMessage(),
            ]);
        }
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function resolveStatus(array $payload): AiActivityStatus
    {
        $status = strtolower(trim((string) ($payload['status'] ?? '')));

        return match ($status) {
            AiActivityStatus::FAILED->value => AiActivityStatus::FAILED,
            AiActivityStatus::FALLBACK->value => AiActivityStatus::FALLBACK,
            AiActivityStatus::SKIPPED->value => AiActivityStatus::SKIPPED,
            default => AiActivityStatus::SUCCESS,
        };
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function resolveSeverity(array $payload): SystemSeverity
    {
        $severity = strtolower(trim((string) ($payload['severity'] ?? '')));

        return match ($severity) {
            SystemSeverity::WARNING->value => SystemSeverity::WARNING,
            SystemSeverity::ERROR->value => SystemSeverity::ERROR,
            SystemSeverity::CRITICAL->value => SystemSeverity::CRITICAL,
            default => SystemSeverity::INFO,
        };
    }

    private function nullableInt(mixed $value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }

        return is_numeric($value) ? (int) $value : null;
    }

    private function nullableString(mixed $value, int $limit): ?string
    {
        $normalized = trim((string) $value);
        if ($normalized === '') {
            return null;
        }

        return mb_substr($normalized, 0, $limit);
    }
}

