<?php

namespace App\Support;

use App\Models\AppSetting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;
use Throwable;

class AppSettings
{
    /**
     * @return array<string, string|null>
     */
    public static function all(): array
    {
        if (! Schema::hasTable('app_settings')) {
            return [];
        }

        try {
            return Cache::remember('app_settings:all', now()->addMinutes(2), function (): array {
                return AppSetting::query()
                    ->get(['key', 'value'])
                    ->mapWithKeys(fn (AppSetting $row) => [$row->key => $row->value])
                    ->all();
            });
        } catch (Throwable) {
            return [];
        }
    }

    public static function get(string $key, ?string $default = null): ?string
    {
        $all = self::all();

        return array_key_exists($key, $all) ? $all[$key] : $default;
    }

    public static function forgetCache(): void
    {
        Cache::forget('app_settings:all');
    }
}
