<?php

namespace App\Services\Onboarding;

use App\Models\OnboardingEvent;
use App\Models\OnboardingLead;
use App\Models\OnboardingRun;
use App\Models\OnboardingTask;
use App\Services\AI\AIProviderInterface;
use App\Services\Onboarding\Contracts\CalendarAdapterInterface;
use App\Services\Onboarding\Contracts\CrmSyncAdapterInterface;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class OnboardingPipelineService
{
    public function __construct(
        private readonly AIProviderInterface $provider,
        private readonly CrmSyncAdapterInterface $crmAdapter,
        private readonly CalendarAdapterInterface $calendarAdapter,
    ) {
    }

    public function processLead(int $leadId, ?int $requestedRunId = null): void
    {
        $lead = OnboardingLead::query()->findOrFail($leadId);
        $run = $requestedRunId !== null
            ? OnboardingRun::query()->where('onboarding_lead_id', $leadId)->findOrFail($requestedRunId)
            : $this->resolveLatestRun($leadId);

        if ($run->status === 'completed') {
            return;
        }

        $this->markLeadStage($lead, 'running', 'lead_validated');
        $this->recordEvent($lead, $run, 'lead_validated', 'success', [
            'email' => $this->maskEmail((string) $lead->email),
            'has_phone' => trim((string) $lead->phone) !== '',
        ]);

        $summary = $this->generateAiSummary($lead, $run);

        $this->recordEvent($lead, $run, 'welcome_email_sent', 'success', [
            'channel' => 'mock',
            'status_label' => 'simulated/mock',
            'delivery' => 'not_sent',
            'message' => 'Welcome email simulated in MVP.',
        ]);
        $this->markLeadStage($lead, 'running', 'welcome_email_sent');

        $task = OnboardingTask::query()->create([
            'onboarding_lead_id' => $lead->id,
            'task_type' => 'advisor_followup',
            'title' => 'Initial discovery call',
            'description' => 'Review AI summary and prepare discovery questions.',
            'due_at' => now()->addDays(2),
            'status' => 'open',
        ]);

        $this->recordEvent($lead, $run, 'advisor_task_created', 'success', [
            'task_type' => 'advisor_followup',
            'title' => $task->title,
            'task_id' => $task->id,
        ]);
        $this->markLeadStage($lead, 'running', 'advisor_task_created');

        $calendarResult = $this->calendarAdapter->createEvent($lead);
        $this->recordEvent($lead, $run, 'calendar_event_created', 'success', $calendarResult);
        $this->markLeadStage($lead, 'running', 'calendar_event_created');

        $crmResult = $this->crmAdapter->syncLead($lead);
        $this->recordEvent($lead, $run, 'crm_synced', 'success', $crmResult);
        $this->markLeadStage($lead, 'running', 'crm_synced');

        $this->recordEvent($lead, $run, 'completed', 'success', [
            'summary_preview' => mb_substr((string) ($summary['summary'] ?? ''), 0, 180),
        ]);

        $run->forceFill([
            'status' => 'completed',
            'finished_at' => now(),
            'error_code' => null,
            'error_message' => null,
        ])->save();

        $this->markLeadStage($lead, 'completed', 'completed');
        $this->refreshDailyKpi($lead->created_at?->toDateString() ?? now()->toDateString());
    }

    public function failRun(OnboardingLead $lead, OnboardingRun $run, string $stage, string $errorCode, string $message): void
    {
        $run->forceFill([
            'status' => 'failed',
            'finished_at' => now(),
            'error_code' => $errorCode,
            'error_message' => mb_substr($message, 0, 800),
        ])->save();

        $this->recordEvent($lead, $run, $stage, 'failed', null, $errorCode, $message);
        $this->markLeadStage($lead, 'failed', 'failed');
    }

    private function generateAiSummary(OnboardingLead $lead, OnboardingRun $run): array
    {
        $startedAt = microtime(true);

        try {
            $response = $this->provider->requestJson(
                [
                    [
                        'role' => 'system',
                        'content' => 'You are an assistant for financial advisory onboarding. Return strict JSON only.',
                    ],
                    [
                        'role' => 'user',
                        'content' => json_encode([
                            'instruction' => 'Summarize client profile and next actions.',
                            'output_keys' => ['summary', 'risk_observation', 'next_actions'],
                            'client' => [
                                'full_name' => $lead->full_name,
                                'risk_profile' => $lead->risk_profile,
                                'annual_income' => $lead->annual_income,
                                'goals' => $lead->goals_json,
                                'notes' => $lead->notes,
                            ],
                        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                    ],
                ],
                [
                    'format' => [
                        'type' => 'json_schema',
                        'name' => 'onboarding_client_summary',
                        'schema' => [
                            'type' => 'object',
                            'additionalProperties' => false,
                            'required' => ['summary', 'risk_observation', 'next_actions'],
                            'properties' => [
                                'summary' => ['type' => 'string'],
                                'risk_observation' => ['type' => 'string'],
                                'next_actions' => ['type' => 'array', 'items' => ['type' => 'string']],
                            ],
                        ],
                    ],
                ],
            );
        } catch (\Throwable $throwable) {
            throw new RuntimeException('AI summary generation failed: '.$throwable->getMessage(), 0, $throwable);
        }

        $durationMs = (int) round((microtime(true) - $startedAt) * 1000);
        $data = (array) ($response['data'] ?? []);

        $this->recordEvent($lead, $run, 'ai_summary_generated', 'success', [
            'summary' => mb_substr((string) ($data['summary'] ?? ''), 0, 1600),
            'risk_observation' => mb_substr((string) ($data['risk_observation'] ?? ''), 0, 800),
            'next_actions' => array_values(array_filter((array) ($data['next_actions'] ?? []), fn ($item) => is_string($item) && trim($item) !== '')),
            'request_id' => $response['request_id'] ?? null,
        ], $durationMs);

        $this->markLeadStage($lead, 'running', 'ai_summary_generated');

        return $data;
    }

    private function markLeadStage(OnboardingLead $lead, string $status, string $stage): void
    {
        $lead->forceFill([
            'status' => $status,
            'current_stage' => $stage,
            'last_processed_at' => now(),
        ])->save();
    }

    private function resolveLatestRun(int $leadId): OnboardingRun
    {
        return OnboardingRun::query()
            ->where('onboarding_lead_id', $leadId)
            ->latest('id')
            ->firstOrFail();
    }

    /**
     * @param  array<string, mixed>|null  $payload
     */
    private function recordEvent(
        OnboardingLead $lead,
        OnboardingRun $run,
        string $stage,
        string $status,
        ?array $payload = null,
        ?string $errorCode = null,
        ?string $errorMessage = null,
        ?int $durationMs = null
    ): void {
        DB::transaction(function () use ($lead, $run, $stage, $status, $payload, $errorCode, $errorMessage, $durationMs): void {
            OnboardingEvent::query()->create([
                'onboarding_run_id' => $run->id,
                'onboarding_lead_id' => $lead->id,
                'stage' => $stage,
                'status' => $status,
                'payload_json' => $payload,
                'duration_ms' => $durationMs,
                'error_code' => $errorCode,
                'error_message' => $errorMessage !== null ? mb_substr($errorMessage, 0, 1200) : null,
                'occurred_at' => now(),
            ]);
        });
    }

    private function maskEmail(string $email): string
    {
        $parts = explode('@', $email);
        if (count($parts) !== 2) {
            return 'masked';
        }

        $name = $parts[0];
        $domain = $parts[1];
        $prefix = mb_substr($name, 0, 2);

        return $prefix.'***@'.$domain;
    }

    private function refreshDailyKpi(string $date): void
    {
        $totalLeads = OnboardingLead::query()->whereDate('created_at', $date)->count();
        $completedRuns = OnboardingRun::query()->whereDate('created_at', $date)->where('status', 'completed')->count();
        $failedRuns = OnboardingRun::query()->whereDate('created_at', $date)->where('status', 'failed')->count();

        $avgDuration = (float) (OnboardingRun::query()
            ->whereDate('created_at', $date)
            ->whereNotNull('started_at')
            ->whereNotNull('finished_at')
            ->get(['started_at', 'finished_at'])
            ->map(fn (OnboardingRun $run): int => (int) $run->started_at->diffInMilliseconds($run->finished_at))
            ->avg() ?? 0);

        $aiSummaryCount = OnboardingEvent::query()->whereDate('occurred_at', $date)->where('stage', 'ai_summary_generated')->where('status', 'success')->count();
        $emailSentCount = OnboardingEvent::query()->whereDate('occurred_at', $date)->where('stage', 'welcome_email_sent')->where('status', 'success')->count();
        $crmSyncCount = OnboardingEvent::query()->whereDate('occurred_at', $date)->where('stage', 'crm_synced')->where('status', 'success')->count();

        DB::table('automation_kpis_daily')->updateOrInsert(
            ['date' => $date],
            [
                'total_leads' => $totalLeads,
                'completed_runs' => $completedRuns,
                'failed_runs' => $failedRuns,
                'avg_duration_ms' => (int) round($avgDuration),
                'ai_summary_count' => $aiSummaryCount,
                'email_sent_count' => $emailSentCount,
                'crm_sync_count' => $crmSyncCount,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );
    }
}
