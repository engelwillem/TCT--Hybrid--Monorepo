<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VerseToneMapping extends Model
{
    protected $fillable = [
        'tone_slug',
        'verse_ref',
        'lang',
        'weight',
        'sort_order',
    ];

    protected $casts = [
        'weight' => 'integer',
        'sort_order' => 'integer',
    ];

    public function tone(): BelongsTo
    {
        return $this->belongsTo(VerseTone::class, 'tone_slug', 'slug');
    }
}
