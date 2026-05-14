<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OnboardingRun extends Model
{
    use HasFactory;

    protected $fillable = [
        'onboarding_lead_id',
        'run_number',
        'status',
        'started_at',
        'finished_at',
        'error_code',
        'error_message',
    ];

    protected $casts = [
        'run_number' => 'integer',
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
    ];

    public function lead(): BelongsTo
    {
        return $this->belongsTo(OnboardingLead::class, 'onboarding_lead_id');
    }

    public function events(): HasMany
    {
        return $this->hasMany(OnboardingEvent::class);
    }
}

