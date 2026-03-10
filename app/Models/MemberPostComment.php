<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MemberPostComment extends Model
{
    protected $fillable = ['member_post_id', 'user_id', 'body', 'reply_to_comment_id'];

    public function scopeByPost($query, $postId)
    {
        return $query->where('member_post_id', $postId);
    }

    public function scopeRoot($query)
    {
        return $query->whereNull('reply_to_comment_id');
    }

    public function post(): BelongsTo
    {
        return $this->belongsTo(MemberPost::class, 'member_post_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'reply_to_comment_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(self::class, 'reply_to_comment_id');
    }

    public function replyTo(): BelongsTo
    {
        return $this->belongsTo(self::class, 'reply_to_comment_id');
    }
}
