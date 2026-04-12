<?php

namespace App\Services\Analytics;

use App\Models\LandingClickEvent;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;

class CommunityComposerAnalyticsService
{
    private const CACHE_TTL_MINUTES = 5;

    private const POST_TYPE_ORDER = [
        'user_post',
        'reflection',
        'testimony',
        'prayer_request',
        'quote',
    ];

    private const EVENT_NAMES = [
        'composer_open',
        'composer_typing_start',
        'composer_attach_media',
        'composer_crop_applied',
        'composer_submit_attempt',
        'composer_submit_success',
        'composer_submit_failure',
        'composer_draft_restored',
        'composer_abandon',
        'composer_idle_timeout',
    ];

    private const FAILURE_REASONS = [
        'text_too_short',
        'max_images',
        'pending_crop',
        'network_error',
        'unknown',
    ];

    public function snapshot(array $filters): array
    {
        $normalized = $this->normalizeFilters($filters);
        $cacheKey = sprintf(
            'analytics:community:composer:%s:%s:%s',
            $normalized['timeframe'],
            $normalized['postType'],
            $normalized['media']
        );

        return Cache::remember(
            $cacheKey,
            now()->addMinutes(self::CACHE_TTL_MINUTES),
            fn (): array => $this->buildSnapshot($normalized)
        );
    }

    private function buildSnapshot(array $filters): array
    {
        $rows = $this->aggregateRows($filters['timeframe']);
        $filteredRows = $this->applyFilters($rows, $filters);

        $openCount = $this->sum($filteredRows, 'openCount');
        $typingStartCount = $this->sum($filteredRows, 'typingStartCount');
        $attachMediaCount = $this->sum($filteredRows, 'attachMediaCount');
        $cropAppliedCount = $this->sum($filteredRows, 'cropAppliedCount');
        $submitSuccessCount = $this->sum($filteredRows, 'submitSuccessCount');
        $submitFailureCount = $this->sum($filteredRows, 'submitFailureCount');
        $submitAttemptCount = $this->sum($filteredRows, 'submitAttemptCount');
        if ($submitAttemptCount <= 0) {
            $submitAttemptCount = $submitSuccessCount + $submitFailureCount;
        }

        $draftRestoredCount = $this->sum($filteredRows, 'draftRestoredCount');
        $draftRestoredSuccessCount = $this->sum($filteredRows, 'draftRestoredSuccessCount');
        $abandonedDraftCount = $this->sum($filteredRows, 'abandonedDraftCount');

        $mediaRows = array_values(array_filter($filteredRows, static fn (array $row): bool => $row['hasMedia']));
        $textRows = array_values(array_filter($filteredRows, static fn (array $row): bool => ! $row['hasMedia']));
        $mediaAttempts = $this->sum($mediaRows, 'submitAttemptCount');
        $mediaSuccess = $this->sum($mediaRows, 'submitSuccessCount');
        $textAttempts = $this->sum($textRows, 'submitAttemptCount');
        $textSuccess = $this->sum($textRows, 'submitSuccessCount');

        $validationFailures = $this->aggregateValidationFailures($filteredRows);
        $topValidationFailures = $this->buildTopValidationFailures($validationFailures);

        $baseSnapshot = [
            'generatedAt' => now()->toISOString(),
            'filters' => $filters,
            'overview' => [
                'openCount' => $openCount,
                'submitSuccessCount' => $submitSuccessCount,
                'submitFailureCount' => $submitFailureCount,
                'meaningfulActivationRatePct' => $this->pct($submitSuccessCount, $openCount),
                'openToSuccessRatePct' => $this->pct($submitSuccessCount, $openCount),
                'typingRatePct' => $this->pct($typingStartCount, $openCount),
                'averageTimeToPostSec' => $this->weightedAverageTime($filteredRows, $submitAttemptCount),
            ],
            'draft' => [
                'restoredCount' => $draftRestoredCount,
                'restoreRatePct' => $this->pct($draftRestoredCount, $openCount),
                'restoredToSuccessRatePct' => $this->pct($draftRestoredSuccessCount, $draftRestoredCount),
                'abandonedDraftRatioPct' => $this->pct($abandonedDraftCount, $draftRestoredCount),
            ],
            'media' => [
                'attachmentRatePct' => $this->pct($attachMediaCount, $openCount),
                'mediaSuccessRatePct' => $this->pct($mediaSuccess, $mediaAttempts),
                'textOnlySuccessRatePct' => $this->pct($textSuccess, $textAttempts),
                'cropInteractionDensity' => $this->round($cropAppliedCount / max(1, $attachMediaCount)),
            ],
            'failure' => [
                'networkErrorRatePct' => $this->pct($validationFailures['network_error'], $submitAttemptCount),
                'topValidationFailures' => $topValidationFailures,
            ],
            'funnel' => $this->buildFunnel(
                $openCount,
                $typingStartCount,
                $attachMediaCount,
                $submitAttemptCount,
                $submitSuccessCount
            ),
            'postTypeBreakdown' => $this->buildPostTypeBreakdown($filteredRows),
        ];

        return [
            ...$baseSnapshot,
            'insights' => $this->buildInsights($baseSnapshot),
        ];
    }

