<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Enums\ReactionType; // Added for enum casting and scope

class MemberPostReaction extends Model
{
    protected $fillable = [
        'member_post_id',
        'user_id',
        'type',
    ];

    protected $casts = [
        'type' => ReactionType::class,
    ];

    public function scopeByType($query, ReactionType $type)
    {
        return $query->where('type', $type);
    }

    public function post(): BelongsTo
    {
        return $this->belongsTo(MemberPost::class, 'member_post_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
