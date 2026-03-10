<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserJournalDraft extends Model
{
    protected $fillable = [
        'user_id',
        'entry_date',
        'source_type',
        'source_ref',
        'body',
        'is_private',
    ];

    protected $casts = [
        'entry_date' => 'date',
        'is_private' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

