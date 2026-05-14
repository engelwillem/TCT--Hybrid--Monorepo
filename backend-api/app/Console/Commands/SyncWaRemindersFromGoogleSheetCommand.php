<?php

namespace App\Console\Commands;

use App\Http\Controllers\Api\V1\WaReminderController;
use Illuminate\Console\Command;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SyncWaRemindersFromGoogleSheetCommand extends Command
{
    protected $signature = 'wa:sync-sheet-reminders {--limit=500 : Max rows to process from spreadsheet}';

    protected $description = 'Pull WA reminder rows from Google Sheet CSV and sync into wa_reminders table';

    public function handle(): int
    {
        if (! (bool) config('wa_sheet_sync.enabled', false)) {
            $this->info('WA sheet sync disabled.');
            return self::SUCCESS;
        }

        $sheetId = trim((string) config('wa_sheet_sync.sheet_id', ''));
        $gid = trim((string) config('wa_sheet_sync.gid', '0'));
        $clientKey = trim((string) config('wa_sheet_sync.client_key', ''));
        $secretKey = trim((string) config('wa_sheet_sync.secret_key', ''));
        $timeoutSeconds = max(5, (int) config('wa_sheet_sync.timeout_seconds', 30));
        $maxRows = max(10, (int) $this->option('limit'));

        if ($sheetId === '' || $clientKey === '') {
            $this->error('WA sheet sync misconfigured: WA_SHEET_SYNC_SHEET_ID and WA_SHEET_SYNC_CLIENT_KEY are required.');
            return self::FAILURE;
        }

        $csvUrl = sprintf('https://docs.google.com/spreadsheets/d/%s/export?format=csv&gid=%s', $sheetId, $gid);

        try {
            $response = Http::timeout($timeoutSeconds)
                ->retry(3, 1000)
                ->get($csvUrl);
        } catch (\Throwable $throwable) {
            Log::error('WA sheet sync failed: unable to fetch CSV', [
                'url' => $csvUrl,
                'error' => $throwable->getMessage(),
            ]);
            $this->error('Failed to fetch spreadsheet CSV: '.$throwable->getMessage());
            return self::FAILURE;
        }

        if (! $response->successful()) {
            Log::error('WA sheet sync failed: non-success response', [
                'url' => $csvUrl,
                'http_status' => $response->status(),
                'body_excerpt' => mb_substr((string) $response->body(), 0, 500),
            ]);
            $this->error('Spreadsheet CSV request failed with HTTP '.$response->status());
            return self::FAILURE;
        }

        $rows = $this->parseCsvRows((string) $response->body(), $maxRows);
        if (count($rows) <= 1) {
            $this->warn('No data rows found in spreadsheet CSV.');
            return self::SUCCESS;
        }

        $request = Request::create('/api/v1/wa/reminders/sync', 'POST', ['rows' => $rows]);
        $request->headers->set('X-CLIENT-KEY', $clientKey);
        if ($secretKey !== '') {
            $request->headers->set('X-SECRET-KEY', $secretKey);
        }

        $controller = app(WaReminderController::class);
        $result = $controller->syncReminders($request);
        $payload = $result->getData(true);
        $syncedRows = is_array($payload['rows'] ?? null) ? count($payload['rows']) : 0;

        Log::info('WA sheet sync completed', [
            'csv_url' => $csvUrl,
            'row_count' => count($rows),
            'result_status' => $payload['status'] ?? null,
            'synced_rows' => $syncedRows,
        ]);

        $this->info("WA sheet sync completed. Parsed rows: ".count($rows).", processed rows: {$syncedRows}.");
        return self::SUCCESS;
    }

    /**
     * @return array<int, array<int, string>>
     */
    private function parseCsvRows(string $csv, int $maxRows): array
    {
        $normalized = preg_replace("/\r\n|\r/u", "\n", $csv);
        $normalized = is_string($normalized) ? $normalized : $csv;
        $lines = explode("\n", $normalized);
        $rows = [];

        foreach ($lines as $line) {
            if (trim($line) === '') {
                continue;
            }

            $rows[] = str_getcsv($line);
            if (count($rows) >= $maxRows) {
                break;
            }
        }

        return $rows;
    }
}

