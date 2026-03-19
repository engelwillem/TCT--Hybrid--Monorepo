<?php

namespace App\Filament\Auth\Responses;

use App\Notifications\AdminLoginSuccessful;
use Filament\Auth\Http\Responses\Contracts\LoginResponse as LoginResponseContract;
use Filament\Facades\Filament;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Livewire\Features\SupportRedirects\Redirector;
use Throwable;

class AdminLoginResponse implements LoginResponseContract
{
    public function toResponse($request): RedirectResponse|Redirector
    {
        $user = Filament::auth()->user();

        $alertEmail = (string) config('admin.alert_email');

        // Only notify for the admin panel.
        if (
            $user &&
            method_exists($user, 'getAttribute') &&
            ((bool) $user->getAttribute('is_admin')) &&
            $request?->is('admintalk/*') &&
            $alertEmail !== ''
        ) {
            try {
                Notification::route('mail', $alertEmail)->notify(
                    new AdminLoginSuccessful(
                        email: Str::lower((string) $user->getAttribute('email')),
                        ip: (string) $request->ip(),
                        userAgent: (string) $request->userAgent(),
                    ),
                );
            } catch (Throwable $e) {
                // Never block admin login if security notification channel is down.
                Log::warning('Admin login notification failed.', [
                    'alert_email' => $alertEmail,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return redirect()->intended(Filament::getUrl());
    }
}
