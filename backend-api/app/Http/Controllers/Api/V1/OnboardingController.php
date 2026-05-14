<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Jobs\Onboarding\ProcessOnboardingLeadJob;
use App\Models\OnboardingEvent;
use App\Models\OnboardingLead;
use App\Models\OnboardingRun;
use App\Models\OnboardingTask;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Services\Onboarding\Contracts\CalendarAdapterInterface;
use App\Services\Onboarding\Contracts\CrmSyncAdapterInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OnboardingController extends Controller
{
    public function storeLead(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'source' => ['nullable', 'string', 'max:40'],
            'full_name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:150'],
            'phone' => ['nullable', 'string', 'max:40'],
            'annual_income' => ['nullable', 'numeric', 'min:0'],
            'risk_profile' => ['nullable', 'string', 'max:30'],
            'goals' => ['nullable', 'array'],
            'notes' => ['nullable', 'string', 'max:3000'],
        ]);

        $correlationId = trim((string) ($request->header('X-Correlation-Id') ?? ''));
        if ($correlationId === '') {
            $correlationId = 'onb-'.Str::uuid();
        }

        $lead = OnboardingLead::query()->firstOrCreate(
            ['correlation_id' => $correlationId],
            [
                'source' => (string) ($validated['source'] ?? 'web_form'),
                'full_name' => (string) $validated['full_name'],
                'email' => (string) $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'annual_income' => $validated['annual_income'] ?? null,
                'risk_profile' => $validated['risk_profile'] ?? null,
                'goals_json' => $validated['goals'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'status' => 'pending',
                'current_stage' => 'lead_received',
            ]
        );

        $run = $this->createRunIfNeeded($lead);
        ProcessOnboardingLeadJob::dispatch($lead->id, $run->id);

        return response()->json([
            'lead_id' => $lead->id,
            'run_id' => $run->id,
            'status' => $lead->status,
            'current_stage' => $lead->current_stage,
            'correlation_id' => $lead->correlation_id,
        ], 202);
    }

    public function listLeads(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['nullable', 'string', 'max:20'],
            'stage' => ['nullable', 'string', 'max:60'],
            'q' => ['nullable', 'string', 'max:120'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $query = OnboardingLead::query()->latest('id');
        if (! empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }
        if (! empty($validated['stage'])) {
            $query->where('current_stage', $validated['stage']);
        }
        if (! empty($validated['q'])) {
            $q = (string) $validated['q'];
            $query->where(function ($builder) use ($q): void {
                $builder->where('full_name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%");
            });
        }
        if (! empty($validated['date_from'])) {
            $query->whereDate('created_at', '>=', $validated['date_from']);
        }
        if (! empty($validated['date_to'])) {
            $query->whereDate('created_at', '<=', $validated['date_to']);
        }

        $limit = (int) ($validated['limit'] ?? 20);
        $items = $query->limit($limit)->get();

        return response()->json(['data' => $items]);
    }

    public function showLead(int $id): JsonResponse
    {
        $lead = OnboardingLead::query()->findOrFail($id);
        $latestRun = OnboardingRun::query()
            ->where('onboarding_lead_id', $lead->id)
            ->latest('id')
            ->first();
        $events = OnboardingEvent::query()
            ->where('onboarding_lead_id', $lead->id)
            ->orderBy('id')
            ->get();
        $tasks = OnboardingTask::query()
            ->where('onboarding_lead_id', $lead->id)
            ->orderBy('id')
            ->get();

        return response()->json([
            'lead' => $lead,
            'latest_run' => $latestRun,
            'events' => $events,
            'tasks' => $tasks,
        ]);
    }

    public function statusByCorrelation(string $correlationId): JsonResponse
    {
        $lead = OnboardingLead::query()
            ->where('correlation_id', $correlationId)
            ->firstOrFail();

        $latestRun = OnboardingRun::query()
            ->where('onboarding_lead_id', $lead->id)
            ->latest('id')
            ->first();

        $events = OnboardingEvent::query()
            ->where('onboarding_lead_id', $lead->id)
            ->orderBy('id')
            ->get()
            ->map(fn (OnboardingEvent $event): array => $this->safeEvent($event));

        return response()->json([
            'correlation_id' => $lead->correlation_id,
            'status' => $lead->status,
            'current_stage' => $lead->current_stage,
            'latest_run' => $latestRun ? $this->safeRun($latestRun) : null,
            'events' => $events,
            'limitations' => [
                'lead_private_fields_hidden' => true,
                'email_delivery' => 'simulated/mock',
                'crm_calendar' => 'generic webhook adapter-ready only unless env URLs are configured',
            ],
        ]);
    }

    public function retryLead(int $id): JsonResponse
    {
        $lead = OnboardingLead::query()->findOrFail($id);
        $runNumber = ((int) OnboardingRun::query()->where('onboarding_lead_id', $lead->id)->max('run_number')) + 1;

        $run = OnboardingRun::query()->create([
            'onboarding_lead_id' => $lead->id,
            'run_number' => $runNumber,
            'status' => 'running',
            'started_at' => now(),
        ]);

        $lead->forceFill([
            'status' => 'pending',
            'current_stage' => 'lead_received',
        ])->save();

        ProcessOnboardingLeadJob::dispatch($lead->id, $run->id);

        return response()->json([
            'lead_id' => $lead->id,
            'run_id' => $run->id,
            'run_number' => $run->run_number,
            'status' => 'queued',
        ], 202);
    }

    public function summary(): JsonResponse
    {
        $totals = OnboardingLead::query()
            ->selectRaw('COUNT(*) as total_leads')
            ->selectRaw("SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed")
            ->selectRaw("SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed")
            ->first();

        $avgDuration = OnboardingRun::query()
            ->whereNotNull('started_at')
            ->whereNotNull('finished_at')
            ->get(['started_at', 'finished_at'])
            ->map(fn (OnboardingRun $run): int => (int) $run->started_at->diffInMilliseconds($run->finished_at))
            ->avg();

        $stageDistribution = OnboardingLead::query()
            ->select('current_stage', DB::raw('COUNT(*) as total'))
            ->groupBy('current_stage')
            ->orderByDesc('total')
            ->get();

        $failureReasons = OnboardingRun::query()
            ->whereNotNull('error_code')
            ->select('error_code', DB::raw('COUNT(*) as total'))
            ->groupBy('error_code')
            ->orderByDesc('total')
            ->limit(10)
            ->get();

        return response()->json([
            'total_leads' => (int) ($totals?->total_leads ?? 0),
            'completed' => (int) ($totals?->completed ?? 0),
            'failed' => (int) ($totals?->failed ?? 0),
            'avg_duration_ms' => $avgDuration !== null ? (int) round((float) $avgDuration) : null,
            'stage_distribution' => $stageDistribution,
            'failure_reasons' => $failureReasons,
            'limitations' => [
                'contains_private_lead_data' => false,
                'email_delivery' => 'simulated/mock',
                'crm_calendar' => 'generic webhook adapter-ready only unless env URLs are configured',
            ],
        ]);
    }

    public function recentRuns(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'limit' => ['nullable', 'integer', 'min:1', 'max:25'],
        ]);

        $limit = (int) ($validated['limit'] ?? 10);
        $runs = OnboardingRun::query()
            ->with('lead:id,correlation_id,status,current_stage,source,created_at')
            ->latest('id')
            ->limit($limit)
            ->get()
            ->map(fn (OnboardingRun $run): array => [
                ...$this->safeRun($run),
                'lead' => $run->lead ? [
                    'correlation_id' => $run->lead->correlation_id,
                    'status' => $run->lead->status,
                    'current_stage' => $run->lead->current_stage,
                    'source' => $run->lead->source,
                    'created_at' => optional($run->lead->created_at)->toIso8601String(),
                ] : null,
            ]);

        return response()->json([
            'data' => $runs,
            'limitations' => [
                'demo_safe' => true,
                'private_lead_fields_hidden' => true,
            ],
        ]);
    }

    public function logs(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'lead_id' => ['nullable', 'integer'],
            'run_id' => ['nullable', 'integer'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:200'],
        ]);

        $query = OnboardingEvent::query()->latest('id');
        if (! empty($validated['lead_id'])) {
            $query->where('onboarding_lead_id', (int) $validated['lead_id']);
        }
        if (! empty($validated['run_id'])) {
            $query->where('onboarding_run_id', (int) $validated['run_id']);
        }

        $limit = (int) ($validated['limit'] ?? 50);

        return response()->json([
            'data' => $query->limit($limit)->get(),
        ]);
    }

    public function kpiDetail(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'days' => ['nullable', 'integer', 'min:1', 'max:90'],
        ]);

        $days = (int) ($validated['days'] ?? 30);
        $from = now()->subDays($days - 1)->startOfDay();

        $daily = DB::table('automation_kpis_daily')
            ->whereDate('date', '>=', $from->toDateString())
            ->orderBy('date')
            ->get();

        $funnel = OnboardingEvent::query()
            ->select('stage', DB::raw('COUNT(*) as total'))
            ->where('status', 'success')
            ->whereDate('occurred_at', '>=', $from->toDateString())
            ->groupBy('stage')
            ->orderBy('total', 'desc')
            ->get();

        $failuresByCode = OnboardingRun::query()
            ->select('error_code', DB::raw('COUNT(*) as total'))
            ->whereNotNull('error_code')
            ->whereDate('created_at', '>=', $from->toDateString())
            ->groupBy('error_code')
            ->orderBy('total', 'desc')
            ->get();

        $integrationHealth = OnboardingEvent::query()
            ->select(
                'stage',
                DB::raw("SUM(CASE WHEN status='success' THEN 1 ELSE 0 END) as success_count"),
                DB::raw("SUM(CASE WHEN status='failed' THEN 1 ELSE 0 END) as failed_count")
            )
            ->whereIn('stage', ['calendar_event_created', 'crm_synced', 'welcome_email_sent'])
            ->whereDate('occurred_at', '>=', $from->toDateString())
            ->groupBy('stage')
            ->get();

        return response()->json([
            'range' => [
                'days' => $days,
                'from' => $from->toDateString(),
                'to' => now()->toDateString(),
            ],
            'daily_kpis' => $daily,
            'funnel_success_counts' => $funnel,
            'failure_by_error_code' => $failuresByCode,
            'integration_health' => $integrationHealth,
        ]);
    }

    public function integrationTest(
        Request $request,
        CrmSyncAdapterInterface $crmAdapter,
        CalendarAdapterInterface $calendarAdapter
    ): JsonResponse {
        $validated = $request->validate([
            'full_name' => ['nullable', 'string', 'max:150'],
            'email' => ['nullable', 'email', 'max:150'],
            'phone' => ['nullable', 'string', 'max:40'],
            'risk_profile' => ['nullable', 'string', 'max:30'],
        ]);

        $lead = new OnboardingLead([
            'full_name' => (string) ($validated['full_name'] ?? 'Integration Test Lead'),
            'email' => (string) ($validated['email'] ?? 'integration.test@example.com'),
            'phone' => $validated['phone'] ?? '6200000000',
            'risk_profile' => $validated['risk_profile'] ?? 'moderate',
            'goals_json' => ['integration_test'],
            'correlation_id' => 'integration-test-'.Str::uuid(),
        ]);

        $result = [
            'mode' => (string) config('onboarding.integrations.mode', 'mock'),
            'crm' => null,
            'calendar' => null,
            'errors' => [],
        ];

        try {
            $result['crm'] = $crmAdapter->syncLead($lead);
        } catch (\Throwable $throwable) {
            $result['errors'][] = [
                'surface' => 'crm',
                'message' => $throwable->getMessage(),
            ];
        }

        try {
            $result['calendar'] = $calendarAdapter->createEvent($lead);
        } catch (\Throwable $throwable) {
            $result['errors'][] = [
                'surface' => 'calendar',
                'message' => $throwable->getMessage(),
            ];
        }

        return response()->json($result, empty($result['errors']) ? 200 : 502);
    }

    private function createRunIfNeeded(OnboardingLead $lead): OnboardingRun
    {
        $existing = OnboardingRun::query()
            ->where('onboarding_lead_id', $lead->id)
            ->whereIn('status', ['running'])
            ->latest('id')
            ->first();

        if ($existing) {
            return $existing;
        }

        $nextRun = ((int) OnboardingRun::query()->where('onboarding_lead_id', $lead->id)->max('run_number')) + 1;

        return OnboardingRun::query()->create([
            'onboarding_lead_id' => $lead->id,
            'run_number' => $nextRun,
            'status' => 'running',
            'started_at' => now(),
        ]);
    }

    private function safeRun(OnboardingRun $run): array
    {
        return [
            'id' => $run->id,
            'run_number' => $run->run_number,
            'status' => $run->status,
            'started_at' => optional($run->started_at)->toIso8601String(),
            'finished_at' => optional($run->finished_at)->toIso8601String(),
            'error_code' => $run->error_code,
            'has_error_message' => trim((string) $run->error_message) !== '',
        ];
    }

    private function safeEvent(OnboardingEvent $event): array
    {
        $payload = (array) ($event->payload_json ?? []);
        unset($payload['email'], $payload['phone'], $payload['full_name'], $payload['response']);

        return [
            'stage' => $event->stage,
            'status' => $event->status,
            'payload' => $payload,
            'duration_ms' => $event->duration_ms,
            'error_code' => $event->error_code,
            'has_error_message' => trim((string) $event->error_message) !== '',
            'occurred_at' => optional($event->occurred_at)->toIso8601String(),
        ];
    }
}
