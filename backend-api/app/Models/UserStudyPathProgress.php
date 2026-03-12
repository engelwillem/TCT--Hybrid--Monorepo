<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserStudyPathProgress extends Model
{
    protected $fillable = [
        'user_id',
        'path_id',
        'last_step_order',
        'completed_at',
    ];

    protected $casts = [
        'last_step_order' => 'integer',
        'completed_at' => 'datetime',
    ];

    public function path(): BelongsTo
    {
        return $this->belongsTo(StudyPath::class, 'path_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class);
    }
}
