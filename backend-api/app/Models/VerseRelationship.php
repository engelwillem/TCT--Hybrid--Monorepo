<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VerseRelationship extends Model
{
    protected $fillable = [
        'from_ref',
        'to_ref',
        'lang',
        'relation_type',
        'strength',
    ];

    protected $casts = [
        'strength' => 'integer',
    ];
}
