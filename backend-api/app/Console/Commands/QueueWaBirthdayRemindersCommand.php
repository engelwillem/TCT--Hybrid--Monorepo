<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\DirectMessage;
use App\Models\UserNotificationPreference;
use App\Models\UserWhatsappVerification;
use App\Models\WaClient;
use App\Models\WaReminder;
use App\Services\Automation\AutomationEventLogger;
use App\Services\Automation\AutomationWorkflowGate;
use App\Services\Engagement\SystemAccountService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class QueueWaBirthdayRemindersCommand extends Command
{
    public function __construct(
        private readonly SystemAccountService $systemAccountService,
        private readonly AutomationEventLogger $eventLogger,
        private readonly AutomationWorkflowGate $workflowGate,
    ) {
        parent::__construct();
    }

    protected $signature = 'wa:queue-birthday-reminders {--limit=500 : Max users to scan per run}';

    protected $description = 'Queue WhatsApp birthday reminders for members with verified WA and enabled WA notifications';

    public function handle(): int
    {
        if ($this->workflowGate->isPaused('wa_queue_birthday')) {
            $this->warn('Workflow wa_queue_birthday is paused.');
            return self::SUCCESS;
        }

        $limit = max(1, (int) $this->option('limit'));
        $users = User::query()
            ->whereNotNull('birth_date')
            ->orderBy('id')
            ->limit($limit)
            ->get();

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

            $verification = UserWhatsappVerification::query()
                ->where('user_id', $user->id)
                ->where('status', 'verified')
                ->whereNotNull('verified_at')
                ->latest('id')
                ->first();

            if (! $verification) {
                $this->queueInboxOnlyFallback($user->id, $user->name, 'birthday', 'WA not verified');
                $skipped++;
                continue;
            }

            $timezone = $this->resolveTimezone(
                $pref->timezone,
                $verification->waClient?->timezone,
                $verification->waClient?->default_timezone
            );

            $nowLocal = Carbon::now($timezone);
            $birthDate = $user->birth_date?->copy()->timezone($timezone);
            if (! $birthDate || $birthDate->month !== $nowLocal->month || $birthDate->day !== $nowLocal->day) {
                $skipped++;
                continue;
            }

            $waClient = $this->resolveWaClient($verification->wa_client_id);
            if (! $waClient) {
                $this->queueInboxOnlyFallback($user->id, $user->name, 'birthday', 'No active WA client');
                $skipped++;
                continue;
            }

            $phone = trim((string) $verification->normalized_phone);
            if ($phone === '') {
                $this->queueInboxOnlyFallback($user->id, $user->name, 'birthday', 'Missing WA phone');
                $skipped++;
                continue;
            }

            $message = $this->buildBirthdayMessage((string) $user->name);
            $scheduledAtLocal = $nowLocal->copy()->setTime(8, 0, 0);
            if ($scheduledAtLocal->lt($nowLocal)) {
                $scheduledAtLocal = $nowLocal->copy()->addMinute();
            }
            $scheduledAtUtc = $scheduledAtLocal->copy()->utc();
            $year = $nowLocal->year;
            $sourceHash = sha1(implode('|', [
                'birthday',
                (string) $waClient->id,
                (string) $user->id,
                $phone,
                (string) $year,
                $message,
            ]));

            $existing = WaReminder::query()
                ->where('wa_client_id', $waClient->id)
                ->where('source_hash', $sourceHash)
                ->latest('id')
                ->first();

            if ($existing && $existing->status === 'Terkirim') {
                $this->queueBirthdayInboxMessage($user->id, $user->name, $year);
                $skipped++;
                continue;
            }

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
                'message_template' => 'birthday_auto',
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
                'workflow' => 'wa_queue_birthday',
                'trigger_source' => 'scheduler',
                'status' => 'queued',
                'channel' => 'whatsapp',
                'intent' => 'member_birthday_reminder',
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
                ],
                'result_payload' => [
                    'queued_status' => 'Pending',
                ],
                'processed_at' => now(),
            ]);

            $this->queueBirthdayInboxMessage($user->id, $user->name, $year);

            $queued++;
        }

        $this->info("Queued {$queued} birthday reminder(s), skipped {$skipped} user(s).");

        return self::SUCCESS;
    }

    private function resolveTimezone(?string ...$candidates): string
    {
        foreach ($candidates as $candidate) {
            $value = trim((string) $candidate);
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

    private function buildBirthdayMessage(string $name): string
    {
        $safeName = trim($name) !== '' ? trim($name) : 'Sahabat';

        return "Shalom {$safeName}, selamat ulang tahun.\nSemoga damai, sukacita, dan penyertaan Tuhan memenuhi langkahmu hari ini.\n\n- Keluarga TheChosenTalks";
    }

    private function queueBirthdayInboxMessage(int $recipientUserId, string $name, int $year): void
    {
        $sender = $this->systemAccountService->getEncourager();
        $safeName = trim($name) !== '' ? trim($name) : 'Friend';
        $tag = "[AUTO_BDAY:{$year}]";
        $body = "Happy Birthday, {$safeName}! May your day be filled with joy, peace, and God's blessings. {$tag}";

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

    private function queueInboxOnlyFallback(int $recipientUserId, string $name, string $intent, string $reason): void
    {
        $sender = $this->systemAccountService->getEncourager();
        $safeName = trim($name) !== '' ? trim($name) : 'Friend';
        $tag = '[AUTO_FALLBACK:'.strtoupper($intent).':'.now()->format('Ymd').']';
        $body = "Hi {$safeName}, we prepared your reminder in-app while WhatsApp is not available. {$tag}";

        DirectMessage::query()->create([
            'sender_id' => $sender->id,
            'recipient_id' => $recipientUserId,
            'body' => $body,
            'approved_at' => now(),
            'read_at' => null,
        ]);

        $this->eventLogger->log([
            'workflow' => 'wa_queue_birthday',
            'trigger_source' => 'scheduler',
            'status' => 'sent',
            'channel' => 'inbox',
            'intent' => $intent,
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
            ],
            'result_payload' => [
                'fallback' => true,
            ],
            'processed_at' => now(),
        ]);
    }
}
