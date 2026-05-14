<?php

namespace App\Models;

use App\Enums\AiActivityStatus;
use App\Enums\SystemSeverity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'event',
        'surface',
        'workflow_key',
        'provider',
        'model',
        'status',
        'severity',
        'request_id',
        'duration_ms',
        'input_tokens',
        'output_tokens',
        'total_tokens',
        'error_code',
        'error_message',
        'context',
        'occurred_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => AiActivityStatus::class,
            'severity' => SystemSeverity::class,
            'duration_ms' => 'integer',
            'input_tokens' => 'integer',
            'output_tokens' => 'integer',
            'total_tokens' => 'integer',
            'context' => 'array',
            'occurred_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
