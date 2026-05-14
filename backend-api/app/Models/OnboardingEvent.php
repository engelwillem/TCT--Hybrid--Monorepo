<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OnboardingEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'onboarding_run_id',
        'onboarding_lead_id',
        'stage',
        'status',
        'payload_json',
        'duration_ms',
        'error_code',
        'error_message',
        'occurred_at',
    ];

    protected $casts = [
        'payload_json' => 'array',
        'duration_ms' => 'integer',
        'occurred_at' => 'datetime',
    ];

    public function run(): BelongsTo
    {
        return $this->belongsTo(OnboardingRun::class, 'onboarding_run_id');
    }

    public function lead(): BelongsTo
    {
        return $this->belongsTo(OnboardingLead::class, 'onboarding_lead_id');
    }
}

