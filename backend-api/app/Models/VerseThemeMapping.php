<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VerseThemeMapping extends Model
{
    protected $fillable = [
        'theme_slug',
        'verse_ref',
        'lang',
        'sort_order',
    ];

    protected $casts = [
        'sort_order' => 'integer',
    ];

    public function theme(): BelongsTo
    {
        return $this->belongsTo(VerseTheme::class, 'theme_slug', 'slug');
    }
}
