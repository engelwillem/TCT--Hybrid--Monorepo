<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserMetric;
use App\Models\UserVerseAction;
use Carbon\Carbon;

class UserMetricsService
{
    public function calculateForUser(User $user, ?Carbon $now = null): array
    {
        $now = ($now ?: now())->copy()->timezone('Asia/Jakarta');

        $base = UserVerseAction::query()
            ->where('user_id', $user->id)
            ->where(function ($q) {
                $q->where('favorited', true)
                    ->orWhere('bookmarked', true)
                    ->orWhere(function ($nq) {
                        $nq->whereNotNull('note_text')->where('note_text', '!=', '');
                    });
            });

        $totalSaved = (clone $base)->count();

        $dateSet = (clone $base)
            ->orderByDesc('updated_at')
            ->pluck('updated_at')
            ->filter()
            ->map(function ($dt) {
                try {
                    return Carbon::parse((string) $dt)->timezone('Asia/Jakarta')->format('Y-m-d');
                } catch (\Throwable) {
                    return null;
                }
            })
            ->filter()
            ->unique()
            ->values()
            ->all();

        $streakDays = 0;
        $cursor = $now->copy()->startOfDay();
        $dateLookup = array_flip($dateSet);
        while (isset($dateLookup[$cursor->format('Y-m-d')])) {
            $streakDays++;
            $cursor->subDay();
        }

        $weeklyCount = (clone $base)
            ->where('updated_at', '>=', $now->copy()->subDays(7))
            ->count();

        $previousWeekly = (clone $base)
            ->whereBetween('updated_at', [
                $now->copy()->subDays(14),
                $now->copy()->subDays(7),
            ])
            ->count();

        $growthPercentage = $previousWeekly > 0
            ? (int) round((($weeklyCount - $previousWeekly) / $previousWeekly) * 100)
            : ($weeklyCount > 0 ? 100 : 0);

        return [
            'streak_days' => $streakDays,
            'total_saved' => $totalSaved,
            'weekly_count' => $weeklyCount,
            'growth_percentage' => $growthPercentage,
            'last_calculated_at' => now(),
        ];
    }

    public function refreshForUser(User $user, ?Carbon $now = null): UserMetric
    {
        $metrics = $this->calculateForUser($user, $now);

        return UserMetric::query()->updateOrCreate(
            ['user_id' => $user->id],
            $metrics,
        );
    }
}
