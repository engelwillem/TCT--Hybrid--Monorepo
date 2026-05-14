<?php

namespace App\Models;

use App\Enums\AutomationRunStatus;
use App\Enums\SystemSeverity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class AutomationRun extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'workflow_key',
        'workflow_version',
        'status',
        'severity',
        'correlation_id',
        'subject_type',
        'subject_id',
        'queued_at',
        'started_at',
        'finished_at',
        'attempt_count',
        'error_code',
        'error_message',
        'input',
        'output',
        'meta',
    ];

    protected function casts(): array
    {
        return [
            'status' => AutomationRunStatus::class,
            'severity' => SystemSeverity::class,
            'queued_at' => 'datetime',
            'started_at' => 'datetime',
            'finished_at' => 'datetime',
            'attempt_count' => 'integer',
            'input' => 'array',
            'output' => 'array',
            'meta' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function subject(): MorphTo
    {
        return $this->morphTo();
    }

    public function steps(): HasMany
    {
        return $this->hasMany(AutomationStep::class);
    }
}
