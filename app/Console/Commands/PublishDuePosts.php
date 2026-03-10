<?php

namespace App\Console\Commands;

use App\Models\Post;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class PublishDuePosts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:publish-due-posts';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Publish scheduled posts whose publish_at is due.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $now = Carbon::now();

        $duePosts = Post::query()
            ->where('status', 'scheduled')
            ->where('publish_at', '<=', $now)
            ->orderBy('publish_at')
            ->get();

        $count = 0;

        foreach ($duePosts as $post) {
            $post->forceFill([
                'status' => 'published',
                'published_at' => $post->published_at ?? $now,
            ])->save();
            $count++;
        }

        $this->info("Published {$count} due post(s). Now=" . $now->toDateTimeString());

        return self::SUCCESS;
    }
}
