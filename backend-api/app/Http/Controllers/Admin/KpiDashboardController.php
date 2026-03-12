<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LandingClickEvent;
use App\Models\MemberPost;
use App\Models\User;
use App\Models\VerseHubLandingEvent;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class KpiDashboardController extends Controller
{
    public function index(): Response
    {
        $viewer = auth()->user();
        abort_unless((bool) ($viewer?->is_admin ?? false), 403);

        $days = max(1, min(30, (int) request()->integer('days', 7)));
        $now = Carbon::now();
        $from = $now->copy()->subDays($days);

        $landingEvents = $this->landingEventsSummary($from);
        $verseHubEvents = $this->verseHubEventsSummary($from);
        $platform = $this->platformSummary($from);

        return Inertia::render('Settings/KpiDashboard', [
            'range' => [
                'days' => $days,
                'from' => $from->toIso8601String(),
                'to' => $now->toIso8601String(),
            ],
            'platform' => $platform,
            'landingAuth' => $landingEvents,
            'versehub' => $verseHubEvents,
        ]);
    }

    private function platformSummary(Carbon $from): array
    {
        $usersTotal = User::query()->count();
        $newUsers = User::query()->where('created_at', '>=', $from)->count();
        $activePosters = MemberPost::query()
            ->where('created_at', '>=', $from)
            ->distinct('user_id')
            ->count('user_id');

        $landingSessions = Schema::hasTable('landing_click_events')
            ? LandingClickEvent::query()->where('created_at', '>=', $from)->distinct('session_id')->count('session_id')
            : 0;

        $versehubSessions = Schema::hasTable('versehub_landing_events')
            ? VerseHubLandingEvent::query()->where('occurred_at', '>=', $from)->distinct('session_id')->count('session_id')
            : 0;

        return [
            'users_total' => $usersTotal,
            'new_users' => $newUsers,
            'active_posters' => $activePosters,
            'active_sessions_tracked' => $landingSessions + $versehubSessions,
        ];
    }

    private function landingEventsSummary(Carbon $from): array
    {
        if (! Schema::hasTable('landing_click_events')) {
            return [
                'events_total' => 0,
                'sessions_total' => 0,
                'by_variant' => [],
                'by_event' => [],
                'cta_ctr_pct' => '0.00%',
            ];
        }

        $rows = LandingClickEvent::query()
            ->where('created_at', '>=', $from)
            ->get(['session_id', 'variant', 'event_name']);

        $eventsTotal = $rows->count();
        $sessionsTotal = $rows->pluck('session_id')->filter()->unique()->count();

        $byVariant = $rows
            ->groupBy(fn ($row) => (string) ($row->variant ?: 'unknown'))
            ->map(fn ($group) => [
                'events' => $group->count(),
                'sessions' => $group->pluck('session_id')->filter()->unique()->count(),
            ])
            ->sortKeys()
            ->all();

        $byEvent = $rows
            ->groupBy(fn ($row) => (string) ($row->event_name ?: 'unknown'))
            ->map(fn ($group) => $group->count())
            ->sortDesc()
            ->all();

        $ctaSessions = $rows
            ->filter(fn ($row) => in_array((string) $row->event_name, ['hero_primary_click', 'final_primary_click', 'hero_secondary_click', 'header_login_click', 'final_login_click'], true))
            ->pluck('session_id')
            ->filter()
            ->unique()
            ->count();

        return [
            'events_total' => $eventsTotal,
            'sessions_total' => $sessionsTotal,
            'by_variant' => $byVariant,
            'by_event' => $byEvent,
            'cta_ctr_pct' => $this->pct($ctaSessions, $sessionsTotal),
        ];
    }

    private function verseHubEventsSummary(Carbon $from): array
    {
        if (! Schema::hasTable('versehub_landing_events')) {
            return [
                'events_total' => 0,
                'sessions_total' => 0,
                'by_persona' => [],
                'by_variant' => [],
                'by_event' => [],
                'start_here_ctr_pct' => '0.00%',
            ];
        }

        $rows = VerseHubLandingEvent::query()
            ->where('occurred_at', '>=', $from)
            ->get(['session_id', 'persona', 'variant', 'event_name']);

        $eventsTotal = $rows->count();
        $sessionsTotal = $rows->pluck('session_id')->filter()->unique()->count();

        $byPersona = $rows
            ->groupBy(fn ($row) => (string) ($row->persona ?: 'unknown'))
            ->map(fn ($group) => [
                'events' => $group->count(),
                'sessions' => $group->pluck('session_id')->filter()->unique()->count(),
            ])
            ->sortKeys()
            ->all();

        $byVariant = $rows
            ->groupBy(fn ($row) => (string) ($row->variant ?: 'unknown'))
            ->map(fn ($group) => [
                'events' => $group->count(),
                'sessions' => $group->pluck('session_id')->filter()->unique()->count(),
            ])
            ->sortKeys()
            ->all();

        $byEvent = $rows
            ->groupBy(fn ($row) => (string) ($row->event_name ?: 'unknown'))
            ->map(fn ($group) => $group->count())
            ->sortDesc()
            ->all();

        $startHereSessions = $rows
            ->where('event_name', 'cta_start_here_click')
            ->pluck('session_id')
            ->filter()
            ->unique()
            ->count();

        return [
            'events_total' => $eventsTotal,
            'sessions_total' => $sessionsTotal,
            'by_persona' => $byPersona,
            'by_variant' => $byVariant,
            'by_event' => $byEvent,
            'start_here_ctr_pct' => $this->pct($startHereSessions, $sessionsTotal),
        ];
    }

    private function pct(int $num, int $den): string
    {
        if ($den <= 0) {
            return '0.00%';
        }

        return number_format(($num / $den) * 100, 2) . '%';
    }
}

