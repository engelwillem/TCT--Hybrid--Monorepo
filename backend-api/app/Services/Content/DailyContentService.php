<?php

namespace App\Services\Content;

use App\Models\DailyContent;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

class DailyContentService
{
    /**
     * Get all rituals for a specific date.
     */
    public function getRitualsForDate(Carbon $date): Collection
    {
        $cacheKey = "daily_rituals_{$date->toDateString()}";

        return Cache::remember($cacheKey, now()->addHours(6), function () use ($date) {
            return DailyContent::where('date', $date->toDateString())
                ->whereNotNull('published_at')
                ->get();
        });
    }

    /**
     * Get a specific ritual type for a date.
     */
    public function getRitual(Carbon $date, string $type): ?DailyContent
    {
        return $this->getRitualsForDate($date)
            ->where('content_type', $type)
            ->first();
    }
}
