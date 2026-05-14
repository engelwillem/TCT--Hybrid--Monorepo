<?php

namespace App\Models;

use App\Enums\AutomationStepStatus;
use App\Enums\SystemSeverity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AutomationStep extends Model
{
    use HasFactory;

    protected $fillable = [
        'automation_run_id',
        'step_key',
        'step_order',
        'status',
        'severity',
        'started_at',
        'finished_at',
        'duration_ms',
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
            'status' => AutomationStepStatus::class,
            'severity' => SystemSeverity::class,
            'started_at' => 'datetime',
            'finished_at' => 'datetime',
            'duration_ms' => 'integer',
            'attempt_count' => 'integer',
            'input' => 'array',
            'output' => 'array',
            'meta' => 'array',
        ];
    }

    public function automationRun(): BelongsTo
    {
        return $this->belongsTo(AutomationRun::class);
    }
}
