<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StudyPath extends Model
{
    protected $fillable = [
        'slug',
        'title_id',
        'title_en',
        'description_id',
        'description_en',
        'cover_color',
        'difficulty',
        'estimated_minutes',
        'is_published',
        'sort_order',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'estimated_minutes' => 'integer',
        'sort_order' => 'integer',
    ];

    public function steps(): HasMany
    {
        return $this->hasMany(StudyPathStep::class, 'path_id')->orderBy('step_order');
    }

    public function userProgress(): HasMany
    {
        return $this->hasMany(UserStudyPathProgress::class, 'path_id');
    }
}
