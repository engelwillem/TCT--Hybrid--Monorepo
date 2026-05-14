<?php

namespace App\Events\Community;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PostRepostedToTalks
{
    use Dispatchable;
    use SerializesModels;

    public function __construct(
        public readonly int $postId,
        public readonly int $authorId,
        public readonly int $repostedBy,
        public readonly string $previousStatus,
        public readonly string $newStatus,
        public readonly int $repostCount,
        public readonly string $activatedAt,
        public readonly string $sourceSurface = 'gallery',
        public readonly ?string $requestId = null,
    ) {}
}
