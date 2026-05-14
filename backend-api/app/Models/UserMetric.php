<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserMetric extends Model
{
    protected $fillable = [
        'user_id',
        'streak_days',
        'total_saved',
        'weekly_count',
        'growth_percentage',
        'last_calculated_at',
    ];

    protected $casts = [
        'streak_days' => 'integer',
        'total_saved' => 'integer',
        'weekly_count' => 'integer',
        'growth_percentage' => 'integer',
        'last_calculated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
