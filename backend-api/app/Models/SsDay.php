<?php

namespace App\Models;

use App\Support\RichContentSanitizer;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SsDay extends Model
{
    protected $table = 'ss_days';

    protected $fillable = [
        'lesson_id',
        'day_key',
        'date',
        'title',
        'content',
        'media_links',
        'cover_image_url',
        'status',
    ];

    protected $casts = [
        'date' => 'date',
        'media_links' => 'array',
    ];

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(SsLesson::class, 'lesson_id');
    }

    protected function content(): Attribute
    {
        return Attribute::make(
            get: fn (?string $value): ?string => app(RichContentSanitizer::class)->sanitize($value),
            set: fn (?string $value): ?string => app(RichContentSanitizer::class)->sanitize($value),
        );
    }
}
