<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VerseHubLandingEvent extends Model
{
    protected $table = 'versehub_landing_events';

    protected $fillable = [
        'user_id',
        'lang',
        'session_id',
        'persona',
        'variant',
        'event_name',
        'meta',
        'occurred_at',
    ];

    protected $casts = [
        'meta' => 'array',
        'occurred_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
