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
            if ($request->is('admintalk', 'admintalk/*')) {
                return route('filament.admin.auth.login');
            }

            return env('NEXT_PUBLIC_APP_URL', 'http://localhost:3000');
        });

        $middleware->web(prepend: [
            HandleCors::class,
            \App\Http\Middleware\SecurityHeaders::class,
            \App\Http\Middleware\RequestProfiling::class,
        ]);

        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
