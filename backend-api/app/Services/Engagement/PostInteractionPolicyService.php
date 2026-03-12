<?php

namespace App\Services\Engagement;

use App\Models\Post;
use App\Models\MemberPost;
use App\Enums\PostType;

class PostInteractionPolicyService
{
    /**
     * Get the allowed interactions for a given post or post type.
     */
    public function getAllowedInteractions(string|PostType $type): array
    {
        $postType = $type instanceof PostType ? $type : PostType::tryFrom($type);

        if (!$postType) {
            return ['amin', 'comment', 'share'];
        }

        return match ($postType) {
            PostType::PRAYER_REQUEST => ['amin', 'comment', 'share'],
            PostType::VERSE_REFLECTION, PostType::REFLECTION, PostType::QUOTE => ['amin', 'comment', 'save', 'share'],
            PostType::EDITORIAL, PostType::COMMUNITY_HIGHLIGHT => ['amin', 'share'],
            PostType::TESTIMONY => ['amin', 'comment', 'share'],
            PostType::IMAGE_POST => ['amin', 'share', 'comment'],
            PostType::DISCUSSION_PROMPT => ['comment', 'amin', 'share', 'save'],
            default => ['amin', 'comment', 'share'],
        };
    }

    /**
     * Determine if a specific action is allowed for a post type.
     */
    public function isActionAllowed(string|PostType $type, string $action): bool
    {
        $allowed = $this->getAllowedInteractions($type);
        return in_array(strtolower($action), $allowed);
    }

    /**
     * Get a 'calm' representation of interaction counts.
     * Hides counts if they are zero to avoid 'Empty Feed' anxiety.
     */
    public function getCalmStats(array $stats): array
    {
        return array_filter($stats, fn($count) => $count > 0);
    }
}
