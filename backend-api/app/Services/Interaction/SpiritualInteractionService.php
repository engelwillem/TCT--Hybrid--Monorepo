<?php

namespace App\Services\Interaction;

use App\Models\MemberPost;
use App\Models\MemberPostReaction;
use App\Models\User;

class SpiritualInteractionService
{
    /**
     * Toggle a spiritual reaction (like, pray, encouraged).
     */
    public function toggleReaction(MemberPost $post, User $user, string $type): bool
    {
        $existing = MemberPostReaction::where('member_post_id', $post->id)
            ->where('user_id', $user->id)
            ->where('type', $type)
            ->first();

        if ($existing) {
            $existing->delete();

            return false; // Removed
        }

        MemberPostReaction::create([
            'member_post_id' => $post->id,
            'user_id' => $user->id,
            'type' => $type,
        ]);

        return true; // Added
    }
}
