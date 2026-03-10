<?php

namespace App\Policies;

use App\Models\MemberPost;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class MemberPostPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, MemberPost $memberPost): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, MemberPost $memberPost): bool
    {
        return $user->id === $memberPost->user_id || ($user->is_admin ?? false);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, MemberPost $memberPost): bool
    {
        return $user->id === $memberPost->user_id || ($user->is_admin ?? false);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, MemberPost $memberPost): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, MemberPost $memberPost): bool
    {
        return false;
    }
}
