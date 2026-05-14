<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VersePastoralNote extends Model
{
    protected $fillable = [
        'verse_ref',
        'lang',
        'theme_slug',
        'tone_slug',
        'audience_scope',
        'language_style',
        'main_message',
        'pastoral_angle',
        'application_text',
        'hope_text',
        'prayer_direction',
        'correction_direction',
        'de_escalation_direction',
        'priority',
        'is_active',
    ];

    protected $casts = [
        'priority' => 'integer',
        'is_active' => 'boolean',
    ];
}

