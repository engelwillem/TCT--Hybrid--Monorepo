<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DailyContent extends Model
{
    use HasFactory;

    const TYPE_VERSE = 'today_verse';

    const TYPE_QUOTE = 'quote_of_day';

    const TYPE_REFLECTION = 'reflection_prompt';

    const TYPE_PRAYER = 'prayer_prompt';

    const TYPE_HIGHLIGHT = 'community_highlight';

    protected $fillable = [
        'date',
        'content_type',
        'payload',
        'source_type',
        'review_status',
        'reviewed_by',
        'reviewed_at',
        'published_at',
    ];

    protected $casts = [
        'date' => 'date',
        'payload' => 'array',
        'published_at' => 'datetime',
        'content_type' => \App\Enums\DailyContentType::class,
        'source_type' => \App\Enums\SourceType::class,
        'review_status' => \App\Enums\ReviewStatus::class,
        'reviewed_at' => 'datetime',
    ];

    /**
     * Scope a query to only include published content for today.
     */
    public function scopeForToday($query)
    {
        return $query->where('date', now()->toDateString())
            ->whereNotNull('published_at');
    }
}
