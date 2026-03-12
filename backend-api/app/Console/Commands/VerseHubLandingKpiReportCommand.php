<?php

namespace App\Console\Commands;

use App\Models\VerseHubLandingEvent;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class VerseHubLandingKpiReportCommand extends Command
{
    protected $signature = 'app:versehub-landing-kpi 
        {--lang=id : Language segment (id|en|all)} 
        {--days=7 : Rolling window in days}
        {--json : Output JSON only}';

    protected $description = 'Generate KPI report for VerseHub landing A/B microcopy events';

    public function handle(): int
    {
        $days = max(1, (int) $this->option('days'));
        $langOpt = (string) $this->option('lang');
        $json = (bool) $this->option('json');
        $from = Carbon::now()->subDays($days);

        $query = VerseHubLandingEvent::query()
            ->where('occurred_at', '>=', $from);

        if (in_array($langOpt, ['id', 'en'], true)) {
            $query->where('lang', $langOpt);
        }

        $rows = $query
            ->orderBy('occurred_at')
            ->get(['lang', 'session_id', 'persona', 'variant', 'event_name', 'meta', 'occurred_at']);

        $byBucket = [];
        $allViewSessions = [];
        $allActionSessions = [];
        $allFirstSessionView = 0;
        $allViewCount = 0;

        foreach ($rows as $row) {
            $persona = (string) $row->persona;
            $variant = (string) $row->variant;
            $bucketKey = $persona.'|'.$variant;
            $session = (string) $row->session_id;
            $event = (string) $row->event_name;
            $meta = is_array($row->meta) ? $row->meta : [];

            if (!isset($byBucket[$bucketKey])) {
                $byBucket[$bucketKey] = [
                    'persona' => $persona,
                    'variant' => $variant,
                    'view_sessions' => [],
                    'start_sessions' => [],
                    'continue_sessions' => [],
                    'explore_sessions' => [],
                    'path_sessions' => [],
                    'search_sessions' => [],
                    'first_session_views' => 0,
                    'view_count' => 0,
                ];
            }

            if ($event === 'landing_view') {
                $byBucket[$bucketKey]['view_sessions'][$session] = true;
                $byBucket[$bucketKey]['view_count']++;
                $allViewSessions[$session] = true;
                $allViewCount++;
                if (($meta['first_session'] ?? false) === true) {
                    $byBucket[$bucketKey]['first_session_views']++;
                    $allFirstSessionView++;
                }
                continue;
            }

            if ($event === 'cta_start_here_click') {
                $byBucket[$bucketKey]['start_sessions'][$session] = true;
                $allActionSessions[$session] = true;
                continue;
            }
            if ($event === 'cta_continue_click') {
                $byBucket[$bucketKey]['continue_sessions'][$session] = true;
                $allActionSessions[$session] = true;
                continue;
            }
            if ($event === 'cta_explore_open') {
                $byBucket[$bucketKey]['explore_sessions'][$session] = true;
                $allActionSessions[$session] = true;
                continue;
            }
            if ($event === 'cta_path_click') {
                $byBucket[$bucketKey]['path_sessions'][$session] = true;
                $allActionSessions[$session] = true;
                continue;
            }
            if ($event === 'search_submit') {
                $byBucket[$bucketKey]['search_sessions'][$session] = true;
                $allActionSessions[$session] = true;
            }
        }

        $details = [];
        foreach ($byBucket as $bucket) {
            $views = count($bucket['view_sessions']);
            $start = count($bucket['start_sessions']);
            $continue = count($bucket['continue_sessions']);
            $explore = count($bucket['explore_sessions']);
            $path = count($bucket['path_sessions']);
            $search = count($bucket['search_sessions']);
            $any = count($bucket['start_sessions'] + $bucket['continue_sessions'] + $bucket['explore_sessions'] + $bucket['path_sessions'] + $bucket['search_sessions']);

            $details[] = [
                'persona' => $bucket['persona'],
                'variant' => strtoupper($bucket['variant']),
                'sessions_viewed' => $views,
                'ctr_any_action_pct' => $this->pct($any, $views),
                'ctr_start_here_pct' => $this->pct($start, $views),
                'ctr_continue_pct' => $this->pct($continue, $views),
                'ctr_explore_pct' => $this->pct($explore, $views),
                'ctr_path_pct' => $this->pct($path, $views),
                'ctr_search_pct' => $this->pct($search, $views),
                'first_session_view_rate_pct' => $this->pct((int) $bucket['first_session_views'], (int) $bucket['view_count']),
            ];
        }

        usort($details, static fn (array $a, array $b) => strcmp($a['persona'].$a['variant'], $b['persona'].$b['variant']));

        $summary = [
            'window_days' => $days,
            'lang' => $langOpt,
            'from' => $from->toIso8601String(),
            'events_total' => $rows->count(),
            'sessions_viewed_total' => count($allViewSessions),
            'sessions_with_action_total' => count($allActionSessions),
            'global_ctr_any_action_pct' => $this->pct(count($allActionSessions), count($allViewSessions)),
            'first_session_view_rate_pct' => $this->pct($allFirstSessionView, $allViewCount),
        ];

        if ($json) {
            $this->line(json_encode([
                'summary' => $summary,
                'details' => $details,
            ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            return self::SUCCESS;
        }

        $this->info('VerseHub Landing KPI Report');
        $this->line(sprintf('Window: last %d day(s) | Lang: %s | From: %s', $days, $langOpt, $from->toDateTimeString()));
        $this->newLine();
        $this->table(
            ['Metric', 'Value'],
            [
                ['Events total', (string) $summary['events_total']],
                ['Sessions viewed total', (string) $summary['sessions_viewed_total']],
                ['Sessions with any action', (string) $summary['sessions_with_action_total']],
                ['Global CTR any action', $summary['global_ctr_any_action_pct'].'%'],
                ['First-session view rate', $summary['first_session_view_rate_pct'].'%'],
            ],
        );

        if ($details === []) {
            $this->warn('No landing KPI rows for the selected filter.');
            return self::SUCCESS;
        }

        $this->newLine();
        $this->table(
            [
                'Persona',
                'Variant',
                'Viewed',
                'CTR Any',
                'CTR Start',
                'CTR Continue',
                'CTR Explore',
                'CTR Path',
                'CTR Search',
                'First-Session View Rate',
            ],
            array_map(static fn (array $r) => [
                $r['persona'],
                $r['variant'],
                (string) $r['sessions_viewed'],
                $r['ctr_any_action_pct'].'%',
                $r['ctr_start_here_pct'].'%',
                $r['ctr_continue_pct'].'%',
                $r['ctr_explore_pct'].'%',
                $r['ctr_path_pct'].'%',
                $r['ctr_search_pct'].'%',
                $r['first_session_view_rate_pct'].'%',
            ], $details),
        );

        return self::SUCCESS;
    }

    private function pct(int $num, int $den): string
    {
        if ($den <= 0) {
            return '0.00';
        }

        return number_format(($num / $den) * 100, 2, '.', '');
    }
}

