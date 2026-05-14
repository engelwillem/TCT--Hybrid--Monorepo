<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AutomationEvent;
use App\Models\User;
use App\Models\WaReminder;
use App\Services\Automation\AutomationEventLogger;
use App\Services\Automation\AutomationWorkflowGate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AutomationKpiController extends Controller
{
    public function __construct(
        private readonly AutomationWorkflowGate $workflowGate,
        private readonly AutomationEventLogger $eventLogger,
    ) {}

    public function summary(Request $request): JsonResponse
    {
        $user = $this->resolveAdmin($request);
        if (! $user) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $limit = max(1, min(50, (int) $request->integer('limit', 20)));
        $workflow = trim((string) $request->query('workflow', ''));
        $status = trim((string) $request->query('status', ''));

        $query = AutomationEvent::query()->orderByDesc('id');
        if ($workflow !== '') {
            $query->where('workflow', $workflow);
        }
        if ($status !== '') {
            $query->where('status', $status);
        }

        $windowStart = now()->subDays(7);
        $windowQuery = AutomationEvent::query()->where('created_at', '>=', $windowStart);
        if ($workflow !== '') {
            $windowQuery->where('workflow', $workflow);
        }

        $total = (clone $windowQuery)->count();
        $success = (clone $windowQuery)->where('status', 'sent')->count();
        $failed = (clone $windowQuery)->where('status', 'failed')->count();
        $retrying = (clone $windowQuery)->where('status', 'retrying')->count();
        $escalated = (clone $windowQuery)->where('status', 'escalated')->count();
        $avgDuration = (int) round((float) ((clone $windowQuery)->whereNotNull('duration_ms')->avg('duration_ms') ?? 0));

        $events = $query->limit($limit)->get()->map(fn (AutomationEvent $event): array => [
            'id' => (int) $event->id,
            'workflow' => (string) $event->workflow,
            'trigger_source' => $event->trigger_source,
            'status' => (string) $event->status,
            'channel' => $event->channel,
            'intent' => $event->intent,
            'confidence' => $event->confidence,
            'recommended_action' => $event->recommended_action,
            'idempotency_key' => $event->idempotency_key,
            'subject_type' => $event->subject_type,
            'subject_id' => $event->subject_id,
            'user_id' => $event->user_id,
            'attempt' => (int) $event->attempt,
            'duration_ms' => $event->duration_ms,
            'available_for_retry' => (bool) $event->available_for_retry,
            'error_code' => $event->error_code,
            'error_message' => $event->error_message,
            'processed_at' => $event->processed_at?->toIso8601String(),
            'escalated_at' => $event->escalated_at?->toIso8601String(),
            'created_at' => $event->created_at?->toIso8601String(),
        ])->values();

        return response()->json([
            'data' => [
                'metrics' => [
                    'window_days' => 7,
                    'total_events' => $total,
                    'success_count' => $success,
                    'failed_count' => $failed,
                    'retry_count' => $retrying,
                    'escalation_count' => $escalated,
                    'success_rate' => $total > 0 ? round(($success / $total) * 100, 2) : 0.0,
                    'failure_rate' => $total > 0 ? round(($failed / $total) * 100, 2) : 0.0,
                    'avg_processing_ms' => $avgDuration,
                ],
                'workflow_state' => [
                    'wa_queue_birthday' => $this->workflowGate->isPaused('wa_queue_birthday') ? 'paused' : 'running',
                    'wa_queue_routine' => $this->workflowGate->isPaused('wa_queue_routine') ? 'paused' : 'running',
                    'wa_process_due' => $this->workflowGate->isPaused('wa_process_due') ? 'paused' : 'running',
                ],
                'events' => $events,
            ],
        ]);
    }

    public function pause(Request $request, string $workflow): JsonResponse
    {
        $user = $this->resolveAdmin($request);
        if (! $user) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $this->workflowGate->pause($workflow);
        $this->eventLogger->log([
            'workflow' => 'automation_control',
            'trigger_source' => 'admin_console',
            'status' => 'sent',
            'channel' => 'system',
            'intent' => 'pause_workflow',
            'recommended_action' => 'pause_workflow',
            'user_id' => $user->id,
            'action_payload' => ['workflow' => $workflow],
            'result_payload' => ['state' => 'paused'],
            'processed_at' => now(),
        ]);

        return response()->json(['data' => ['workflow' => $workflow, 'state' => 'paused']]);
    }

    public function resume(Request $request, string $workflow): JsonResponse
    {
        $user = $this->resolveAdmin($request);
        if (! $user) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $this->workflowGate->resume($workflow);
        $this->eventLogger->log([
            'workflow' => 'automation_control',
            'trigger_source' => 'admin_console',
            'status' => 'sent',
            'channel' => 'system',
            'intent' => 'resume_workflow',
            'recommended_action' => 'resume_workflow',
            'user_id' => $user->id,
            'action_payload' => ['workflow' => $workflow],
            'result_payload' => ['state' => 'running'],
            'processed_at' => now(),
        ]);

        return response()->json(['data' => ['workflow' => $workflow, 'state' => 'running']]);
    }

    public function retryFailed(Request $request, AutomationEvent $automationEvent): JsonResponse
    {
        $user = $this->resolveAdmin($request);
        if (! $user) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if (! $automationEvent->available_for_retry) {
            return response()->json(['message' => 'Event is not retryable.'], 422);
        }

        $subjectType = (string) $automationEvent->subject_type;
        $subjectId = (int) $automationEvent->subject_id;
        if ($subjectType !== 'wa_reminder' || $subjectId <= 0) {
            return response()->json(['message' => 'Unsupported retry subject.'], 422);
        }

        $reminder = WaReminder::query()->find($subjectId);
        if (! $reminder) {
            return response()->json(['message' => 'Related reminder not found.'], 404);
        }

        $reminder->status = 'Pending';
        $reminder->last_error = null;
        $reminder->response = null;
        $reminder->fonnte_message_id = null;
        $reminder->save();

        $this->eventLogger->log([
            'workflow' => 'wa_process_due',
            'trigger_source' => 'admin_retry',
            'status' => 'retrying',
            'channel' => 'whatsapp',
            'intent' => 'retry_send',
            'recommended_action' => 'resend_whatsapp',
            'user_id' => $user->id,
            'subject_type' => 'wa_reminder',
            'subject_id' => $reminder->id,
            'idempotency_key' => $automationEvent->idempotency_key,
            'attempt' => max(1, ((int) $automationEvent->attempt) + 1),
            'action_payload' => ['event_id' => $automationEvent->id],
            'result_payload' => ['status' => 'Pending'],
            'processed_at' => now(),
        ]);

        return response()->json(['data' => ['event_id' => $automationEvent->id, 'retry_state' => 'queued']]);
    }

    private function resolveAdmin(Request $request): ?User
    {
        /** @var User|null $user */
        $user = $request->user();
        if (! $user) {
            return null;
        }

        $email = strtolower(trim((string) $user->email));
        if (! $user->is_admin || $email !== 'engel.willem@gmail.com') {
            return null;
        }

        return $user;
    }
}

