<?php

namespace App\Jobs\Engagement;

use App\Models\DailyContent;
use App\Services\Engagement\DailyAutomationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class DailyEngagementJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Execute the job.
     */
    public function handle(DailyAutomationService $automation): void
    {
        // 1. Get Today's DailyContent
        $contents = DailyContent::where('date', now()->toDateString())
            ->whereNotNull('published_at')
            ->get();

        if ($contents->isEmpty()) {
            Log::info("DailyEngagementJob: No published content for today.");
            return;
        }

        foreach ($contents as $content) {
            // 2. Bridge to Community via Service
            $post = $automation->bridgeDailyContent($content);

            if ($post) {
                Log::info("DailyEngagementJob: Bridged DailyContent #{$content->id} to MemberPost #{$post->id}");

                // 3. Social Ignition
                $comment = $automation->ignitePost($post);

                if ($comment) {
                    Log::info("DailyEngagementJob: Ignited MemberPost #{$post->id} with comment.");
                }
            }
        }
    }
}
