<?php

namespace App\Providers;

use App\Filament\Auth\Responses\AdminLoginResponse;
use App\Services\Mentor\MentorDriverInterface;
use App\Services\Mentor\TemplateMentorDriver;
use Filament\Auth\Http\Responses\Contracts\LoginResponse as FilamentLoginResponseContract;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Override Filament login response so we can send security notifications.
        $this->app->bind(FilamentLoginResponseContract::class, AdminLoginResponse::class);

        // Bind the Mentor driver. Swap to OpenAIMentorDriver via config/versehub_mentor.php.
        $this->app->bind(MentorDriverInterface::class, TemplateMentorDriver::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Prefetching can feel "heavy" on local/dev or low-end devices because
        // it injects many <link rel="prefetch"> tags and loads them (waterfall).
        // Disable it for local so navigation feels instant again.
        if (!app()->isLocal()) {
            Vite::prefetch(concurrency: 3);
        }
    }
}