    private function aggregateRows(string $timeframe): array
    {
        $since = Carbon::now()->subDays($timeframe === '30d' ? 30 : 7);
        $rows = [];

        $events = LandingClickEvent::query()
            ->select(['event_name', 'meta', 'created_at'])
            ->whereIn('event_name', self::EVENT_NAMES)
            ->where('created_at', '>=', $since)
            ->cursor();

        foreach ($events as $event) {
            $payload = $this->extractPayload($event->meta);
            $postType = $this->normalizePostType($payload['postType'] ?? $payload['post_type'] ?? null) ?? 'user_post';
            $hasMedia = $this->normalizeHasMedia($payload);
            $rowKey = sprintf('%s:%s', $postType, $hasMedia ? '1' : '0');

            if (! isset($rows[$rowKey])) {
                $rows[$rowKey] = $this->newRow($timeframe, $postType, $hasMedia);
            }

            $reason = $this->normalizeFailureReason($payload['reason'] ?? $payload['failureReason'] ?? $payload['failure_reason'] ?? null);
            $timeToPostSec = $this->normalizeTimeToPostSec($payload['timeSpentMs'] ?? $payload['time_spent_ms'] ?? null);
            $isDraftRestore = (bool) ($payload['isDraftRestore'] ?? $payload['is_draft_restore'] ?? false);

            switch ((string) $event->event_name) {
                case 'composer_open':
                    $rows[$rowKey]['openCount']++;
                    break;
                case 'composer_typing_start':
                    $rows[$rowKey]['typingStartCount']++;
                    break;
                case 'composer_attach_media':
                    $rows[$rowKey]['attachMediaCount']++;
                    break;
                case 'composer_crop_applied':
                    $rows[$rowKey]['cropAppliedCount']++;
                    break;
                case 'composer_submit_attempt':
                    $rows[$rowKey]['submitAttemptCount']++;
                    $rows[$rowKey]['timeToPostTotalSec'] += $timeToPostSec;
                    break;
                case 'composer_submit_success':
                    $rows[$rowKey]['submitSuccessCount']++;
                    $rows[$rowKey]['submitAttemptCount']++;
                    $rows[$rowKey]['timeToPostTotalSec'] += $timeToPostSec;
                    if ($isDraftRestore) {
                        $rows[$rowKey]['draftRestoredSuccessCount']++;
                    }
                    break;
                case 'composer_submit_failure':
                    $rows[$rowKey]['submitFailureCount']++;
                    $rows[$rowKey]['submitAttemptCount']++;
                    $rows[$rowKey]['timeToPostTotalSec'] += $timeToPostSec;
                    $rows[$rowKey]['validationFailures'][$reason]++;
                    break;
                case 'composer_draft_restored':
                    $rows[$rowKey]['draftRestoredCount']++;
                    break;
                case 'composer_abandon':
                case 'composer_idle_timeout':
                    $rows[$rowKey]['abandonedDraftCount']++;
                    break;
            }
        }

        return array_values($rows);
    }

    private function applyFilters(array $rows, array $filters): array
    {
        return array_values(array_filter($rows, static function (array $row) use ($filters): bool {
            if ($row['timeframe'] !== $filters['timeframe']) {
                return false;
            }

            if ($filters['postType'] !== 'all' && $row['postType'] !== $filters['postType']) {
                return false;
            }

            if ($filters['media'] === 'with_media' && ! $row['hasMedia']) {
                return false;
            }

            if ($filters['media'] === 'without_media' && $row['hasMedia']) {
                return false;
            }

            return true;
        }));
    }

    private function buildTopValidationFailures(array $validationFailures): array
    {
        arsort($validationFailures);
        $top = [];
        foreach (array_slice($validationFailures, 0, 3, true) as $reason => $count) {
            $top[] = [
                'reason' => $reason,
                'count' => $count,
            ];
        }

        return $top;
    }

