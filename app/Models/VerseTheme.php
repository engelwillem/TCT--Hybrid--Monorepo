<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\BibleVerse; // Added this import

class VerseTheme extends Model
{
    protected $fillable = [
        'slug',
        'title_id',
        'title_en',
        'description_id',
        'description_en',
        'color_key',
        'is_published',
        'sort_order',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function mappings(): HasMany
    {
        return $this->hasMany(VerseThemeMapping::class, 'theme_slug', 'slug');
    }
}
