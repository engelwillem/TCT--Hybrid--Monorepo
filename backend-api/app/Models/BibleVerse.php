<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BibleVerse extends Model
{
    protected $fillable = [
        'provider',
        'lang',
        'book_code',
        'chapter',
        'verse',
        'reference',
        'text',
        'translation_name',
    ];

    protected $casts = [
        'chapter' => 'integer',
        'verse' => 'integer',
    ];

    public function relationships()
    {
        return $this->hasMany(VerseRelationship::class, 'from_ref', 'verse_ref');
    }

    public function targetRelationships()
    {
        return $this->hasMany(VerseRelationship::class, 'to_ref', 'verse_ref');
    }

    public function themes()
    {
        return $this->belongsToMany(VerseTheme::class, 'verse_theme_mappings', 'verse_ref', 'theme_id', 'verse_ref', 'id');
    }
}