    private function buildFunnel(
        int $openCount,
        int $typingStartCount,
        int $attachMediaCount,
        int $submitAttemptCount,
        int $submitSuccessCount
    ): array {
        return [
            [
                'key' => 'open',
                'label' => 'Open',
                'value' => $openCount,
                'rateFromPreviousPct' => 100.0,
            ],
            [
                'key' => 'engage',
                'label' => 'Engage',
                'value' => $typingStartCount,
                'rateFromPreviousPct' => $this->pct($typingStartCount, $openCount),
            ],
            [
                'key' => 'prepare',
                'label' => 'Prepare',
                'value' => $attachMediaCount,
                'rateFromPreviousPct' => $this->pct($attachMediaCount, $typingStartCount),
            ],
            [
                'key' => 'attempt',
                'label' => 'Attempt',
                'value' => $submitAttemptCount,
                'rateFromPreviousPct' => $this->pct($submitAttemptCount, $attachMediaCount > 0 ? $attachMediaCount : $typingStartCount),
            ],
            [
                'key' => 'success',
                'label' => 'Success',
                'value' => $submitSuccessCount,
                'rateFromPreviousPct' => $this->pct($submitSuccessCount, $submitAttemptCount),
            ],
        ];
    }

    private function buildPostTypeBreakdown(array $rows): array
    {
        $items = [];
        foreach (self::POST_TYPE_ORDER as $postType) {
            $postRows = array_values(array_filter(
                $rows,
                static fn (array $row): bool => $row['postType'] === $postType
            ));

            $openCount = $this->sum($postRows, 'openCount');
            if ($openCount <= 0) {
                continue;
            }

            $submitSuccessCount = $this->sum($postRows, 'submitSuccessCount');
            $items[] = [
                'postType' => $postType,
                'openCount' => $openCount,
                'submitSuccessCount' => $submitSuccessCount,
                'successRatePct' => $this->pct($submitSuccessCount, $openCount),
            ];
        }

        return $items;
    }

    private function buildInsights(array $snapshot): array
    {
        $insights = [];

        if (($snapshot['overview']['typingRatePct'] ?? 0) < 55) {
            $insights[] = [
                'id' => 'typing-rate-low',
                'tone' => 'warning',
                'title' => 'Engage rate masih rendah',
                'detail' => sprintf(
                    'Hanya %s%% sesi open berlanjut ke typing. Evaluasi prompt awal dan clarity entry state.',
                    $snapshot['overview']['typingRatePct']
                ),
            ];
        }

        if (
            ($snapshot['draft']['restoreRatePct'] ?? 0) >= 20
            && ($snapshot['draft']['restoredToSuccessRatePct'] ?? 0) < 45
        ) {
            $insights[] = [
                'id' => 'draft-gap',
                'tone' => 'warning',
                'title' => 'Draft dipulihkan, tapi belum banyak selesai diposting',
                'detail' => sprintf(
                    'Restore rate %s%% dengan conversion restore->success %s%%. Audit friction submit/auth flow.',
                    $snapshot['draft']['restoreRatePct'],
                    $snapshot['draft']['restoredToSuccessRatePct']
                ),
            ];
        }

        if (
            ($snapshot['media']['mediaSuccessRatePct'] ?? 0)
            > (($snapshot['media']['textOnlySuccessRatePct'] ?? 0) + 6)
        ) {
            $insights[] = [
                'id' => 'media-outperform',
                'tone' => 'positive',
                'title' => 'Post dengan media cenderung lebih sukses',
                'detail' => sprintf(
                    'Success media %s%% vs text-only %s%%. Pertahankan flow media yang ringan.',
                    $snapshot['media']['mediaSuccessRatePct'],
                    $snapshot['media']['textOnlySuccessRatePct']
                ),
            ];
        }

        if (($snapshot['failure']['networkErrorRatePct'] ?? 0) > 6) {
            $insights[] = [
                'id' => 'network-risk',
                'tone' => 'warning',
                'title' => 'Network failure rate meningkat',
                'detail' => sprintf(
                    'Sekitar %s%% attempt gagal karena network. Perlu cek proxy/API reliability.',
                    $snapshot['failure']['networkErrorRatePct']
                ),
            ];
        }

        if ($insights === []) {
            $insights[] = [
                'id' => 'healthy-baseline',
                'tone' => 'neutral',
                'title' => 'Baseline composer stabil',
                'detail' => 'Tidak ada sinyal friksi menonjol pada filter saat ini. Lanjutkan monitoring mingguan.',
            ];
        }

        return $insights;
    }

