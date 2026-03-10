<?php

namespace App\Console\Commands\Community;

use Illuminate\Console\Command;
use App\Services\Engagement\CommunityPulseService;

class GeneratePulseCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:generate-pulse';

    protected $description = 'Generate a summary card of community activity for the feed.';

    public function handle(CommunityPulseService $service): int
    {
        $this->info('Generating Community Pulse...');

        $pulse = $service->generatePulse();

        if ($pulse) {
            $this->info("Community Pulse generated as Post #{$pulse->id}");
        } else {
            $this->warn('No significant activity found to generate a pulse.');
        }

        return 0;
    }
}
