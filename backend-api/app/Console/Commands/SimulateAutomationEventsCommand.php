<?php

namespace App\Console\Commands;

use App\Models\AutomationEvent;
use App\Models\AutomationFailure;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class SimulateAutomationEventsCommand extends Command
{
    protected $signature = 'app:simulate-automation-events {--count=50 : Number of events to generate}';

    protected $description = 'Generate realistic automation events for KPI dashboard demo';

    public function handle(): int
    {
        $count = max(1, min(500, (int) $this->option('count')));

        $workflows = ['wa_queue_birthday', 'wa_queue_routine', 'wa_process_due'];
        $statuses = [
            'sent' => 55,
            'queued' => 20,
            'processing' => 8,
            'retrying' => 10,
            'escalated' => 4,
            'failed' => 3,
        ];

        $created = 0;
        for ($i = 0; $i < $count; $i++) {
            $workflow = $workflows[array_rand($workflows)];
            $status = $this->pickWeightedStatus($statuses);
            $attempt = in_array($status, ['retrying', 'escalated', 'failed'], true) ? random_int(2, 4) : 1;
            $idempotencyKey = sha1($workflow.'|'.Str::uuid()->toString());
            $createdAt = now()->subMinutes(random_int(0, 60 * 24 * 7));

            $event = AutomationEvent::query()->create([
                'workflow' => $workflow,
                'trigger_source' => 'simulation',
                'status' => $status,
                'channel' => 'whatsapp',
                'intent' => 'demo_orchestration',
                'confidence' => round(mt_rand(65, 99) / 100, 2),
                'recommended_action' => match ($status) {
                    'retrying' => 'retry_send',
                    'escalated' => 'escalate_human',
                    default => 'send_whatsapp',
                },
                'idempotency_key' => $idempotencyKey,
                'subject_type' => 'wa_reminder',
                'subject_id' => random_int(1, 500),
                'attempt' => $attempt,
                'duration_ms' => random_int(300, 6000),
                'available_for_retry' => in_array($status, ['retrying', 'failed'], true),
                'processed_at' => $status === 'queued' ? null : $createdAt->copy()->addSeconds(random_int(5, 120)),
                'escalated_at' => $status === 'escalated' ? $createdAt->copy()->addSeconds(random_int(30, 180)) : null,
                'error_code' => in_array($status, ['retrying', 'failed', 'escalated'], true)
                    ? collect(['timeout', 'auth_error', 'invalid_number', 'provider_error'])->random()
                    : null,
                'error_message' => in_array($status, ['retrying', 'failed', 'escalated'], true)
                    ? 'Simulated automation delivery failure'
                    : null,
                'decision_payload' => [
                    'wa_verified' => true,
                    'policy' => 'structured_orchestration',
                ],
                'action_payload' => [
                    'channels' => ['whatsapp', 'inbox'],
                ],
                'result_payload' => [
                    'simulated' => true,
                    'status' => $status,
                ],
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);

            if (in_array($status, ['retrying', 'failed', 'escalated'], true)) {
                AutomationFailure::query()->create([
                    'automation_event_id' => $event->id,
                    'workflow' => $workflow,
                    'status' => $status,
                    'root_cause' => (string) ($event->error_code ?? 'provider_error'),
                    'idempotency_key' => $idempotencyKey,
                    'subject_type' => 'wa_reminder',
                    'subject_id' => $event->subject_id,
                    'attempt' => $attempt,
                    'error_message' => (string) ($event->error_message ?? 'failure'),
                    'payload' => ['simulated' => true],
                    'resolved_at' => null,
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]);
            }

            $created++;
        }

        $this->info("Generated {$created} simulated automation events.");
        return self::SUCCESS;
    }

    /**
     * @param array<string,int> $weights
     */
    private function pickWeightedStatus(array $weights): string
    {
        $sum = array_sum($weights);
        $pick = random_int(1, max(1, $sum));
        $cursor = 0;
        foreach ($weights as $status => $weight) {
            $cursor += $weight;
            if ($pick <= $cursor) {
                return $status;
            }
        }

        return 'queued';
    }
}

