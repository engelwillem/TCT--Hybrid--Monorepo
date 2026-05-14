<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReflectionResponse extends Model
{
    protected $fillable = [
        'user_id',
        'verse_ref',
        'question_text',
        'answer_text',
        'is_private',
    ];

    protected $casts = [
        'is_private' => 'boolean',
    ];

    /**
     * Get the user that owns the reflection.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
