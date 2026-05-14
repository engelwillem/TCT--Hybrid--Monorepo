<?php

namespace App\Console\Commands;

use App\Models\DirectMessage;
use App\Models\User;
use App\Models\UserNotificationPreference;
use App\Models\UserWhatsappVerification;
use App\Models\WaClient;
use App\Models\WaReminder;
use App\Services\Automation\AutomationEventLogger;
use App\Services\Automation\AutomationWorkflowGate;
use App\Services\Engagement\SystemAccountService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class QueueWaMemberRoutineRemindersCommand extends Command
{
    protected $signature = 'wa:queue-member-routine-reminders {--limit=500 : Max users to scan per run}';

    protected $description = 'Queue non-birthday routine reminders (worship/class/visit) based on profile notification preferences';

    public function __construct(
        private readonly SystemAccountService $systemAccountService,
        private readonly AutomationEventLogger $eventLogger,
        private readonly AutomationWorkflowGate $workflowGate,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        if ($this->workflowGate->isPaused('wa_queue_routine')) {
            $this->warn('Workflow wa_queue_routine is paused.');
            return self::SUCCESS;
        }

        $limit = max(1, (int) $this->option('limit'));
        $users = User::query()->orderBy('id')->limit($limit)->get();

        $queued = 0;
        $skipped = 0;

        foreach ($users as $user) {
            $pref = UserNotificationPreference::query()
                ->where('user_id', $user->id)
                ->where('event_key', 'global')
                ->where('channel', 'whatsapp')
                ->first();

            if (! $pref || ! (bool) $pref->enabled) {
                $skipped++;
                continue;
            }

            $meta = is_array($pref->meta) ? $pref->meta : [];
            $timezone = $this->resolveTimezone(
                (string) ($pref->timezone ?? ''),
                (string) ($meta['timezone'] ?? '')
            );
            $nowLocal = Carbon::now($timezone);
            $event = $this->resolveTodayRoutineEvent($meta, $nowLocal);
            if ($event === null) {
                $skipped++;
                continue;
            }

            $verification = UserWhatsappVerification::query()
                ->where('user_id', $user->id)
                ->where('status', 'verified')
                ->whereNotNull('verified_at')
                ->latest('id')
                ->first();

            if (! $verification) {
                $this->queueInboxOnlyFallback(
                    $user->id,
                    $user->name,
                    $event['key'],
                    $event['label'],
                    $nowLocal->toDateString(),
                    'WA not verified'
                );
                $skipped++;
                continue;
            }

            $waClient = $this->resolveWaClient($verification->wa_client_id);
            if (! $waClient) {
                $this->queueInboxOnlyFallback(
                    $user->id,
                    $user->name,
                    $event['key'],
                    $event['label'],
                    $nowLocal->toDateString(),
                    'No active WA client'
                );
                $skipped++;
                continue;
            }

            $phone = trim((string) $verification->normalized_phone);
            if ($phone === '') {
                $this->queueInboxOnlyFallback(
                    $user->id,
                    $user->name,
                    $event['key'],
                    $event['label'],
                    $nowLocal->toDateString(),
                    'Missing WA phone'
                );
                $skipped++;
                continue;
            }

            $message = $this->buildRoutineMessage($user->name, $event['label']);
            $scheduledAtLocal = $nowLocal->copy()->setTimeFromTimeString($event['time'].':00');
            if ($scheduledAtLocal->lt($nowLocal)) {
                $scheduledAtLocal = $nowLocal->copy()->addMinute();
            }
            $scheduledAtUtc = $scheduledAtLocal->copy()->utc();
            $dayKey = $nowLocal->toDateString();

            $sourceHash = sha1(implode('|', [
                'routine',
                $event['key'],
                (string) $waClient->id,
                (string) $user->id,
                $phone,
                $dayKey,
                $message,
            ]));

            $existing = WaReminder::query()
                ->where('wa_client_id', $waClient->id)
                ->where('source_hash', $sourceHash)
                ->latest('id')
                ->first();

            if (! $existing || $existing->status !== 'Terkirim') {
                $payload = [
                    'wa_client_id' => $waClient->id,
                    'sheet_row_number' => null,
                    'customer_name' => $user->name,
                    'phone' => $phone,
                    'tanggal' => $scheduledAtLocal->format('Y-m-d'),
                    'jam' => $scheduledAtLocal->format('H:i:s'),
                    'zona_waktu' => $timezone,
                    'timezone' => $timezone,
                    'scheduled_at' => $scheduledAtUtc,
                    'message_template' => "routine_{$event['key']}_auto",
                    'message_final' => $message,
                    'toko' => 'TheChosenTalks',
                    'status' => 'Pending',
                    'fonnte_message_id' => null,
                    'sent_at' => null,
                    'response' => null,
                    'last_error' => null,
                    'source_hash' => $sourceHash,
                ];

                if ($existing) {
                    $existing->fill($payload);
                    $existing->save();
                } else {
                    WaReminder::query()->create($payload);
                }

                $this->eventLogger->log([
                    'workflow' => 'wa_queue_routine',
                    'trigger_source' => 'scheduler',
                    'status' => 'queued',
                    'channel' => 'whatsapp',
                    'intent' => "member_{$event['key']}_reminder",
                    'confidence' => 1.0,
                    'recommended_action' => 'send_wa_and_inbox',
                    'idempotency_key' => $sourceHash,
                    'subject_type' => 'user',
                    'subject_id' => $user->id,
                    'user_id' => $user->id,
                    'decision_payload' => [
                        'wa_verified' => true,
                        'timezone' => $timezone,
                        'scheduled_local' => $scheduledAtLocal->toDateTimeString(),
                    ],
                    'action_payload' => [
                        'channels' => ['whatsapp', 'inbox'],
                        'event_key' => $event['key'],
                    ],
                    'result_payload' => [
                        'queued_status' => 'Pending',
                    ],
                    'processed_at' => now(),
                ]);
            }

            $this->queueRoutineInboxMessage(
                $user->id,
                $user->name,
                $event['key'],
                $event['label'],
                $dayKey
            );

            $queued++;
        }

        $this->info("Queued {$queued} routine reminder(s), skipped {$skipped} user(s).");

        return self::SUCCESS;
    }

    /**
     * @return array{key:string,label:string,time:string}|null
     */
    private function resolveTodayRoutineEvent(array $meta, Carbon $nowLocal): ?array
    {
        $dayOfWeek = $nowLocal->dayOfWeekIso; // 1=Mon ... 7=Sun
        $matrix = [
            7 => ['key' => 'worship', 'label' => 'worship service', 'enabled_key' => 'reminder_worship_enabled', 'time_key' => 'reminder_worship_time', 'default_time' => '07:00'],
            3 => ['key' => 'class', 'label' => 'class session', 'enabled_key' => 'reminder_class_enabled', 'time_key' => 'reminder_class_time', 'default_time' => '18:00'],
            6 => ['key' => 'visit', 'label' => 'member visit', 'enabled_key' => 'reminder_visit_enabled', 'time_key' => 'reminder_visit_time', 'default_time' => '09:00'],
        ];

        if (! isset($matrix[$dayOfWeek])) {
            return null;
        }

        $row = $matrix[$dayOfWeek];
        if (! (bool) ($meta[$row['enabled_key']] ?? false)) {
            return null;
        }

        $time = (string) ($meta[$row['time_key']] ?? $row['default_time']);
        if (! preg_match('/^\d{2}:\d{2}$/', $time)) {
            $time = $row['default_time'];
        }

        return [
            'key' => $row['key'],
            'label' => $row['label'],
            'time' => $time,
        ];
    }

    private function resolveTimezone(string ...$candidates): string
    {
        foreach ($candidates as $candidate) {
            $value = trim($candidate);
            if ($value !== '') {
                return $value;
            }
        }

        return 'Asia/Makassar';
    }

    private function resolveWaClient(?int $preferredClientId): ?WaClient
    {
        if ($preferredClientId) {
            $client = WaClient::query()->find($preferredClientId);
            if ($client && strtolower((string) $client->status) === 'active' && trim((string) $client->fonnte_token) !== '') {
                return $client;
            }
        }

        $defaultKey = trim((string) config('whatsapp_verification.client_key', 'CLIENT_DEMO_001'));
        if ($defaultKey !== '') {
            $client = WaClient::query()->where('client_key', $defaultKey)->first();
            if ($client && strtolower((string) $client->status) === 'active' && trim((string) $client->fonnte_token) !== '') {
                return $client;
            }
        }

        return WaClient::query()
            ->where('status', 'active')
            ->whereNotNull('fonnte_token')
            ->where('fonnte_token', '!=', '')
            ->orderBy('id')
            ->first();
    }

    private function buildRoutineMessage(string $name, string $eventLabel): string
    {
        $safeName = trim($name) !== '' ? trim($name) : 'Sahabat';
        return "Shalom {$safeName}, this is your reminder for today's {$eventLabel}. May God guide and bless your time.";
    }

    private function queueRoutineInboxMessage(int $recipientUserId, string $name, string $eventKey, string $eventLabel, string $dayKey): void
    {
        $sender = $this->systemAccountService->getEncourager();
        $safeName = trim($name) !== '' ? trim($name) : 'Friend';
        $tag = "[AUTO_ROUTINE:{$eventKey}:{$dayKey}]";
        $body = "Hi {$safeName}, this is your reminder for today's {$eventLabel}. We are praying for your day. {$tag}";

        $alreadySent = DirectMessage::query()
            ->where('sender_id', $sender->id)
            ->where('recipient_id', $recipientUserId)
            ->where('body', 'like', "%{$tag}%")
            ->exists();

        if ($alreadySent) {
            return;
        }

        DirectMessage::query()->create([
            'sender_id' => $sender->id,
            'recipient_id' => $recipientUserId,
            'body' => $body,
            'approved_at' => now(),
            'read_at' => null,
        ]);
    }

    private function queueInboxOnlyFallback(
        int $recipientUserId,
        string $name,
        string $eventKey,
        string $eventLabel,
        string $dayKey,
        string $reason
    ): void {
        $sender = $this->systemAccountService->getEncourager();
        $safeName = trim($name) !== '' ? trim($name) : 'Friend';
        $tag = "[AUTO_ROUTINE_FALLBACK:{$eventKey}:{$dayKey}]";
        $body = "Hi {$safeName}, this is your reminder for today's {$eventLabel}. We sent it in-app because WhatsApp is unavailable. {$tag}";

        $alreadySent = DirectMessage::query()
            ->where('sender_id', $sender->id)
            ->where('recipient_id', $recipientUserId)
            ->where('body', 'like', "%{$tag}%")
            ->exists();

        if (! $alreadySent) {
            DirectMessage::query()->create([
                'sender_id' => $sender->id,
                'recipient_id' => $recipientUserId,
                'body' => $body,
                'approved_at' => now(),
                'read_at' => null,
            ]);
        }

        $this->eventLogger->log([
            'workflow' => 'wa_queue_routine',
            'trigger_source' => 'scheduler',
            'status' => 'sent',
            'channel' => 'inbox',
            'intent' => "member_{$eventKey}_reminder",
            'confidence' => 1.0,
            'recommended_action' => 'send_inbox_only',
            'subject_type' => 'user',
            'subject_id' => $recipientUserId,
            'user_id' => $recipientUserId,
            'decision_payload' => [
                'wa_verified' => false,
                'reason' => $reason,
            ],
            'action_payload' => [
                'channels' => ['inbox'],
                'event_key' => $eventKey,
            ],
            'result_payload' => [
                'fallback' => true,
            ],
            'processed_at' => now(),
        ]);
    }
}
