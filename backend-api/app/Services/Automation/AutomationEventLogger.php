<?php

namespace App\Services\Automation;

use App\Models\AutomationEvent;
use Illuminate\Support\Carbon;

class AutomationEventLogger
{
    public function log(array $payload): AutomationEvent
    {
        $normalized = array_merge([
            'workflow' => 'unknown',
            'trigger_source' => null,
            'status' => 'queued',
            'channel' => null,
            'intent' => null,
            'confidence' => null,
            'recommended_action' => null,
            'idempotency_key' => null,
            'correlation_id' => null,
            'subject_type' => null,
            'subject_id' => null,
            'user_id' => null,
            'attempt' => 1,
            'duration_ms' => null,
            'available_for_retry' => false,
            'processed_at' => null,
            'escalated_at' => null,
            'error_code' => null,
            'error_message' => null,
            'decision_payload' => null,
            'action_payload' => null,
            'result_payload' => null,
        ], $payload);

        if (is_string($normalized['processed_at']) && trim($normalized['processed_at']) !== '') {
            $normalized['processed_at'] = Carbon::parse($normalized['processed_at']);
        }
        if (is_string($normalized['escalated_at']) && trim($normalized['escalated_at']) !== '') {
            $normalized['escalated_at'] = Carbon::parse($normalized['escalated_at']);
        }

        return AutomationEvent::query()->create($normalized);
    }
}

