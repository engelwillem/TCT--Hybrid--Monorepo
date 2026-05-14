<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\UserMetricsService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class RecalculateUserMetrics implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public int $userId) {}

    public function handle(UserMetricsService $service): void
    {
        $user = User::query()->find($this->userId);
        if (! $user) {
            return;
        }

        $service->refreshForUser($user);
    }
}
