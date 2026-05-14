<?php

namespace App\Console\Commands;

use App\Models\AutomationEvent;
use App\Models\AutomationFailure;
use App\Models\DirectMessage;
use App\Models\User;
use App\Models\WaLog;
use App\Models\WaPhoneOwner;
use App\Models\WaReminder;
use App\Services\Automation\AutomationEventLogger;
use App\Services\Automation\AutomationWorkflowGate;
use App\Services\Engagement\SystemAccountService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ProcessDueWaRemindersCommand extends Command
{
    private const WATCHDOG_OVERDUE_MINUTES = 2;
    private const MAX_RETRY_ATTEMPTS = 3;

    protected $signature = 'wa:process-due-reminders {--limit=50 : Max reminders per run}';

    protected $description = 'Process due WhatsApp reminders and send via Fonnte';

    public function __construct(
        private readonly AutomationEventLogger $eventLogger,
        private readonly AutomationWorkflowGate $workflowGate,
        private readonly SystemAccountService $systemAccountService,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        if ($this->workflowGate->isPaused('wa_process_due')) {
            $this->warn('Workflow wa_process_due is paused.');
            return self::SUCCESS;
        }

        $limit = max(1, (int) $this->option('limit'));
        $now = now()->utc();

        $candidateIds = WaReminder::query()
            ->whereIn('status', ['Pending', 'Gagal'])
            ->whereNull('fonnte_message_id')
            ->whereNotNull('scheduled_at')
            ->where('scheduled_at', '<=', $now)
            ->orderBy('scheduled_at')
            ->limit($limit)
            ->pluck('id');

        if ($candidateIds->isEmpty()) {
            $this->info('No due reminders.');
            return self::SUCCESS;
        }

        $processed = 0;
        foreach ($candidateIds as $id) {
            DB::transaction(function () use ($id, &$processed, $now): void {
                $reminder = WaReminder::query()
                    ->with('client')
                    ->lockForUpdate()
                    ->find($id);

                if (! $reminder) {
                    return;
                }

                if (! in_array($reminder->status, ['Pending', 'Gagal'], true)) {
                    return;
                }

                if ($reminder->fonnte_message_id) {
                    return;
                }

                if (! $this->isLatestUnsentRevision($reminder)) {
                    $reminder->status = 'Skip';
                    $reminder->last_error = 'superseded by newer revision';
                    $reminder->save();
                    $this->writeLegacyLog($reminder, 'Skip', null, ['reason' => 'superseded by newer revision'], null);
                    return;
                }

                $startMs = (int) floor(microtime(true) * 1000);
                $idempotencyKey = trim((string) $reminder->source_hash) !== ''
                    ? trim((string) $reminder->source_hash)
                    : 'wa-reminder:'.$reminder->id;
                $attempt = $this->resolveAttemptNumber($idempotencyKey);

                $this->eventLogger->log([
                    'workflow' => 'wa_process_due',
                    'trigger_source' => 'scheduler',
                    'status' => 'processing',
                    'channel' => 'whatsapp',
                    'intent' => 'dispatch_wa_reminder',
                    'confidence' => 1.0,
                    'recommended_action' => 'send_whatsapp',
                    'idempotency_key' => $idempotencyKey,
                    'subject_type' => 'wa_reminder',
                    'subject_id' => $reminder->id,
                    'attempt' => $attempt,
                    'action_payload' => [
                        'phone' => $reminder->phone,
                        'scheduled_at' => $reminder->scheduled_at?->toIso8601String(),
                    ],
                ]);

                Log::info('WA Scheduler Debug', [
                    'now' => $now->toDateTimeString(),
                    'scheduled_at' => $reminder->scheduled_at?->toDateTimeString(),
                    'reminder_id' => $reminder->id,
                    'wa_client_id' => $reminder->wa_client_id,
                ]);

                if (! $reminder->scheduled_at || $reminder->scheduled_at->gt($now)) {
                    return;
                }

                $overdueMinutes = abs($now->diffInMinutes($reminder->scheduled_at, false));
                if ($overdueMinutes > self::WATCHDOG_OVERDUE_MINUTES) {
                    Log::warning('WA Reminder watchdog: overdue reminder being processed', [
                        'reminder_id' => $reminder->id,
                        'wa_client_id' => $reminder->wa_client_id,
                        'sheet_row_number' => $reminder->sheet_row_number,
                        'overdue_minutes' => $overdueMinutes,
                        'scheduled_at' => $reminder->scheduled_at?->toDateTimeString(),
                        'now' => $now->toDateTimeString(),
                    ]);
                }

                $client = $reminder->client;
                if (! $client || strtolower((string) $client->status) !== 'active') {
                    $reminder->status = 'Skip';
                    $reminder->last_error = 'client inactive/not found';
                    $reminder->save();
                    $this->writeLegacyLog($reminder, 'Skip', null, ['reason' => 'client inactive/not found'], null);
                    return;
                }
                $clientToken = trim((string) $client->fonnte_token);
                if ($clientToken === '') {
                    $reminder->status = 'Skip';
                    $reminder->last_error = 'client token missing';
                    $reminder->save();
                    $this->writeLegacyLog($reminder, 'Skip', null, ['reason' => 'client token missing'], null);
                    return;
                }

                $ownerConflictReason = $this->resolvePhoneOwnerConflict($reminder);
                if ($ownerConflictReason !== null) {
                    $reminder->status = 'Skip';
                    $reminder->last_error = $ownerConflictReason;
                    $reminder->save();
                    $this->writeLegacyLog($reminder, 'Skip', null, ['reason' => $ownerConflictReason], null);
                    return;
                }

                try {
                    $response = Http::asForm()
                        ->timeout(30)
                        ->withHeaders([
                            'Authorization' => $clientToken,
                        ])
                        ->post('https://api.fonnte.com/send', [
                            'target' => $reminder->phone,
                            'message' => $reminder->message_final,
                        ]);

                    $decoded = $this->decodeResponseBody((string) $response->body());
                    $isSuccess = $this->isSuccessfulFonnteResponse($response->status(), $decoded);
                    $messageId = $this->extractMessageId($decoded);

                    if ($isSuccess) {
                        $timezone = $reminder->timezone ?: 'Asia/Makassar';
                        $sentAtLocal = Carbon::now($timezone);

                        $reminder->status = 'Terkirim';
                        $reminder->fonnte_message_id = $messageId;
                        $reminder->sent_at = $sentAtLocal->copy()->utc();
                        $reminder->response = $this->encodeResponse([
                            'http_status' => $response->status(),
                            'body' => $decoded,
                        ]);
                        $reminder->last_error = null;
                        $reminder->save();

                        $this->upsertPhoneOwnerFromSuccess($reminder, $sentAtLocal->copy()->utc());
                        $this->writeLegacyLog($reminder, 'Terkirim', $messageId, $decoded, $sentAtLocal);
                        $durationMs = max(0, (int) floor(microtime(true) * 1000) - $startMs);
                        $this->eventLogger->log([
                            'workflow' => 'wa_process_due',
                            'trigger_source' => 'scheduler',
                            'status' => 'sent',
                            'channel' => 'whatsapp',
                            'intent' => 'dispatch_wa_reminder',
                            'confidence' => 1.0,
                            'recommended_action' => 'send_whatsapp',
                            'idempotency_key' => $idempotencyKey,
                            'subject_type' => 'wa_reminder',
                            'subject_id' => $reminder->id,
                            'attempt' => $attempt,
                            'duration_ms' => $durationMs,
                            'processed_at' => now(),
                            'result_payload' => [
                                'http_status' => $response->status(),
                                'message_id' => $messageId,
                            ],
                        ]);
                        AutomationFailure::query()
                            ->where('workflow', 'wa_process_due')
                            ->where('idempotency_key', $idempotencyKey)
                            ->whereNull('resolved_at')
                            ->update([
                                'status' => 'resolved',
                                'resolved_at' => now(),
                            ]);
                    } else {
                        $reminder->status = 'Gagal';
                        $reminder->last_error = 'fonnte error';
                        $reminder->response = $this->encodeResponse([
                            'http_status' => $response->status(),
                            'body' => $decoded,
                        ]);
                        $reminder->save();

                        $this->writeLegacyLog($reminder, 'Gagal', $messageId, $decoded, null);
                        $this->recordFailureEvent(
                            reminder: $reminder,
                            idempotencyKey: $idempotencyKey,
                            attempt: $attempt,
                            errorCode: 'fonnte_error',
                            errorMessage: 'fonnte error',
                            responsePayload: [
                                'http_status' => $response->status(),
                                'body' => $decoded,
                            ],
                            startMs: $startMs
                        );
                    }
                } catch (\Throwable $throwable) {
                    $reminder->status = 'Gagal';
                    $reminder->last_error = $throwable->getMessage();
                    $reminder->response = $this->encodeResponse([
                        'error' => $throwable->getMessage(),
                    ]);
                    $reminder->save();

                    $this->writeLegacyLog(
                        $reminder,
                        'Gagal',
                        null,
                        ['error' => $throwable->getMessage()],
                        null
                    );
                    $this->recordFailureEvent(
                        reminder: $reminder,
                        idempotencyKey: $idempotencyKey,
                        attempt: $attempt,
                        errorCode: 'exception',
                        errorMessage: $throwable->getMessage(),
                        responsePayload: ['error' => $throwable->getMessage()],
                        startMs: $startMs
                    );
                }

                $processed++;
            });
        }

        $this->info("Processed {$processed} reminder(s).");
        return self::SUCCESS;
    }

    private function isLatestUnsentRevision(WaReminder $reminder): bool
    {
        $latestUnsentId = WaReminder::query()
            ->where('wa_client_id', $reminder->wa_client_id)
            ->where('sheet_row_number', $reminder->sheet_row_number)
            ->whereNull('fonnte_message_id')
            ->whereIn('status', ['Pending', 'Gagal'])
            ->max('id');

        if ($latestUnsentId === null) {
            return true;
        }

        return (int) $latestUnsentId === (int) $reminder->id;
    }

    private function writeLegacyLog(
        WaReminder $reminder,
        string $status,
        ?string $messageId,
        array $responsePayload,
        ?Carbon $sentAtLocal
    ): void {
        WaLog::query()->create([
            'wa_client_id' => $reminder->wa_client_id,
            'row_number' => $reminder->sheet_row_number,
            'customer_name' => $reminder->customer_name,
            'phone' => $reminder->phone,
            'toko' => $reminder->toko,
            'message' => $reminder->message_final,
            'timezone' => $reminder->timezone,
            'scheduled_at' => $reminder->scheduled_at,
            'status' => $status,
            'fonnte_message_id' => $messageId,
            'response' => $this->encodeResponse($responsePayload),
            'sent_at' => $sentAtLocal?->copy()->utc(),
        ]);
    }

    private function isSuccessfulFonnteResponse(int $statusCode, mixed $decoded): bool
    {
        if ($statusCode < 200 || $statusCode >= 300) {
            return false;
        }

        if (! is_array($decoded)) {
            return true;
        }

        if (! array_key_exists('status', $decoded)) {
            return true;
        }

        $status = $decoded['status'];
        if (is_bool($status)) {
            return $status;
        }

        $normalized = strtolower(trim((string) $status));
        return in_array($normalized, ['true', '1', 'ok', 'success', 'sukses'], true);
    }

    private function decodeResponseBody(string $body): mixed
    {
        $decoded = json_decode($body, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            return $decoded;
        }

        return ['raw' => $body];
    }

    private function extractMessageId(mixed $decoded): ?string
    {
        if (! is_array($decoded)) {
            return null;
        }

        $candidates = [
            $decoded['id'] ?? null,
            $decoded['message_id'] ?? null,
        ];

        foreach ($candidates as $candidate) {
            if (is_array($candidate)) {
                $first = $candidate[0] ?? null;
                if (is_string($first) && trim($first) !== '') {
                    return trim($first);
                }
                if (is_numeric($first)) {
                    return (string) $first;
                }
                continue;
            }

            if (is_string($candidate) && trim($candidate) !== '') {
                return trim($candidate);
            }
            if (is_numeric($candidate)) {
                return (string) $candidate;
            }
        }

        return null;
    }

    private function encodeResponse(array $payload): string
    {
        $encoded = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        return is_string($encoded) ? $encoded : '{}';
    }

    private function normalizeOwnerName(?string $name): string
    {
        $normalized = trim(mb_strtolower((string) $name));
        $normalized = preg_replace('/\s+/', ' ', $normalized);

        return is_string($normalized) ? $normalized : '';
    }

    private function resolvePhoneOwnerConflict(WaReminder $reminder): ?string
    {
        $phone = trim((string) $reminder->phone);
        if ($phone === '') {
            return null;
        }

        $incomingNameNormalized = $this->normalizeOwnerName($reminder->customer_name);
        if ($incomingNameNormalized === '') {
            return 'nama pelanggan kosong';
        }

        $owner = WaPhoneOwner::query()
            ->where('wa_client_id', $reminder->wa_client_id)
            ->where('phone', $phone)
            ->first();

        if (! $owner) {
            $owner = $this->bootstrapPhoneOwnerFromHistory((int) $reminder->wa_client_id, $phone);
        }

        if (! $owner) {
            return null;
        }

        $ownerNameNormalized = trim((string) $owner->canonical_name_normalized);
        if ($ownerNameNormalized === '' || $ownerNameNormalized === $incomingNameNormalized) {
            return null;
        }

        return sprintf(
            'conflict_phone_owner: nomor %s milik %s',
            $phone,
            (string) $owner->canonical_name
        );
    }

    private function upsertPhoneOwnerFromSuccess(WaReminder $reminder, Carbon $sentAtUtc): void
    {
        $phone = trim((string) $reminder->phone);
        $name = trim((string) $reminder->customer_name);
        $nameNormalized = $this->normalizeOwnerName($name);

        if ($phone === '' || $nameNormalized === '') {
            return;
        }

        $owner = WaPhoneOwner::query()
            ->firstOrNew([
                'wa_client_id' => $reminder->wa_client_id,
                'phone' => $phone,
            ]);

        if (! $owner->exists) {
            $owner->first_seen_at = $sentAtUtc;
            $owner->confidence = 1;
        } elseif ((string) $owner->canonical_name_normalized === $nameNormalized) {
            $owner->confidence = ((int) $owner->confidence) + 1;
        }

        if (trim((string) $owner->canonical_name_normalized) === '' || (string) $owner->canonical_name_normalized === $nameNormalized) {
            $owner->canonical_name = $name;
            $owner->canonical_name_normalized = $nameNormalized;
        }

        $owner->last_seen_at = $sentAtUtc;
        $owner->save();
    }

    private function bootstrapPhoneOwnerFromHistory(int $waClientId, string $phone): ?WaPhoneOwner
    {
        $firstSent = WaReminder::query()
            ->where('wa_client_id', $waClientId)
            ->where('phone', $phone)
            ->where('status', 'Terkirim')
            ->whereNotNull('sent_at')
            ->orderBy('sent_at')
            ->orderBy('id')
            ->first();

        if (! $firstSent) {
            return null;
        }

        $name = trim((string) $firstSent->customer_name);
        $nameNormalized = $this->normalizeOwnerName($name);
        if ($nameNormalized === '') {
            return null;
        }

        return WaPhoneOwner::query()->firstOrCreate(
            [
                'wa_client_id' => $waClientId,
                'phone' => $phone,
            ],
            [
                'canonical_name' => $name,
                'canonical_name_normalized' => $nameNormalized,
                'first_seen_at' => $firstSent->sent_at?->copy()->utc(),
                'last_seen_at' => $firstSent->sent_at?->copy()->utc(),
                'confidence' => 1,
            ]
        );
    }

    private function resolveAttemptNumber(string $idempotencyKey): int
    {
        $latestAttempt = (int) AutomationEvent::query()
            ->where('workflow', 'wa_process_due')
            ->where('idempotency_key', $idempotencyKey)
            ->max('attempt');

        return max(1, $latestAttempt + 1);
    }

    private function recordFailureEvent(
        WaReminder $reminder,
        string $idempotencyKey,
        int $attempt,
        string $errorCode,
        string $errorMessage,
        array $responsePayload,
        int $startMs
    ): void {
        $durationMs = max(0, (int) floor(microtime(true) * 1000) - $startMs);
        $willEscalate = $attempt >= self::MAX_RETRY_ATTEMPTS;
        $status = $willEscalate ? 'escalated' : 'retrying';

        $event = $this->eventLogger->log([
            'workflow' => 'wa_process_due',
            'trigger_source' => 'scheduler',
            'status' => $status,
            'channel' => 'whatsapp',
            'intent' => 'dispatch_wa_reminder',
            'confidence' => 1.0,
            'recommended_action' => $willEscalate ? 'escalate_human' : 'retry_send',
            'idempotency_key' => $idempotencyKey,
            'subject_type' => 'wa_reminder',
            'subject_id' => $reminder->id,
            'attempt' => $attempt,
            'duration_ms' => $durationMs,
            'available_for_retry' => ! $willEscalate,
            'processed_at' => now(),
            'escalated_at' => $willEscalate ? now() : null,
            'error_code' => $errorCode,
            'error_message' => $errorMessage,
            'result_payload' => $responsePayload,
        ]);

        AutomationFailure::query()->create([
            'automation_event_id' => $event->id,
            'workflow' => 'wa_process_due',
            'status' => $status,
            'root_cause' => $errorCode,
            'idempotency_key' => $idempotencyKey,
            'subject_type' => 'wa_reminder',
            'subject_id' => $reminder->id,
            'attempt' => $attempt,
            'error_message' => $errorMessage,
            'payload' => $responsePayload,
        ]);

        if ($willEscalate) {
            $this->notifyAdminEscalation($reminder, $errorMessage, $attempt);
        }
    }

    private function notifyAdminEscalation(WaReminder $reminder, string $errorMessage, int $attempt): void
    {
        $admin = User::query()
            ->whereRaw('LOWER(email) = ?', ['engel.willem@gmail.com'])
            ->first();
        if (! $admin) {
            return;
        }

        $sender = $this->systemAccountService->getEncourager();
        $tag = "[AUTO_ESCALATION:WA:{$reminder->id}]";
        $body = "Automation escalation: WA reminder #{$reminder->id} failed after {$attempt} attempts. Error: {$errorMessage}. {$tag}";

        $exists = DirectMessage::query()
            ->where('sender_id', $sender->id)
            ->where('recipient_id', $admin->id)
            ->where('body', 'like', "%{$tag}%")
            ->exists();

        if ($exists) {
            return;
        }

        DirectMessage::query()->create([
            'sender_id' => $sender->id,
            'recipient_id' => $admin->id,
            'body' => $body,
            'approved_at' => now(),
            'read_at' => null,
        ]);
    }
}
