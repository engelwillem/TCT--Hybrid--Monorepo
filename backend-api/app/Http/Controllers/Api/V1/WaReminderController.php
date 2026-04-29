<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\WaClient;
use App\Models\WaLog;
use App\Models\WaReminder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;

class WaReminderController extends Controller
{
    private const STATUS_TERKIRIM = 'Terkirim';
    private const STATUS_PENDING = 'Pending';
    private const STATUS_SKIP = 'Skip';
    private const STATUS_GAGAL = 'Gagal';
    private const DEFAULT_MESSAGE_TEMPLATE = "Halo {nama}, hari ini jadwal kunjungan kami ya.\n\n> _{toko}_";
    private const DEFAULT_CLIENT_TIMEZONE = 'Asia/Makassar';
    private const DEFAULT_CLIENT_KEY = 'CLIENT_DEMO_001';
    private const SUPPORTED_CLIENT_TIMEZONES = [
        'Asia/Jakarta',
        'Asia/Makassar',
        'Asia/Jayapura',
    ];

    public function sendReminder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'client_key' => ['nullable', 'string'],
            'rows' => ['required', 'array'],
        ]);

        $clientKey = trim((string) ($validated['client_key'] ?? ''));
        if ($clientKey === '') {
            $clientKey = self::DEFAULT_CLIENT_KEY;
        }

        $client = WaClient::query()
            ->where('client_key', $clientKey)
            ->first();

        if (! $client) {
            WaLog::query()->create([
                'status' => 'client_not_found',
                'response' => $this->encodeResponse([
                    'client_key' => $clientKey,
                    'message' => 'Client not found',
                ]),
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Client not found',
            ], 404);
        }

        if ($this->isSecretKeyRequired($client)) {
            $secretFromHeader = trim((string) $request->header('X-SECRET-KEY', ''));
            if (! hash_equals((string) $client->secret_key, $secretFromHeader)) {
                WaLog::query()->create([
                    'wa_client_id' => $client->id,
                    'status' => 'unauthorized',
                    'response' => $this->encodeResponse([
                        'message' => 'Unauthorized',
                    ]),
                ]);

                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized',
                ], 401);
            }
        }

        if (strtolower((string) $client->status) !== 'active') {
            WaLog::query()->create([
                'wa_client_id' => $client->id,
                'status' => 'client_inactive',
                'response' => $this->encodeResponse([
                    'message' => 'Client inactive',
                ]),
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Client inactive',
            ], 403);
        }

        $results = [];
        $clientTimezone = $this->resolveClientTimezone($client->timezone, $client->default_timezone);
        foreach ($validated['rows'] as $index => $row) {
            $rowNumber = $index + 1;
            if ($rowNumber === 1) {
                continue;
            }

            if (! is_array($row)) {
                $results[] = $this->skipRow($client, $rowNumber, '', '', '', '', $clientTimezone, null, 'format baris tidak valid');
                continue;
            }

            $name = $this->cell($row, 0);
            $phoneRaw = $this->cell($row, 1);
            $date = $this->cell($row, 2);
            $time = $this->cell($row, 3);
            $rowTimezone = $this->cell($row, 4);
            $messageTemplate = $this->cell($row, 5);
            $toko = $this->cell($row, 6);
            $status = $this->normalizeInputStatus($this->cell($row, 7));
            $sendId = $this->cell($row, 9);
            $effectiveTimezone = $this->resolveRowTimezone($rowTimezone, $clientTimezone);
            $now = Carbon::now($effectiveTimezone);

            if ($date === '') {
                $results[] = $this->skipRow($client, $rowNumber, $name, $phoneRaw, $toko, $messageTemplate, $effectiveTimezone, null, 'tanggal kosong');
                continue;
            }

            if ($time === '') {
                $results[] = $this->skipRow($client, $rowNumber, $name, $phoneRaw, $toko, $messageTemplate, $effectiveTimezone, null, 'jam kosong');
                continue;
            }

            if ($status === self::STATUS_TERKIRIM) {
                $results[] = $this->skipRow($client, $rowNumber, $name, $phoneRaw, $toko, $messageTemplate, $effectiveTimezone, null, 'status sudah terkirim');
                continue;
            }

            if ($sendId !== '') {
                $results[] = $this->skipRow($client, $rowNumber, $name, $phoneRaw, $toko, $messageTemplate, $effectiveTimezone, null, 'id kirim sudah ada');
                continue;
            }

            $scheduleAt = $this->parseSheetDateTime($date, $time, $effectiveTimezone);
            if (! $scheduleAt) {
                $results[] = $this->skipRow($client, $rowNumber, $name, $phoneRaw, $toko, $messageTemplate, $effectiveTimezone, null, 'format tanggal/jam tidak valid');
                continue;
            }

            if ($scheduleAt->gt($now)) {
                $results[] = $this->skipRow($client, $rowNumber, $name, $phoneRaw, $toko, $messageTemplate, $effectiveTimezone, $scheduleAt, 'belum waktunya kirim');
                continue;
            }

            $phone = $this->normalizePhone($phoneRaw);
            if (! $phone) {
                $results[] = $this->skipRow($client, $rowNumber, $name, $phoneRaw, $toko, $messageTemplate, $effectiveTimezone, $scheduleAt, 'nomor whatsapp tidak valid');
                continue;
            }

            $messageFinal = $this->buildMessage(
                $messageTemplate,
                $name,
                $toko,
                $date,
                $time,
                $rowTimezone
            );

            if (trim($messageFinal) === '') {
                $results[] = $this->skipRow($client, $rowNumber, $name, $phone, $toko, $messageTemplate, $effectiveTimezone, $scheduleAt, 'pesan kosong');
                continue;
            }

            try {
                $httpResponse = Http::asForm()
                    ->timeout(30)
                    ->withHeaders([
                        'Authorization' => $client->fonnte_token,
                    ])
                    ->post('https://api.fonnte.com/send', [
                        'target' => $phone,
                        'message' => $messageFinal,
                    ]);
            } catch (\Throwable $throwable) {
                $errorPayload = [
                    'error' => $throwable->getMessage(),
                ];

                WaLog::query()->create([
                    'wa_client_id' => $client->id,
                    'row_number' => $rowNumber,
                    'customer_name' => $name !== '' ? $name : null,
                    'phone' => $phone,
                    'toko' => $toko !== '' ? $toko : null,
                    'message' => $messageFinal !== '' ? $messageFinal : null,
                    'timezone' => $effectiveTimezone,
                    'scheduled_at' => $scheduleAt,
                    'status' => self::STATUS_GAGAL,
                    'response' => $this->encodeResponse($errorPayload),
                ]);

                $results[] = [
                    'row_number' => $rowNumber,
                    'status' => self::STATUS_GAGAL,
                    'sent_at' => null,
                    'message_id' => null,
                    'reason' => 'fonnte error',
                    'response' => $errorPayload,
                ];

                continue;
            }

            $decodedResponse = $this->decodeResponseBody($httpResponse->body());
            $isSuccess = $this->isSuccessfulFonnteResponse($httpResponse->status(), $decodedResponse);
            $messageId = $this->extractMessageId($decodedResponse);
            $rowStatus = $this->resolveDeliveryStatus($httpResponse->status(), $decodedResponse);
            $sentAt = $rowStatus === self::STATUS_TERKIRIM
                ? Carbon::now($effectiveTimezone)
                : null;

            WaLog::query()->create([
                'wa_client_id' => $client->id,
                'row_number' => $rowNumber,
                'customer_name' => $name !== '' ? $name : null,
                'phone' => $phone,
                'toko' => $toko !== '' ? $toko : null,
                'message' => $messageFinal !== '' ? $messageFinal : null,
                'timezone' => $effectiveTimezone,
                'scheduled_at' => $scheduleAt,
                'status' => $rowStatus,
                'fonnte_message_id' => $messageId,
                'response' => $this->encodeResponse([
                    'http_status' => $httpResponse->status(),
                    'body' => $decodedResponse,
                ]),
                'sent_at' => $sentAt,
            ]);

            $results[] = [
                'row_number' => $rowNumber,
                'status' => $rowStatus,
                'sent_at' => $sentAt?->format('Y-m-d H:i:s'),
                'message_id' => $messageId,
                'reason' => $rowStatus === self::STATUS_GAGAL ? 'fonnte error' : null,
                'response' => $decodedResponse,
            ];
        }

        return response()->json([
            'status' => true,
            'message' => 'Processed',
            'rows' => $results,
        ]);
    }

    public function syncReminders(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'rows' => ['required', 'array'],
        ]);

        $client = $this->resolveClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        $clientTimezone = $this->resolveClientTimezone($client->timezone, $client->default_timezone);
        $results = [];

        foreach ($validated['rows'] as $index => $row) {
            $rowNumber = $index + 1;
            if ($rowNumber === 1) {
                continue;
            }

            if (! is_array($row)) {
                $results[] = [
                    'row_number' => $rowNumber,
                    'status' => self::STATUS_SKIP,
                    'reason' => 'format baris tidak valid',
                ];
                continue;
            }

            $name = $this->cell($row, 0);
            $phoneRaw = $this->cell($row, 1);
            $tanggal = $this->cell($row, 2);
            $jam = $this->cell($row, 3);
            $zonaWaktu = $this->cell($row, 4);
            $messageTemplate = $this->cell($row, 5);
            $toko = $this->cell($row, 6);
            $sheetStatus = $this->normalizeInputStatus($this->cell($row, 7));
            $sheetIdKirim = $this->cell($row, 9);

            if ($name === '' && $phoneRaw === '') {
                $results[] = [
                    'row_number' => $rowNumber,
                    'status' => self::STATUS_SKIP,
                    'reason' => 'baris kosong',
                ];
                continue;
            }

            if ($tanggal === '') {
                $results[] = [
                    'row_number' => $rowNumber,
                    'status' => self::STATUS_SKIP,
                    'reason' => 'tanggal kosong',
                ];
                continue;
            }

            if ($jam === '') {
                $results[] = [
                    'row_number' => $rowNumber,
                    'status' => self::STATUS_SKIP,
                    'reason' => 'jam kosong',
                ];
                continue;
            }

            $effectiveTimezone = $this->resolveRowTimezone($zonaWaktu, $clientTimezone);
            $scheduledLocal = $this->parseSheetDateTime($tanggal, $jam, $effectiveTimezone);
            if (! $scheduledLocal) {
                $results[] = [
                    'row_number' => $rowNumber,
                    'status' => self::STATUS_SKIP,
                    'reason' => 'format tanggal/jam tidak valid',
                ];
                continue;
            }

            $phone = $this->normalizePhone($phoneRaw);
            if (! $phone) {
                $results[] = [
                    'row_number' => $rowNumber,
                    'status' => self::STATUS_SKIP,
                    'reason' => 'nomor whatsapp tidak valid',
                ];
                continue;
            }

            $messageFinal = $this->buildMessage($messageTemplate, $name, $toko, $tanggal, $jam, $zonaWaktu);
            if (trim($messageFinal) === '') {
                $results[] = [
                    'row_number' => $rowNumber,
                    'status' => self::STATUS_SKIP,
                    'reason' => 'pesan kosong',
                ];
                continue;
            }

            $sourceHash = $this->buildSourceHash(
                (int) $client->id,
                $rowNumber,
                $phone,
                $tanggal,
                $jam,
                $zonaWaktu,
                $messageTemplate,
                $toko
            );
            $scheduledUtc = $scheduledLocal->copy()->utc();

            $sentSameHash = WaReminder::query()
                ->where('wa_client_id', $client->id)
                ->where('source_hash', $sourceHash)
                ->where('status', self::STATUS_TERKIRIM)
                ->latest('id')
                ->first();

            if ($sentSameHash) {
                $results[] = [
                    'row_number' => $rowNumber,
                    'status' => self::STATUS_SKIP,
                    'reason' => 'sudah terkirim',
                ];
                continue;
            }

            $reminder = WaReminder::query()
                ->where('wa_client_id', $client->id)
                ->where('source_hash', $sourceHash)
                ->latest('id')
                ->first();

            $payload = [
                'wa_client_id' => $client->id,
                'sheet_row_number' => $rowNumber,
                'customer_name' => $name !== '' ? $name : null,
                'phone' => $phone,
                'tanggal' => $tanggal !== '' ? $tanggal : null,
                'jam' => $jam !== '' ? $jam : null,
                'zona_waktu' => $zonaWaktu !== '' ? $zonaWaktu : null,
                'timezone' => $effectiveTimezone,
                'scheduled_at' => $scheduledUtc,
                'message_template' => $messageTemplate !== '' ? $messageTemplate : null,
                'message_final' => $messageFinal,
                'toko' => $toko !== '' ? $toko : null,
                'status' => self::STATUS_PENDING,
                'source_hash' => $sourceHash,
            ];

            if ($reminder) {
                $beforeScheduleAt = $reminder->scheduled_at?->copy();
                $beforeStatus = (string) $reminder->status;
                $reminder->fill($payload);
                $reminder->status = self::STATUS_PENDING;
                $reminder->fonnte_message_id = null;
                $reminder->sent_at = null;
                $reminder->last_error = null;
                $reminder->response = null;
                $reminder->save();

                $this->writeRescheduleAuditIfChanged(
                    $client->id,
                    $rowNumber,
                    $name,
                    $phone,
                    $toko,
                    $messageFinal,
                    $effectiveTimezone,
                    $beforeScheduleAt,
                    $scheduledUtc,
                    $beforeStatus
                );
            } else {
                $staleUnsent = WaReminder::query()
                    ->where('wa_client_id', $client->id)
                    ->where('sheet_row_number', $rowNumber)
                    ->where('status', '!=', self::STATUS_TERKIRIM)
                    ->latest('id')
                    ->first();

                if ($staleUnsent) {
                    $beforeScheduleAt = $staleUnsent->scheduled_at?->copy();
                    $beforeStatus = (string) $staleUnsent->status;
                    $staleUnsent->fill($payload);
                    $staleUnsent->status = self::STATUS_PENDING;
                    $staleUnsent->fonnte_message_id = null;
                    $staleUnsent->sent_at = null;
                    $staleUnsent->last_error = null;
                    $staleUnsent->response = null;
                    $staleUnsent->save();

                    $this->writeRescheduleAuditIfChanged(
                        $client->id,
                        $rowNumber,
                        $name,
                        $phone,
                        $toko,
                        $messageFinal,
                        $effectiveTimezone,
                        $beforeScheduleAt,
                        $scheduledUtc,
                        $beforeStatus
                    );
                } else {
                    WaReminder::query()->create($payload);
                }
            }

            $results[] = [
                'row_number' => $rowNumber,
                'status' => self::STATUS_PENDING,
            ];
        }

        return response()->json([
            'status' => true,
            'message' => 'Processed',
            'rows' => $results,
        ]);
    }

    public function reminderStatus(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'rows' => ['required', 'array'],
        ]);

        $client = $this->resolveClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        $clientTimezone = $this->resolveClientTimezone($client->timezone, $client->default_timezone);
        $results = [];

        foreach ($validated['rows'] as $index => $row) {
            $rowNumber = $index + 1;
            if ($rowNumber === 1) {
                continue;
            }

            $rowTimezone = is_array($row) ? $this->cell($row, 4) : '';
            $effectiveTimezone = $this->resolveRowTimezone($rowTimezone, $clientTimezone);

            $reminder = null;
            if (is_array($row)) {
                $name = $this->cell($row, 0);
                $phoneRaw = $this->cell($row, 1);
                $tanggal = $this->cell($row, 2);
                $jam = $this->cell($row, 3);
                $zonaWaktu = $this->cell($row, 4);
                $messageTemplate = $this->cell($row, 5);
                $toko = $this->cell($row, 6);
                $phone = $this->normalizePhone($phoneRaw);

                if ($phone && $tanggal !== '' && $jam !== '') {
                    $latestHash = $this->buildSourceHash(
                        (int) $client->id,
                        $rowNumber,
                        $phone,
                        $tanggal,
                        $jam,
                        $zonaWaktu,
                        $messageTemplate,
                        $toko
                    );

                    $reminder = WaReminder::query()
                        ->where('wa_client_id', $client->id)
                        ->where('source_hash', $latestHash)
                        ->latest('id')
                        ->first();
                }
            }

            if (! $reminder) {
                $reminder = WaReminder::query()
                    ->where('wa_client_id', $client->id)
                    ->where('sheet_row_number', $rowNumber)
                    ->latest('id')
                    ->first();
            }

            if (! $reminder) {
                continue;
            }

            $sentAt = $reminder->sent_at;
            $sentAtFormatted = null;
            if ($sentAt !== null) {
                $sentAtFormatted = $sentAt->copy()->timezone($effectiveTimezone)->format('Y-m-d H:i:s');
            }

            $results[] = [
                'row_number' => $rowNumber,
                'status' => $reminder->status,
                'sent_at' => $sentAtFormatted,
                'message_id' => $reminder->fonnte_message_id,
            ];
        }

        return response()->json([
            'status' => true,
            'rows' => $results,
        ]);
    }

    private function skipRow(
        WaClient $client,
        int $rowNumber,
        string $name,
        string $phoneRaw,
        string $toko,
        string $messageTemplate,
        string $timezone,
        ?Carbon $scheduledAt,
        string $reason
    ): array {
        WaLog::query()->create([
            'wa_client_id' => $client->id,
            'row_number' => $rowNumber,
            'customer_name' => $name !== '' ? $name : null,
            'phone' => $phoneRaw !== '' ? $phoneRaw : null,
            'toko' => $toko !== '' ? $toko : null,
            'message' => $messageTemplate !== '' ? $messageTemplate : null,
            'timezone' => $timezone,
            'scheduled_at' => $scheduledAt,
            'status' => self::STATUS_SKIP,
            'response' => $this->encodeResponse([
                'reason' => $reason,
            ]),
        ]);

        return [
            'row_number' => $rowNumber,
            'status' => self::STATUS_SKIP,
            'reason' => $reason,
        ];
    }

    private function cell(array $row, int $index): string
    {
        $value = $row[$index] ?? '';

        if (! is_string($value) && ! is_numeric($value)) {
            return '';
        }

        return trim((string) $value);
    }

    private function parseSheetDateTime(string $date, string $time, string $timezone): ?Carbon
    {
        $dateValue = trim($date);
        $timeValue = trim($time);

        if ($dateValue === '' || $timeValue === '') {
            return null;
        }

        $normalizedDate = $this->normalizeSheetDate($dateValue, $timezone);
        $normalizedTime = $this->normalizeSheetTime($timeValue, $timezone);

        if ($normalizedDate === null || $normalizedTime === null) {
            return null;
        }

        try {
            return Carbon::createFromFormat(
                'Y-m-d H:i:s',
                "{$normalizedDate} {$normalizedTime}",
                $timezone
            );
        } catch (\Throwable) {
            return null;
        }
    }

    private function resolveClientTimezone(?string $clientTimezone, ?string $clientDefaultTimezone): string
    {
        $value = trim((string) ($clientTimezone ?? ''));
        if ($value === '') {
            $value = trim((string) ($clientDefaultTimezone ?? ''));
        }
        $resolved = $this->mapTimezoneLabel($value);

        if ($resolved !== null) {
            return $resolved;
        }

        return self::DEFAULT_CLIENT_TIMEZONE;
    }

    private function resolveRowTimezone(?string $rowTimezone, string $fallbackTimezone): string
    {
        $value = trim((string) $rowTimezone);
        if ($value === '') {
            return $fallbackTimezone;
        }

        $resolved = $this->mapTimezoneLabel($value);

        return $resolved ?? $fallbackTimezone;
    }

    private function mapTimezoneLabel(string $value): ?string
    {
        $aliases = [
            'WIB' => 'Asia/Jakarta',
            'WITA' => 'Asia/Makassar',
            'WIT' => 'Asia/Jayapura',
        ];

        $upper = strtoupper($value);
        if (isset($aliases[$upper])) {
            return $aliases[$upper];
        }

        if (in_array($value, self::SUPPORTED_CLIENT_TIMEZONES, true)) {
            return $value;
        }

        return null;
    }

    private function normalizeSheetDate(string $dateValue, string $timezone): ?string
    {
        $dateFormats = ['d/m/Y', 'd-m-Y', 'Y-m-d', 'm/d/Y', 'n/j/Y'];

        foreach ($dateFormats as $dateFormat) {
            try {
                return Carbon::createFromFormat($dateFormat, $dateValue, $timezone)->format('Y-m-d');
            } catch (\Throwable) {
                continue;
            }
        }

        if (is_numeric($dateValue)) {
            $serial = (float) str_replace(',', '.', $dateValue);
            $daySerial = (int) floor($serial);
            if ($daySerial > 0) {
                return Carbon::create(1899, 12, 30, 0, 0, 0, $timezone)
                    ->addDays($daySerial)
                    ->format('Y-m-d');
            }
        }

        try {
            return Carbon::parse($dateValue, $timezone)->format('Y-m-d');
        } catch (\Throwable) {
            return null;
        }
    }

    private function normalizeSheetTime(string $timeValue, string $timezone): ?string
    {
        $plainTimePattern = '/^(?<h>\d{1,2}):(?<m>\d{2})(?::(?<s>\d{2}))?$/';
        if (preg_match($plainTimePattern, $timeValue, $matches) === 1) {
            $hour = (int) $matches['h'];
            $minute = (int) $matches['m'];
            $second = isset($matches['s']) ? (int) $matches['s'] : 0;

            if ($hour > 23 || $minute > 59 || $second > 59) {
                return null;
            }

            return sprintf('%02d:%02d:%02d', $hour, $minute, $second);
        }

        $ampmFormats = ['g:i A', 'g:iA', 'g:i:s A', 'g:i:sA'];
        foreach ($ampmFormats as $ampmFormat) {
            try {
                return Carbon::createFromFormat($ampmFormat, strtoupper($timeValue), $timezone)->format('H:i:s');
            } catch (\Throwable) {
                continue;
            }
        }

        if (is_numeric($timeValue)) {
            $serial = (float) str_replace(',', '.', $timeValue);
            if ($serial >= 0) {
                $fraction = $serial - floor($serial);
                $totalSeconds = (int) round($fraction * 86400);
                $totalSeconds = $totalSeconds % 86400;
                $hours = intdiv($totalSeconds, 3600);
                $minutes = intdiv($totalSeconds % 3600, 60);
                $seconds = $totalSeconds % 60;

                return sprintf('%02d:%02d:%02d', $hours, $minutes, $seconds);
            }
        }

        try {
            return Carbon::parse($timeValue, $timezone)->format('H:i:s');
        } catch (\Throwable) {
            return null;
        }
    }

    private function normalizePhone(string $phone): ?string
    {
        $digitsOnly = preg_replace('/\D+/', '', $phone);
        $digitsOnly = is_string($digitsOnly) ? $digitsOnly : '';

        if ($digitsOnly === '') {
            return null;
        }

        if (str_starts_with($digitsOnly, '08')) {
            return '628'.substr($digitsOnly, 2);
        }

        if (str_starts_with($digitsOnly, '8')) {
            return '628'.substr($digitsOnly, 1);
        }

        return $digitsOnly;
    }

    private function buildMessage(
        string $template,
        string $name,
        string $toko,
        string $date,
        string $time,
        string $zonaWaktu
    ): string {
        $effectiveTemplate = trim($template) !== ''
            ? $template
            : self::DEFAULT_MESSAGE_TEMPLATE;

        return strtr($effectiveTemplate, [
            '{nama}' => $name,
            '{toko}' => $toko,
            '{tanggal}' => $date,
            '{jam}' => $time,
            '{zona_waktu}' => $zonaWaktu,
        ]);
    }

    private function isSecretKeyRequired(WaClient $client): bool
    {
        return trim((string) $client->secret_key) !== '';
    }

    private function decodeResponseBody(string $body): mixed
    {
        $decoded = json_decode($body, true);

        if (json_last_error() === JSON_ERROR_NONE) {
            return $decoded;
        }

        return [
            'raw' => $body,
        ];
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

    private function resolveDeliveryStatus(int $statusCode, mixed $decoded): string
    {
        if (! $this->isSuccessfulFonnteResponse($statusCode, $decoded)) {
            return self::STATUS_GAGAL;
        }

        return self::STATUS_TERKIRIM;
    }

    private function normalizeInputStatus(string $status): string
    {
        $normalized = strtolower(trim($status));

        return match ($normalized) {
            'terkirim' => self::STATUS_TERKIRIM,
            'gagal' => self::STATUS_GAGAL,
            'skip' => self::STATUS_SKIP,
            default => $status,
        };
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

        if (isset($decoded['detail']) && is_array($decoded['detail'])) {
            $firstDetail = $decoded['detail'][0] ?? null;
            if (is_array($firstDetail)) {
                $candidates[] = $firstDetail['id'] ?? null;
                $candidates[] = $firstDetail['message_id'] ?? null;
            }
        }

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

    private function writeRescheduleAuditIfChanged(
        int $waClientId,
        int $rowNumber,
        string $name,
        string $phone,
        string $toko,
        string $messageFinal,
        string $timezone,
        ?Carbon $beforeScheduleAt,
        Carbon $afterScheduleAtUtc,
        string $beforeStatus
    ): void {
        if (! $beforeScheduleAt) {
            return;
        }

        if ($beforeScheduleAt->equalTo($afterScheduleAtUtc) && $beforeStatus === self::STATUS_PENDING) {
            return;
        }

        WaLog::query()->create([
            'wa_client_id' => $waClientId,
            'row_number' => $rowNumber,
            'customer_name' => $name !== '' ? $name : null,
            'phone' => $phone !== '' ? $phone : null,
            'toko' => $toko !== '' ? $toko : null,
            'message' => $messageFinal !== '' ? $messageFinal : null,
            'timezone' => $timezone,
            'scheduled_at' => $afterScheduleAtUtc,
            'status' => self::STATUS_PENDING,
            'response' => $this->encodeResponse([
                'reason' => 'reschedule_detected',
                'from_status' => $beforeStatus,
                'from_scheduled_at_utc' => $beforeScheduleAt->copy()->utc()->format('Y-m-d H:i:s'),
                'to_scheduled_at_utc' => $afterScheduleAtUtc->copy()->utc()->format('Y-m-d H:i:s'),
            ]),
        ]);
    }

    private function buildSourceHash(
        int $waClientId,
        int $sheetRowNumber,
        string $phone,
        string $tanggal,
        string $jam,
        string $zonaWaktu,
        string $messageTemplate,
        string $toko
    ): string {
        $payload = [
            'wa_client_id' => $waClientId,
            'sheet_row_number' => $sheetRowNumber,
            'phone' => trim($phone),
            'tanggal' => trim($tanggal),
            'jam' => trim($jam),
            'zona_waktu' => trim($zonaWaktu),
            'message_template' => trim($messageTemplate),
            'toko' => trim($toko),
        ];

        return sha1(json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: '');
    }

    private function resolveClientFromHeaders(Request $request): WaClient|JsonResponse
    {
        $clientKey = trim((string) $request->header('X-CLIENT-KEY', ''));
        if ($clientKey === '') {
            return response()->json([
                'status' => false,
                'message' => 'Client key missing',
            ], 422);
        }

        $client = WaClient::query()->where('client_key', $clientKey)->first();
        if (! $client) {
            return response()->json([
                'status' => false,
                'message' => 'Client not found',
            ], 404);
        }

        if (strtolower((string) $client->status) !== 'active') {
            return response()->json([
                'status' => false,
                'message' => 'Client inactive',
            ], 403);
        }

        if ($this->isSecretKeyRequired($client)) {
            $secretFromHeader = trim((string) $request->header('X-SECRET-KEY', ''));
            if (! hash_equals((string) $client->secret_key, $secretFromHeader)) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized',
                ], 401);
            }
        }

        return $client;
    }
}
