<?php

namespace App\Services\Interaction;

use App\Models\MemberPost;
use App\Enums\PostType;

class PostInteractionPolicyService
{
    /**
     * Determine if a specific action is allowed for a given post.
     */
    public function isActionAllowed(MemberPost $post, string $action): bool
    {
        $allowed = $post->type->allowedInteractions();

        return in_array(strtolower($action), $allowed);
    }

    /**
     * Get all allowed actions for a post.
     */
    public function getAllowedActions(MemberPost $post): array
    {
        return $post->type->allowedInteractions();
    }
}
