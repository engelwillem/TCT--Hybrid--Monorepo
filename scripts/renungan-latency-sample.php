<?php

declare(strict_types=1);

/**
 * Renungan latency sampler for before/after release comparisons.
 *
 * Usage example:
 *   php scripts/renungan-latency-sample.php --url=https://example.com/api/v1/renungan/personalize --samples=40
 *
 * Optional:
 *   --url=...                 Target endpoint (default: http://127.0.0.1:8000/api/v1/renungan/personalize)
 *   --samples=40              Number of measured requests (default: 25)
 *   --warmup=3                Warmup requests before sampling (default: 3)
 *   --timeout=45              Per-request timeout seconds (default: 45)
 *   --text="..."              Reflection text payload
 *   --lang=id                 Payload lang (default: id)
 *   --mode=calm_heart         Optional payload mode
 *   --storage-mode=standard   Optional payload storage_mode
 *   --no-debug-header         Disable X-Renungan-Debug-Telemetry: 1
 *   --json-out=path.json      Write machine-readable JSON report
 *   --help                    Show this help
 */

$options = getopt('', [
    'url::',
    'samples::',
    'warmup::',
    'timeout::',
    'text::',
    'lang::',
    'mode::',
    'storage-mode::',
    'no-debug-header',
    'json-out::',
    'help',
]);

if (isset($options['help'])) {
    fwrite(STDOUT, "Renungan latency sampling tool\n");
    fwrite(STDOUT, "Run: php scripts/renungan-latency-sample.php [--url=...] [--samples=25]\n");
    exit(0);
}

$url = trim((string) ($options['url'] ?? 'http://127.0.0.1:8000/api/v1/renungan/personalize'));
$samples = max(1, (int) ($options['samples'] ?? 25));
$warmup = max(0, (int) ($options['warmup'] ?? 3));
$timeoutSec = max(1, (int) ($options['timeout'] ?? 45));
$reflectionText = (string) ($options['text'] ?? 'saya lagi bingung soal keputusan kerja dan masa depan');
$lang = (string) ($options['lang'] ?? 'id');
$mode = isset($options['mode']) ? trim((string) $options['mode']) : '';
$storageMode = isset($options['storage-mode']) ? trim((string) $options['storage-mode']) : '';
$useDebugHeader = !isset($options['no-debug-header']);
$jsonOut = isset($options['json-out']) ? trim((string) $options['json-out']) : '';

$payload = [
    'text' => $reflectionText,
    'lang' => $lang,
];

if ($mode !== '') {
    $payload['mode'] = $mode;
}
if ($storageMode !== '') {
    $payload['storage_mode'] = $storageMode;
}

$baseHeaders = [
    'Content-Type: application/json',
    'Accept: application/json',
];

if ($useDebugHeader) {
    $baseHeaders[] = 'X-Renungan-Debug-Telemetry: 1';
}

$totalIterations = $warmup + $samples;
$rows = [];
$statusCounts = [];

fwrite(STDOUT, "Sampling {$samples} requests (+{$warmup} warmup) to {$url}\n");

for ($i = 1; $i <= $totalIterations; $i++) {
    $requestId = sprintf('rls-%d-%d', time(), $i);
    $headers = $baseHeaders;
    $headers[] = 'X-Request-Id: ' . $requestId;

    $startedAt = microtime(true);
    $response = performHttpJsonRequest($url, $headers, $payload, $timeoutSec);
    $elapsedMs = (int) round((microtime(true) - $startedAt) * 1000);

    $statusCode = $response['status_code'];
    $statusKey = (string) $statusCode;
    $statusCounts[$statusKey] = ($statusCounts[$statusKey] ?? 0) + 1;

    $decoded = $response['json'];
    $telemetry = is_array($decoded) ? dataGet($decoded, 'data.generation.telemetry_debug', []) : [];
    $isMeasured = $i > $warmup;

    if ($isMeasured) {
        $rows[] = [
            'iteration' => $i - $warmup,
            'status_code' => $statusCode,
            'client_total_ms' => $elapsedMs,
            'analysis_duration_ms' => toNullableInt(dataGet($telemetry, 'analysis_duration_ms')),
            'verse_query_duration_ms' => toNullableInt(dataGet($telemetry, 'verse_query_duration_ms')),
            'verse_selection_duration_ms' => toNullableInt(dataGet($telemetry, 'verse_selection_duration_ms')),
            'interpretation_duration_ms' => toNullableInt(dataGet($telemetry, 'interpretation_duration_ms')),
            'generation_duration_ms' => toNullableInt(dataGet($telemetry, 'generation_duration_ms')),
            'evaluation_duration_ms' => toNullableInt(dataGet($telemetry, 'evaluation_duration_ms')),
            'mentor_duration_ms' => toNullableInt(dataGet($telemetry, 'mentor_duration_ms')),
            'backend_total_duration_ms' => toNullableInt(dataGet($telemetry, 'total_duration_ms')),
            'candidate_count' => toNullableInt(dataGet($telemetry, 'candidate_count')),
            'selected_verse_count' => toNullableInt(dataGet($telemetry, 'selected_verse_count')),
            'fallback_verse_used' => toNullableBool(dataGet($telemetry, 'fallback_verse_used')),
            'fallback_meditation_used' => toNullableBool(dataGet($telemetry, 'fallback_meditation_used')),
            'quality_rewrite_triggered' => toNullableBool(dataGet($telemetry, 'quality_rewrite_triggered')),
            'mentor_provider' => toNullableString(dataGet($telemetry, 'mentor_provider')),
            'mentor_model' => toNullableString(dataGet($telemetry, 'mentor_model')),
            'mentor_success' => toNullableBool(dataGet($telemetry, 'mentor_success')),
            'mentor_fallback' => toNullableBool(dataGet($telemetry, 'mentor_fallback')),
            'error' => $response['error'],
        ];
    }

    $phaseLabel = $isMeasured ? sprintf('sample %d/%d', $i - $warmup, $samples) : sprintf('warmup %d/%d', $i, $warmup);
    fwrite(STDOUT, sprintf(
        "[%s] status=%d client=%dms backend=%sms mentor=%sms\n",
        $phaseLabel,
        $statusCode,
        $elapsedMs,
        valueOrDash(dataGet($telemetry, 'total_duration_ms')),
        valueOrDash(dataGet($telemetry, 'mentor_duration_ms'))
    ));
}

