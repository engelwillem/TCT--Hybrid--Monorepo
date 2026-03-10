<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        /** @var \App\Models\User|null $user */
        $user = $request->user();

        if (!$user || !$user->is_admin) {
            if ($user) {
                // Logged in but not admin -> redirect to landing with error.
                return redirect()->route('landing.index')
                    ->with('error', 'Anda tidak memiliki akses ke halaman admin.');
            }

            abort(403);
        }

        return $next($request);
    }
}
