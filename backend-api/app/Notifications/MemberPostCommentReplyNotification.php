<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class MemberPostCommentReplyNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly string $actorName,
        private readonly int $postId,
        private readonly string $snippet,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => "{$this->actorName} replied to your comment",
            'body' => mb_strimwidth($this->snippet, 0, 120, '...'),
            'url' => "/community#post-{$this->postId}",
            'type' => 'member_post_comment_reply',
        ];
    }
}
