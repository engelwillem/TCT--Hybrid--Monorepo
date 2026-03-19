<?php

namespace App\Console\Commands;

use App\Jobs\RecalculateUserMetrics;
use App\Models\User;
use App\Services\UserMetricsService;
use Illuminate\Console\Command;

class RecalculateUserMetricsCommand extends Command
{
    protected $signature = 'app:recalculate-user-metrics {--user_id=} {--sync}';

    protected $description = 'Recalculate precomputed user metrics for VerseHub activity';

    public function handle(UserMetricsService $service): int
    {
        $userId = $this->option('user_id');
        $sync = (bool) $this->option('sync');

        if (is_numeric($userId)) {
            $user = User::query()->find((int) $userId);
            if (! $user) {
                $this->error('User not found.');

                return self::FAILURE;
            }

            if ($sync) {
                $service->refreshForUser($user);
                $this->info('Metrics updated synchronously for user #'.$user->id);
            } else {
                RecalculateUserMetrics::dispatch($user->id);
                $this->info('Metrics job dispatched for user #'.$user->id);
            }

            return self::SUCCESS;
        }

        $count = 0;
        User::query()->select('id')->chunk(200, function ($users) use (&$count, $service, $sync) {
            foreach ($users as $user) {
                if ($sync) {
                    $service->refreshForUser($user);
                } else {
                    RecalculateUserMetrics::dispatch($user->id);
                }
                $count++;
            }
        });

        $this->info(($sync ? 'Updated' : 'Dispatched').' metrics for '.$count.' users.');

        return self::SUCCESS;
    }
}
