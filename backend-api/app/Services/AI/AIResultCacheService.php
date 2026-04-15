<?php

namespace App\Services\AI;

use Closure;
use Illuminate\Support\Facades\Cache;

class AIResultCacheService
{
    /**
     * @param  Closure(): array<string, mixed>  $resolver
     * @return array<string, mixed>
     */
    public function remember(string $namespace, array $fingerprint, Closure $resolver, ?int $ttlSeconds = null): array
    {
        $enabled = (bool) config('ai.cache.enabled', true);
        if (! $enabled) {
            return $resolver();
        }

        $ttl = $ttlSeconds ?? (int) config('ai.cache.ttl_seconds', 600);
        $cacheKey = 'ai:'.$namespace.':'.sha1(json_encode($fingerprint, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: '');

        return Cache::remember($cacheKey, max(1, $ttl), $resolver);
    }
}

