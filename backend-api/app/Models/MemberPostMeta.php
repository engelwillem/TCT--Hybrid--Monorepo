<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MemberPostMeta extends Model
{
    protected $table = 'member_post_meta';

    protected $fillable = [
        'member_post_id',
        'key',
        'value',
    ];

    public function post(): BelongsTo
    {
        return $this->belongsTo(MemberPost::class, 'member_post_id');
    }
}
