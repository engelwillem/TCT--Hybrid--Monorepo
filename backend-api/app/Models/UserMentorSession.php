<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserMentorSession extends Model
{
    protected $fillable = [
        'user_id',
        'verse_ref',
        'lang',
        'question',
        'answer_summary',
        'insight_type',
        'session_type',
        'summary',
        'metadata',
        'is_archived',
    ];

    protected $casts = [
        'metadata' => 'array',
        'is_archived' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class);
    }
}
