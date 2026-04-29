<?php

namespace App\Console\Commands;

use App\Models\WaLog;
use App\Models\WaPhoneOwner;
use App\Models\WaReminder;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ProcessDueWaRemindersCommand extends Command
{
    private const WATCHDOG_OVERDUE_MINUTES = 2;

    protected $signature = 'wa:process-due-reminders {--limit=50 : Max reminders per run}';

    protected $description = 'Process due WhatsApp reminders and send via Fonnte';

    public function handle(): int
    {
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
                            'Authorization' => $client->fonnte_token,
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
                    } else {
                        $reminder->status = 'Gagal';
                        $reminder->last_error = 'fonnte error';
                        $reminder->response = $this->encodeResponse([
                            'http_status' => $response->status(),
                            'body' => $decoded,
                        ]);
                        $reminder->save();

                        $this->writeLegacyLog($reminder, 'Gagal', $messageId, $decoded, null);
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
}