    private function aggregateValidationFailures(array $rows): array
    {
        $acc = [
            'text_too_short' => 0,
            'max_images' => 0,
            'pending_crop' => 0,
            'network_error' => 0,
            'unknown' => 0,
        ];

        foreach ($rows as $row) {
            foreach ($acc as $reason => $count) {
                $acc[$reason] += (int) ($row['validationFailures'][$reason] ?? 0);
            }
        }

        return $acc;
    }

    private function weightedAverageTime(array $rows, int $totalAttempts): float
    {
        if ($totalAttempts <= 0) {
            return 0.0;
        }

        $weighted = 0.0;
        foreach ($rows as $row) {
            $weighted += (float) ($row['timeToPostTotalSec'] ?? 0.0);
        }

        return $this->round($weighted / $totalAttempts);
    }

    private function sum(array $rows, string $field): int
    {
        $sum = 0;
        foreach ($rows as $row) {
            $sum += (int) ($row[$field] ?? 0);
        }

        return $sum;
    }

    private function newRow(string $timeframe, string $postType, bool $hasMedia): array
    {
        return [
            'timeframe' => $timeframe,
            'postType' => $postType,
            'hasMedia' => $hasMedia,
            'openCount' => 0,
            'typingStartCount' => 0,
            'attachMediaCount' => 0,
            'cropAppliedCount' => 0,
            'submitAttemptCount' => 0,
            'submitSuccessCount' => 0,
            'submitFailureCount' => 0,
            'draftRestoredCount' => 0,
            'draftRestoredSuccessCount' => 0,
            'abandonedDraftCount' => 0,
            'timeToPostTotalSec' => 0.0,
            'validationFailures' => [
                'text_too_short' => 0,
                'max_images' => 0,
                'pending_crop' => 0,
                'network_error' => 0,
                'unknown' => 0,
            ],
        ];
    }

    private function extractPayload(mixed $meta): array
    {
        if (! is_array($meta)) {
            return [];
        }

        $payload = $meta['payload_meta'] ?? $meta['meta'] ?? $meta;

        return is_array($payload) ? $payload : [];
    }

    private function normalizeFilters(array $filters): array
    {
        $timeframe = in_array(($filters['timeframe'] ?? null), ['7d', '30d'], true) ? $filters['timeframe'] : '7d';
        $postType = in_array(($filters['postType'] ?? null), ['all', ...self::POST_TYPE_ORDER], true) ? $filters['postType'] : 'all';
        $media = in_array(($filters['media'] ?? null), ['all', 'with_media', 'without_media'], true) ? $filters['media'] : 'all';

        return [
            'timeframe' => $timeframe,
            'postType' => $postType,
            'media' => $media,
        ];
    }

    private function normalizePostType(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $postType = trim($value);
        if ($postType === '' || ! in_array($postType, self::POST_TYPE_ORDER, true)) {
            return null;
        }

        return $postType;
    }

    private function normalizeHasMedia(array $payload): bool
    {
        $raw = $payload['hasMedia'] ?? $payload['has_media'] ?? null;
        if (is_bool($raw)) {
            return $raw;
        }
        if (is_string($raw)) {
            $normalized = strtolower(trim($raw));
            if (in_array($normalized, ['1', 'true', 'yes'], true)) {
                return true;
            }
            if (in_array($normalized, ['0', 'false', 'no'], true)) {
                return false;
            }
        }

        $mediaCount = $payload['mediaCount'] ?? $payload['media_count'] ?? 0;
        return is_numeric($mediaCount) && (int) $mediaCount > 0;
    }

    private function normalizeFailureReason(mixed $value): string
    {
        if (! is_string($value)) {
            return 'unknown';
        }

        $reason = strtolower(trim($value));
        if ($reason === 'submit_failed') {
            return 'network_error';
        }

        return in_array($reason, self::FAILURE_REASONS, true) ? $reason : 'unknown';
    }

    private function normalizeTimeToPostSec(mixed $value): float
    {
        if (! is_numeric($value)) {
            return 0.0;
        }

        return max(0, (float) $value / 1000);
    }

    private function pct(int|float $numerator, int|float $denominator): float
    {
        if ($denominator <= 0) {
            return 0.0;
        }

        return $this->round(($numerator / $denominator) * 100);
    }

    private function round(float $value): float
    {
        return round($value, 1);
    }
}
