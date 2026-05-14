<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AutomationEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'workflow',
        'trigger_source',
        'status',
        'channel',
        'intent',
        'confidence',
        'recommended_action',
        'idempotency_key',
        'correlation_id',
        'subject_type',
        'subject_id',
        'user_id',
        'attempt',
        'duration_ms',
        'available_for_retry',
        'processed_at',
        'escalated_at',
        'error_code',
        'error_message',
        'decision_payload',
        'action_payload',
        'result_payload',
    ];

    protected $casts = [
        'confidence' => 'float',
        'available_for_retry' => 'boolean',
        'decision_payload' => 'array',
        'action_payload' => 'array',
        'result_payload' => 'array',
        'processed_at' => 'datetime',
        'escalated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

