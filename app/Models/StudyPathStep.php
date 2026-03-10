<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudyPathStep extends Model
{
    protected $fillable = [
        'path_id',
        'step_order',
        'verse_ref',
        'lang',
        'focus_question',
        'mentor_note',
    ];

    protected $casts = [
        'step_order' => 'integer',
    ];

    public function path(): BelongsTo
    {
        return $this->belongsTo(StudyPath::class, 'path_id');
    }
}
