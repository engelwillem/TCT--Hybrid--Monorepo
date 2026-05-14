<?php

namespace App\Listeners\Community;

use App\Events\Community\PostRepostedToTalks;
use App\Models\LandingClickEvent;
use Illuminate\Contracts\Queue\ShouldQueue;

class RecordPostRepostedAnalytics implements ShouldQueue
{
    public string $queue = 'default';

    public function handle(PostRepostedToTalks $event): void
    {
        LandingClickEvent::query()->create([
            'user_id' => $event->repostedBy,
            'session_id' => $event->requestId ?: sprintf('repost-%d-%d', $event->postId, $event->repostedBy),
            'variant' => 'community',
            'event_name' => 'community_repost_success',
            'target' => sprintf('/api/v1/community/posts/%d/repost', $event->postId),
            'page' => '/community?tab=GALERY',
            'meta' => [
                'payload_meta' => [
                    'post_id' => (string) $event->postId,
                    'author_id' => (string) $event->authorId,
                    'reposted_by' => (string) $event->repostedBy,
                    'repost_count' => $event->repostCount,
                    'previous_status' => $event->previousStatus,
                    'new_status' => $event->newStatus,
                    'activated_at' => $event->activatedAt,
                    'source_surface' => $event->sourceSurface,
                    'request_id' => $event->requestId,
                ],
            ],
        ]);
    }
}
