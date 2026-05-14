<?php

namespace App\Listeners\Community;

use App\Events\Community\PostRepostedToTalks;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Cache;

class InvalidateCommunityPostCaches implements ShouldQueue
{
    public string $queue = 'default';

    public function handle(PostRepostedToTalks $event): void
    {
        // Idempotent invalidation: repeating these forgets is safe.
        $keys = [
            'community:feed:public',
            'community:feed:talks',
            'community:feed:gallery',
            sprintf('community:post:%d', $event->postId),
            sprintf('community:author:%d:posts', $event->authorId),
            'analytics:community:composer:7d:all:all',
            'analytics:community:composer:30d:all:all',
        ];

        foreach ($keys as $key) {
            Cache::forget($key);
        }

        // Bust markers for consumers that use versioned cache keys.
        Cache::add('community:cache:bust:feed', 0, now()->addDay());
        Cache::add('community:cache:bust:gallery', 0, now()->addDay());
        Cache::increment('community:cache:bust:feed');
        Cache::increment('community:cache:bust:gallery');
    }
}
