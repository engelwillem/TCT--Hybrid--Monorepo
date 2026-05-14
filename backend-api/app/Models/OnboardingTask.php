<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OnboardingTask extends Model
{
    use HasFactory;

    protected $fillable = [
        'onboarding_lead_id',
        'task_type',
        'title',
        'description',
        'due_at',
        'assignee',
        'status',
    ];

    protected $casts = [
        'due_at' => 'datetime',
    ];

    public function lead(): BelongsTo
    {
        return $this->belongsTo(OnboardingLead::class, 'onboarding_lead_id');
    }
}

