<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class TrackUserPresence
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $user = $request->user();
        if (! $user) {
            return $response;
        }

        // Write at most once per minute per user to avoid DB write pressure.
        $lockKey = "presence:touch:user:{$user->id}";
        if (Cache::add($lockKey, 1, now()->addSeconds(60))) {
            $user->forceFill([
                'last_seen_at' => Carbon::now(),
            ])->saveQuietly();
        }

        return $response;
    }
}

