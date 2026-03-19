<?php

namespace App\Console\Commands;

use App\Enums\PostType;
use App\Jobs\Engagement\DailyEngagementJob;
use App\Models\MemberPost;
use App\Services\Engagement\CommunityPulseService;
use App\Services\Engagement\SystemAccountService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class DailyMaintenanceCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:daily-maintenance';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Run all daily maintenance and engagement tasks.';

    /**
     * Execute the console command.
     */
    public function handle(CommunityPulseService $pulseService, SystemAccountService $accounts): int
    {
        $this->info('Starting daily maintenance...');

        // 1. Run Daily Engagement Bridge
        $this->info('Running Daily Engagement Bridge...');
        dispatch_sync(new DailyEngagementJob);

        // 2. Generate Community Pulse
        $this->info('Generating Community Pulse...');
        $pulse = $pulseService->generateDailyPulse();
        if ($pulse) {
            $shepherd = $accounts->getShepherd();

            // Check if pulse already exists for today
            $exists = MemberPost::where('user_id', $shepherd->id)
                ->where('type', PostType::COMMUNITY_HIGHLIGHT)
                ->whereDate('created_at', now())
                ->exists();

            if (! $exists) {
                MemberPost::create([
                    'user_id' => $shepherd->id,
                    'type' => PostType::COMMUNITY_HIGHLIGHT,
                    'text' => $pulse['description'],
                    'title' => $pulse['title'],
                    'metadata' => $pulse['metadata'],
                ]);
                $this->info('Community Pulse published.');
            } else {
                $this->info('Community Pulse for today already exists, skipping.');
            }
        } else {
            $this->info('No Community Pulse generated today.');
        }

        // 3. Publish Due Posts
        $this->info('Publishing due posts...');
        Artisan::call('app:publish-due-posts');
        $this->line(Artisan::output());

        // 3. Optional: Recalculate metrics
        if (class_exists(\App\Console\Commands\RecalculateUserMetricsCommand::class)) {
            $this->info('Recalculating user metrics...');
            Artisan::call('app:recalculate-user-metrics');
        }

        $this->info('Daily Maintenance Completed Successfully!');

        return self::SUCCESS;
    }
}
