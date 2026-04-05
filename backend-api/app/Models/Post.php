<?php

namespace App\Models;

use App\Support\RichContentSanitizer;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Post extends Model
{
    protected $fillable = [
        'channel_id',
        'title',
        'content',
        'meta',
        'publish_at',
        'status',
        'published_at',
    ];

    protected $casts = [
        'publish_at' => 'datetime',
        'published_at' => 'datetime',
        'meta' => 'array',
    ];

    public function channel(): BelongsTo
    {
        return $this->belongsTo(Channel::class);
    }

    protected function content(): Attribute
    {
        return Attribute::make(
            get: fn (?string $value): ?string => app(RichContentSanitizer::class)->sanitize($value),
            set: fn (?string $value): ?string => app(RichContentSanitizer::class)->sanitize($value),
        );
    }
}
