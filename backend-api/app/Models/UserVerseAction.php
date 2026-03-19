<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserVerseAction extends Model
{
    protected $fillable = [
        'user_id',
        'lang',
        'book_code',
        'chapter',
        'verse',
        'favorited',
        'bookmarked',
        'highlighted',
        'highlight_color',
        'note_text',
    ];

    protected $casts = [
        'favorited' => 'boolean',
        'bookmarked' => 'boolean',
        'highlighted' => 'boolean',
        'chapter' => 'integer',
        'verse' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