$report = buildReport($rows, [
    'url' => $url,
    'samples' => $samples,
    'warmup' => $warmup,
    'timeout_sec' => $timeoutSec,
    'generated_at' => gmdate('c'),
    'status_counts_all_requests' => $statusCounts,
    'debug_header_enabled' => $useDebugHeader,
]);

fwrite(STDOUT, "\n=== Summary ===\n");
fwrite(STDOUT, json_encode($report['summary'], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n");

if ($jsonOut !== '') {
    $jsonDir = dirname($jsonOut);
    if (!is_dir($jsonDir)) {
        if (!mkdir($jsonDir, 0777, true) && !is_dir($jsonDir)) {
            fwrite(STDERR, "Failed to create directory for --json-out: {$jsonDir}\n");
            exit(2);
        }
    }
    $written = file_put_contents($jsonOut, json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    if ($written === false) {
        fwrite(STDERR, "Failed to write JSON report to {$jsonOut}\n");
        exit(2);
    }
    fwrite(STDOUT, "Report written to {$jsonOut}\n");
}

exit(0);

/**
 * @param list<string> $headers
 * @param array<string, mixed> $payload
 * @return array{status_code:int,json:array<string,mixed>|null,error:string|null}
 */
function performHttpJsonRequest(string $url, array $headers, array $payload, int $timeoutSec): array
{
    $body = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($body === false) {
        return ['status_code' => 0, 'json' => null, 'error' => 'payload_encode_failed'];
    }

    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        if ($ch === false) {
            return ['status_code' => 0, 'json' => null, 'error' => 'curl_init_failed'];
        }
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_POSTFIELDS => $body,
            CURLOPT_CONNECTTIMEOUT => max(1, min(10, $timeoutSec)),
            CURLOPT_TIMEOUT => $timeoutSec,
        ]);
        $raw = curl_exec($ch);
        $statusCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($raw === false) {
            return ['status_code' => $statusCode, 'json' => null, 'error' => $error !== '' ? $error : 'curl_exec_failed'];
        }

        $decoded = json_decode($raw, true);
        return [
            'status_code' => $statusCode,
            'json' => is_array($decoded) ? $decoded : null,
            'error' => $decoded === null ? 'json_decode_failed' : null,
        ];
    }

    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => implode("\r\n", $headers),
            'content' => $body,
            'timeout' => $timeoutSec,
            'ignore_errors' => true,
        ],
    ]);
    $raw = @file_get_contents($url, false, $context);
    $statusCode = 0;
    $error = null;
    if (isset($http_response_header) && is_array($http_response_header)) {
        foreach ($http_response_header as $headerLine) {
            if (preg_match('#^HTTP/\S+\s+(\d{3})#', $headerLine, $matches)) {
                $statusCode = (int) $matches[1];
                break;
            }
        }
    }
    if ($raw === false) {
        $error = 'file_get_contents_failed';
        return ['status_code' => $statusCode, 'json' => null, 'error' => $error];
    }
    $decoded = json_decode($raw, true);
    return [
        'status_code' => $statusCode,
        'json' => is_array($decoded) ? $decoded : null,
        'error' => $decoded === null ? 'json_decode_failed' : null,
    ];
}

/**
 * @param array<int, array<string, mixed>> $rows
 * @param array<string, mixed> $meta
 * @return array{meta:array<string,mixed>,summary:array<string,mixed>,rows:array<int,array<string,mixed>>}
 */
