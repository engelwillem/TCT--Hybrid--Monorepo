<?php

namespace App\Console\Commands\Community;

use Illuminate\Console\Command;
use App\Models\DailyContent;
use App\Services\Engagement\DailyAutomationService;
use App\Enums\ReviewStatus;

class BridgeDailyContentCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:bridge-daily-content';

    protected $description = 'Bridge approved rituals to the community feed and trigger social ignition.';

    public function handle(DailyAutomationService $automation): int
    {
        $this->info('Starting Daily Content Bridge...');

        $contents = DailyContent::where('date', now()->toDateString())
            ->where('review_status', ReviewStatus::APPROVED)
            ->whereNotNull('published_at')
            ->get();

        if ($contents->isEmpty()) {
            $this->warn('No approved content found for today.');
            return 0;
        }

        foreach ($contents as $content) {
            $post = $automation->bridgeDailyContent($content);

            if ($post) {
                $this->info("Bridged Content #{$content->id} as Post #{$post->id}");

                $comment = $automation->ignitePost($post);
                if ($comment) {
                    $this->info("  - Added 'Social Ignition' comment from Encourager.");
                }
            } else {
                $this->line("Content #{$content->id} already bridged.");
            }
        }

        $this->info('Daily Content Bridge complete.');
        return 0;
    }
}
