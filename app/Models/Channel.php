<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Channel extends Model
{
    protected $casts = [
        'is_private' => 'boolean',
        'type' => \App\Enums\ChannelType::class,
    ];

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'channel_members')
            ->withPivot('role', 'joined_at')
            ->withTimestamps();
    }

    public function posts(): BelongsToMany
    {
        return $this->belongsToMany(MemberPost::class, 'channel_posts', 'channel_id', 'member_post_id')
            ->withTimestamps();
    }
}
