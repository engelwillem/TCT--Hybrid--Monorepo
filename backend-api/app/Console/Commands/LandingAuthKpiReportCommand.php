<?php

namespace App\Console\Commands;

use App\Models\LandingClickEvent;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class LandingAuthKpiReportCommand extends Command
{
    protected $signature = 'app:landing-auth-kpi
        {--days=7 : Rolling window in days}
        {--variant=all : Variant filter (a|b|all)}
        {--json : Output JSON only}';

    protected $description = 'Generate KPI report for landing auth click events (A/B variant)';

    public function handle(): int
    {
        $days = max(1, (int) $this->option('days'));
        $variantOpt = strtolower((string) $this->option('variant'));
        if (!in_array($variantOpt, ['a', 'b', 'all'], true)) {
            $variantOpt = 'all';
        }
        $json = (bool) $this->option('json');
        $from = Carbon::now()->subDays($days);

        $query = LandingClickEvent::query()->where('created_at', '>=', $from);
        if ($variantOpt !== 'all') {
            $query->where('variant', $variantOpt);
        }

        $rows = $query
            ->orderBy('created_at')
            ->get(['variant', 'session_id', 'event_name', 'created_at']);

        $events = [
            'header_login_click',
            'hero_primary_click',
            'hero_secondary_click',
            'hero_login_click',
            'final_primary_click',
            'final_login_click',
        ];

        $byVariant = [];
        foreach ($rows as $row) {
            $variant = strtoupper((string) $row->variant);
            $session = (string) $row->session_id;
            $eventName = (string) $row->event_name;

            if (!isset($byVariant[$variant])) {
                $byVariant[$variant] = [
                    'variant' => $variant,
                    'sessions' => [],
                    'clicks_total' => 0,
                    'events' => array_fill_keys($events, 0),
                    'event_sessions' => array_fill_keys($events, []),
                ];
            }

            $byVariant[$variant]['sessions'][$session] = true;
            $byVariant[$variant]['clicks_total']++;

            if (isset($byVariant[$variant]['events'][$eventName])) {
                $byVariant[$variant]['events'][$eventName]++;
                $byVariant[$variant]['event_sessions'][$eventName][$session] = true;
            }
        }

        $detail = [];
        foreach ($byVariant as $variant => $bucket) {
            $sessions = count($bucket['sessions']);
            $clicks = (int) $bucket['clicks_total'];
            $detail[] = [
                'variant' => $variant,
                'sessions_with_click' => $sessions,
                'clicks_total' => $clicks,
                'clicks_per_session' => $this->ratio($clicks, $sessions),
                'session_rate_hero_primary_pct' => $this->pct(count($bucket['event_sessions']['hero_primary_click']), $sessions),
                'session_rate_hero_secondary_pct' => $this->pct(count($bucket['event_sessions']['hero_secondary_click']), $sessions),
                'session_rate_header_login_pct' => $this->pct(count($bucket['event_sessions']['header_login_click']), $sessions),
                'session_rate_final_primary_pct' => $this->pct(count($bucket['event_sessions']['final_primary_click']), $sessions),
                'session_rate_final_login_pct' => $this->pct(count($bucket['event_sessions']['final_login_click']), $sessions),
            ];
        }

        usort($detail, static fn (array $a, array $b) => strcmp($a['variant'], $b['variant']));

        $allSessions = [];
        $allClicks = $rows->count();
        foreach ($rows as $row) {
            $allSessions[(string) $row->session_id] = true;
        }

        $summary = [
            'window_days' => $days,
            'variant' => $variantOpt,
            'from' => $from->toIso8601String(),
            'events_total' => $allClicks,
            'sessions_with_click_total' => count($allSessions),
            'clicks_per_session_global' => $this->ratio($allClicks, count($allSessions)),
        ];

        if ($json) {
            $this->line(json_encode([
                'summary' => $summary,
                'detail' => $detail,
            ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            return self::SUCCESS;
        }

        $this->info('Landing Auth KPI Report');
        $this->line(sprintf('Window: last %d day(s) | Variant filter: %s | From: %s', $days, strtoupper($variantOpt), $from->toDateTimeString()));
        $this->newLine();
        $this->table(
            ['Metric', 'Value'],
            [
                ['Events total', (string) $summary['events_total']],
                ['Sessions with click', (string) $summary['sessions_with_click_total']],
                ['Clicks per session', (string) $summary['clicks_per_session_global']],
            ]
        );

        if ($detail === []) {
            $this->warn('No landing auth click events for selected filter.');
            return self::SUCCESS;
        }

        $this->newLine();
        $this->table(
            [
                'Variant',
                'Sessions',
                'Clicks',
                'Click/Session',
                'Hero Primary',
                'Hero Secondary',
                'Header Login',
                'Final Primary',
                'Final Login',
            ],
            array_map(static fn (array $r) => [
                $r['variant'],
                (string) $r['sessions_with_click'],
                (string) $r['clicks_total'],
                (string) $r['clicks_per_session'],
                $r['session_rate_hero_primary_pct'].'%',
                $r['session_rate_hero_secondary_pct'].'%',
                $r['session_rate_header_login_pct'].'%',
                $r['session_rate_final_primary_pct'].'%',
                $r['session_rate_final_login_pct'].'%',
            ], $detail)
        );

        return self::SUCCESS;
    }

    private function pct(int $num, int $den): string
    {
        if ($den <= 0) return '0.00';
        return number_format(($num / $den) * 100, 2, '.', '');
    }

    private function ratio(int $num, int $den): string
    {
        if ($den <= 0) return '0.00';
        return number_format($num / $den, 2, '.', '');
    }
}
