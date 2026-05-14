<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WaPhoneOwner extends Model
{
    use HasFactory;

    protected $fillable = [
        'wa_client_id',
        'phone',
        'canonical_name',
        'canonical_name_normalized',
        'first_seen_at',
        'last_seen_at',
        'confidence',
    ];

    protected $casts = [
        'first_seen_at' => 'datetime',
        'last_seen_at' => 'datetime',
        'confidence' => 'integer',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(WaClient::class, 'wa_client_id');
    }
}

