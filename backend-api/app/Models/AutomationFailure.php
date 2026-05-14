<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AutomationFailure extends Model
{
    use HasFactory;

    protected $fillable = [
        'automation_event_id',
        'workflow',
        'status',
        'root_cause',
        'idempotency_key',
        'subject_type',
        'subject_id',
        'attempt',
        'error_message',
        'payload',
        'resolved_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'resolved_at' => 'datetime',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(AutomationEvent::class, 'automation_event_id');
    }
}

