<?php

namespace App\Services\Automation;

use Illuminate\Support\Facades\Cache;

class AutomationWorkflowGate
{
    private const CACHE_PREFIX = 'automation:workflow:paused:';

    public function isPaused(string $workflow): bool
    {
        return Cache::get(self::CACHE_PREFIX.$workflow, false) === true;
    }

    public function pause(string $workflow): void
    {
        Cache::forever(self::CACHE_PREFIX.$workflow, true);
    }

    public function resume(string $workflow): void
    {
        Cache::forget(self::CACHE_PREFIX.$workflow);
    }
}

