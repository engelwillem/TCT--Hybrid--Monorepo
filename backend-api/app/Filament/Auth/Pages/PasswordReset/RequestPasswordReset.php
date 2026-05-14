<?php

namespace App\Filament\Auth\Pages\PasswordReset;

use DanHarrin\LivewireRateLimiting\Exceptions\TooManyRequestsException;
use Filament\Auth\Notifications\ResetPassword as ResetPasswordNotification;
use Filament\Auth\Pages\PasswordReset\RequestPasswordReset as BaseRequestPasswordReset;
use Filament\Facades\Filament;
use Filament\Models\Contracts\FilamentUser;
use Filament\Notifications\Notification;
use Illuminate\Auth\Events\PasswordResetLinkSent;
use Illuminate\Contracts\Auth\CanResetPassword;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use LogicException;

class RequestPasswordReset extends BaseRequestPasswordReset
{
    private function allowedAdminEmail(): string
    {
        $email = (string) config('admin.password_reset_email');

        return Str::lower($email);
    }

    public function request(): void
    {
        try {
            $this->rateLimit(2);
        } catch (TooManyRequestsException $exception) {
            $this->getRateLimitedNotification($exception)?->send();

            return;
        }

        $data = $this->form->getState();
        $email = Str::lower((string) ($data['email'] ?? ''));

        // HARD restriction (optional): only allow password reset requests for one allowed admin email.
        // If ADMIN_PASSWORD_RESET_EMAIL is not set, fall back to normal Filament behavior.
        // We still return a "sent"-style message to avoid user enumeration.
        if ($this->allowedAdminEmail() !== '' && $email !== $this->allowedAdminEmail()) {
            Notification::make()
                ->title(__('passwords.sent'))
                ->success()
                ->send();

            $this->form->fill();

            return;
        }

        $status = Password::broker(Filament::getAuthPasswordBroker())->sendResetLink(
            ['email' => $email],
            function (CanResetPassword $user, string $token): void {
                if (
                    ($user instanceof FilamentUser) &&
                    (! $user->canAccessPanel(Filament::getCurrentOrDefaultPanel()))
                ) {
                    return;
                }

                if (! method_exists($user, 'notify')) {
                    $userClass = $user::class;

                    throw new LogicException("Model [{$userClass}] does not have a [notify()] method.");
                }

                $notification = app(ResetPasswordNotification::class, ['token' => $token]);
                $notification->url = Filament::getResetPasswordUrl($token, $user);

                $user->notify($notification);

                if (class_exists(PasswordResetLinkSent::class)) {
                    event(new PasswordResetLinkSent($user));
                }
            },
        );

        if ($status !== Password::RESET_LINK_SENT) {
            Notification::make()
                ->title(__($status))
                ->danger()
                ->send();

            return;
        }

        Notification::make()
            ->title(__($status))
            ->success()
            ->send();

        $this->form->fill();
    }
}
