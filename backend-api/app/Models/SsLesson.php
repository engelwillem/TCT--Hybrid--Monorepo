<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SsLesson extends Model
{
    protected $table = 'ss_lessons';

    protected $fillable = [
        'quarter_id',
        'lesson_number',
        'title',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function quarter(): BelongsTo
    {
        return $this->belongsTo(SsQuarter::class, 'quarter_id');
    }

    public function days(): HasMany
    {
        return $this->hasMany(SsDay::class, 'lesson_id');
    }
}
