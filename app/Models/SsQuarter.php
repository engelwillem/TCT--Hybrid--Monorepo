<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SsQuarter extends Model
{
    protected $table = 'ss_quarters';

    protected $fillable = [
        'year',
        'quarter',
        'title',
        'start_date',
        'end_date',
        'is_active',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
    ];

    public function lessons(): HasMany
    {
        return $this->hasMany(SsLesson::class, 'quarter_id');
    }
}
