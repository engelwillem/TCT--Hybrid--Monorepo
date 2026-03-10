<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SsDayComment extends Model
{
    protected $fillable = [
        'ss_day_id',
        'user_id',
        'author_name',
        'reply_to_id',
        'body',
    ];

    public function day(): BelongsTo
    {
        return $this->belongsTo(SsDay::class, 'ss_day_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function replyTo(): BelongsTo
    {
        return $this->belongsTo(self::class, 'reply_to_id');
    }
}
