<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeedItem extends Model
{
    protected $fillable = [
        'quarter_id',
        'type',
        'payload',
        'priority',
        'visible_from',
        'visible_until',
    ];

    protected $casts = [
        'payload' => 'array',
        'visible_from' => 'datetime',
        'visible_until' => 'datetime',
    ];

    public function quarter(): BelongsTo
    {
        return $this->belongsTo(Quarter::class);
    }
}
