<?php

namespace App\Models;

use App\Support\AppSettings;
use Illuminate\Database\Eloquent\Model;

class AppSetting extends Model
{
    protected $fillable = [
        'key',
        'value',
    ];

    protected static function booted(): void
    {
        static::saved(fn () => AppSettings::forgetCache());
        static::deleted(fn () => AppSettings::forgetCache());
    }
}
