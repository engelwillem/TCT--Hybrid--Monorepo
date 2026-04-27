<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\WaClient;
use App\Models\WaLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;

class WaReminderController extends Controller
{
    public function sendReminder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'client_key' => ['required', 'string'],
            'rows' => ['required', 'array'],
        ]);

        $client = WaClient::query()
            ->where('client_key', $validated['client_key'])
            ->first();

        if (! $client) {
            WaLog::query()->create([
                'status' => 'client_not_found',
                'response' => $this->encodeResponse([
                    'client_key' => $validated['client_key'],
                    'message' => 'Client not found',
                ]),
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Client not found',
            ], 404);
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
        $now = Carbon::now();

        foreach ($validated['rows'] as $index => $row) {
            $rowNumber = $index + 1;
            if ($rowNumber === 1) {
                continue;
            }

            if (! is_array($row)) {
                $results[] = $this->skipRow($client, $rowNumber, '', '', '', '', 'format baris tidak valid');
                continue;
            }

            $name = $this->cell($row, 0);
            $phoneRaw = $this->cell($row, 1);
            $date = $this->cell($row, 2);
            $time = $this->cell($row, 3);
            $messageTemplate = $this->cell($row, 4);
            $toko = $this->cell($row, 5);
            $status = strtolower($this->cell($row, 6));
            $sendId = $this->cell($row, 8);

            if ($date === '') {
                $results[] = $this->skipRow($client, $rowNumber, $name, $phoneRaw, $toko, $messageTemplate, 'tanggal kosong');
                continue;
            }

            if ($time === '') {
                $results[] = $this->skipRow($client, $rowNumber, $name, $phoneRaw, $toko, $messageTemplate, 'jam kosong');
                continue;
            }

            if ($status === 'terkirim') {
                $results[] = $this->skipRow($client, $rowNumber, $name, $phoneRaw, $toko, $messageTemplate, 'status sudah terkirim');
                continue;
            }

            if ($sendId !== '') {
                $results[] = $this->skipRow($client, $rowNumber, $name, $phoneRaw, $toko, $messageTemplate, 'id kirim sudah ada');
                continue;
            }

            $scheduleAt = $this->parseScheduleAt($date, $time);
            if (! $scheduleAt) {
                $results[] = $this->skipRow($client, $rowNumber, $name, $phoneRaw, $toko, $messageTemplate, 'format tanggal/jam tidak valid');
                continue;
            }

            if ($scheduleAt->gt($now)) {
                $results[] = $this->skipRow($client, $rowNumber, $name, $phoneRaw, $toko, $messageTemplate, 'belum waktunya kirim');
                continue;
            }

            $phone = $this->normalizePhone($phoneRaw);
            if (! $phone) {
                $results[] = $this->skipRow($client, $rowNumber, $name, $phoneRaw, $toko, $messageTemplate, 'nomor whatsapp tidak valid');
                continue;
            }

            $messageFinal = $this->buildMessage(
                $messageTemplate,
                $name,
                $toko,
                $date,
                $time
            );

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
                    'status' => 'gagal',
                    'response' => $this->encodeResponse($errorPayload),
                ]);

                $results[] = [
                    'row_number' => $rowNumber,
                    'status' => 'gagal',
                    'sent_at' => null,
                    'message_id' => null,
                    'response' => $errorPayload,
                ];

                continue;
            }

            $decodedResponse = $this->decodeResponseBody($httpResponse->body());
            $isSuccess = $this->isSuccessfulFonnteResponse($httpResponse->status(), $decodedResponse);
            $messageId = $this->extractMessageId($decodedResponse);
            $sentAt = $isSuccess ? Carbon::now() : null;
            $rowStatus = $isSuccess ? 'terkirim' : 'gagal';

            WaLog::query()->create([
                'wa_client_id' => $client->id,
                'row_number' => $rowNumber,
                'customer_name' => $name !== '' ? $name : null,
                'phone' => $phone,
                'toko' => $toko !== '' ? $toko : null,
                'message' => $messageFinal !== '' ? $messageFinal : null,
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
                'response' => $decodedResponse,
            ];
        }

        return response()->json([
            'status' => true,
            'message' => 'Processed',
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
        string $reason
    ): array {
        WaLog::query()->create([
            'wa_client_id' => $client->id,
            'row_number' => $rowNumber,
            'customer_name' => $name !== '' ? $name : null,
            'phone' => $phoneRaw !== '' ? $phoneRaw : null,
            'toko' => $toko !== '' ? $toko : null,
            'message' => $messageTemplate !== '' ? $messageTemplate : null,
            'status' => 'skip',
            'response' => $this->encodeResponse([
                'reason' => $reason,
            ]),
        ]);

        return [
            'row_number' => $rowNumber,
            'status' => 'skip',
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

    private function parseScheduleAt(string $date, string $time): ?Carbon
    {
        $timezone = config('app.timezone');
        $dateFormats = ['d/m/Y', 'd-m-Y', 'Y-m-d', 'm/d/Y'];
        $timeFormats = ['H:i', 'H:i:s', 'g:i A', 'g:iA'];

        foreach ($dateFormats as $dateFormat) {
            foreach ($timeFormats as $timeFormat) {
                try {
                    return Carbon::createFromFormat(
                        "{$dateFormat} {$timeFormat}",
                        "{$date} {$time}",
                        $timezone
                    );
                } catch (\Throwable) {
                    continue;
                }
            }
        }

        try {
            return Carbon::parse("{$date} {$time}", $timezone);
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
        string $time
    ): string {
        return strtr($template, [
            '{nama}' => $name,
            '{toko}' => $toko,
            '{tanggal}' => $date,
            '{jam}' => $time,
        ]);
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
}
