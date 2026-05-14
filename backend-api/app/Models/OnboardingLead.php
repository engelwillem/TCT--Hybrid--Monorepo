<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OnboardingLead extends Model
{
    use HasFactory;

    protected $fillable = [
        'source',
        'full_name',
        'email',
        'phone',
        'annual_income',
        'risk_profile',
        'goals_json',
        'notes',
        'status',
        'current_stage',
        'correlation_id',
        'last_processed_at',
    ];

    protected $casts = [
        'annual_income' => 'decimal:2',
        'goals_json' => 'array',
        'last_processed_at' => 'datetime',
    ];

    public function runs(): HasMany
    {
        return $this->hasMany(OnboardingRun::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(OnboardingEvent::class);
    }
}

