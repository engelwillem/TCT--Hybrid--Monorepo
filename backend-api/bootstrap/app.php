<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Http\Middleware\HandleCors;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Enable Sanctum's stateful SPA handling for the decoupled Next.js frontend.
        $middleware->statefulApi();

        // Any guest that hits auth-protected routes should go to landing page,
        // not directly to /login.
        $middleware->redirectGuestsTo(function (Request $request) {
            // If hitting admin paths, let Filament handle the login redirect
            // (usually /admintalk/login).
            if ($request->is('admintalk', 'admintalk/*')) {
                return route('filament.admin.auth.login');
            }

            return route('landing.index');
        });

        // NOTE: web middleware order matters.
        // - RequestProfiling is dev-only (APP_DEBUG=true). It adds useful headers like
        //   X-Profile-Duration-Ms and X-Profile-Db-Queries to help debug slow navigation.
        $middleware->web(prepend: [
            HandleCors::class,
            \App\Http\Middleware\SecurityHeaders::class,
            \App\Http\Middleware\RequestProfiling::class,
        ]);

        $middleware->web(append: [
            \App\Http\Middleware\TrackUserPresence::class,
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'admin' => \App\Http\Middleware\EnsureAdmin::class,
            'verified_or_admin' => \App\Http\Middleware\EnsureVerifiedOrAdmin::class,
        ]);

        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
