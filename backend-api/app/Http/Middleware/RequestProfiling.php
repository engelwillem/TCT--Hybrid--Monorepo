<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

/**
 * Very small dev-friendly profiler.
 *
 * What it gives you:
 * - Total request duration (ms)
 * - DB query count
 * - Total DB time (ms) (approx, from DB::listen)
 *
 * How to use:
 * - Enabled ONLY when APP_DEBUG=true
 * - Look at response headers:
 *   - X-Profile-Duration-Ms
 *   - X-Profile-Db-Queries
 *   - X-Profile-Db-Time-Ms
 */
class RequestProfiling
{
    public function handle(Request $request, Closure $next): Response
    {
        // Keep this strictly dev-only.
        if (! config('app.debug')) {
            return $next($request);
        }

        // Opt-in only: avoids slowing down normal browsing.
        // Enable by adding `?profile=1` to the URL.
        if (! $request->boolean('profile')) {
            return $next($request);
        }

        $t0 = microtime(true);
        $queryCount = 0;
        $dbTimeMs = 0.0;

        // Count queries + accumulate query time.
        // NOTE: This adds a tiny overhead but is useful for local profiling.
        DB::listen(function ($query) use (&$queryCount, &$dbTimeMs) {
            $queryCount++;
            // $query->time is already in ms.
            $dbTimeMs += (float) ($query->time ?? 0);
        });

        /** @var Response $response */
        $response = $next($request);

        $durationMs = (microtime(true) - $t0) * 1000.0;

        // Add headers so you can inspect in browser devtools.
        $response->headers->set('X-Profile-Duration-Ms', (string) round($durationMs, 1));
        $response->headers->set('X-Profile-Db-Queries', (string) $queryCount);
        $response->headers->set('X-Profile-Db-Time-Ms', (string) round($dbTimeMs, 1));

        // Intentionally do not log to file: local browsing can generate a lot of requests.

        return $response;
    }
}
