<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WaReminder extends Model
{
    use HasFactory;

    protected $fillable = [
        'wa_client_id',
        'sheet_row_number',
        'customer_name',
        'phone',
        'tanggal',
        'jam',
        'zona_waktu',
        'timezone',
        'scheduled_at',
        'message_template',
        'message_final',
        'toko',
        'status',
        'fonnte_message_id',
        'sent_at',
        'response',
        'last_error',
        'source_hash',
    ];

    protected $casts = [
        'sheet_row_number' => 'integer',
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(WaClient::class, 'wa_client_id');
    }
}

