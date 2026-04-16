<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SpiritualSessionMemory extends Model
{
    protected $fillable = [
        'user_id',
        'source',
        'dominant_emotion',
        'reflection_theme',
        'primary_verse_reference',
        'primary_verse_text',
        'interpretation_focus',
        'pipeline_version',
        'meta',
    ];

    protected $casts = [
        'meta' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

