<?php

namespace App\Filament\Pages;

use App\Models\VerseHubLandingEvent;
use BackedEnum;
use Filament\Facades\Filament;
use Filament\Pages\Page;
use UnitEnum;

class VerseHubLandingKpi extends Page
{
    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-chart-bar';

    protected static string|UnitEnum|null $navigationGroup = 'VerseHub Mentor';

    protected static ?string $navigationLabel = 'Landing KPI';

    protected static ?int $navigationSort = 41;

    protected string $view = 'filament.pages.versehub-landing-kpi';

    public int $days = 7;

    public string $lang = 'id';

    /** @var array<string, string|int> */
    public array $summary = [];

    /** @var array<int, array<string, string|int>> */
    public array $rows = [];

    public static function shouldRegisterNavigation(): bool
    {
        $user = Filament::auth()->user();
        return (bool) ($user?->is_admin ?? false);
    }

    public static function canAccess(): bool
    {
        $user = Filament::auth()->user();
        return (bool) ($user?->is_admin ?? false);
    }

    public function mount(): void
    {
        $this->refreshData();
    }

    public function refreshData(): void
    {
        $days = max(1, min(60, (int) $this->days));
        $lang = in_array($this->lang, ['id', 'en', 'all'], true) ? $this->lang : 'id';

        $query = VerseHubLandingEvent::query()
            ->where('occurred_at', '>=', now()->subDays($days));
        if ($lang !== 'all') {
            $query->where('lang', $lang);
        }

        $events = $query
            ->get(['session_id', 'persona', 'variant', 'event_name', 'meta']);

        $buckets = [];
        $viewSessions = [];
        $actionSessions = [];
        foreach ($events as $event) {
            $bucket = $event->persona.'|'.$event->variant;
            $session = (string) $event->session_id;
            if (!isset($buckets[$bucket])) {
                $buckets[$bucket] = [
                    'persona' => $event->persona,
                    'variant' => strtoupper((string) $event->variant),
                    'views' => [],
                    'start' => [],
                    'continue' => [],
                    'explore' => [],
                    'path' => [],
                    'search' => [],
                ];
            }

            if ($event->event_name === 'landing_view') {
                $buckets[$bucket]['views'][$session] = true;
                $viewSessions[$session] = true;
                continue;
            }
            if ($event->event_name === 'cta_start_here_click') {
                $buckets[$bucket]['start'][$session] = true;
                $actionSessions[$session] = true;
                continue;
            }
            if ($event->event_name === 'cta_continue_click') {
                $buckets[$bucket]['continue'][$session] = true;
                $actionSessions[$session] = true;
                continue;
            }
            if ($event->event_name === 'cta_explore_open') {
                $buckets[$bucket]['explore'][$session] = true;
                $actionSessions[$session] = true;
                continue;
            }
            if ($event->event_name === 'cta_path_click') {
                $buckets[$bucket]['path'][$session] = true;
                $actionSessions[$session] = true;
                continue;
            }
            if ($event->event_name === 'search_submit') {
                $buckets[$bucket]['search'][$session] = true;
                $actionSessions[$session] = true;
            }
        }

        $rows = [];
        foreach ($buckets as $bucket) {
            $viewed = count($bucket['views']);
            $start = count($bucket['start']);
            $continue = count($bucket['continue']);
            $explore = count($bucket['explore']);
            $path = count($bucket['path']);
            $search = count($bucket['search']);
            $any = count($bucket['start'] + $bucket['continue'] + $bucket['explore'] + $bucket['path'] + $bucket['search']);

            $rows[] = [
                'persona' => (string) $bucket['persona'],
                'variant' => (string) $bucket['variant'],
                'viewed' => $viewed,
                'ctr_any' => $this->pct($any, $viewed),
                'ctr_start' => $this->pct($start, $viewed),
                'ctr_continue' => $this->pct($continue, $viewed),
                'ctr_explore' => $this->pct($explore, $viewed),
                'ctr_path' => $this->pct($path, $viewed),
                'ctr_search' => $this->pct($search, $viewed),
            ];
        }

        usort($rows, static fn (array $a, array $b) => strcmp($a['persona'].$a['variant'], $b['persona'].$b['variant']));

        $this->days = $days;
        $this->lang = $lang;
        $this->rows = $rows;
        $this->summary = [
            'events_total' => $events->count(),
            'sessions_viewed' => count($viewSessions),
            'sessions_with_action' => count($actionSessions),
            'global_ctr_any' => $this->pct(count($actionSessions), count($viewSessions)).'%',
        ];
    }

    private function pct(int $num, int $den): string
    {
        if ($den <= 0) {
            return '0.00';
        }
        return number_format(($num / $den) * 100, 2, '.', '');
    }
}

