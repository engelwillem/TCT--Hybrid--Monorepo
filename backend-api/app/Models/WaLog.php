<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WaLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'wa_client_id',
        'row_number',
        'customer_name',
        'phone',
        'toko',
        'message',
        'timezone',
        'scheduled_at',
        'status',
        'fonnte_message_id',
        'response',
        'sent_at',
    ];

    protected $casts = [
        'row_number' => 'integer',
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(WaClient::class, 'wa_client_id');
    }
}