function buildReport(array $rows, array $meta): array
{
    $summary = [
        'sample_count' => count($rows),
        'client_total_ms' => summarizeMetric($rows, 'client_total_ms'),
        'backend_total_duration_ms' => summarizeMetric($rows, 'backend_total_duration_ms'),
        'analysis_duration_ms' => summarizeMetric($rows, 'analysis_duration_ms'),
        'verse_query_duration_ms' => summarizeMetric($rows, 'verse_query_duration_ms'),
        'verse_selection_duration_ms' => summarizeMetric($rows, 'verse_selection_duration_ms'),
        'interpretation_duration_ms' => summarizeMetric($rows, 'interpretation_duration_ms'),
        'generation_duration_ms' => summarizeMetric($rows, 'generation_duration_ms'),
        'evaluation_duration_ms' => summarizeMetric($rows, 'evaluation_duration_ms'),
        'mentor_duration_ms' => summarizeMetric($rows, 'mentor_duration_ms'),
        'fallback_meditation_used_rate' => summarizeBoolRate($rows, 'fallback_meditation_used'),
        'fallback_verse_used_rate' => summarizeBoolRate($rows, 'fallback_verse_used'),
        'quality_rewrite_triggered_rate' => summarizeBoolRate($rows, 'quality_rewrite_triggered'),
        'mentor_fallback_rate' => summarizeBoolRate($rows, 'mentor_fallback'),
        'mentor_success_rate' => summarizeBoolRate($rows, 'mentor_success'),
        'telemetry_coverage_rate' => summarizeTelemetryCoverage($rows),
    ];

    return [
        'meta' => $meta,
        'summary' => $summary,
        'rows' => $rows,
    ];
}

/**
 * @param array<int, array<string, mixed>> $rows
 * @return array<string, int|float|null>
 */
function summarizeMetric(array $rows, string $key): array
{
    $values = [];
    foreach ($rows as $row) {
        $value = $row[$key] ?? null;
        if (is_int($value)) {
            $values[] = $value;
        }
    }

    if ($values === []) {
        return ['count' => 0, 'min' => null, 'avg' => null, 'median' => null, 'p95' => null, 'max' => null];
    }

    sort($values);
    $count = count($values);
    $sum = array_sum($values);

    return [
        'count' => $count,
        'min' => $values[0],
        'avg' => round($sum / $count, 2),
        'median' => percentile($values, 50),
        'p95' => percentile($values, 95),
        'max' => $values[$count - 1],
    ];
}

/**
 * @param array<int, array<string, mixed>> $rows
 * @return array{true_count:int,false_count:int,coverage_count:int,rate:float}
 */
function summarizeBoolRate(array $rows, string $key): array
{
    $trueCount = 0;
    $falseCount = 0;
    foreach ($rows as $row) {
        $value = $row[$key] ?? null;
        if ($value === true) {
            $trueCount++;
        } elseif ($value === false) {
            $falseCount++;
        }
    }
    $coverage = $trueCount + $falseCount;
    $rate = $coverage > 0 ? round($trueCount / $coverage, 4) : 0.0;

    return [
        'true_count' => $trueCount,
        'false_count' => $falseCount,
        'coverage_count' => $coverage,
        'rate' => $rate,
    ];
}

/**
 * @param array<int, array<string, mixed>> $rows
 * @return array{with_debug_telemetry:int,total:int,rate:float}
 */
function summarizeTelemetryCoverage(array $rows): array
{
    $withTelemetry = 0;
    foreach ($rows as $row) {
        if (is_int($row['backend_total_duration_ms'] ?? null)) {
            $withTelemetry++;
        }
    }
    $total = count($rows);
    $rate = $total > 0 ? round($withTelemetry / $total, 4) : 0.0;
    return [
        'with_debug_telemetry' => $withTelemetry,
        'total' => $total,
        'rate' => $rate,
    ];
}

/**
 * @param list<int> $sortedValues
 */
function percentile(array $sortedValues, int $percent): int
{
    $count = count($sortedValues);
    if ($count === 0) {
        return 0;
    }
    $position = (int) ceil(($percent / 100) * $count) - 1;
    $position = max(0, min($count - 1, $position));
    return $sortedValues[$position];
}

/**
 * @param array<string, mixed> $array
 * @return mixed
 */
function dataGet(array $array, string $path, mixed $default = null): mixed
{
    $segments = explode('.', $path);
    $value = $array;
    foreach ($segments as $segment) {
        if (!is_array($value) || !array_key_exists($segment, $value)) {
            return $default;
        }
        $value = $value[$segment];
    }
    return $value;
}

function toNullableInt(mixed $value): ?int
{
    if (is_int($value)) {
        return $value;
    }
    if (is_numeric($value)) {
        return (int) $value;
    }
    return null;
}

function toNullableBool(mixed $value): ?bool
{
    if (is_bool($value)) {
        return $value;
    }
    return null;
}

function toNullableString(mixed $value): ?string
{
    if (is_string($value)) {
        return $value;
    }
    if ($value === null) {
        return null;
    }
    return (string) $value;
}

function valueOrDash(mixed $value): string
{
    if ($value === null || $value === '') {
        return '-';
    }
    return (string) $value;
}
