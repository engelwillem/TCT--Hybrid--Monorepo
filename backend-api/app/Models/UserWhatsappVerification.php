<?php

namespace App\Models;

use App\Enums\WhatsappVerificationStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserWhatsappVerification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'wa_client_id',
        'phone',
        'normalized_phone',
        'status',
        'verification_code_hash',
        'requested_at',
        'verified_at',
        'expires_at',
        'attempt_count',
        'last_error',
        'meta',
    ];

    protected function casts(): array
    {
        return [
            'status' => WhatsappVerificationStatus::class,
            'requested_at' => 'datetime',
            'verified_at' => 'datetime',
            'expires_at' => 'datetime',
            'attempt_count' => 'integer',
            'meta' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function waClient(): BelongsTo
    {
        return $this->belongsTo(WaClient::class);
    }
}
